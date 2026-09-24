'use client';

import React, { useState } from 'react';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  SlidersHorizontal,
  ShieldAlert,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Award,
  Sparkles,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  Activity,
  ActivityCategory,
  ScoringRuleType,
  RuleConfig,
  FixedRuleConfig,
  RankingRuleConfig,
  QuantityRuleConfig,
  QuantityRuleItem,
  FormulaRuleConfig,
} from '@/types';

// Category color badges and labels
const CATEGORY_MAP: Record<ActivityCategory, { label: string; color: string }> = {
  ACADEMIC: { label: 'Học thuật', color: 'bg-[#1A55E3]/15 text-[#1A55E3] border-[#1A55E3]/30' },
  CHALLENGE: { label: 'Thử thách', color: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  DISCIPLINE: { label: 'Nề nếp / Kỷ luật', color: 'bg-[#FF0854]/15 text-[#FF0854] border-[#FF0854]/30' },
  SPIRIT: { label: 'Tinh thần', color: 'bg-[#00D284]/15 text-[#008f5a] border-[#00D284]/30' },
  SPECIAL: { label: 'Đặc biệt', color: 'bg-[#5E6EED]/15 text-[#5E6EED] border-[#5E6EED]/30' },
};

// Rule type labels and badges
const RULE_TYPE_MAP: Record<ScoringRuleType, { label: string; badge: string }> = {
  FIXED: { label: 'Điểm cố định', badge: 'bg-[#00D284]/15 text-[#008f5a] border-[#00D284]/30' },
  RANKING: { label: 'Theo thứ hạng', badge: 'bg-[#1A55E3]/15 text-[#1A55E3] border-[#1A55E3]/30' },
  QUANTITY: { label: 'Theo số lần / Tiêu chí', badge: 'bg-[#FF0854]/15 text-[#FF0854] border-[#FF0854]/30' },
  FORMULA: { label: 'Công thức trọng số', badge: 'bg-[#5E6EED]/15 text-[#5E6EED] border-[#5E6EED]/30' },
};

export default function AdminRulesPage() {
  const { activities, currentProfile, updateScoringRule, updateActivity, addActivity, deleteActivity } =
    useScoringSystem();
  const isAdmin = currentProfile?.role === 'ADMIN';

  const [toastMessage, setToastMessage] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white border border-[#E2DDD2] rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-black text-[#1E293B]">Yêu Cầu Quyền Quản Trị (ADMIN)</h2>
        <p className="text-xs text-[#64748B]">
          Tài khoản trọng tài (SCORER) chỉ có quyền nhập điểm và tra cứu. Chỉ có ADMIN mới có quyền thay đổi các cấu hình quy tắc và biểu điểm thi đấu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 text-[#2D2A26]">
      {/* Header with Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#DFD8CA]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 text-xs font-black uppercase tracking-wider mb-2 border border-amber-500/30">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Quản Trị Quy Tắc & Biểu Điểm
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">
            CẤU HÌNH THỂ LỆ & BIỂU ĐIỂM
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1">
            Tùy chỉnh điểm cố định, thứ hạng, danh mục kỷ luật và thêm các hoạt động tính điểm mới cho hội trại.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#1A55E3] to-[#5E6EED] text-white font-black text-xs shadow-md shadow-[#1A55E3]/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Hoạt Động Mới</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#00D284]/15 border border-[#00D284]/40 text-[#008f5a] text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#00D284]" />
          <span>{toastMessage}</span>
        </div>
      )}


      {/* Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activities.map((act) => (
          <ActivityRuleCard
            key={act.id}
            activity={act}
            onSaveRule={async (newConfig) => {
              await updateScoringRule(act.id, newConfig);
              showToast(`Đã lưu cấu hình biểu điểm cho hoạt động "${act.name}" thành công!`);
            }}
            onUpdateMeta={async (updates) => {
              await updateActivity(act.id, updates);
              showToast(`Đã cập nhật thông tin hoạt động "${act.name}"!`);
            }}
            onDelete={() => setDeleteConfirmId(act.id)}
          />
        ))}
      </div>

      {/* Modal: Add New Activity */}
      {isAddModalOpen && (
        <AddActivityModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={async (newAct) => {
            const res = await addActivity(newAct);
            if (res.success) {
              showToast(`Đã thêm hoạt động mới: "${newAct.name}"!`);
              setIsAddModalOpen(false);
            }
          }}
        />
      )}

      {/* Confirmation Modal for Delete */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-[#2D2A26]">
            <div className="w-12 h-12 rounded-2xl bg-[#FF0854]/15 border border-[#FF0854]/30 flex items-center justify-center text-[#FF0854] mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#1E293B]">Xóa hoạt động này?</h3>
              <p className="text-xs text-[#64748B]">
                Hành động này sẽ xóa hoạt động tính điểm khỏi danh sách hiện hành.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] font-bold text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteActivity(deleteConfirmId);
                  setDeleteConfirmId(null);
                  showToast('Đã xóa hoạt động thành công.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#FF0854] hover:bg-[#d90444] text-white font-bold text-xs transition-colors"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// Activity Rule Card in Warm Beige
// ==============================================================================
interface ActivityRuleCardProps {
  activity: Activity;
  onSaveRule: (config: RuleConfig) => Promise<void>;
  onUpdateMeta: (updates: Partial<Activity>) => Promise<void>;
  onDelete: () => void;
}

function ActivityRuleCard({
  activity,
  onSaveRule,
  onUpdateMeta,
  onDelete,
}: ActivityRuleCardProps) {
  const rule = activity.scoring_rule;
  const initialConfig = rule?.config;

  const [configDraft, setConfigDraft] = useState<RuleConfig>(() => {
    return initialConfig || getDefaultConfig(activity.rule_type);
  });
  const [name, setName] = useState(activity.name);
  const [description, setDescription] = useState(activity.description);
  const [isRepeatable, setIsRepeatable] = useState(activity.is_repeatable);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemPoints, setNewItemPoints] = useState<number>(-20);

  const [newRankNumber, setNewRankNumber] = useState<number>(4);
  const [newRankPoints, setNewRankPoints] = useState<number>(5);

  const catInfo = CATEGORY_MAP[activity.category] || CATEGORY_MAP.SPECIAL;
  const ruleInfo = RULE_TYPE_MAP[activity.rule_type] || RULE_TYPE_MAP.FIXED;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveRule(configDraft);
      if (name !== activity.name || description !== activity.description || isRepeatable !== activity.is_repeatable) {
        await onUpdateMeta({ name, description, is_repeatable: isRepeatable });
      }
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-[#1A55E3]/40 hover:shadow-md transition-all shadow-xs">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${ruleInfo.badge}`}>
              {ruleInfo.label}
            </span>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${catInfo.color}`}>
              {catInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditingMeta(!isEditingMeta)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#F4F0E6] hover:bg-[#EAE5DB] text-[#5A5248] font-bold transition-colors"
            >
              {isEditingMeta ? 'Thu gọn' : 'Đổi tên / mô tả'}
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Xóa hoạt động"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#FF0854] hover:bg-[#FF0854]/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Name & Description */}
        {isEditingMeta ? (
          <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2] animate-in fade-in duration-150">
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Tên hoạt động
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] font-bold text-xs focus:outline-none focus:border-[#1A55E3]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] text-xs focus:outline-none focus:border-[#1A55E3] resize-none"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#5A5248] font-medium">Lặp lại nhiều lần trong hội trại</span>
              <button
                type="button"
                onClick={() => setIsRepeatable(!isRepeatable)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  isRepeatable
                    ? 'bg-[#00D284]/20 text-[#008f5a] border border-[#00D284]/40'
                    : 'bg-[#EAE5DB] text-[#5A5248]'
                }`}
              >
                {isRepeatable ? 'Có (Lặp lại)' : 'Không (Chỉ 1 lần)'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-black text-[#1E293B] tracking-tight">{name}</h3>
              <span className="text-[11px] font-semibold text-[#64748B] whitespace-nowrap">
                {isRepeatable ? 'Lặp lại nhiều lần' : 'Chỉ tính 1 lần'}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{description}</p>
          </div>
        )}
      </div>

      {/* Visual Dynamic Score Configuration (Warm Beige) */}
      <div className="bg-[#FAF8F5] border border-[#E2DDD2] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE5D9]">
          <div className="text-xs font-black text-[#1E293B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1A55E3]" />
            <span>Biểu Điểm & Tùy Chỉnh Điểm Số</span>
          </div>
          <span className="text-[10px] text-[#64748B] font-medium">Chỉnh sửa trực tiếp</span>
        </div>

        {/* 1. FIXED RULE CONFIG */}
        {activity.rule_type === 'FIXED' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E2DDD2]">
              <div>
                <div className="text-xs font-bold text-[#1E293B]">Điểm thưởng hoàn thành</div>
                <div className="text-[11px] text-[#64748B]">Đội đạt tiêu chuẩn nhận ngay số điểm này</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={(configDraft as FixedRuleConfig).points ?? 0}
                  onChange={(e) =>
                    setConfigDraft({
                      points: Number(e.target.value) || 0,
                    } as FixedRuleConfig)
                  }
                  className="w-20 px-3 py-1.5 text-center font-black text-base rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-[#00a86b] focus:outline-none focus:border-[#00D284]"
                />
                <span className="text-xs font-bold text-[#64748B]">điểm</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. RANKING RULE CONFIG */}
        {activity.rule_type === 'RANKING' && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries((configDraft as RankingRuleConfig).ranks || {}).map(([rank, pts]) => (
                <div
                  key={rank}
                  className="bg-white p-2.5 rounded-xl border border-[#E2DDD2] space-y-1 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-600 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Hạng {rank}
                    </span>
                    {Number(rank) > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextRanks = { ...(configDraft as RankingRuleConfig).ranks };
                          delete nextRanks[rank];
                          setConfigDraft({ ranks: nextRanks });
                        }}
                        className="text-[#64748B] hover:text-[#FF0854] text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={pts}
                      onChange={(e) => {
                        const nextRanks = {
                          ...(configDraft as RankingRuleConfig).ranks,
                          [rank]: Number(e.target.value) || 0,
                        };
                        setConfigDraft({ ranks: nextRanks });
                      }}
                      className="w-full px-2 py-1 text-center font-black text-sm rounded-lg bg-[#FAF8F5] border border-[#D5CDC0] text-[#1A55E3] focus:outline-none focus:border-[#1A55E3]"
                    />
                    <span className="text-[10px] text-[#64748B] font-bold">đ</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add extra rank */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#EAE5D9] text-xs">
              <span className="text-[#64748B] font-medium">Thêm thứ hạng:</span>
              <input
                type="number"
                min={1}
                value={newRankNumber}
                onChange={(e) => setNewRankNumber(Number(e.target.value) || 1)}
                placeholder="Hạng"
                className="w-16 px-2 py-1 rounded-lg bg-white border border-[#D5CDC0] text-[#1E293B] text-xs font-bold text-center"
              />
              <input
                type="number"
                value={newRankPoints}
                onChange={(e) => setNewRankPoints(Number(e.target.value) || 0)}
                placeholder="Điểm"
                className="w-16 px-2 py-1 rounded-lg bg-white border border-[#D5CDC0] text-[#1A55E3] text-xs font-bold text-center"
              />
              <button
                type="button"
                onClick={() => {
                  if (newRankNumber) {
                    const nextRanks = {
                      ...(configDraft as RankingRuleConfig).ranks,
                      [newRankNumber]: newRankPoints,
                    };
                    setConfigDraft({ ranks: nextRanks });
                    setNewRankNumber(newRankNumber + 1);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#1E293B] text-xs font-bold transition-colors"
              >
                + Thêm
              </button>
            </div>
          </div>
        )}

        {/* 3. QUANTITY RULE CONFIG */}
        {activity.rule_type === 'QUANTITY' && (
          <div className="space-y-2.5 pt-1">
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {((configDraft as QuantityRuleConfig).items || []).map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-[#E2DDD2] hover:border-[#1A55E3]/40 transition-colors"
                >
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const nextItems = [...((configDraft as QuantityRuleConfig).items || [])];
                      nextItems[index] = { ...item, label: e.target.value };
                      setConfigDraft({ items: nextItems });
                    }}
                    className="flex-1 px-2 py-1 rounded-lg bg-transparent text-[#1E293B] font-semibold text-xs border border-transparent focus:border-[#D5CDC0] focus:bg-[#FAF8F5] focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={item.points}
                      onChange={(e) => {
                        const nextItems = [...((configDraft as QuantityRuleConfig).items || [])];
                        nextItems[index] = { ...item, points: Number(e.target.value) || 0 };
                        setConfigDraft({ items: nextItems });
                      }}
                      className={`w-16 px-2 py-1 text-center font-black text-xs rounded-lg bg-[#FAF8F5] border border-[#D5CDC0] ${
                        item.points >= 0 ? 'text-[#00a86b]' : 'text-[#FF0854]'
                      } focus:outline-none`}
                    />
                    <span className="text-[10px] text-[#64748B] font-bold">đ</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = ((configDraft as QuantityRuleConfig).items || []).filter(
                          (_, i) => i !== index
                        );
                        setConfigDraft({ items: nextItems });
                      }}
                      className="p-1 text-[#64748B] hover:text-[#FF0854] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new item row */}
            <div className="pt-2 border-t border-[#EAE5D9] flex items-center gap-2">
              <input
                type="text"
                placeholder="Tên tiêu chí / vi phạm mới..."
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#1A55E3]"
              />
              <input
                type="number"
                placeholder="Điểm (+/-)"
                value={newItemPoints}
                onChange={(e) => setNewItemPoints(Number(e.target.value) || 0)}
                className="w-20 px-2.5 py-1.5 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] text-xs text-center font-bold focus:outline-none focus:border-[#1A55E3]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newItemLabel.trim()) {
                    const newItem: QuantityRuleItem = {
                      id: `item-${Date.now()}`,
                      label: newItemLabel.trim(),
                      points: newItemPoints,
                    };
                    const nextItems = [...((configDraft as QuantityRuleConfig).items || []), newItem];
                    setConfigDraft({ items: nextItems });
                    setNewItemLabel('');
                    setNewItemPoints(-20);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#1E293B] font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
          </div>
        )}

        {/* 4. FORMULA RULE CONFIG */}
        {activity.rule_type === 'FORMULA' && (
          <div className="space-y-3 pt-1">
            <div className="text-[11px] text-[#5A5248] bg-white p-2.5 rounded-xl border border-[#E2DDD2] flex items-center justify-between">
              <span className="font-bold text-[#1E293B]">Công thức tính điểm:</span>
              <span className="text-[#1A55E3] font-mono font-bold">
                {(configDraft as FormulaRuleConfig).expression || 'round(morning * 0.4 + afternoon * 0.6)'}
              </span>
            </div>

            <div className="space-y-2">
              {((configDraft as FormulaRuleConfig).fields || []).map((field, idx) => (
                <div
                  key={field.key || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E2DDD2] gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1E293B]">{field.label}</div>
                    <div className="text-[10px] text-[#64748B]">
                      Khoảng điểm: {field.min} - {field.max}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#64748B]">Trọng số:</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={field.weight}
                      onChange={(e) => {
                        const newWeight = parseFloat(e.target.value) || 0;
                        const nextFields = [...((configDraft as FormulaRuleConfig).fields || [])];
                        nextFields[idx] = { ...field, weight: newWeight };
                        setConfigDraft({
                          ...(configDraft as FormulaRuleConfig),
                          fields: nextFields,
                        });
                      }}
                      className="w-16 px-2 py-1 text-center font-black text-xs rounded-lg bg-[#FAF8F5] border border-[#D5CDC0] text-[#1A55E3] focus:outline-none"
                    />
                    <span className="text-xs text-[#64748B] font-bold">
                      ({Math.round((field.weight || 0) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-2 flex items-center justify-between border-t border-[#EAE5D9]">
        <button
          type="button"
          onClick={() => setConfigDraft(initialConfig || getDefaultConfig(activity.rule_type))}
          className="text-[#64748B] hover:text-[#1E293B] text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-sm ${
            isSavedRecently
              ? 'bg-[#00D284] text-white'
              : 'bg-[#1A55E3] hover:bg-[#1547bf] text-white'
          }`}
        >
          {isSavedRecently ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Đã lưu thành công</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu quy tắc'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ==============================================================================
// Modal: Add New Activity in Warm Beige
// ==============================================================================
interface AddActivityModalProps {
  onClose: () => void;
  onAdd: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<void>;
}

function AddActivityModal({ onClose, onAdd }: AddActivityModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('CHALLENGE');
  const [description, setDescription] = useState('');
  const [ruleType, setRuleType] = useState<ScoringRuleType>('FIXED');
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fixedPoints, setFixedPoints] = useState<number>(20);
  const [rank1Points, setRank1Points] = useState<number>(30);
  const [rank2Points, setRank2Points] = useState<number>(20);
  const [rank3Points, setRank3Points] = useState<number>(10);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code.startsWith('ACT_')) {
      const generated =
        'ACT_' +
        val
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_')
          .replace(/_+/g, '_')
          .slice(0, 15);
      setCode(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      let config: RuleConfig;
      if (ruleType === 'FIXED') {
        config = { points: fixedPoints };
      } else if (ruleType === 'RANKING') {
        config = {
          ranks: {
            1: rank1Points,
            2: rank2Points,
            3: rank3Points,
          },
        };
      } else if (ruleType === 'QUANTITY') {
        config = {
          items: [
            { id: 'crit_1', label: 'Tiêu chí đạt chuẩn', points: 10 },
            { id: 'crit_violation', label: 'Vi phạm quy định', points: -10 },
          ],
        };
      } else {
        config = {
          formula_name: 'Custom Weighted Score',
          expression: 'round(session_1 * 0.5 + session_2 * 0.5)',
          description: 'Tính điểm trung bình trọng số hai phiên',
          fields: [
            { key: 'session_1', label: 'Phiên 1', min: 0, max: 100, weight: 0.5 },
            { key: 'session_2', label: 'Phiên 2', min: 0, max: 100, weight: 0.5 },
          ],
        };
      }

      await onAdd({
        name: name.trim(),
        code: code.trim() || `ACT_${Date.now()}`,
        category,
        description: description.trim() || `Hoạt động ${name}`,
        rule_type: ruleType,
        is_repeatable: isRepeatable,
        display_order: 99,
        is_active: true,
        scoring_rule: {
          id: `rule-${Date.now()}`,
          activity_id: '',
          rule_type: ruleType,
          config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar space-y-6 shadow-2xl text-[#2D2A26]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5D9]">
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#1A55E3]/15 text-[#1A55E3] border border-[#1A55E3]/30">
              Thêm Hoạt Động Tính Điểm
            </span>
            <h2 className="text-xl font-black text-[#1E293B] mt-1">Tạo Hoạt Động Mới</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#EAE5DB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Tên Hoạt Động <span className="text-[#FF0854]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Vòng Chung Kết Hackathon"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] font-bold text-xs focus:outline-none focus:border-[#1A55E3]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Mã Hoạt Động
              </label>
              <input
                type="text"
                placeholder="HACKATHON_FINAL"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5CDC0] text-[#1A55E3] font-mono text-xs focus:outline-none focus:border-[#1A55E3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Danh Mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] font-bold text-xs focus:outline-none focus:border-[#1A55E3]"
              >
                <option value="ACADEMIC">Học thuật (ACADEMIC)</option>
                <option value="CHALLENGE">Thử thách (CHALLENGE)</option>
                <option value="DISCIPLINE">Nề nếp / Kỷ luật (DISCIPLINE)</option>
                <option value="SPIRIT">Tinh thần đồng đội (SPIRIT)</option>
                <option value="SPECIAL">Đặc biệt (SPECIAL)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Phương Thức Tính Điểm
              </label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as ScoringRuleType)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] font-bold text-xs focus:outline-none focus:border-[#1A55E3]"
              >
                <option value="FIXED">Điểm cố định (FIXED)</option>
                <option value="RANKING">Theo thứ hạng xếp hạng (RANKING)</option>
                <option value="QUANTITY">Theo số lần / Tiêu chí (QUANTITY)</option>
                <option value="FORMULA">Công thức trọng số (FORMULA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Mô Tả & Thể Lệ
            </label>
            <textarea
              rows={2}
              placeholder="Quy định và cách thức chấm điểm cho hoạt động này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] text-xs focus:outline-none focus:border-[#1A55E3] resize-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2DDD2] space-y-3">
            <div className="text-xs font-bold text-[#1E293B]">Thiết Lập Biểu Điểm Ban Đầu:</div>

            {ruleType === 'FIXED' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5A5248]">Điểm nhận được khi hoàn thành:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={fixedPoints}
                    onChange={(e) => setFixedPoints(Number(e.target.value) || 0)}
                    className="w-20 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-[#00a86b] font-black text-center text-sm"
                  />
                  <span className="text-xs font-bold text-[#64748B]">điểm</span>
                </div>
              </div>
            )}

            {ruleType === 'RANKING' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E2DDD2] text-center">
                  <div className="text-[10px] text-amber-700 font-bold mb-1">Hạng 1</div>
                  <input
                    type="number"
                    value={rank1Points}
                    onChange={(e) => setRank1Points(Number(e.target.value) || 0)}
                    className="w-full py-1 text-center font-black text-sm rounded bg-white text-[#1A55E3] border border-[#D5CDC0]"
                  />
                </div>
                <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E2DDD2] text-center">
                  <div className="text-[10px] text-amber-700 font-bold mb-1">Hạng 2</div>
                  <input
                    type="number"
                    value={rank2Points}
                    onChange={(e) => setRank2Points(Number(e.target.value) || 0)}
                    className="w-full py-1 text-center font-black text-sm rounded bg-white text-[#1A55E3] border border-[#D5CDC0]"
                  />
                </div>
                <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E2DDD2] text-center">
                  <div className="text-[10px] text-amber-700 font-bold mb-1">Hạng 3</div>
                  <input
                    type="number"
                    value={rank3Points}
                    onChange={(e) => setRank3Points(Number(e.target.value) || 0)}
                    className="w-full py-1 text-center font-black text-sm rounded bg-white text-[#1A55E3] border border-[#D5CDC0]"
                  />
                </div>
              </div>
            )}

            {ruleType === 'QUANTITY' && (
              <div className="text-xs text-[#64748B] space-y-1">
                <p>Khởi tạo với 2 tiêu chí mẫu (được chỉnh sửa và thêm tiêu chí sau khi tạo):</p>
                <div className="text-[#1E293B] font-semibold">• Tiêu chí đạt chuẩn: +10đ</div>
                <div className="text-[#1E293B] font-semibold">• Vi phạm quy định: -10đ</div>
              </div>
            )}

            {ruleType === 'FORMULA' && (
              <div className="text-xs text-[#64748B]">
                Khởi tạo với công thức chuẩn 2 phiên (Phiên 1: 50% + Phiên 2: 50%). Có thể tùy chỉnh trọng số sau khi tạo.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#E2DDD2]">
            <div>
              <div className="text-xs font-bold text-[#1E293B]">Chế độ lặp lại</div>
              <div className="text-[11px] text-[#64748B]">Một đội có thể được chấm điểm nhiều lần cho hoạt động này không?</div>
            </div>
            <button
              type="button"
              onClick={() => setIsRepeatable(!isRepeatable)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors ${
                isRepeatable
                  ? 'bg-[#00D284]/20 text-[#008f5a] border border-[#00D284]/40'
                  : 'bg-[#EAE5DB] text-[#5A5248]'
              }`}
            >
              {isRepeatable ? 'Lặp lại nhiều lần' : 'Chỉ tính 1 lần'}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] font-bold text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tạo...' : 'Tạo Hoạt Động'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getDefaultConfig(ruleType: ScoringRuleType): RuleConfig {
  switch (ruleType) {
    case 'FIXED':
      return { points: 15 };
    case 'RANKING':
      return { ranks: { 1: 30, 2: 20, 3: 10 } };
    case 'QUANTITY':
      return {
        items: [
          { id: 'crit_1', label: 'Vi phạm', points: -30 },
          { id: 'crit_2', label: 'Điểm thưởng', points: 30 },
        ],
      };
    case 'FORMULA':
      return {
        formula_name: 'Weighted Score',
        expression: 'round(morning * 0.4 + afternoon * 0.6)',
        description: 'Trọng số phiên sáng và chiều',
        fields: [
          { key: 'morning', label: 'Phiên Sáng', min: 0, max: 100, weight: 0.4 },
          { key: 'afternoon', label: 'Phiên Chiều', min: 0, max: 100, weight: 0.6 },
        ],
      };
  }
}
