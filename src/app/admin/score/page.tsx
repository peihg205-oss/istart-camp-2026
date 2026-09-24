'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useScoringSystem } from '@/lib/store/scoringStore';
import { useToast } from '@/components/ui/ToastProvider';
import {
  calculateScorePreview,
  checkDuplicateSubmission,
} from '@/lib/scoring/engine';
import {
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ShieldCheck,
  Plus,
  Minus,
  FileCheck,
  Zap,
  Award,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  QuantityRuleConfig,
  RankingRuleConfig,
  FixedRuleConfig,
} from '@/types';

export default function AdminScorePage() {
  const router = useRouter();
  const toast = useToast();
  const {
    rankedTeams,
    activities,
    transactions,
    addTransaction,
    addSpecialScore,
    currentProfile,
  } = useScoringSystem();

  // Mode: Standard Rule Scoring vs Special / Ad-hoc Scoring
  const [scoringMode, setScoringMode] = useState<'STANDARD' | 'SPECIAL'>('STANDARD');

  // Wizard state (Standard)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');

  // Input states (Standard)
  const [rankInput, setRankInput] = useState<number>(1);
  const [quantityItemId, setQuantityItemId] = useState<string>('noise');
  const [quantityCount, setQuantityCount] = useState<number>(1);
  const [morningScore, setMorningScore] = useState<number>(85);
  const [afternoonScore, setAfternoonScore] = useState<number>(90);
  const [customNotes, setCustomNotes] = useState<string>('');

  // Special Scoring states
  const [specialPoints, setSpecialPoints] = useState<number>(30);
  const [specialCategory, setSpecialCategory] = useState<string>('Thưởng đột xuất (Bonus)');
  const [specialReason, setSpecialReason] = useState<string>('');
  const [specialDetailNotes, setSpecialDetailNotes] = useState<string>('');

  // UI state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 1. Resolve selected entities
  const selectedTeam = useMemo(() => {
    return rankedTeams.find((t) => t.id === selectedTeamId);
  }, [rankedTeams, selectedTeamId]);

  const selectedActivity = useMemo(() => {
    return activities.find((a) => a.id === selectedActivityId);
  }, [activities, selectedActivityId]);

  const duplicateCheck = useMemo(() => {
    if (!selectedTeamId || !selectedActivity) return { allowed: true };
    return checkDuplicateSubmission(selectedTeamId, selectedActivity, transactions);
  }, [selectedTeamId, selectedActivity, transactions]);

  // Synchronize item and rank selection with selected activity
  React.useEffect(() => {
    if (!selectedActivity) return;
    if (selectedActivity.rule_type === 'QUANTITY') {
      const items = (selectedActivity.scoring_rule?.config as QuantityRuleConfig)?.items || [];
      if (items.length > 0 && !items.some((i) => i.id === quantityItemId)) {
        setQuantityItemId(items[0].id);
      }
    } else if (selectedActivity.rule_type === 'RANKING') {
      const ranks = (selectedActivity.scoring_rule?.config as RankingRuleConfig)?.ranks || {};
      const rankKeys = Object.keys(ranks).map(Number);
      if (rankKeys.length > 0 && !rankKeys.includes(rankInput)) {
        setRankInput(rankKeys[0]);
      }
    }
  }, [selectedActivity, quantityItemId, rankInput]);

  // Auto calculate preview points based on current inputs
  const calculationPreview = useMemo(() => {
    if (!selectedActivity || !selectedActivity.scoring_rule) {
      return { points: 0, breakdown: 'Chưa chọn hoạt động', isValid: false };
    }

    const rule = selectedActivity.scoring_rule;
    return calculateScorePreview({
      ruleType: selectedActivity.rule_type,
      config: rule.config,
      rank: rankInput,
      quantityItemId,
      quantityCount,
      formulaValues: {
        morning: morningScore,
        afternoon: afternoonScore,
      },
    });
  }, [
    selectedActivity,
    rankInput,
    quantityItemId,
    quantityCount,
    morningScore,
    afternoonScore,
  ]);

  // Handle final submission (Standard Flow)
  const handleConfirmSubmit = async () => {
    if (!selectedTeamId || !selectedActivityId || !calculationPreview.isValid) {
      return;
    }

    if (!duplicateCheck.allowed) {
      setErrorMessage(duplicateCheck.reason || 'Trùng lặp giao dịch');
      setIsModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await addTransaction({
        teamId: selectedTeamId,
        activityId: selectedActivityId,
        points: calculationPreview.points,
        metadata: {
          rule_type: selectedActivity?.rule_type,
          rank: rankInput,
          quantity_item_id: quantityItemId,
          quantity_count: quantityCount,
          formula_values: {
            morning: morningScore,
            afternoon: afternoonScore,
          },
          breakdown: calculationPreview.breakdown,
        },
        notes: customNotes.trim() || calculationPreview.breakdown,
      });

      setIsSubmitting(false);
      setIsModalOpen(false);

      if (result.success) {
        setSubmissionSuccess(true);
        toast.success(
          'Đã lưu giao dịch điểm thành công!',
          `${selectedTeam?.code}: ${calculationPreview.points >= 0 ? '+' : ''}${calculationPreview.points}đ cho ${selectedActivity?.name}`
        );
      } else {
        setErrorMessage(result.error || 'Có lỗi xảy ra khi lưu giao dịch.');
        toast.error('Không thể lưu giao dịch', result.error);
      }
    } catch (e: unknown) {
      setIsSubmitting(false);
      setIsModalOpen(false);
      const errMsg = e instanceof Error ? e.message : 'Lỗi hệ thống';
      setErrorMessage(errMsg);
      toast.error('Lỗi khi chấm điểm', errMsg);
    }
  };

  // Handle Special Score Submission
  const handleConfirmSpecialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      alert('Vui lòng chọn đội tuyển được cộng/trừ điểm');
      return;
    }
    if (!specialReason.trim()) {
      alert('Vui lòng nhập lý do cụ thể để minh bạch trên bảng điểm công khai!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addSpecialScore({
        teamId: selectedTeamId,
        points: specialPoints,
        reason: specialReason.trim(),
        categoryName: specialCategory,
        notes: specialDetailNotes.trim(),
      });

      setIsSubmitting(false);
      if (res.success) {
        setSubmissionSuccess(true);
        toast.success(
          'Đã ghi nhận điểm đặc biệt!',
          `${selectedTeam?.code}: ${specialPoints >= 0 ? '+' : ''}${specialPoints}đ (${specialReason})`
        );
      } else {
        setErrorMessage(res.error || 'Lỗi khi lưu điểm đặc biệt');
      }
    } catch (e: unknown) {
      setIsSubmitting(false);
      const errMsg = e instanceof Error ? e.message : 'Lỗi hệ thống';
      setErrorMessage(errMsg);
    }
  };

  const handleResetForm = () => {
    setSelectedTeamId('');
    setSelectedActivityId('');
    setCustomNotes('');
    setSpecialReason('');
    setSpecialDetailNotes('');
    setSubmissionSuccess(false);
    setErrorMessage('');
    setQuantityCount(1);
    setRankInput(1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 text-[#2D2A26]">
      {/* Header */}
      <div className="pb-4 border-b border-[#DFD8CA]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A55E3]/10 text-[#1A55E3] border border-[#1A55E3]/25 text-xs font-black uppercase tracking-wider mb-2">
          <Calculator className="w-3.5 h-3.5" /> Hệ Thống Chấm Điểm Realtime
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
          NHẬP ĐIỂM & GHI NHẬN THÀNH TÍCH
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] font-medium">
          Chấm điểm theo thể lệ chuẩn hoặc cộng/trừ điểm đặc biệt với lý do minh bạch, tự động đồng bộ thời gian thực sang bảng điểm công khai.
        </p>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => {
              setScoringMode('STANDARD');
              setSubmissionSuccess(false);
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
              scoringMode === 'STANDARD'
                ? 'bg-[#1A55E3] text-white shadow-xs'
                : 'bg-white hover:bg-[#EAE5DB] text-[#5A5248] border border-[#E2DDD2]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Chấm theo Thể Lệ Hoạt Động (Chuẩn)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScoringMode('SPECIAL');
              setSubmissionSuccess(false);
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
              scoringMode === 'SPECIAL'
                ? 'bg-gradient-to-r from-[#FF0854] to-[#1A55E3] text-white shadow-xs'
                : 'bg-white hover:bg-[#EAE5DB] text-[#5A5248] border border-[#E2DDD2]'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>⚡ Cộng / Trừ Điểm Đặc Biệt (Có lý do)</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {submissionSuccess && (
        <div className="p-6 rounded-3xl bg-[#00D284]/15 border-2 border-[#00D284] text-[#008f5a] shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-[#00D284] flex-shrink-0" />
            <div>
              <h3 className="text-lg font-black text-[#1E293B]">
                Giao Dịch Đã Ghi Nhận Thành Công!
              </h3>
              <p className="text-xs text-[#008f5a] font-medium">
                Điểm số đã được cộng/trừ vào bảng tổng sắp thời gian thực và tự động hiển thị trên giao diện công khai cho các đội.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleResetForm}
              className="px-4 py-2 rounded-xl bg-[#00D284] hover:bg-[#00ba75] text-slate-950 font-black text-xs transition-colors shadow-xs"
            >
              + Tiếp tục ghi điểm
            </button>
            <button
              onClick={() => router.push('/admin/history')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F4F0E6] text-[#1E293B] border border-[#D5CDC0] font-bold text-xs transition-colors"
            >
              Xem sổ nhật ký giao dịch
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FF0854]/15 border border-[#FF0854] text-[#FF0854] text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-150">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: CHẤM THEO THỂ LỆ CHUẨN */}
      {/* ========================================================================= */}
      {scoringMode === 'STANDARD' && (
        <div className="space-y-6">
          {/* STEP 1: CHỌN ĐỘI TUYỂN */}
          <section className="bg-white border border-[#E2DDD2] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1A55E3] text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#1E293B]">
                  BƯỚC 1: CHỌN ĐỘI TUYỂN
                </h2>
              </div>
              {selectedTeam && (
                <span className="text-xs font-bold text-[#1A55E3]">
                  Đã chọn: {selectedTeam.code} (#{selectedTeam.rank} - {selectedTeam.total_score}đ)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {rankedTeams.map((team) => {
                const isSelected = team.id === selectedTeamId;
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#1A55E3] text-white border-[#1A55E3] shadow-md ring-2 ring-[#1A55E3]/40'
                        : 'bg-[#FAF8F5] border-[#E2DDD2] text-[#2D2A26] hover:border-[#1A55E3]/50 hover:bg-white'
                    }`}
                  >
                    <span className="font-black text-sm">{team.code}</span>
                    <span
                      className={`text-[10px] font-semibold mt-0.5 ${
                        isSelected ? 'text-white/90' : 'text-[#64748B]'
                      }`}
                    >
                      {team.total_score}đ (#{team.rank})
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2: CHỌN HOẠT ĐỘNG */}
          <section className="bg-white border border-[#E2DDD2] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1A55E3] text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#1E293B]">
                  BƯỚC 2: CHỌN HOẠT ĐỘNG THI ĐẤU
                </h2>
              </div>
              {selectedActivity && (
                <span className="text-xs font-bold text-[#1A55E3]">
                  Loại: {selectedActivity.rule_type} •{' '}
                  {selectedActivity.is_repeatable ? 'Lặp lại' : '1 lần'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activities.map((act) => {
                const isSelected = act.id === selectedActivityId;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setSelectedActivityId(act.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1A55E3] text-white border-[#1A55E3] shadow-md ring-2 ring-[#1A55E3]/40'
                        : 'bg-[#FAF8F5] border-[#E2DDD2] text-[#2D2A26] hover:border-[#1A55E3]/50 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#EAE5DB] text-[#5A5248]'
                          }`}
                        >
                          {act.rule_type}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? 'text-white/80' : 'text-[#64748B]'
                          }`}
                        >
                          {act.category}
                        </span>
                      </div>
                      <div className="font-black text-sm">{act.name}</div>
                    </div>
                    <p
                      className={`text-[11px] line-clamp-2 mt-2 leading-relaxed ${
                        isSelected ? 'text-white/85' : 'text-[#64748B]'
                      }`}
                    >
                      {act.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 3: NHẬP ĐIỂM THEO CẤU HÌNH THỂ LỆ */}
          {selectedActivity && (
            <section className="bg-white border border-[#E2DDD2] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EAE5D9]">
                <span className="w-6 h-6 rounded-full bg-[#1A55E3] text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#1E293B]">
                  BƯỚC 3: THIẾT LẬP THÔNG SỐ ĐIỂM
                </h2>
              </div>

              {/* FIXED */}
              {selectedActivity.rule_type === 'FIXED' && (
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E2DDD2] text-xs">
                  <p className="text-[#5A5248]">
                    Quy tắc điểm cố định: Đội hoàn thành đạt chuẩn sẽ nhận được{' '}
                    <strong className="text-[#00a86b] text-sm">
                      +{(selectedActivity.scoring_rule?.config as FixedRuleConfig)?.points || 15} điểm
                    </strong>
                    .
                  </p>
                </div>
              )}

              {/* RANKING */}
              {selectedActivity.rule_type === 'RANKING' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#1E293B]">
                    Chọn Thứ Hạng Đạt Được Trong Vòng Đấu:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(
                      (selectedActivity.scoring_rule?.config as RankingRuleConfig)?.ranks || {
                        '1': 30,
                        '2': 25,
                        '3': 20,
                      }
                    )
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([rStr, pts]) => {
                        const r = Number(rStr);
                        const isSelected = rankInput === r;
                        return (
                          <button
                            key={rStr}
                            type="button"
                            onClick={() => setRankInput(r)}
                            className={`p-4 rounded-2xl border text-center transition-all ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-black ring-2 ring-amber-300'
                                : 'bg-[#FAF8F5] border-[#E2DDD2] text-[#2D2A26] hover:bg-white'
                            }`}
                          >
                            <div className="text-xs font-bold uppercase">Hạng {r}</div>
                            <div className="text-lg font-black mt-1">+{pts} điểm</div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* QUANTITY */}
              {selectedActivity.rule_type === 'QUANTITY' && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-[#1E293B]">
                    Chọn Mục Kỷ Luật Hoặc Đóng Góp Tích Cực:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(
                      (selectedActivity.scoring_rule?.config as QuantityRuleConfig)?.items || []
                    ).map((item) => {
                      const isSelected = quantityItemId === item.id;
                      const isPositive = item.points > 0;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setQuantityItemId(item.id)}
                          className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#1A55E3] text-white border-[#1A55E3] ring-2 ring-[#1A55E3]/40'
                              : 'bg-[#FAF8F5] border-[#E2DDD2] text-[#2D2A26] hover:bg-white'
                          }`}
                        >
                          <span className="font-semibold text-xs">{item.label}</span>
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : isPositive
                                ? 'bg-[#00D284]/15 text-[#00a86b]'
                                : 'bg-[#FF0854]/15 text-[#FF0854]'
                            }`}
                          >
                            {isPositive ? `+${item.points}` : item.points}đ/lần
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-bold text-[#1E293B] mb-2 block">
                      Số Lần Phát Sinh (Quantity Count):
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantityCount(Math.max(1, quantityCount - 1))}
                        className="w-10 h-10 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#1E293B] flex items-center justify-center font-black"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-xl text-[#1E293B] w-12 text-center">
                        {quantityCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantityCount(quantityCount + 1)}
                        className="w-10 h-10 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#1E293B] flex items-center justify-center font-black"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FORMULA */}
              {selectedActivity.rule_type === 'FORMULA' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1E293B]">
                      Điểm Phiên Sáng (Thang 0-100, Trọng số 40%):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={morningScore}
                      onChange={(e) => setMorningScore(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-sm font-bold text-[#1E293B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1E293B]">
                      Điểm Phiên Chiều (Thang 0-100, Trọng số 60%):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={afternoonScore}
                      onChange={(e) => setAfternoonScore(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-sm font-bold text-[#1E293B]"
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STEP 4: GHI CHÚ & LÝ DO MINH BẠCH */}
          {selectedActivity && (
            <section className="bg-white border border-[#E2DDD2] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EAE5D9]">
                <span className="w-6 h-6 rounded-full bg-[#1A55E3] text-white text-xs font-black flex items-center justify-center">
                  4
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#1E293B]">
                  BƯỚC 4: LÝ DO & GHI CHÚ CHẤM ĐIỂM
                </h2>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A5248] block mb-1">
                  Ghi chú cụ thể (Hiển thị công khai để các đội nắm rõ):
                </label>
                <input
                  type="text"
                  placeholder={calculationPreview.breakdown || 'Ghi rõ diễn giải nếu cần'}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-xs font-medium text-[#1E293B] focus:outline-none focus:border-[#1A55E3]"
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-[#64748B]">Mẫu lý do:</span>
                {[
                  'Hoàn thành xuất sắc bài thi',
                  'Tham gia đầy đủ và đúng giờ',
                  'Vi phạm quy chế lần 1',
                  'Đóng góp tích cực hoạt động chung',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCustomNotes(s)}
                    className="px-2.5 py-1 rounded-lg bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#2D2A26] font-semibold transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* STEP 5: XEM TRƯỚC VÀ XÁC NHẬN */}
          {selectedTeam && selectedActivity && (
            <section className="bg-white border border-[#E2DDD2] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1A55E3] text-white text-xs font-black flex items-center justify-center">
                    5
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-[#1E293B]">
                    BƯỚC 5: XÁC NHẬN VÀ LƯU ĐIỂM
                  </h2>
                </div>
                <div className="text-lg font-black">
                  Điểm dự kiến:{' '}
                  <span
                    className={
                      calculationPreview.points >= 0 ? 'text-[#00a86b]' : 'text-[#FF0854]'
                    }
                  >
                    {calculationPreview.points >= 0 ? '+' : ''}
                    {calculationPreview.points} điểm
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Đội nhận điểm:</span>
                  <span className="font-bold text-[#1E293B]">
                    {selectedTeam.code} - {selectedTeam.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Hoạt động:</span>
                  <span className="font-bold text-[#1E293B]">{selectedActivity.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Lý do & Diễn giải:</span>
                  <span className="font-medium text-[#1E293B]">
                    {customNotes || calculationPreview.breakdown}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!calculationPreview.isValid}
                  className="px-6 py-3 rounded-2xl bg-[#1A55E3] hover:bg-[#1547bf] disabled:opacity-50 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-[#1A55E3]/25 transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Xác Nhận & Ghi Điểm</span>
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CỘNG / TRỪ ĐIỂM ĐẶC BIỆT (SPECIAL SCORING) */}
      {/* ========================================================================= */}
      {scoringMode === 'SPECIAL' && (
        <form
          onSubmit={handleConfirmSpecialSubmit}
          className="bg-white border border-[#E2DDD2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE5D9]">
            <Zap className="w-5 h-5 text-[#FF0854]" />
            <div>
              <h2 className="text-lg font-black text-[#1E293B]">
                GHI NHẬN ĐIỂM SỰ KIỆN / THƯỞNG PHẠT ĐẶC BIỆT
              </h2>
              <p className="text-xs text-[#64748B]">
                Dành cho các tình huống bất ngờ, giải cứu thử thách, minigame ngẫu hứng hoặc đóng góp xuất sắc.
              </p>
            </div>
          </div>

          {/* 1. Chọn Đội */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1E293B]">
              1. Chọn Đội Tuyển Được Cộng / Trừ Điểm: <span className="text-[#FF0854]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {rankedTeams.map((team) => {
                const isSelected = team.id === selectedTeamId;
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#1A55E3] text-white border-[#1A55E3] font-black shadow-xs ring-2 ring-[#1A55E3]/30'
                        : 'bg-[#FAF8F5] border-[#E2DDD2] text-[#2D2A26] hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{team.code}</div>
                    <div className="text-[10px] text-[#64748B]">{team.total_score}đ</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Loại sự kiện & Số điểm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E293B]">
                2. Phân Loại Sự Kiện:
              </label>
              <select
                value={specialCategory}
                onChange={(e) => setSpecialCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#1A55E3]"
              >
                <option value="Thưởng đột xuất (Bonus)">Thưởng đột xuất (Bonus)</option>
                <option value="Cứu trợ / Giải cứu (Rescue)">Cứu trợ / Giải cứu (Rescue)</option>
                <option value="Minigame ngẫu hứng">Minigame ngẫu hứng</option>
                <option value="Cổ vũ & Tinh thần bùng nổ">Cổ vũ & Tinh thần bùng nổ</option>
                <option value="Đóng góp hỗ trợ Ban chỉ huy">Đóng góp hỗ trợ Ban chỉ huy</option>
                <option value="Phạt vi phạm đặc biệt">Phạt vi phạm đặc biệt</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E293B]">
                Số Điểm Muốn Ghi Nhận (+ hoặc -):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={specialPoints}
                  onChange={(e) => setSpecialPoints(Number(e.target.value) || 0)}
                  className={`w-full px-3 py-2.5 text-center font-black text-base rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] focus:outline-none ${
                    specialPoints >= 0 ? 'text-[#00a86b]' : 'text-[#FF0854]'
                  }`}
                />
                <span className="text-xs font-bold text-[#64748B]">điểm</span>
              </div>
            </div>
          </div>

          {/* Quick Point Stepper */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-[#64748B] font-bold">Mức điểm nhanh:</span>
            {[+10, +20, +30, +50, +100, -10, -20, -50].map((pts) => (
              <button
                key={pts}
                type="button"
                onClick={() => setSpecialPoints(pts)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                  specialPoints === pts
                    ? pts >= 0
                      ? 'bg-[#00D284] text-white border-[#00D284]'
                      : 'bg-[#FF0854] text-white border-[#FF0854]'
                    : 'bg-[#FAF8F5] border-[#D5CDC0] text-[#5A5248] hover:bg-[#EAE5DB]'
                }`}
              >
                {pts > 0 ? `+${pts}` : pts}
              </button>
            ))}
          </div>

          {/* 3. Lý Do Cụ Thể (Bắt buộc) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E293B] block">
              3. Lý Do Chi Tiết (Bắt buộc - hiển thị công khai để giải thích rõ ràng): <span className="text-[#FF0854]">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ví dụ: Đội đã xuất sắc giải cứu trạm gác đêm bị bão cát, được Ban Giám Khảo đặc cách tặng thêm 50 điểm thưởng..."
              value={specialReason}
              onChange={(e) => setSpecialReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-xs text-[#1E293B] focus:outline-none focus:border-[#1A55E3] resize-none"
            />
          </div>

          {/* Quick Reason Suggestions */}
          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            <span className="text-[#64748B]">Gợi ý lý do:</span>
            {[
              'Cứu trợ đồng đội thành công',
              'Cổ vũ bùng nổ nhất phiên',
              'Thắng minigame giữa giờ',
              'Hỗ trợ dọn dẹp khu cắm trại',
              'Sáng tạo vượt trội trong trò chơi',
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setSpecialReason(sample)}
                className="px-2 py-0.5 rounded-md bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#2D2A26] font-medium"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 border-t border-[#EAE5D9]">
            <button
              type="submit"
              disabled={isSubmitting || !selectedTeamId || !specialReason.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1A55E3] to-[#5E6EED] hover:opacity-95 disabled:opacity-50 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-[#1A55E3]/25 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Xác Nhận & Ghi Điểm Đặc Biệt'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Modal (Standard Flow) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-[#2D2A26]">
            <h3 className="text-lg font-black text-[#1E293B]">
              Xác Nhận Lưu Giao Dịch Điểm?
            </h3>
            <p className="text-xs text-[#64748B]">
              Điểm số sẽ được ghi nhận vào nhật ký kiểm toán và cập nhật ngay lập tức lên bảng tổng sắp công khai.
            </p>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2DDD2] text-xs space-y-1.5">
              <div>
                Đội: <strong className="text-[#1E293B]">{selectedTeam?.code}</strong>
              </div>
              <div>
                Hoạt động: <strong className="text-[#1E293B]">{selectedActivity?.name}</strong>
              </div>
              <div>
                Điểm:{' '}
                <strong
                  className={
                    calculationPreview.points >= 0 ? 'text-[#00a86b]' : 'text-[#FF0854]'
                  }
                >
                  {calculationPreview.points >= 0 ? '+' : ''}
                  {calculationPreview.points}đ
                </strong>
              </div>
              <div>
                Lý do:{' '}
                <span className="text-[#64748B]">
                  {customNotes || calculationPreview.breakdown}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="px-5 py-2 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] text-white text-xs font-black"
              >
                {isSubmitting ? 'Đang lưu...' : 'Xác Nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
