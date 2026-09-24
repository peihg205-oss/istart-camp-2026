'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Heart, Key, MapPin, Calendar, Sparkles } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="w-full bg-white/95 border-t border-slate-200/80 mt-20 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block py-1 group">
              <div className="relative h-14 w-auto max-w-[240px] flex items-center">
                <Image
                  src="/images/istart-camp-2026-navbar-logo.png"
                  alt="iSTART CAMP 2026"
                  width={1024}
                  height={474}
                  className="h-11 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
            <p className="text-slate-600 text-sm max-w-md leading-relaxed font-medium">
              Hệ thống bảng điểm điện tử trực tiếp dành cho 12 đội tuyển tranh tài tại IStart Camp 2026. Tôn vinh tinh thần đồng đội, bứt phá năng lực và chuẩn mực giá trị iSER: <strong>Dynamic • Innovative • Global-minded</strong>.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full banner-pill-slogan shadow-xs">
              <Image
                src="/images/unlock-the-iser-in-you.png"
                alt="UNLOCK THE iSER IN YOU"
                width={987}
                height={90}
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </div>

            {/* Event Meta Details from Banner */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600 pt-1">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                <Calendar className="w-3 h-3 text-amber-600" /> 25.09.2026
              </span>
              <span className="inline-flex items-center gap-1 bg-[#1A55E3]/10 text-[#1A55E3] px-2.5 py-1 rounded-lg border border-[#1A55E3]/20">
                <MapPin className="w-3 h-3 text-[#1A55E3]" /> Nhà Thi Đấu Cầu Giấy (35 Trần Quý Kiên)
              </span>
              <span className="inline-flex items-center gap-1 bg-[#5E6EED]/10 text-[#5E6EED] px-2.5 py-1 rounded-lg border border-[#5E6EED]/20">
                🎓 K25 - New Journey
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Khám Phá Trại
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-[#1A55E3] transition-colors">
                  Bảng tổng sắp 14 đội
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-[#1A55E3] transition-colors">
                  Quy chế 6 thử thách
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="hover:text-[#1A55E3] transition-colors">
                  Thống kê điểm số & biểu đồ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#1A55E3] transition-colors">
                  Về iSER & Cam kết minh bạch
                </Link>
              </li>
            </ul>
          </div>

          {/* Teams Roster */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              12 Đội Thi Đấu
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-extrabold text-slate-700">
              {[
                'IB 1',
                'IB 2',
                'IB 3 + KEUKA + MKT',
                'AC',
                'ICE + AAI',
                'FDB',
                'BEL',
                'AIT + ISEL',
                'MIS',
                'BDA',
                'DB',
                'DC',
              ].map((code) => (
                <Link
                  key={code}
                  href={`/teams/${encodeURIComponent(code)}`}
                  className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-[#1A55E3] hover:text-white border border-slate-200 hover:border-[#1A55E3] transition-colors"
                >
                  {code}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 IStart Camp. Hệ thống bảng điểm điện tử thời gian thực.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-[#FF0854] inline fill-[#FF0854]" /> for 12 Teams
          </p>
        </div>
      </div>
    </footer>
  );
}
