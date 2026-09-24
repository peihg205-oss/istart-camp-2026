'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Trophy,
  Activity,
  BarChart3,
  Info,
  Radio,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useScoringSystem } from '@/lib/store/scoringStore';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isRealtimeConnected, currentProfile } = useScoringSystem();

  // Do not render public navbar on admin pages
  if (pathname.startsWith('/admin')) return null;

  const navLinks = [
    { href: '/', label: 'Bảng Xếp Hạng', icon: Trophy },
    { href: '/activities', label: 'Thử Thách & Thể Lệ', icon: Activity },
    { href: '/statistics', label: 'Thống Kê Trại', icon: BarChart3 },
    { href: '/about', label: 'Về IStart Camp', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Official Brand Logo from Brand Team */}
          <Link href="/" className="flex items-center group py-1">
            <div className="relative h-14 w-auto max-w-[200px] sm:max-w-[240px] flex items-center group-hover:scale-105 transition-transform">
              <Image
                src="/images/istart-camp-2026-navbar-logo.png"
                alt="iSTART CAMP 2026"
                width={1024}
                height={474}
                priority
                className="h-11 sm:h-13 w-auto object-contain drop-shadow-xs"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#1A55E3] text-white shadow-sm shadow-[#1A55E3]/30'
                      : 'text-slate-700 hover:text-[#1A55E3] hover:bg-[#1A55E3]/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1A55E3]'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Live Indicator & Admin Access */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-bold text-slate-800 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isRealtimeConnected ? 'bg-[#00D284]' : 'bg-[#FF0854]'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isRealtimeConnected ? 'bg-[#00D284]' : 'bg-[#FF0854]'
                  }`}
                ></span>
              </span>
              <Radio className="w-3.5 h-3.5 text-[#1A55E3]" />
              <span className="font-extrabold tracking-wide">LIVE ARENA</span>
            </div>

            <Link
              href={currentProfile ? '/admin/dashboard' : '/admin/login'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-[#1A55E3] text-white text-xs font-black transition-all shadow-xs"
              title={currentProfile ? 'Vào bàn điều khiển Admin & Trọng tài' : 'Đăng nhập ban điều hành'}
            >
              <Shield className="w-3.5 h-3.5 text-[#0DCAF0]" />
              <span>
                {currentProfile
                  ? currentProfile.role === 'ADMIN'
                    ? 'Bàn Quản Trị'
                    : 'Bàn Trọng Tài'
                  : 'Đăng Nhập Admin'}
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href={currentProfile ? '/admin/dashboard' : '/admin/login'}
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-[#0DCAF0]" />
              <span>{currentProfile ? currentProfile.role : 'Admin'}</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold ${
                  isActive
                    ? 'bg-[#1A55E3] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#1A55E3]'}`} />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2">
            <Link
              href={currentProfile ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white font-black text-sm shadow-sm hover:bg-[#1A55E3] transition-colors"
            >
              <Shield className="w-4 h-4 text-[#0DCAF0]" />
              <span>
                {currentProfile
                  ? currentProfile.role === 'ADMIN'
                    ? 'Vào Bàn Quản Trị Admin'
                    : 'Vào Bàn Trọng Tài'
                  : 'Đăng Nhập Quản Trị / Trọng Tài'}
              </span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00D284]"></span>
              Thời Gian Thực 2026
            </div>
            <span className="text-[11px] font-bold text-[#FF0854]">iSER Arena</span>
          </div>
        </div>
      )}
    </header>
  );
}
