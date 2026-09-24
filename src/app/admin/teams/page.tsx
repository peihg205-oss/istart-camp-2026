'use client';

import React, { useState } from 'react';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  Users2,
  Edit3,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  X,
  Plus,
  Minus,
  AlertCircle,
  HelpCircle,
  Upload,
  Camera,
  Loader2,
} from 'lucide-react';
import { Team } from '@/types';
import { uploadImageFile } from '@/lib/utils/upload';

export default function AdminTeamsPage() {
  const {
    rankedTeams,
    teams,
    updateTeam,
    currentProfile,
    addSpecialScore,
    setInitialBaselinePoints,
  } = useScoringSystem();
  const isAdmin = currentProfile?.role === 'ADMIN';

  const [successMsg, setSuccessMsg] = useState('');

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [mottoInput, setMottoInput] = useState('');
  const [colorInput, setColorInput] = useState('#0284c7');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [leaderInput, setLeaderInput] = useState('');
  const [assistantInput, setAssistantInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // 2. Special Scoring Modal State
  const [specialTeam, setSpecialTeam] = useState<Team | null>(null);
  const [specialPoints, setSpecialPoints] = useState<number>(20);
  const [specialCategory, setSpecialCategory] = useState('Thưởng đột xuất (Bonus)');
  const [specialReason, setSpecialReason] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmittingSpecial, setIsSubmittingSpecial] = useState(false);

  // 3. Baseline Starting Points Modal State (Batch setup for all 14 teams)
  const [isBaselineModalOpen, setIsBaselineModalOpen] = useState(false);
  const [baselinePointsMap, setBaselinePointsMap] = useState<Record<string, number>>({});
  const [baselineReason, setBaselineReason] = useState(
    'Điểm tích lũy từ các hoạt động thủ công trước hội trại'
  );
  const [isSubmittingBaseline, setIsSubmittingBaseline] = useState(false);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // Open Edit Team Modal
  const handleOpenEdit = (team: Team) => {
    if (!isAdmin) return;
    setEditingTeam(team);
    setNameInput(team.name);
    setMottoInput(team.motto || '');
    setColorInput(team.color_accent || '#0284c7');
    setAvatarUrlInput(team.avatar_url || '');
    setLeaderInput(team.leader || '');
    setAssistantInput(team.assistant || '');
  };

  const handleSaveTeam = () => {
    if (!editingTeam) return;
    updateTeam(editingTeam.id, {
      name: nameInput,
      motto: mottoInput,
      color_accent: colorInput,
      avatar_url: avatarUrlInput || undefined,
      leader: leaderInput || undefined,
      assistant: assistantInput || undefined,
    });
    showToast(`Đã cập nhật thông tin đội ${editingTeam.code}.`);
    setEditingTeam(null);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetTeamId?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const target = targetTeamId
      ? teams.find((t) => t.id === targetTeamId)
      : editingTeam;
    const safeCode = target
      ? target.code.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'team';

    const result = await uploadImageFile(file, {
      folder: 'teams',
      filename: `team-${safeCode}`,
    });

    setIsUploadingAvatar(false);

    if (result.success && result.url) {
      if (targetTeamId) {
        updateTeam(targetTeamId, { avatar_url: result.url });
        showToast(`Đã cập nhật huy hiệu logo mới cho đội ${target?.code}!`);
      } else {
        setAvatarUrlInput(result.url);
        showToast('Tải ảnh lên thành công! Nhấn "Lưu Thay Đổi" để hoàn tất.');
      }
    } else {
      alert(result.error || 'Có lỗi xảy ra khi tải ảnh lên.');
    }
  };

  // Open Special Score Modal for a specific team
  const handleOpenSpecialScore = (team: Team) => {
    setSpecialTeam(team);
    setSpecialPoints(25);
    setSpecialCategory('Thưởng đột xuất (Bonus)');
    setSpecialReason('');
    setSpecialNotes('');
  };

  const handleConfirmSpecialScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialTeam) return;
    if (!specialReason.trim()) {
      alert('Vui lòng nhập lý do cụ thể để các đội và ban giám khảo nắm rõ!');
      return;
    }

    setIsSubmittingSpecial(true);
    try {
      const res = await addSpecialScore({
        teamId: specialTeam.id,
        points: specialPoints,
        reason: specialReason.trim(),
        categoryName: specialCategory,
        notes: specialNotes.trim(),
      });

      if (res.success) {
        showToast(
          `Đã ghi nhận ${specialPoints >= 0 ? '+' : ''}${specialPoints}đ cho ${specialTeam.code}: "${specialReason}"`
        );
        setSpecialTeam(null);
      } else {
        alert(res.error || 'Có lỗi khi lưu điểm đặc biệt');
      }
    } finally {
      setIsSubmittingSpecial(false);
    }
  };

  // Open Baseline Starting Points Modal
  const handleOpenBaselineModal = () => {
    const initialMap: Record<string, number> = {};
    rankedTeams.forEach((t) => {
      // Default to 0 or leave empty
      initialMap[t.id] = 0;
    });
    setBaselinePointsMap(initialMap);
    setIsBaselineModalOpen(true);
  };

  const handleSaveBaselinePoints = async () => {
    setIsSubmittingBaseline(true);
    try {
      const entries = Object.entries(baselinePointsMap).map(([teamId, points]) => ({
        teamId,
        points: Number(points) || 0,
        reason: baselineReason.trim() || 'Điểm tích lũy từ các hoạt động thủ công trước hội trại',
      }));

      const res = await setInitialBaselinePoints(entries);
      if (res.success) {
        showToast(`Đã khởi tạo điểm ban đầu cho các đội thành công (${res.count} đội)!`);
        setIsBaselineModalOpen(false);
      }
    } finally {
      setIsSubmittingBaseline(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#DFD8CA]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A55E3]/10 text-[#1A55E3] border border-[#1A55E3]/25 text-xs font-black uppercase tracking-wider mb-2">
            <Users2 className="w-3.5 h-3.5" /> Quản Lý Đội Tuyển
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            DANH SÁCH 14 ĐỘI TUYỂN TRANH TÀI
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium">
            Thông tin chi tiết, màu nhận diện, khẩu hiệu và quản lý điểm số hiện tại của từng đội.
          </p>
        </div>

        {/* Global Action: Setup Initial Points */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenBaselineModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#1E293B] border border-[#D5CDC0] font-black text-xs shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Target className="w-4 h-4 text-[#1A55E3]" />
            <span>Khởi tạo điểm ban đầu (Baseline)</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#00D284]/15 border border-[#00D284]/40 text-[#00a86b] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00D284] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid of 14 Teams in Warm Beige Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rankedTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white border border-[#E2DDD2] rounded-3xl p-5 flex flex-col justify-between group hover:border-[#1A55E3]/40 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative group/avatar">
                    <div
                      className="w-12 h-12 rounded-2xl p-1 flex items-center justify-center shrink-0 border relative overflow-hidden"
                      style={{
                        borderColor: team.color_accent,
                        backgroundColor: '#F8F6F0',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          team.avatar_url ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${team.code}`
                        }
                        alt={team.code}
                        className="w-full h-full object-contain rounded-xl p-0.5"
                      />
                      {isAdmin && (
                        <label
                          className="absolute inset-0 bg-black/60 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-center p-1"
                          title="Bấm để tự tải ảnh đại diện / huy hiệu mới"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-bold mt-0.5">Đổi avt</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, team.id)}
                            disabled={isUploadingAvatar}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-black text-lg text-[#1E293B] flex items-center gap-2">
                      {team.code}
                      {team.rank === 1 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-xs">
                          👑 TOP 1
                        </span>
                      )}
                      {team.rank === 2 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-900 font-black text-[10px]">
                          🥈 TOP 2
                        </span>
                      )}
                      {team.rank === 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-700 text-amber-100 font-black text-[10px]">
                          🥉 TOP 3
                        </span>
                      )}
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: team.color_accent }}
                      ></span>
                    </div>
                    <div className="text-xs font-semibold text-[#64748B] flex items-center flex-wrap gap-1">
                      <span>Hạng #{team.rank} •</span>
                      <strong className="text-[#1A55E3] font-black">{team.total_score}đ</strong>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleOpenEdit(team)}
                    className="p-2 rounded-xl bg-[#F4F0E6] hover:bg-[#EAE5DB] text-[#5A5248] hover:text-[#1E293B] transition-colors"
                    title="Chỉnh sửa thông tin đội"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#1E293B]">{team.name}</div>
                {team.motto && (
                  <p className="text-[#64748B] italic text-[11px]">
                    &ldquo;{team.motto}&rdquo;
                  </p>
                )}
                {(team.leader || team.assistant) && (
                  <div className="pt-1.5 flex flex-col gap-0.5 text-[11px] border-t border-[#F0EAE1]">
                    {team.leader && (
                      <div className="text-blue-800 font-semibold flex items-center gap-1">
                        <span>👑 Leader:</span>
                        <span className="font-bold">{team.leader}</span>
                      </div>
                    )}
                    {team.assistant && (
                      <div className="text-rose-800 font-semibold flex items-center gap-1">
                        <span>⚡ PA:</span>
                        <span className="font-bold">{team.assistant}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Special Points & Status */}
            <div className="mt-4 pt-3 border-t border-[#EAE5D9] flex items-center justify-between text-[11px]">
              <span className="text-[#64748B]">
                Trạng thái: <strong className="text-[#00a86b]">Đang thi đấu</strong>
              </span>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleOpenSpecialScore(team)}
                  className="px-2.5 py-1 rounded-xl bg-[#1A55E3]/10 hover:bg-[#1A55E3] text-[#1A55E3] hover:text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                  title="Cộng hoặc trừ điểm đặc biệt có lý do cho đội"
                >
                  <Zap className="w-3 h-3" />
                  <span>Điểm đặc biệt</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Special Scoring Modal */}
      {specialTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#2D2A26]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#1A55E3]/15 text-[#1A55E3] border border-[#1A55E3]/30">
                  Cộng / Trừ Điểm Đặc Biệt
                </span>
                <h3 className="text-lg font-black text-[#1E293B] mt-1">
                  Đội: {specialTeam.code} - {specialTeam.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSpecialTeam(null)}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#EAE5DB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSpecialScore} className="space-y-4 text-xs">
              {/* Event Category & Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    Loại Ghi Nhận
                  </label>
                  <select
                    value={specialCategory}
                    onChange={(e) => setSpecialCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] font-bold text-xs focus:outline-none focus:border-[#1A55E3]"
                  >
                    <option value="Thưởng đột xuất (Bonus)">Thưởng đột xuất (Bonus)</option>
                    <option value="Cứu trợ / Giải cứu (Rescue)">Cứu trợ / Giải cứu (Rescue)</option>
                    <option value="Minigame ngẫu hứng">Minigame ngẫu hứng</option>
                    <option value="Tinh thần & Cổ vũ bùng nổ">Tinh thần & Cổ vũ bùng nổ</option>
                    <option value="Phạt vi phạm đặc biệt">Phạt vi phạm đặc biệt</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    Số Điểm (+ hoặc -)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      required
                      value={specialPoints}
                      onChange={(e) => setSpecialPoints(Number(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-center font-black text-sm focus:outline-none ${
                        specialPoints >= 0 ? 'text-[#00a86b]' : 'text-[#FF0854]'
                      }`}
                    />
                    <span className="font-bold text-[#64748B]">điểm</span>
                  </div>
                </div>
              </div>

              {/* Quick Point Stepper Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#64748B] font-bold mr-1">Gợi ý nhanh:</span>
                {[+10, +20, +30, +50, +100, -10, -20, -50].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setSpecialPoints(pts)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-black border transition-all ${
                      specialPoints === pts
                        ? pts >= 0
                          ? 'bg-[#00D284] text-white border-[#00D284]'
                          : 'bg-[#FF0854] text-white border-[#FF0854]'
                        : 'bg-white border-[#D5CDC0] text-[#5A5248] hover:bg-[#EAE5DB]'
                    }`}
                  >
                    {pts > 0 ? `+${pts}` : pts}
                  </button>
                ))}
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider block mb-1">
                  Lý Do Cụ Thể (Bắt buộc - công khai cho các đội thấy) <span className="text-[#FF0854]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Đội cứu hộ thành công trạm thử thách đêm, nhận thêm 30 điểm thưởng từ Ban chỉ huy trại..."
                  value={specialReason}
                  onChange={(e) => setSpecialReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-[#1E293B] text-xs focus:outline-none focus:border-[#1A55E3] resize-none"
                />
              </div>

              {/* Quick Reason Suggestions */}
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                <span className="text-[#64748B]">Mẫu lý do:</span>
                {[
                  'Cứu trợ đồng đội thành công',
                  'Cổ vũ bùng nổ nhất phiên',
                  'Thắng minigame giữa giờ',
                  'Hỗ trợ dọn dẹp vệ sinh trại',
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

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE5D9]">
                <button
                  type="button"
                  onClick={() => setSpecialTeam(null)}
                  className="px-4 py-2 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSpecial || !specialReason.trim()}
                  className="px-5 py-2 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isSubmittingSpecial ? 'Đang lưu...' : 'Xác nhận cộng điểm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Batch Initial Baseline Starting Points */}
      {isBaselineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-5 text-[#2D2A26]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#1A55E3]/15 text-[#1A55E3] border border-[#1A55E3]/30">
                  Khởi Tạo Điểm Số Ban Đầu (Baseline)
                </span>
                <h3 className="text-xl font-black text-[#1E293B] mt-1">
                  Nhập Điểm Tích Lũy Trước Hội Trại Cho 14 Đội
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Ghi nhận điểm số đã có từ các hoạt động thủ công trước đó để bắt đầu tính điểm real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBaselineModalOpen(false)}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#EAE5DB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Reason Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider block">
                Lý Do / Nguồn Gốc Điểm (Áp dụng chung cho lần khởi tạo này):
              </label>
              <input
                type="text"
                value={baselineReason}
                onChange={(e) => setBaselineReason(e.target.value)}
                placeholder="Điểm tích lũy từ các hoạt động thủ công trước hội trại"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#1A55E3]"
              />
            </div>

            {/* 14 Teams Baseline Table */}
            <div className="border border-[#E2DDD2] rounded-2xl overflow-hidden bg-white">
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#F4F0E6] text-[10px] uppercase font-bold text-[#5A5248] border-b border-[#E2DDD2]">
                    <tr>
                      <th className="py-2.5 px-3">Mã đội</th>
                      <th className="py-2.5 px-3">Tên đội tuyển</th>
                      <th className="py-2.5 px-3 text-right">Điểm hiện tại</th>
                      <th className="py-2.5 px-3 text-center">Điểm khởi đầu (+đ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5D9]">
                    {rankedTeams.map((team) => (
                      <tr key={team.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-2.5 px-3 font-black text-[#1E293B]">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: team.color_accent }}
                          ></span>
                          {team.code}
                        </td>
                        <td className="py-2.5 px-3 text-[#5A5248] font-medium truncate max-w-xs">
                          {team.name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-[#1A55E3]">
                          {team.total_score}đ
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={baselinePointsMap[team.id] ?? 0}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setBaselinePointsMap((prev) => ({
                                ...prev,
                                [team.id]: val,
                              }));
                            }}
                            className="w-24 px-2 py-1 text-center font-black text-xs rounded-lg bg-[#FAF8F5] border border-[#D5CDC0] text-[#00a86b] focus:outline-none focus:border-[#00D284]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Set All Button */}
            <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
              <span>Gán nhanh cho tất cả đội:</span>
              <div className="flex items-center gap-1.5">
                {[10, 20, 30, 50].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => {
                      const newMap: Record<string, number> = {};
                      rankedTeams.forEach((t) => {
                        newMap[t.id] = quickVal;
                      });
                      setBaselinePointsMap(newMap);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#1E293B] font-bold text-[10px]"
                  >
                    Tất cả +{quickVal}đ
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE5D9]">
              <button
                type="button"
                onClick={() => setIsBaselineModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingBaseline}
                onClick={handleSaveBaselinePoints}
                className="px-5 py-2 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Target className="w-3.5 h-3.5" />
                <span>{isSubmittingBaseline ? 'Đang lưu...' : `Lưu Điểm Khởi Đầu Cho ${rankedTeams.length} Đội`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Team Info */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CA] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#2D2A26]">
            <h3 className="text-lg font-black text-[#1E293B]">
              Chỉnh Sửa Thông Tin Đội {editingTeam.code}
            </h3>

            {/* Avatar Crest Upload Section */}
            <div className="p-3 bg-white rounded-2xl border border-[#D5CDC0] space-y-2">
              <label className="text-xs font-bold text-[#5A5248] block">
                Huy hiệu / Logo Đội (Avatar):
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-2xl p-1 bg-[#F8F6F0] border-2 flex items-center justify-center shrink-0 relative overflow-hidden"
                  style={{ borderColor: colorInput }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrlInput || `https://api.dicebear.com/7.x/identicon/svg?seed=${editingTeam.code}`}
                    alt={editingTeam.code}
                    className="w-full h-full object-contain rounded-xl"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] text-white text-xs font-bold shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingAvatar ? 'Đang tải lên...' : 'Tự up ảnh (Up avt)'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e)}
                        disabled={isUploadingAvatar}
                      />
                    </label>

                    {avatarUrlInput && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrlInput('')}
                        className="px-2.5 py-1.5 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] text-xs font-semibold transition-colors"
                      >
                        Dùng mặc định
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[#64748B]">
                    Hỗ trợ ảnh PNG, JPG, WebP, SVG từ máy tính.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Tên Đầy Đủ:</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] font-bold outline-none focus:border-[#1A55E3]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Khẩu Hiệu (Motto):</label>
              <input
                type="text"
                value={mottoInput}
                onChange={(e) => setMottoInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] outline-none focus:border-[#1A55E3]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Leader (Đội trưởng):</label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Thùy Dung"
                value={leaderInput}
                onChange={(e) => setLeaderInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] outline-none focus:border-[#1A55E3]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Performance Assistant:</label>
              <input
                type="text"
                placeholder="Ví dụ: Hoàng Lê Bích Ngọc"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs text-[#1E293B] outline-none focus:border-[#1A55E3]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A5248]">Mã Màu Nhận Diện:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-[#D5CDC0] bg-white p-1"
                />
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#D5CDC0] text-xs font-mono text-[#1E293B] outline-none focus:border-[#1A55E3]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="px-4 py-2 rounded-xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#5A5248] text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveTeam}
                className="px-4 py-2 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] text-white text-xs font-bold"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
