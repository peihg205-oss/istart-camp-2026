'use client';

import React, { useMemo } from 'react';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Trophy, Flame, ShieldAlert, Award } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
  ACADEMIC: '#1d4ed8', // Royal blue
  CHALLENGE: '#7c3aed', // Purple
  DISCIPLINE: '#f59e0b', // Amber
  SPIRIT: '#10b981', // Emerald
  SPECIAL: '#ec4899', // Pink
};

export default function StatisticsPage() {
  const { rankedTeams, transactions, activities } = useScoringSystem();

  // 1. Data for Team Bar Chart
  const teamScoreData = useMemo(() => {
    return rankedTeams.map((t) => ({
      code: t.code,
      score: t.total_score || 0,
      fill: t.color_accent || '#1d4ed8',
    }));
  }, [rankedTeams]);

  // 2. Data for Category Distribution Pie Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {
      ACADEMIC: 0,
      CHALLENGE: 0,
      DISCIPLINE: 0,
      SPIRIT: 0,
    };

    const actCategoryMap = new Map(activities.map((a) => [a.id, a.category]));

    for (const tx of transactions) {
      if (tx.status === 'ACTIVE') {
        const cat = actCategoryMap.get(tx.activity_id) || 'ACADEMIC';
        map[cat] = (map[cat] || 0) + Math.abs(Number(tx.points_awarded));
      }
    }

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#2563eb',
    }));
  }, [transactions, activities]);

  // 3. Quick aggregate statistics
  const stats = useMemo(() => {
    const activeTx = transactions.filter((t) => t.status === 'ACTIVE');
    const positiveTx = activeTx.filter((t) => t.points_awarded > 0);
    const negativeTx = activeTx.filter((t) => t.points_awarded < 0);

    const totalPositive = positiveTx.reduce((sum, t) => sum + Number(t.points_awarded), 0);
    const totalNegative = negativeTx.reduce((sum, t) => sum + Number(t.points_awarded), 0);

    return {
      txCount: activeTx.length,
      totalPositive,
      totalNegative,
      highestTeam: rankedTeams[0],
      lowestTeam: rankedTeams[rankedTeams.length - 1],
    };
  }, [transactions, rankedTeams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A55E3]/10 text-blue-900 border border-[#1A55E3]/20 text-xs font-bold uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5 text-[#1A55E3]" />
          Phân Tích & Dữ Liệu
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          THỐNG KÊ TOÀN DIỆN ISTART CAMP 2026
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          Dữ liệu biểu đồ điểm số, phân bổ thử thách học thuật, thể lực và đánh giá nề nếp kỷ luật giữa 14 đội tuyển.
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Trophy className="w-4 h-4 text-amber-500" /> Đội Dẫn Đầu
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.highestTeam ? stats.highestTeam.code : '---'}
          </div>
          <div className="text-xs font-semibold text-[#1A55E3] mt-1">
            {stats.highestTeam?.total_score || 0} điểm
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Flame className="w-4 h-4 text-[#00D284]" /> Tổng Điểm Thưởng
          </div>
          <div className="text-2xl font-black text-[#00D284]">
            +{stats.totalPositive}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Từ các thử thách & đóng góp
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <ShieldAlert className="w-4 h-4 text-[#FF0854]" /> Tổng Điểm Kỷ Luật
          </div>
          <div className="text-2xl font-black text-[#FF0854]">
            {stats.totalNegative}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Vi phạm quy chế trại
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Award className="w-4 h-4 text-[#1A55E3]" /> Lượt Giao Dịch
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.txCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Được ghi nhận minh bạch
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Scores Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                So Sánh Tổng Điểm 14 Đội Tuyển
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Biểu đồ cột thể hiện tương quan số điểm hiện tại của các đội
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#1A55E3]/10 text-[#1A55E3]">
              Đơn vị: Điểm
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value) => [`${value} điểm`, 'Tổng điểm']}
                  contentStyle={{
                    borderRadius: '16px',
                    borderColor: '#dbeafe',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-5 h-5 text-[#1A55E3]" />
              <h3 className="text-lg font-black text-slate-900">
                Phân Bổ Hạng Mục
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Tỷ trọng điểm số theo nhóm thử thách
            </p>

            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} điểm`, 'Khối lượng điểm']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs font-bold">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-slate-600 text-[11px] truncate">
                  {item.name}: {item.value}đ
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Team Link Carousel/Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h4 className="text-base font-black text-slate-900 mb-4">
          Hồ sơ chi tiết từng đội tuyển
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {rankedTeams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.code}`}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-[#1A55E3]/10 border border-slate-200 hover:border-blue-300 text-center transition-all group"
            >
              <div className="font-black text-slate-900 group-hover:text-[#1A55E3] text-sm">
                {team.code}
              </div>
              <div className="text-[11px] font-bold text-[#1A55E3] mt-0.5">
                {team.total_score}đ
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                #{team.rank}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
