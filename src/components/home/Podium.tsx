'use client';

import React from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Crown, Sparkles, Flame, ChevronRight } from 'lucide-react';
import { Team } from '@/types';
import { PodiumSkeleton } from '@/components/ui/Skeleton';
import { ChessKnightPiece, ISerToyCube, GoldenStar3D } from '@/components/ui/BannerGraphicElements';

interface PodiumProps {
  topTeams: Team[];
}

export function Podium({ topTeams }: PodiumProps) {
  const first = topTeams[0];
  const second = topTeams[1];
  const third = topTeams[2];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#f59e0b', '#10b981', '#6366f1', '#fde047'],
      });
    } catch (e) {
      console.log('Confetti error', e);
    }
  };

  if (!first) {
    return <PodiumSkeleton />;
  }

  return (
    <section className="my-8 sm:my-12 px-4 max-w-5xl mx-auto relative">
      {/* Decorative Chess Knight & iSER Cube Mascots on Podium Sides */}
      <div className="absolute -top-6 left-2 lg:-left-10 pointer-events-none hidden md:block opacity-90 animate-float">
        <ChessKnightPiece className="w-16 h-20 lg:w-20 lg:h-24" />
      </div>

      <div className="absolute -top-6 right-2 lg:-right-10 pointer-events-none hidden md:block opacity-90 animate-float-delayed">
        <ISerToyCube className="w-16 h-16 lg:w-20 lg:h-20" />
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
          <Crown className="w-4 h-4 text-amber-600" />
          Bục Vinh Quang iSER 2026
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 flex items-center justify-center gap-2">
          <span>NGÔI ĐẦU ĐẤU TRƯỜNG</span>
          <GoldenStar3D className="w-8 h-8 inline" />
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-md mx-auto mt-1">
          Ba đội tuyển xuất sắc nhất đang bứt phá trên hành trình &ldquo;Unlock the iSER in you&rdquo;
        </p>
      </div>

      {/* Podium Grid (Mobile friendly order: 2nd - 1st - 3rd) */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 sm:gap-6 pt-8 pb-4">
        {/* RANK 2 - SILVER (Left on desktop) */}
        {/* RANK 2 - SILVER (Left on desktop) */}
        {second && (
          <div className="w-full md:w-1/3 order-2 md:order-1 flex flex-col items-center">
            {/* Team Card */}
            <Link
              href={`/teams/${second.code}`}
              className="w-full max-w-[280px] bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all text-center flex flex-col items-center group relative"
            >
              {/* Silver badge pill */}
              <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-black text-slate-700 inline-flex items-center gap-1 mb-4 shadow-2xs">
                <span>#2 HẠNG NHÌ</span>
              </div>

              {/* Avatar */}
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 border-2 border-slate-300 flex items-center justify-center p-2 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={second.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${second.code}`}
                    alt={second.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center shadow-md ring-2 ring-white">
                  2
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 group-hover:text-[#1A55E3] transition-colors">
                {second.code}
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">
                {second.name}
              </p>

              <div className="w-full bg-slate-50 rounded-2xl py-2 px-3 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Điểm số:</span>
                <span className="text-lg font-black text-slate-800">
                  {second.total_score}đ
                </span>
              </div>
            </Link>

            {/* Pedestal Block 2 */}
            <div className="hidden md:flex flex-col w-full max-w-[280px] h-32 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 rounded-t-3xl border-t-4 border-white shadow-xl items-center justify-center relative mt-3">
              <div className="w-full h-3 bg-blue-300/40 rounded-t-full mb-1"></div>
              <span className="text-4xl font-black text-slate-500 drop-shadow-sm">2</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">SILVER PODIUM</span>
            </div>
          </div>
        )}

        {/* RANK 1 - GOLD (Center on desktop, Tallest) */}
        {first && (
          <div className="w-full md:w-1/3 order-1 md:order-2 flex flex-col items-center">
            {/* Team Card */}
            <Link
              href={`/teams/${first.code}`}
              onClick={triggerConfetti}
              className="w-full max-w-[310px] bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 border-3 border-amber-400 shadow-2xl hover:shadow-amber-300/40 hover:-translate-y-2 transition-all text-center flex flex-col items-center group relative ring-4 ring-amber-300/60"
            >
              {/* Gold Top Banner */}
              <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black shadow-sm flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>#1 QUÁN QUÂN</span>
              </div>

              {/* Floating Crown and Avatar */}
              <div className="relative mb-3 flex flex-col items-center">
                <Crown className="w-9 h-9 text-amber-500 mx-auto animate-bounce drop-shadow-sm -mb-2 z-10" />
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-200 via-amber-100 to-yellow-300 border-4 border-amber-400 flex items-center justify-center p-2 shadow-lg relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={first.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${first.code}`}
                    alt={first.name}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                  <div className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-sm flex items-center justify-center shadow-lg ring-2 ring-white">
                    1
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                {first.code}
              </h3>
              <p className="text-xs text-slate-600 font-bold line-clamp-1 mb-3">
                {first.name}
              </p>

              <div className="w-full bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl py-2.5 px-4 border border-amber-300 flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-600 inline" /> Dẫn đầu:
                </span>
                <span className="text-xl font-black text-amber-800">
                  {first.total_score} điểm
                </span>
              </div>

              <div className="mt-3 text-[11px] font-extrabold text-[#1A55E3] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Xem chi tiết đội <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Pedestal Block 1 - Glowing Stepped Gold */}
            <div className="hidden md:flex flex-col w-full max-w-[310px] h-44 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 rounded-t-3xl border-t-4 border-yellow-100 shadow-[0_-8px_25px_rgba(245,158,11,0.45)] ring-4 ring-amber-300/60 items-center justify-center relative mt-3">
              <div className="w-full h-3.5 bg-yellow-100/60 rounded-t-full mb-1"></div>
              <span className="text-5xl font-black text-amber-950 drop-shadow-md">1</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-950/80">GOLD PODIUM</span>
            </div>
          </div>
        )}

        {/* RANK 3 - BRONZE (Right on desktop) */}
        {third && (
          <div className="w-full md:w-1/3 order-3 flex flex-col items-center">
            {/* Team Card */}
            <Link
              href={`/teams/${third.code}`}
              className="w-full max-w-[280px] bg-white rounded-3xl p-5 border-2 border-amber-800/20 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all text-center flex flex-col items-center group relative"
            >
              {/* Bronze badge */}
              <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-700/20 text-xs font-black text-amber-800 inline-flex items-center gap-1 mb-4 shadow-2xs">
                <span>#3 HẠNG BA</span>
              </div>

              {/* Avatar */}
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-50 border-2 border-amber-700/40 flex items-center justify-center p-2 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={third.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${third.code}`}
                    alt={third.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md ring-2 ring-white">
                  3
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 group-hover:text-[#1A55E3] transition-colors">
                {third.code}
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">
                {third.name}
              </p>

              <div className="w-full bg-amber-50/50 rounded-2xl py-2 px-3 border border-amber-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Điểm số:</span>
                <span className="text-lg font-black text-amber-900">
                  {third.total_score}đ
                </span>
              </div>
            </Link>

            {/* Pedestal Block 3 */}
            <div className="hidden md:flex flex-col w-full max-w-[280px] h-24 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 rounded-t-3xl border-t-4 border-amber-400 shadow-xl items-center justify-center relative mt-3">
              <div className="w-full h-2.5 bg-amber-400/40 rounded-t-full mb-1"></div>
              <span className="text-4xl font-black text-amber-200 drop-shadow-sm">3</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">BRONZE PODIUM</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
