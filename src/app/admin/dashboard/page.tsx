'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  PlusCircle,
  Trophy,
  Users,
  Award,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Radio,
  Key,
  Zap,
} from 'lucide-react';
import { GoldenStar3D } from '@/components/ui/BannerGraphicElements';

export default function AdminDashboardPage() {
  const {
    rankedTeams,
    activities,
    transactions,
    auditLogs,
    currentProfile,
    isRealtimeConnected,
  } = useScoringSystem();

  const activeTransactions = transactions.filter((t) => t.status === 'ACTIVE');
  const totalPoints = activeTransactions.reduce(
    (sum, t) => sum + Number(t.points_awarded),
    0
  );

  const topTeam = rankedTeams[0];
  const role = currentProfile?.role || 'SCORER';

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-[#2D2A26]">
      {/* Official Event Brand Strip (Warm Beige Edition) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#1A55E3]/10 via-[#FAF8F5] to-amber-500/10 border border-[#DFD8CA] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <GoldenStar3D className="w-12 h-12" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-[#1E293B] flex items-center gap-2">
              <span>iST<span className="text-[#FF0854]">A</span>RT CAMP 2026</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                ARENA CONTROL
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="h-6 sm:h-7 flex items-center">
                <Image
                  src="/images/unlock-the-iser-in-you.png"
                  alt="UNLOCK THE iSER IN YOU"
                  width={987}
                  height={90}
                  className="h-5 sm:h-6 w-auto object-contain drop-shadow-xs"
                />
              </div>
              <span className="text-[#94A3B8] hidden sm:inline">•</span>
              <span className="text-[#64748B] text-xs font-semibold hidden sm:inline">
                25.09.2026 @ Nhà thi đấu Cầu Giấy
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Values Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase">
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
            ⚡ DYNAMIC
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
            💡 INNOVATIVE
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
            🌐 GLOBAL-MINDED
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
            🎓 iSER
          </span>
        </div>
      </div>

      {/* Top Welcome Action Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#DFD8CA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#1A55E3]/15 text-[#1A55E3] border border-[#1A55E3]/30">
              {role === 'ADMIN' ? 'Ban Quản Trị' : 'Bàn Trọng Tài'}
            </span>
            <div className="flex items-center gap-1 text-xs text-[#00a86b] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00D284] animate-pulse"></span>
              Realtime Socket: {isRealtimeConnected ? 'Hoạt động tức thời' : 'Ngoại tuyến'}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            BÀN ĐIỀU KHIỂN CHẤM ĐIỂM
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Xin chào, <span className="text-[#1E293B] font-bold">{currentProfile?.full_name}</span>. Hệ thống sẵn sàng ghi nhận kết quả và đồng bộ trực tiếp ra bảng điểm công khai.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/score"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1A55E3] hover:bg-[#1547bf] text-white font-black text-xs shadow-md shadow-[#1A55E3]/25 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>+ Nhập Điểm Hoạt Động</span>
          </Link>
          <Link
            href="/admin/teams"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EAE5DB] hover:bg-[#DFD8CA] text-[#1E293B] font-bold text-xs border border-[#D5CDC0] transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Điểm Đặc Biệt</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (Warm Beige) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2DDD2] rounded-3xl p-5 space-y-2 shadow-xs hover:border-[#1A55E3]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
            <span>Tổng Điểm Đã Cấp</span>
            <Award className="w-4 h-4 text-[#1A55E3]" />
          </div>
          <div className="text-3xl font-black text-[#1E293B]">{totalPoints}</div>
          <div className="text-[11px] text-[#1A55E3] font-semibold">
            Qua {activeTransactions.length} lượt chấm điểm
          </div>
        </div>

        <div className="bg-white border border-[#E2DDD2] rounded-3xl p-5 space-y-2 shadow-xs hover:border-amber-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
            <span>Đội Dẫn Đầu Toàn Trại</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">
            {topTeam ? topTeam.code : '---'}
          </div>
          <div className="text-[11px] text-[#64748B] font-semibold">
            {topTeam ? `${topTeam.total_score} điểm tích lũy` : ''}
          </div>
        </div>

        <div className="bg-white border border-[#E2DDD2] rounded-3xl p-5 space-y-2 shadow-xs hover:border-[#00D284]/50 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
            <span>Đội Tuyển Tham Gia</span>
            <Users className="w-4 h-4 text-[#00a86b]" />
          </div>
          <div className="text-3xl font-black text-[#1E293B]">{rankedTeams.length} Đội</div>
          <div className="text-[11px] text-[#00a86b] font-semibold">
            100% sẵn sàng thi đấu
          </div>
        </div>

        <div className="bg-white border border-[#E2DDD2] rounded-3xl p-5 space-y-2 shadow-xs hover:border-[#5E6EED]/50 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
            <span>Hạng Mục Hoạt Động</span>
            <Sparkles className="w-4 h-4 text-[#5E6EED]" />
          </div>
          <div className="text-3xl font-black text-[#1E293B]">{activities.length} Bài thi</div>
          <div className="text-[11px] text-[#5E6EED] font-semibold">
            Fixed, Ranking, Quantity, Formula
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Transactions vs Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Transactions */}
        <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#1A55E3]" />
              <h3 className="text-lg font-black text-[#1E293B]">Giao Dịch Điểm Mới Nhất</h3>
            </div>
            <Link
              href="/admin/history"
              className="text-xs font-bold text-[#1A55E3] hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {transactions.slice(0, 5).map((tx) => {
              const isPositive = tx.points_awarded >= 0;
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAE5DB] text-[#1E293B] font-black flex items-center justify-center text-xs shrink-0">
                      {tx.team?.code || 'ĐỘI'}
                    </div>
                    <div>
                      <div className="font-bold text-[#1E293B]">
                        {tx.activity?.name || 'Hoạt động'}
                      </div>
                      <div className="text-[11px] text-[#64748B] line-clamp-1">
                        {tx.notes || 'Chấm theo tiêu chuẩn'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-xs px-2.5 py-1 rounded-xl ${
                        isPositive
                          ? 'bg-[#00D284]/15 text-[#00a86b]'
                          : 'bg-[#FF0854]/15 text-[#FF0854]'
                      }`}
                    >
                      {isPositive ? `+${tx.points_awarded}` : tx.points_awarded}đ
                    </span>
                    <div className="text-[10px] text-[#64748B] mt-1">
                      {new Date(tx.created_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Audit Log Feed */}
        <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D9]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <h3 className="text-lg font-black text-[#1E293B]">Nhật Ký Kiểm Toán (Audit Trail)</h3>
            </div>
            <Link
              href="/admin/history"
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              Chi tiết log <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-[#64748B] text-xs font-medium">
                Chưa có thao tác sửa hoặc hoàn tác nào phát sinh. Hệ thống ghi nhận mọi thay đổi trực tiếp.
              </div>
            ) : (
              auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.action === 'CREATE'
                          ? 'bg-[#00D284]/15 text-[#00a86b]'
                          : log.action === 'EDIT'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-[#FF0854]/15 text-[#FF0854]'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {new Date(log.created_at).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                  <div className="text-[#5A5248] font-semibold">
                    Thực hiện bởi: <span className="text-[#1E293B] font-bold">{log.performed_by_name}</span>
                  </div>
                  {log.reason && (
                    <div className="text-[11px] text-[#64748B] italic">
                      Lý do: &ldquo;{log.reason}&rdquo;
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
