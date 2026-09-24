'use client';

import { Podium } from '@/components/home/Podium';
import { LeaderboardTable } from '@/components/home/LeaderboardTable';
import { RecentActivityTicker } from '@/components/home/RecentActivityTicker';
import { useScoringSystem } from '@/lib/store/scoringStore';
import { Sparkles, Compass, ShieldAlert, Award } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { rankedTeams, transactions } = useScoringSystem();

  return (
    <div className="w-full flex flex-col space-y-8 pt-4 sm:pt-6 pb-16">
      {/* 1. Top 3 Podium Focus */}
      <Podium topTeams={rankedTeams.slice(0, 3)} />

      {/* 3. Main Content Grid: Leaderboard (Left/Main) & Live Feeds (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Complete 14 Teams Leaderboard (spans 2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <LeaderboardTable teams={rankedTeams} />
          </div>

          {/* Sidebar: Live Feeds & Quick Guides */}
          <div className="space-y-6">
            {/* Recent Activity Live Stream */}
            <RecentActivityTicker transactions={transactions} />

            {/* Camp Values Card */}
            <div className="bg-gradient-to-br from-[#1A55E3] via-[#1547bf] to-[#0d2466] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold mb-4 backdrop-blur-xs border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0DCAF0]" />
                <span>Giá trị cốt lõi iSER</span>
              </div>

              <h4 className="text-xl font-black mb-2">Unlock the iSER in you!</h4>
              <p className="text-xs text-blue-100/90 leading-relaxed mb-4">
                Điểm số không chỉ đo lường chiến thắng, mà còn ghi nhận sự kỷ luật, tinh thần đồng đội và nỗ lực bứt phá không ngừng của mỗi cá nhân và tập thể.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-blue-400/30">
                <div className="flex items-center gap-1.5 text-blue-100">
                  <span className="w-2 h-2 rounded-full bg-[#00D284]"></span>
                  <span>Integrity (Chính trực)</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-100">
                  <span className="w-2 h-2 rounded-full bg-[#0DCAF0]"></span>
                  <span>Synergy (Đồng vận)</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-100">
                  <span className="w-2 h-2 rounded-full bg-[#5E6EED]"></span>
                  <span>Empathy (Thấu cảm)</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-100">
                  <span className="w-2 h-2 rounded-full bg-[#FF0854]"></span>
                  <span>Resilience (Kiên cường)</span>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h5 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Truy cập nhanh
              </h5>
              <div className="space-y-2 text-xs font-semibold">
                <Link
                  href="/activities"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#1A55E3]/5 text-slate-700 hover:text-[#1A55E3] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#1A55E3]" />
                    Xem quy chế 6 bài thi
                  </span>
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/activities#discipline"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#FF0854]/5 text-slate-700 hover:text-[#FF0854] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#FF0854]" />
                    Biểu phí trừ điểm Kỷ luật
                  </span>
                  <span className="text-[11px] font-bold text-[#FF0854] bg-[#FF0854]/10 px-2 py-0.5 rounded-full">-30 đến -70đ</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
