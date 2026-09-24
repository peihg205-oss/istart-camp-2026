'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  Trophy,
  Filter,
} from 'lucide-react';
import { Team } from '@/types';

interface LeaderboardTableProps {
  teams: Team[];
}

export function LeaderboardTable({ teams }: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [movementFilter, setMovementFilter] = useState<'ALL' | 'UP' | 'DOWN'>('ALL');

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchSearch =
        team.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.motto?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (movementFilter === 'UP') return team.movement === 'UP';
      if (movementFilter === 'DOWN') return team.movement === 'DOWN';

      return true;
    });
  }, [teams, searchQuery, movementFilter]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 lg:p-8">
      {/* Header with Search & Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              BẢNG TỔNG SẮP {teams.length} ĐỘI
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Điểm số cập nhật tức thời theo các lượt chấm của Ban Giám Khảo
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã đội (BDA, BEL...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1A55E3] focus:ring-2 focus:ring-[#1A55E3]/20 outline-none transition-all"
            />
          </div>

          {/* Movement Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMovementFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                movementFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setMovementFilter('UP')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                movementFilter === 'UP'
                  ? 'bg-[#00D284] text-white shadow-xs'
                  : 'text-[#00a86b] hover:bg-[#00D284]/10'
              }`}
              title="Đội đang thăng hạng"
            >
              <ArrowUp className="w-3 h-3" /> Tăng
            </button>
            <button
              onClick={() => setMovementFilter('DOWN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                movementFilter === 'DOWN'
                  ? 'bg-[#FF0854] text-white shadow-xs'
                  : 'text-[#FF0854] hover:bg-[#FF0854]/10'
              }`}
              title="Đội bị tụt hạng"
            >
              <ArrowDown className="w-3 h-3" /> Giảm
            </button>
          </div>
        </div>
      </div>

      {/* Table for Tablet & Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 w-16 text-center">Hạng</th>
              <th className="py-3 px-4 w-20 text-center">Biến động</th>
              <th className="py-3 px-4">Đội thi đấu</th>
              <th className="py-3 px-4 hidden lg:table-cell">Khẩu hiệu (Motto)</th>
              <th className="py-3 px-4 text-right">Tổng điểm</th>
              <th className="py-3 px-4 w-24 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredTeams.map((team) => {
              const rank = team.rank || 0;
              const isTop3 = rank <= 3;

              return (
                <tr
                  key={team.id}
                  className="hover:bg-[#1A55E3]/5 transition-colors group cursor-pointer"
                >
                  {/* Rank Column */}
                  <td className="py-4 px-4 text-center font-black">
                    {rank === 1 && (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black shadow-sm ring-2 ring-amber-200">
                        1
                      </span>
                    )}
                    {rank === 2 && (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-black shadow-sm ring-2 ring-slate-100">
                        2
                      </span>
                    )}
                    {rank === 3 && (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white font-black shadow-sm ring-2 ring-amber-600/30">
                        3
                      </span>
                    )}
                    {rank > 3 && (
                      <span className="text-slate-500 font-bold text-base">
                        #{rank}
                      </span>
                    )}
                  </td>

                  {/* Movement Column */}
                  <td className="py-4 px-4 text-center">
                    {team.movement === 'UP' && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-black bg-[#00D284]/15 text-[#009b62]">
                        <ArrowUp className="w-3 h-3" /> +1
                      </span>
                    )}
                    {team.movement === 'DOWN' && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-black bg-[#FF0854]/15 text-[#FF0854]">
                        <ArrowDown className="w-3 h-3" /> -1
                      </span>
                    )}
                    {team.movement === 'SAME' && (
                      <span className="inline-flex items-center text-slate-300">
                        <Minus className="w-4 h-4" />
                      </span>
                    )}
                  </td>

                  {/* Team Identity */}
                  <td className="py-4 px-4">
                    <Link
                      href={`/teams/${team.code}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 p-1 group-hover:scale-105 transition-transform overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={team.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${team.code}`}
                          alt={team.code}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 group-hover:text-[#1A55E3] transition-colors">
                            {team.code}
                          </span>
                          {isTop3 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              TOP {rank}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-medium line-clamp-1">
                          {team.name}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Motto Column */}
                  <td className="py-4 px-4 text-xs text-slate-500 italic hidden lg:table-cell max-w-xs truncate">
                    &ldquo;{team.motto}&rdquo;
                  </td>

                  {/* Total Score Column */}
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`text-lg font-black ${
                        isTop3 ? 'text-[#1A55E3]' : 'text-slate-800'
                      }`}
                    >
                      {team.total_score}
                    </span>
                    <span className="text-xs font-bold text-slate-400 ml-1">
                      điểm
                    </span>
                  </td>

                  {/* Action Column */}
                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/teams/${team.code}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-[#1A55E3] group-hover:text-white text-slate-400 transition-colors"
                      title="Xem hồ sơ đội"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (< 640px) */}
      <div className="sm:hidden space-y-3">
        {filteredTeams.map((team) => {
          const rank = team.rank || 0;
          return (
            <Link
              key={team.id}
              href={`/teams/${team.code}`}
              className="block p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#1A55E3]/50 transition-all active:scale-98"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-900'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white border border-slate-300 text-slate-600'
                    }`}
                  >
                    #{rank}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={team.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${team.code}`}
                      alt={team.code}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-black text-slate-900 text-base">
                    {team.code}
                  </span>
                  {team.movement === 'UP' && (
                    <span className="text-[10px] font-bold text-[#009b62] bg-[#00D284]/15 px-1.5 py-0.5 rounded flex items-center">
                      <ArrowUp className="w-2.5 h-2.5 inline" /> +1
                    </span>
                  )}
                  {team.movement === 'DOWN' && (
                    <span className="text-[10px] font-bold text-[#FF0854] bg-[#FF0854]/15 px-1.5 py-0.5 rounded flex items-center">
                      <ArrowDown className="w-2.5 h-2.5 inline" /> -1
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-[#1A55E3]">
                    {team.total_score}đ
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 font-medium line-clamp-1">
                {team.name}
              </div>
              {team.motto && (
                <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                  &ldquo;{team.motto}&rdquo;
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <Filter className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
          <p className="font-bold text-sm text-slate-700">Không tìm thấy đội tuyển phù hợp</p>
          <p className="text-xs text-slate-500 mt-1">
            Không có đội nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setMovementFilter('ALL');
            }}
            className="mt-3 px-4 py-1.5 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] text-white font-bold text-xs transition-colors shadow-xs"
          >
            Hiển thị lại 14 đội
          </button>
        </div>
      )}
    </div>
  );
}
