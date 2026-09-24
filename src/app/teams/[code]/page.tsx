'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  Trophy,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  BarChart2,
  Camera,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { uploadImageFile } from '@/lib/utils/upload';

export default function TeamDetailPage() {
  const params = useParams();
  const rawCode = params?.code as string;
  const decoded = rawCode ? decodeURIComponent(rawCode) : '';

  const {
    rankedTeams,
    transactions,
    activities,
    updateTeam,
    currentProfile,
  } = useScoringSystem();
  const isAdmin = currentProfile?.role === 'ADMIN';
  const [isUploading, setIsUploading] = useState(false);

  const team = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_+]+/g, '');
    const target = normalize(decoded);

    return rankedTeams.find((t) => {
      const cNorm = normalize(t.code);
      const idNorm = normalize(t.id);
      if (cNorm === target || idNorm === target) return true;
      if (cNorm === 'aitisel' && (target === 'ait' || target === 'isel' || target === 'ise')) return true;
      if (cNorm === 'ib3keukamkt' && (target === 'ib3' || target === 'keuka' || target === 'mkt')) return true;
      if (cNorm === 'iceaai' && (target === 'ice' || target === 'aai')) return true;
      if (cNorm === 'ib1' && target === 'ib') return true;
      if (cNorm === 'dc' && target === 'mkt') return true;
      return false;
    });
  }, [rankedTeams, decoded]);

  // All transactions for this team
  const teamTransactions = useMemo(() => {
    if (!team) return [];
    return transactions.filter((t) => t.team_id === team.id);
  }, [transactions, team]);

  // Score grouped by activity
  const activityScores = useMemo(() => {
    if (!team) return [];
    const map = new Map<string, number>();

    for (const act of activities) {
      map.set(act.id, 0);
    }

    for (const tx of teamTransactions) {
      if (tx.status === 'ACTIVE') {
        const cur = map.get(tx.activity_id) || 0;
        map.set(tx.activity_id, cur + Number(tx.points_awarded));
      }
    }

    return activities.map((act) => ({
      activityName: act.name,
      shortName: act.code,
      score: map.get(act.id) || 0,
      category: act.category,
    }));
  }, [team, activities, teamTransactions]);

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Không tìm thấy đội {decoded}</h2>
        <p className="text-sm text-slate-500">
          Mã đội không hợp lệ hoặc chưa được đăng ký trong danh sách các đội tuyển IStart Camp 2026.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A55E3] text-white font-bold text-sm hover:bg-[#1547bf] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Về Bảng xếp hạng chính
        </Link>
      </div>
    );
  }

  const isTop3 = (team.rank || 0) <= 3;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !team) return;

    setIsUploading(true);
    const safeCode = team.code.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const result = await uploadImageFile(file, {
      folder: 'teams',
      filename: `team-${safeCode}`,
    });
    setIsUploading(false);

    if (result.success && result.url) {
      updateTeam(team.id, { avatar_url: result.url });
    } else {
      alert(result.error || 'Có lỗi khi tải ảnh lên.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#1A55E3] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Bảng xếp hạng
        </Link>
      </div>

      {/* Team Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: team.color_accent }}
        ></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Team Avatar */}
            <div className="relative group/avatar">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1.5 shadow-md flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor: '#f8fafc',
                  border: `3px solid ${team.color_accent}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={team.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${team.code}`}
                  alt={team.code}
                  className="w-full h-full object-contain rounded-2xl p-1"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                {isAdmin && !isUploading && (
                  <label
                    className="absolute inset-0 bg-black/55 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer p-2 text-center"
                    title="Bấm để tự tải ảnh đại diện / huy hiệu mới"
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Đổi ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                )}
              </div>
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full text-white font-black text-sm flex items-center justify-center shadow-md ring-2 ring-white"
                style={{ backgroundColor: team.color_accent }}
              >
                #{team.rank}
              </div>
            </div>

            {/* Team Names & Motto */}
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
                  {team.code}
                </h1>
                {isTop3 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> TOP {team.rank}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-700">
                {team.name}
              </h2>
              {team.motto && (
                <p className="text-xs sm:text-sm text-slate-500 italic mt-1 max-w-md">
                  &ldquo;{team.motto}&rdquo;
                </p>
              )}
              {(team.leader || team.assistant) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 pt-1">
                  {team.leader && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      👑 Leader: {team.leader}
                    </span>
                  )}
                  {team.assistant && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      ⚡ Performance Assistant: {team.assistant}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Score Card */}
          <div className="w-full sm:w-auto bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-around sm:justify-start gap-6 text-center">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Thứ Hạng
              </div>
              <div className="text-3xl font-black text-slate-900 mt-0.5">
                #{team.rank}
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                trên {rankedTeams.length} Đội
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200"></div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tổng Điểm
              </div>
              <div className="text-3xl font-black text-[#1A55E3] mt-0.5">
                {team.total_score}
              </div>
              <div className="text-[11px] font-semibold text-[#1A55E3]">
                Điểm tích lũy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Score by Activity Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#1A55E3]" />
                Điểm Từng Hoạt Động Của {team.code}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Điểm số phân bổ theo từng thử thách trong chương trình trại
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityScores} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value, name, item) => [
                    `${value} điểm`,
                    item.payload.activityName,
                  ]}
                  contentStyle={{
                    borderRadius: '16px',
                    borderColor: '#dbeafe',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} fill={team.color_accent} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Mini Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            {activityScores.map((item) => (
              <div
                key={item.shortName}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="font-bold text-slate-500 text-[11px] truncate">
                  {item.activityName}
                </div>
                <div
                  className={`text-base font-black mt-0.5 ${
                    item.score > 0
                      ? 'text-[#1A55E3]'
                      : item.score < 0
                      ? 'text-[#FF0854]'
                      : 'text-slate-400'
                  }`}
                >
                  {item.score > 0 ? `+${item.score}` : item.score}đ
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Slogan & Camp Pledge Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Hành Trình Thi Đấu
            </div>
            <h4 className="text-lg font-black mb-2">Bản Lĩnh Đội {team.code}</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Mỗi điểm số ghi nhận đều minh chứng cho sự kiên trì, tôn trọng kỷ luật và nhiệt huyết của các thành viên. Hãy giữ vững ngọn lửa &ldquo;Unlock the iSER in you&rdquo;!
            </p>
            <div className="p-3 rounded-xl bg-white/10 text-xs font-medium text-slate-200">
              Tổng số lần ghi điểm: <span className="font-bold text-white">{teamTransactions.length}</span> lượt
            </div>
          </div>
        </div>
      </div>

      {/* Complete Chronological Transactions Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Lịch Sử Giao Dịch Điểm Chi Tiết
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Nhật ký từng lần chấm điểm được trọng tài ghi nhận
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {teamTransactions.length} Giao dịch
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3">Thời gian</th>
                <th className="py-3 px-3">Hoạt động</th>
                <th className="py-3 px-3">Ghi chú / Chi tiết</th>
                <th className="py-3 px-3">Trọng tài</th>
                <th className="py-3 px-3 text-right">Điểm số</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {teamTransactions.map((tx) => {
                const isPositive = tx.points_awarded >= 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {tx.activity?.name || 'Hoạt động'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 max-w-sm">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Boolean(tx.metadata && typeof tx.metadata === 'object' && 'is_special' in tx.metadata && tx.metadata.is_special) && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            ⚡ Điểm đặc biệt
                          </span>
                        )}
                        {Boolean(tx.metadata && typeof tx.metadata === 'object' && 'is_baseline' in tx.metadata && tx.metadata.is_baseline) && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-[#1A55E3]">
                            🎯 Điểm khởi đầu
                          </span>
                        )}
                        <span className="font-medium text-xs text-slate-800">
                          {tx.notes || (tx.metadata && typeof tx.metadata === 'object' && 'reason' in tx.metadata && typeof tx.metadata.reason === 'string' ? tx.metadata.reason : 'Ghi nhận theo thể lệ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {tx.created_by_name || 'Hệ thống'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`font-black text-sm px-2 py-0.5 rounded-lg ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isPositive ? `+${tx.points_awarded}` : tx.points_awarded}đ
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'ACTIVE'
                            ? 'bg-[#00D284]/10 text-emerald-700'
                            : tx.status === 'MODIFIED'
                            ? 'bg-[#1A55E3]/10 text-[#1A55E3]'
                            : 'bg-slate-200 text-slate-500 line-through'
                        }`}
                      >
                        {tx.status === 'ACTIVE'
                          ? 'Hợp lệ'
                          : tx.status === 'MODIFIED'
                          ? 'Đã sửa'
                          : 'Đã hủy'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {teamTransactions.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            Chưa có giao dịch điểm nào được ghi nhận cho đội này.
          </div>
        )}
      </div>
    </div>
  );
}
