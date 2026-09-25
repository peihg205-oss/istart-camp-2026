// ==============================================================================
// IStart Camp 2026 - Supabase Data Service (Full CRUD on Real Database)
// ==============================================================================
import { createClient } from '@/lib/supabase/client';
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
} from '@/lib/data/seedData';

/**
 * Fetch all teams from Supabase
 */
export async function fetchLiveTeams(): Promise<Team[]> {
  const supabase = createClient();
  if (!supabase) return INITIAL_TEAMS;

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_TEAMS;
    }
    return data as Team[];
  } catch (err) {
    console.warn('Fallback to local teams:', err);
    return INITIAL_TEAMS;
  }
}

/**
 * Fetch all activities & scoring rules from Supabase
 */
export async function fetchLiveActivities(): Promise<Activity[]> {
  const supabase = createClient();
  if (!supabase) return INITIAL_ACTIVITIES;

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*, scoring_rules(*)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_ACTIVITIES;
    }

    return data.map((act) => ({
      ...act,
      scoring_rule: act.scoring_rules?.[0] || undefined,
    })) as Activity[];
  } catch (err) {
    console.warn('Fallback to local activities:', err);
    return INITIAL_ACTIVITIES;
  }
}

/**
 * Fetch real score transactions from Supabase (NO fake score data)
 */
export async function fetchLiveTransactions(): Promise<ScoreTransaction[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('score_transactions')
      .select('*, team:teams(*), activity:activities(*)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }
    return data as ScoreTransaction[];
  } catch (err) {
    console.warn('Error fetching transactions:', err);
    return [];
  }
}

/**
 * Fetch real audit logs from Supabase
 */
export async function fetchLiveAuditLogs(): Promise<ScoreAuditLog[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('score_audit_logs')
      .select('*, transaction:score_transactions(*)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }
    return data as ScoreAuditLog[];
  } catch (err) {
    console.warn('Error fetching audit logs:', err);
    return [];
  }
}

/**
 * Fetch profiles/users from Supabase
 */
export async function fetchLiveProfiles(): Promise<Profile[]> {
  const supabase = createClient();
  if (!supabase) return INITIAL_PROFILES;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_PROFILES;
    }
    return data as Profile[];
  } catch (err) {
    console.warn('Error fetching profiles:', err);
    return INITIAL_PROFILES;
  }
}

/**
 * Insert new score transaction and audit log into Supabase
 */
export async function insertScoreTransaction(
  tx: Omit<ScoreTransaction, 'id' | 'created_at' | 'updated_at'>,
  reason?: string
): Promise<{ success: boolean; transaction?: ScoreTransaction; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    // Local / offline fallback
    const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const createdTx: ScoreTransaction = {
      ...tx,
      id,
      created_at: now,
      updated_at: now,
    };
    return { success: true, transaction: createdTx };
  }

  try {
    const { data: insertedTx, error: txError } = await supabase
      .from('score_transactions')
      .insert({
        team_id: tx.team_id,
        activity_id: tx.activity_id,
        points_awarded: tx.points_awarded,
        metadata: tx.metadata,
        notes: tx.notes,
        status: tx.status || 'ACTIVE',
        created_by: tx.created_by && tx.created_by.includes('-') ? tx.created_by : null,
      })
      .select('*, team:teams(*), activity:activities(*)')
      .single();

    if (txError || !insertedTx) {
      return { success: false, error: txError?.message || 'Không thể tạo giao dịch điểm' };
    }

    // Insert Audit Log
    await supabase.from('score_audit_logs').insert({
      transaction_id: insertedTx.id,
      action: 'CREATE',
      performed_by: tx.created_by && tx.created_by.includes('-') ? tx.created_by : null,
      new_value: insertedTx,
      reason: reason || tx.notes || 'Chấm điểm mới',
    });

    return { success: true, transaction: insertedTx as ScoreTransaction };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi kết nối Supabase' };
  }
}

/**
 * Update transaction in Supabase with EDIT audit log
 */
export async function updateScoreTransaction(
  id: string,
  newPoints: number,
  reason: string,
  performedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: true };
  }

  try {
    // Get existing snapshot
    const { data: existing } = await supabase
      .from('score_transactions')
      .select('*')
      .eq('id', id)
      .single();

    const { data: updated, error: updateError } = await supabase
      .from('score_transactions')
      .update({
        points_awarded: newPoints,
        status: 'MODIFIED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Insert Audit Log
    await supabase.from('score_audit_logs').insert({
      transaction_id: id,
      action: 'UPDATE',
      performed_by: performedBy && performedBy.includes('-') ? performedBy : null,
      old_value: existing,
      new_value: updated,
      reason,
    });

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi sửa điểm' };
  }
}

/**
 * Undo transaction in Supabase with UNDO audit log
 */
export async function undoScoreTransaction(
  id: string,
  reason: string,
  performedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: true };
  }

  try {
    const { data: existing } = await supabase
      .from('score_transactions')
      .select('*')
      .eq('id', id)
      .single();

    const { data: updated, error: updateError } = await supabase
      .from('score_transactions')
      .update({
        status: 'UNDONE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Insert Audit Log
    await supabase.from('score_audit_logs').insert({
      transaction_id: id,
      action: 'UNDO',
      performed_by: performedBy && performedBy.includes('-') ? performedBy : null,
      old_value: existing,
      new_value: updated,
      reason,
    });

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi hoàn tác' };
  }
}

/**
 * Update Team in Supabase
 */
export async function updateTeamInSupabase(
  id: string,
  updates: Partial<Team>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { success: true };

  try {
    const { error } = await supabase.from('teams').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi cập nhật đội' };
  }
}

/**
 * Update Scoring Rule in Supabase
 */
export async function updateScoringRuleInSupabase(
  activityId: string,
  config: RuleConfig
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('scoring_rules')
      .update({ config, updated_at: new Date().toISOString() })
      .eq('activity_id', activityId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi cập nhật quy tắc' };
  }
}

/**
 * Insert Activity into Supabase
 */
export async function insertActivityInSupabase(
  activity: Activity
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { success: true };

  try {
    // 1. Insert activity row (without nested scoring_rule)
    const { scoring_rule, ...activityRow } = activity;
    const { error: actError } = await supabase.from('activities').insert(activityRow);
    if (actError) return { success: false, error: actError.message };

    // 2. Insert scoring_rule row if present
    if (scoring_rule) {
      const { error: ruleError } = await supabase.from('scoring_rules').insert(scoring_rule);
      if (ruleError) console.warn('Supabase scoring rule insert warning:', ruleError);
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi thêm hoạt động' };
  }
}

/**
 * Update Activity in Supabase
 */
export async function updateActivityInSupabase(
  id: string,
  updates: Partial<Activity>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { success: true };

  try {
    const { scoring_rule, ...activityUpdates } = updates;
    if (Object.keys(activityUpdates).length > 0) {
      const { error } = await supabase.from('activities').update(activityUpdates).eq('id', id);
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi cập nhật hoạt động' };
  }
}

/**
 * Delete Activity in Supabase
 */
export async function deleteActivityInSupabase(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { success: true };

  try {
    await supabase.from('scoring_rules').delete().eq('activity_id', id);
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi xóa hoạt động' };
  }
}

