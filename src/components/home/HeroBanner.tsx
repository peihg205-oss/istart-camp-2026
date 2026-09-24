'use client';

import React from 'react';
import Image from 'next/image';
import { Trophy, Users, Award, Zap, Key, MapPin, Calendar, Building2 } from 'lucide-react';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  GoldenStar3D,
  YellowPuzzlePiece,
  BluePuzzlePiece,
  ChessKnightPiece,
  GameJourneyRibbon,
} from '@/components/ui/BannerGraphicElements';

export function HeroBanner() {
  const { rankedTeams, transactions, activities } = useScoringSystem();

  const totalPoints = transactions
    .filter((t) => t.status === 'ACTIVE')
    .reduce((sum, t) => sum + Number(t.points_awarded), 0);

  const topTeam = rankedTeams[0];

  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 game-floor-pattern border-b border-slate-200/80">
      {/* Playful Floating 3D Graphic Decor Elements from the Banner */}
      <div className="absolute top-8 left-4 lg:left-12 pointer-events-none animate-float hidden sm:block z-10">
        <YellowPuzzlePiece className="w-16 h-16 lg:w-20 lg:h-20" />
      </div>

      <div className="absolute top-20 right-4 lg:right-16 pointer-events-none animate-float-delayed hidden sm:block z-10">
        <GoldenStar3D className="w-14 h-14 lg:w-18 lg:h-18" />
      </div>

      <div className="absolute bottom-24 left-6 lg:left-16 pointer-events-none animate-float-delayed hidden lg:block z-10">
        <ChessKnightPiece className="w-16 h-20 lg:w-20 lg:h-24" />
      </div>

      <div className="absolute bottom-16 right-6 lg:right-20 pointer-events-none animate-float hidden md:block z-10">
        <BluePuzzlePiece className="w-16 h-16 lg:w-20 lg:h-20" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* 1. OFFICIAL ORGANIZERS STRIP (From top of the banner) */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2 px-4 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs max-w-4xl mx-auto text-[11px] sm:text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5 text-blue-900">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-black">ĐHQGHN (VNU)</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-blue-900">
            <span className="font-black">TRƯỜNG QUỐC TẾ (VNU-IS)</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="font-black">KEUKA COLLEGE</span>
            <span className="text-[10px] text-slate-500 hidden md:inline">USA</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="font-black">HELP UNIVERSITY</span>
            <span className="text-[10px] text-slate-500 hidden md:inline">Malaysia</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTERPIECE OFFICIAL 3D LOGO */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center">
          <div className="relative w-80 sm:w-[420px] md:w-[480px] aspect-[21/10] hover:scale-105 transition-transform duration-300 drop-shadow-[0_20px_40px_rgba(29,78,216,0.25)]">
            <Image
              src="/images/istart-camp-2026-logo-3d.png"
              alt="iSTART CAMP 2026 Logo 3D"
              fill
              sizes="(max-width: 768px) 90vw, 480px"
              priority
              className="object-contain"
            />
          </div>

          {/* Slogan & Live Arena Indicator */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE ARENA 2026</span>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full banner-pill-slogan shadow-md hover:scale-105 transition-transform">
              <Image
                src="/images/unlock-the-iser-in-you.png"
                alt="UNLOCK THE iSER IN YOU"
                width={987}
                height={90}
                className="h-6 sm:h-7 w-auto object-contain drop-shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. EVENT META PILLS (DATE & VENUE) */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-4xl mx-auto pt-1">
          {/* Left date capsule */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full banner-badge-date text-xs sm:text-sm font-black tracking-wide">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>HANOI, 25.09.2026</span>
          </div>

          {/* Right venue bar */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full banner-badge-venue text-xs sm:text-sm font-black tracking-wider text-center">
            <MapPin className="w-4 h-4 text-blue-100" />
            <span>CAU GIAY GYMNASIUM, 35 TRAN QUY KIEN, CAU GIAY, HA NOI</span>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* 4. THE 4 iSER CORE VALUES INTERACTIVE DOCK (From the Toy Dice) */}
        {/* ========================================================================= */}
        <div className="pt-2 max-w-4xl mx-auto">
          <div className="text-center mb-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              4 GIÁ TRỊ CỐT LÕI iSER NĂM 2026
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Value 1 */}
            <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-amber-300 shadow-xs flex items-center gap-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg shrink-0">
                ⚡
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 uppercase">DYNAMIC</div>
                <div className="text-[10px] font-bold text-slate-500">Năng động tiên phong</div>
              </div>
            </div>

            {/* Value 2 */}
            <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-blue-300 shadow-xs flex items-center gap-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
                💡
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 uppercase">INNOVATIVE</div>
                <div className="text-[10px] font-bold text-slate-500">Đổi mới sáng tạo</div>
              </div>
            </div>

            {/* Value 3 */}
            <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-indigo-300 shadow-xs flex items-center gap-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg shrink-0">
                🌐
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 uppercase">GLOBAL-MINDED</div>
                <div className="text-[10px] font-bold text-slate-500">Tư duy toàn cầu</div>
              </div>
            </div>

            {/* Value 4 */}
            <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-emerald-300 shadow-xs flex items-center gap-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg shrink-0">
                🎓
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 uppercase">iSER IDENTITY</div>
                <div className="text-[10px] font-bold text-slate-500">Bản sắc sinh viên IS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Winding Game Ribbon Track */}
        <GameJourneyRibbon />

        {/* ========================================================================= */}
        {/* 5. LIVE STATS CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto pt-2">
          {/* Stat 1: Teams */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-blue-100 shadow-xs flex items-center gap-3 hover:scale-102 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">14 Đội</div>
              <div className="text-xs font-bold text-slate-500">Tranh tài toàn diện</div>
            </div>
          </div>

          {/* Stat 2: Challenges */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-amber-100 shadow-xs flex items-center gap-3 hover:scale-102 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{activities.length} Thử thách</div>
              <div className="text-xs font-bold text-slate-500">Học thuật & Thể lực</div>
            </div>
          </div>

          {/* Stat 3: Total Score */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-emerald-100 shadow-xs flex items-center gap-3 hover:scale-102 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalPoints}đ</div>
              <div className="text-xs font-bold text-slate-500">Tổng điểm tích lũy</div>
            </div>
          </div>

          {/* Stat 4: Current Leader */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-amber-200 shadow-xs flex items-center gap-3 hover:scale-102 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <div className="text-2xl font-black text-amber-600 truncate">
                {topTeam ? topTeam.code : '---'}
              </div>
              <div className="text-xs font-bold text-slate-500 truncate">
                {topTeam ? `${topTeam.total_score}đ quán quân` : 'Đang tính toán'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

