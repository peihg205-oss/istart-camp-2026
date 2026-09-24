'use client';

// ==============================================================================
// IStart Camp 2026 - Central Scoring Context & Realtime Store
// ==============================================================================
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Activity,
  Profile,
  RuleConfig,
  ScoreAuditLog,
  ScoreTransaction,
  Team,
} from '@/types';
import {
  INITIAL_ACTIVITIES,
  INITIAL_PROFILES,
  INITIAL_TEAMS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
} from '@/lib/data/seedData';
import { calculateLeaderboard } from '@/lib/scoring/engine';
import { createClient } from '@/lib/supabase/client';
import {
  fetchLiveActivities,
  fetchLiveAuditLogs,
  fetchLiveProfiles,
  fetchLiveTeams,
  fetchLiveTransactions,
  insertScoreTransaction,
  undoScoreTransaction,
  updateScoreTransaction,
  updateScoringRuleInSupabase,
  updateTeamInSupabase,
  insertActivityInSupabase,
  updateActivityInSupabase,
  deleteActivityInSupabase,
} from '@/lib/services/supabaseDataService';

const STORAGE_KEY_TEAMS = 'istart_2026_teams_v3';
const STORAGE_KEY_ACTIVITIES = 'istart_2026_activities_v3';
const STORAGE_KEY_TRANSACTIONS = 'istart_2026_transactions_v4';
const STORAGE_KEY_AUDIT = 'istart_2026_audit_logs_v4';
const STORAGE_KEY_USER = 'istart_2026_current_user_v3';

interface ScoringContextType {
  teams: Team[];
  rankedTeams: Team[];
  activities: Activity[];
  transactions: ScoreTransaction[];
  auditLogs: ScoreAuditLog[];
  profiles: Profile[];
  currentProfile: Profile | null;
  isRealtimeConnected: boolean;
  isDemoMode: boolean;
  lastUpdateTimestamp: number;
  isLoading: boolean;
  // Auth actions
  loginAs: (role: 'ADMIN' | 'SCORER') => void;
  loginWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; profile?: Profile }>;
  logout: () => void;
  // Scoring actions
  addTransaction: (params: {
    teamId: string;
    activityId: string;
    points: number;
    metadata: Record<string, unknown>;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string; transaction?: ScoreTransaction }>;
  editTransaction: (params: {
    id: string;
    points: number;
    reason: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  undoTransaction: (params: {
    id: string;
    reason: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateScoringRule: (activityId: string, config: RuleConfig) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'created_at'> & { id?: string }) => Promise<{ success: boolean; activity?: Activity }>;
  updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  addSpecialScore: (params: {
    teamId: string;
    points: number;
    reason: string;
    categoryName?: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string; transaction?: ScoreTransaction }>;
  setInitialBaselinePoints: (
    entries: Array<{ teamId: string; points: number; reason: string }>
  ) => Promise<{ success: boolean; count: number }>;
  resetAllData: () => void;
  loadDemoData: () => void;
  wipeDataToZero: () => void;
}

const ScoringContext = createContext<ScoringContextType | null>(null);

function getInitialStorageData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (item === 'null') return null as unknown as T;
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function ScoringProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(() => {
    const loaded = getInitialStorageData<Team[]>(STORAGE_KEY_TEAMS, INITIAL_TEAMS);
    // If user's browser has old 14-team format or missing 'IB 1', seamlessly upgrade to official 12 teams
    const isOldFormat =
      !Array.isArray(loaded) ||
      loaded.length !== 12 ||
      !loaded.some((t) => t.code === 'IB 1');

    if (isOldFormat) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(INITIAL_TEAMS));
      }
      return INITIAL_TEAMS;
    }
    return loaded;
  });
  const [activities, setActivities] = useState<Activity[]>(() =>
    getInitialStorageData(STORAGE_KEY_ACTIVITIES, INITIAL_ACTIVITIES)
  );
  // Default to rich Demo transactions so the site is instantly alive & demo-ready
  const [transactions, setTransactions] = useState<ScoreTransaction[]>(() => {
    const loaded = getInitialStorageData<ScoreTransaction[]>(STORAGE_KEY_TRANSACTIONS, INITIAL_TRANSACTIONS);
    const hasOldTeamTx =
      !Array.isArray(loaded) ||
      loaded.some((tx) => tx.team_id === 'team-ib' || tx.team_id === 'team-help');

    if (hasOldTeamTx) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      }
      return INITIAL_TRANSACTIONS;
    }
    return loaded;
  });
  const [auditLogs, setAuditLogs] = useState<ScoreAuditLog[]>(() =>
    getInitialStorageData(STORAGE_KEY_AUDIT, INITIAL_AUDIT_LOGS)
  );
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(() =>
    getInitialStorageData(STORAGE_KEY_USER, INITIAL_PROFILES[0])
  );
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);
  const [isDemoMode] = useState<boolean>(true);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state changes to browser storage
  const persistState = useCallback(
    (
      newTeams?: Team[],
      newActivities?: Activity[],
      newTransactions?: ScoreTransaction[],
      newAudit?: ScoreAuditLog[],
      newUser?: Profile | null
    ) => {
      try {
        if (newTeams) {
          setTeams(newTeams);
          localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(newTeams));
        }
        if (newActivities) {
          setActivities(newActivities);
          localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(newActivities));
        }
        if (newTransactions) {
          setTransactions(newTransactions);
          localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(newTransactions));
          setLastUpdateTimestamp(Date.now());
        }
        if (newAudit) {
          setAuditLogs(newAudit);
          localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(newAudit));
        }
        if (newUser !== undefined) {
          setCurrentProfile(newUser);
          if (newUser) {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
          } else {
            localStorage.setItem(STORAGE_KEY_USER, 'null');
          }
        }

        // Broadcast to other tabs (instant real-time sync with public leaderboard)
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('istart_realtime_channel');
            bc.postMessage({ type: 'SYNC', timestamp: Date.now() });
            bc.close();
          } catch {}
        }
      } catch (err) {
        console.error('Failed to persist scoring state', err);
      }
    },
    []
  );

  // Fetch real data from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadRealData() {
      setIsLoading(true);
      try {
        const [liveTeams, liveActs, liveTxs, liveLogs, liveUsers] = await Promise.all([
          fetchLiveTeams(),
          fetchLiveActivities(),
          fetchLiveTransactions(),
          fetchLiveAuditLogs(),
          fetchLiveProfiles(),
        ]);

        if (isMounted) {
          if (liveTeams.length > 0) setTeams(liveTeams);
          if (liveActs.length > 0) setActivities(liveActs);
          if (liveTxs.length > 0) setTransactions(liveTxs);
          if (liveLogs.length > 0) setAuditLogs(liveLogs);
          if (liveUsers.length > 0) setProfiles(liveUsers);
        }
      } catch (err) {
        console.warn('Real data loading fallback:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRealData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for custom broadcast events across browser tabs (StorageEvent & BroadcastChannel)
  useEffect(() => {
    const handleBroadcast = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY_TRANSACTIONS && event.newValue) {
        setTransactions(JSON.parse(event.newValue));
        setLastUpdateTimestamp(Date.now());
      }
      if (event.key === STORAGE_KEY_TEAMS && event.newValue) {
        setTeams(JSON.parse(event.newValue));
      }
      if (event.key === STORAGE_KEY_ACTIVITIES && event.newValue) {
        setActivities(JSON.parse(event.newValue));
      }
      if (event.key === STORAGE_KEY_AUDIT && event.newValue) {
        setAuditLogs(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleBroadcast);

    // Cross-tab BroadcastChannel listener for instantaneous realtime sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('istart_realtime_channel');
        bc.onmessage = () => {
          const storedTxs = getInitialStorageData(STORAGE_KEY_TRANSACTIONS, INITIAL_TRANSACTIONS);
          const storedTeams = getInitialStorageData(STORAGE_KEY_TEAMS, INITIAL_TEAMS);
          const storedActs = getInitialStorageData(STORAGE_KEY_ACTIVITIES, INITIAL_ACTIVITIES);
          setTransactions(storedTxs);
          setTeams(storedTeams);
          setActivities(storedActs);
          setLastUpdateTimestamp(Date.now());
        };
      } catch {}
    }

    return () => {
      window.removeEventListener('storage', handleBroadcast);
      bc?.close();
    };
  }, []);

  // Supabase Realtime channel integration
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel('score_transactions_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'score_transactions' },
        (payload) => {
          setLastUpdateTimestamp(Date.now());
          if (payload.eventType === 'INSERT') {
            const newTx = payload.new as ScoreTransaction;
            setTransactions((prev) => [newTx, ...prev.filter((t) => t.id !== newTx.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as ScoreTransaction;
            setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as ScoreTransaction;
            setTransactions((prev) => prev.filter((t) => t.id !== deleted.id));
          }
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Authenticate as a specific role
  const loginAs = useCallback(
    (role: 'ADMIN' | 'SCORER') => {
      const profile = profiles.find((p) => p.role === role) || INITIAL_PROFILES[0];
      persistState(undefined, undefined, undefined, undefined, profile);
    },
    [profiles, persistState]
  );

  const loginWithCredentials = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string; profile?: Profile }> => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanEmail) {
        return { success: false, error: 'Vui lòng nhập địa chỉ email.' };
      }
      if (!cleanPass) {
        return { success: false, error: 'Vui lòng nhập mật khẩu.' };
      }

      // Valid test/default passwords
      const validAdminPasswords = ['iser2026!secret', 'admin2026', 'admin', 'istart2026'];
      const validScorerPasswords = ['iser2026!secret', 'scorer2026', 'scorer', 'istart2026'];

      // Check current profiles loaded
      const matchedProfile = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

      if (matchedProfile) {
        const allowed = matchedProfile.role === 'ADMIN' ? validAdminPasswords : validScorerPasswords;
        if (!allowed.includes(cleanPass.toLowerCase())) {
          return { success: false, error: 'Mật khẩu không chính xác. Mật khẩu mặc định là: iSER2026!secret' };
        }
        persistState(undefined, undefined, undefined, undefined, matchedProfile);
        return { success: true, profile: matchedProfile };
      }

      // Fallback check against predefined profiles
      if (cleanEmail === 'admin@istartcamp.vn' || cleanEmail.includes('admin')) {
        if (!validAdminPasswords.includes(cleanPass.toLowerCase())) {
          return { success: false, error: 'Mật khẩu quản trị viên không chính xác. Mật khẩu mặc định là: iSER2026!secret' };
        }
        const profile = INITIAL_PROFILES[0];
        persistState(undefined, undefined, undefined, undefined, profile);
        return { success: true, profile };
      }

      if (cleanEmail === 'scorer@istartcamp.vn' || cleanEmail.includes('scorer') || cleanEmail.includes('trongtai')) {
        if (!validScorerPasswords.includes(cleanPass.toLowerCase())) {
          return { success: false, error: 'Mật khẩu trọng tài viên không chính xác. Mật khẩu mặc định là: iSER2026!secret' };
        }
        const profile = INITIAL_PROFILES[1];
        persistState(undefined, undefined, undefined, undefined, profile);
        return { success: true, profile };
      }

      return {
        success: false,
        error: 'Tài khoản email này chưa được đăng ký trong danh sách Trọng tài/Admin.',
      };
    },
    [profiles, persistState]
  );

  const logout = useCallback(() => {
    persistState(undefined, undefined, undefined, undefined, null);
  }, [persistState]);

  // Scoring Action: Add Transaction
  const addTransaction = useCallback(
    async ({
      teamId,
      activityId,
      points,
      metadata,
      notes,
    }: {
      teamId: string;
      activityId: string;
      points: number;
      metadata: Record<string, unknown>;
      notes?: string;
    }) => {
      const team = teams.find((t) => t.id === teamId);
      const activity = activities.find((a) => a.id === activityId);

      if (!team || !activity) {
        return { success: false, error: 'Đội hoặc Hoạt động không hợp lệ' };
      }

      // Check one-time duplicate prevention
      if (!activity.is_repeatable) {
        const hasExisting = transactions.some(
          (t) => t.team_id === teamId && t.activity_id === activityId && t.status === 'ACTIVE'
        );
        if (hasExisting) {
          return {
            success: false,
            error: `Đội ${team.code} đã được ghi điểm cho hoạt động một lần "${activity.name}". Vui lòng sửa giao dịch cũ nếu cần thay đổi điểm.`,
          };
        }
      }

      // Execute on real Supabase Database
      const dbResult = await insertScoreTransaction(
        {
          team_id: teamId,
          activity_id: activityId,
          points_awarded: points,
          metadata,
          status: 'ACTIVE',
          notes: notes || '',
          created_by: currentProfile?.id,
          created_by_name: currentProfile?.full_name || 'Trọng tài iSER',
          team,
          activity,
        },
        notes || 'Chấm điểm hoạt động'
      );

      if (!dbResult.success || !dbResult.transaction) {
        return { success: false, error: dbResult.error || 'Lỗi khi lưu giao dịch' };
      }

      const newTx = dbResult.transaction;
      const updatedTransactions = [newTx, ...transactions];

      const newAuditLog: ScoreAuditLog = {
        id: `log-${Date.now()}`,
        transaction_id: newTx.id,
        action: 'CREATE',
        performed_by: currentProfile?.id || 'anonymous',
        performed_by_name: currentProfile?.full_name || 'Trọng tài iSER',
        new_value: newTx,
        reason: notes || 'Chấm điểm ban đầu',
        created_at: new Date().toISOString(),
        transaction: newTx,
      };
      const updatedAudit = [newAuditLog, ...auditLogs];

      persistState(undefined, undefined, updatedTransactions, updatedAudit);
      return { success: true, transaction: newTx };
    },
    [teams, activities, transactions, auditLogs, currentProfile, persistState]
  );

  // Scoring Action: Edit Transaction (Admin only)
  const editTransaction = useCallback(
    async ({
      id,
      points,
      reason,
      notes,
    }: {
      id: string;
      points: number;
      reason: string;
      notes?: string;
    }) => {
      const target = transactions.find((t) => t.id === id);
      if (!target) return { success: false, error: 'Không tìm thấy giao dịch điểm' };

      const oldSnapshot = { ...target };
      const now = new Date().toISOString();

      // Execute on real Supabase Database
      const dbRes = await updateScoreTransaction(id, points, reason, currentProfile?.id);
      if (!dbRes.success) {
        return { success: false, error: dbRes.error };
      }

      const updatedTx: ScoreTransaction = {
        ...target,
        points_awarded: points,
        status: 'MODIFIED',
        notes: notes !== undefined ? notes : target.notes,
        updated_at: now,
      };

      const newAuditLog: ScoreAuditLog = {
        id: `log-${Date.now()}`,
        transaction_id: id,
        action: 'EDIT',
        performed_by: currentProfile?.id || 'anonymous',
        performed_by_name: currentProfile?.full_name || 'Camp Master Admin',
        old_value: oldSnapshot,
        new_value: updatedTx,
        reason: reason || 'Chỉnh sửa lại số điểm theo khiếu nại',
        created_at: now,
        transaction: updatedTx,
      };

      const updatedTransactions = transactions.map((t) => (t.id === id ? updatedTx : t));
      const updatedAudit = [newAuditLog, ...auditLogs];

      persistState(undefined, undefined, updatedTransactions, updatedAudit);
      return { success: true };
    },
    [transactions, auditLogs, currentProfile, persistState]
  );

  // Scoring Action: Undo Transaction (Admin only)
  const undoTransaction = useCallback(
    async ({ id, reason }: { id: string; reason: string }) => {
      const target = transactions.find((t) => t.id === id);
      if (!target) return { success: false, error: 'Không tìm thấy giao dịch điểm' };

      const oldSnapshot = { ...target };
      const now = new Date().toISOString();

      // Execute on real Supabase Database
      const dbRes = await undoScoreTransaction(id, reason, currentProfile?.id);
      if (!dbRes.success) {
        return { success: false, error: dbRes.error };
      }

      const updatedTx: ScoreTransaction = {
        ...target,
        status: 'UNDONE',
        updated_at: now,
      };

      const newAuditLog: ScoreAuditLog = {
        id: `log-${Date.now()}`,
        transaction_id: id,
        action: 'UNDO',
        performed_by: currentProfile?.id || 'anonymous',
        performed_by_name: currentProfile?.full_name || 'Camp Master Admin',
        old_value: oldSnapshot,
        new_value: updatedTx,
        reason: reason || 'Hủy bỏ giao dịch điểm do nhập nhầm',
        created_at: now,
        transaction: updatedTx,
      };

      const updatedTransactions = transactions.map((t) => (t.id === id ? updatedTx : t));
      const updatedAudit = [newAuditLog, ...auditLogs];

      persistState(undefined, undefined, updatedTransactions, updatedAudit);
      return { success: true };
    },
    [transactions, auditLogs, currentProfile, persistState]
  );

  // Update Scoring Rule in Supabase
  const updateScoringRule = useCallback(
    async (activityId: string, newConfig: RuleConfig) => {
      await updateScoringRuleInSupabase(activityId, newConfig);
      const updated = activities.map((act) => {
        if (act.id === activityId && act.scoring_rule) {
          return {
            ...act,
            scoring_rule: {
              ...act.scoring_rule,
              config: newConfig,
              updated_at: new Date().toISOString(),
            },
          };
        }
        return act;
      });
      persistState(undefined, updated);
    },
    [activities, persistState]
  );

  // Add new scoring activity
  const addActivity = useCallback(
    async (newActivityData: Omit<Activity, 'id' | 'created_at'> & { id?: string }) => {
      const now = new Date().toISOString();
      const activityId = newActivityData.id || `act-${Date.now()}`;
      const newActivity: Activity = {
        ...newActivityData,
        id: activityId,
        created_at: now,
        scoring_rule: newActivityData.scoring_rule
          ? {
              ...newActivityData.scoring_rule,
              id: newActivityData.scoring_rule.id || `rule-${Date.now()}`,
              activity_id: activityId,
              created_at: now,
              updated_at: now,
            }
          : undefined,
      };

      await insertActivityInSupabase(newActivity);
      const updated = [...activities, newActivity];
      persistState(undefined, updated);
      return { success: true, activity: newActivity };
    },
    [activities, persistState]
  );

  // Update existing activity
  const updateActivity = useCallback(
    async (activityId: string, updates: Partial<Activity>) => {
      await updateActivityInSupabase(activityId, updates);
      const updated = activities.map((act) => {
        if (act.id === activityId) {
          return {
            ...act,
            ...updates,
            scoring_rule: updates.scoring_rule !== undefined ? updates.scoring_rule : act.scoring_rule,
          };
        }
        return act;
      });
      persistState(undefined, updated);
    },
    [activities, persistState]
  );

  // Delete activity
  const deleteActivity = useCallback(
    async (activityId: string) => {
      await deleteActivityInSupabase(activityId);
      const updated = activities.filter((act) => act.id !== activityId);
      persistState(undefined, updated);
    },
    [activities, persistState]
  );

  // Update Team in Supabase
  const updateTeam = useCallback(
    async (teamId: string, updates: Partial<Team>) => {
      await updateTeamInSupabase(teamId, updates);
      const updated = teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t));
      persistState(updated);
    },
    [teams, persistState]
  );

  // Add Special Score (Bonus / Penalty / Emergency Rescue / Spontaneous Challenge)
  const addSpecialScore = useCallback(
    async ({
      teamId,
      points,
      reason,
      categoryName = 'Sự kiện đặc biệt',
      notes,
    }: {
      teamId: string;
      points: number;
      reason: string;
      categoryName?: string;
      notes?: string;
    }) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return { success: false, error: 'Không tìm thấy thông tin đội' };
      if (!reason || !reason.trim()) {
        return { success: false, error: 'Bắt buộc nhập lý do cộng/trừ điểm đặc biệt' };
      }

      // Check or create special event activity
      let specialAct = activities.find(
        (a) => a.code === 'SPECIAL_EVENT' || a.id === 'act-special-event'
      );
      let nextActivities = activities;
      if (!specialAct) {
        specialAct = {
          id: 'act-special-event',
          code: 'SPECIAL_EVENT',
          name: 'Điểm Thưởng / Phạt Sự Kiện Đặc Biệt',
          category: 'SPECIAL',
          description: 'Ghi nhận điểm thưởng đột xuất, giải cứu hoặc vi phạm đặc biệt từ Ban Tổ Chức',
          rule_type: 'FIXED',
          is_repeatable: true,
          display_order: 99,
          is_active: true,
          created_at: new Date().toISOString(),
          scoring_rule: {
            id: 'rule-special-event',
            activity_id: 'act-special-event',
            rule_type: 'FIXED',
            config: { points: 0 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
        nextActivities = [...activities, specialAct];
      }

      const fullReason = reason.trim();
      const combinedNotes = notes ? `${fullReason} • ${notes}` : fullReason;

      const dbResult = await insertScoreTransaction(
        {
          team_id: teamId,
          activity_id: specialAct.id,
          points_awarded: points,
          metadata: {
            is_special: true,
            category_name: categoryName,
            reason: fullReason,
            notes: notes || '',
          },
          status: 'ACTIVE',
          notes: combinedNotes,
          created_by: currentProfile?.id,
          created_by_name: currentProfile?.full_name || 'Camp Master Admin',
          team,
          activity: specialAct,
        },
        `[Đặc biệt] ${combinedNotes}`
      );

      if (!dbResult.success || !dbResult.transaction) {
        return { success: false, error: dbResult.error || 'Lỗi khi lưu điểm đặc biệt' };
      }

      const newTx = dbResult.transaction;
      const updatedTxs = [newTx, ...transactions];

      const newAuditLog: ScoreAuditLog = {
        id: `log-${Date.now()}`,
        transaction_id: newTx.id,
        action: 'CREATE',
        performed_by: currentProfile?.id || 'admin',
        performed_by_name: currentProfile?.full_name || 'Camp Master Admin',
        new_value: newTx,
        reason: `[Điểm đặc biệt ${categoryName}] ${combinedNotes}`,
        created_at: new Date().toISOString(),
        transaction: newTx,
      };

      persistState(
        undefined,
        nextActivities !== activities ? nextActivities : undefined,
        updatedTxs,
        [newAuditLog, ...auditLogs]
      );
      return { success: true, transaction: newTx };
    },
    [teams, activities, transactions, auditLogs, currentProfile, persistState]
  );

  // Set Initial Baseline Points for Teams from manual prior activities
  const setInitialBaselinePoints = useCallback(
    async (entries: Array<{ teamId: string; points: number; reason: string }>) => {
      let baselineAct = activities.find(
        (a) => a.code === 'BASELINE' || a.id === 'act-initial-baseline'
      );
      let nextActivities = activities;
      if (!baselineAct) {
        baselineAct = {
          id: 'act-initial-baseline',
          code: 'BASELINE',
          name: 'Điểm Khởi Đầu / Hoạt Động Trước Trại',
          category: 'SPECIAL',
          description: 'Ghi nhận điểm số tích lũy từ các hoạt động thủ công trước hội trại',
          rule_type: 'FIXED',
          is_repeatable: true,
          display_order: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          scoring_rule: {
            id: 'rule-initial-baseline',
            activity_id: 'act-initial-baseline',
            rule_type: 'FIXED',
            config: { points: 0 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
        nextActivities = [...activities, baselineAct];
      }

      const newTransactions: ScoreTransaction[] = [];
      const newAuditLogs: ScoreAuditLog[] = [];
      const now = new Date().toISOString();

      for (const entry of entries) {
        if (entry.points === 0 && !entry.reason) continue;
        const team = teams.find((t) => t.id === entry.teamId);
        if (!team) continue;

        const txId = `tx-base-${team.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const noteText = entry.reason?.trim() || 'Điểm tích lũy từ các hoạt động thủ công trước hội trại';

        const tx: ScoreTransaction = {
          id: txId,
          team_id: team.id,
          activity_id: baselineAct.id,
          points_awarded: entry.points,
          metadata: {
            is_baseline: true,
            reason: noteText,
          },
          status: 'ACTIVE',
          notes: noteText,
          created_by: currentProfile?.id,
          created_by_name: currentProfile?.full_name || 'Camp Master Admin',
          created_at: now,
          updated_at: now,
          team,
          activity: baselineAct,
        };

        newTransactions.push(tx);
        newAuditLogs.push({
          id: `log-${Date.now()}-${team.id}`,
          transaction_id: tx.id,
          action: 'CREATE',
          performed_by: currentProfile?.id || 'admin',
          performed_by_name: currentProfile?.full_name || 'Camp Master Admin',
          new_value: tx,
          reason: `[Khởi tạo điểm] Đội ${team.code}: ${entry.points >= 0 ? '+' : ''}${entry.points}đ (${noteText})`,
          created_at: now,
          transaction: tx,
        });

        insertScoreTransaction(tx, noteText).catch(() => {});
      }

      if (newTransactions.length > 0) {
        const updatedTxs = [...newTransactions, ...transactions];
        const updatedLogs = [...newAuditLogs, ...auditLogs];
        persistState(
          undefined,
          nextActivities !== activities ? nextActivities : undefined,
          updatedTxs,
          updatedLogs
        );
      }

      return { success: true, count: newTransactions.length };
    },
    [teams, activities, transactions, auditLogs, currentProfile, persistState]
  );

  // Load full demo dataset
  const loadDemoData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(INITIAL_TEAMS));
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    setTeams(INITIAL_TEAMS);
    setActivities(INITIAL_ACTIVITIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setLastUpdateTimestamp(Date.now());
  }, []);

  // Wipe to clean zero for live event scoring
  const wipeDataToZero = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify([]));
    }
    setTransactions([]);
    setAuditLogs([]);
    setLastUpdateTimestamp(Date.now());
  }, []);

  // Reset data to initial demo state
  const resetAllData = useCallback(() => {
    loadDemoData();
    setCurrentProfile(INITIAL_PROFILES[0]);
  }, [loadDemoData]);

  // Leaderboard is always strictly derived from active transactions
  const rankedTeams = useMemo(() => {
    return calculateLeaderboard(teams, transactions);
  }, [teams, transactions]);

  // Enrich transactions with team & activity references
  const enrichedTransactions = useMemo(() => {
    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const actMap = new Map(activities.map((a) => [a.id, a]));

    return transactions.map((tx) => ({
      ...tx,
      team: tx.team || teamMap.get(tx.team_id),
      activity: tx.activity || actMap.get(tx.activity_id),
    }));
  }, [transactions, teams, activities]);

  return (
    <ScoringContext.Provider
      value={{
        teams,
        rankedTeams,
        activities,
        transactions: enrichedTransactions,
        auditLogs,
        profiles,
        currentProfile,
        isRealtimeConnected,
        isDemoMode,
        lastUpdateTimestamp,
        isLoading,
        loginAs,
        loginWithCredentials,
        logout,
        addTransaction,
        editTransaction,
        undoTransaction,
        updateScoringRule,
        addActivity,
        updateActivity,
        deleteActivity,
        updateTeam,
        addSpecialScore,
        setInitialBaselinePoints,
        resetAllData,
        loadDemoData,
        wipeDataToZero,
      }}
    >
      {children}
    </ScoringContext.Provider>
  );
}

export function useScoringSystem() {
  const context = useContext(ScoringContext);
  if (!context) {
    throw new Error('useScoringSystem must be used within a ScoringProvider');
  }
  return context;
}
