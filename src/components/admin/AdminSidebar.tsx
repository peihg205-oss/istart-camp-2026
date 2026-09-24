'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Users2,
  SlidersHorizontal,
  UserCheck,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useScoringSystem } from '@/lib/store/scoringStore';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentProfile, loginAs, logout } = useScoringSystem();

  const role = currentProfile?.role || 'SCORER';
  const isAdmin = role === 'ADMIN';

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SCORER'],
    },
    {
      href: '/admin/score',
      label: 'Nhập điểm (Score Flow)',
      icon: PlusCircle,
      roles: ['ADMIN', 'SCORER'],
      highlight: true,
    },
    {
      href: '/admin/history',
      label: 'Lịch sử & Audit Log',
      icon: History,
      roles: ['ADMIN', 'SCORER'],
    },
    {
      href: '/admin/teams',
      label: 'Quản lý 14 Đội',
      icon: Users2,
      roles: ['ADMIN', 'SCORER'],
    },
    {
      href: '/admin/rules',
      label: 'Quy tắc chấm điểm',
      icon: SlidersHorizontal,
      roles: ['ADMIN'],
      badge: 'Admin',
    },
    {
      href: '/admin/users',
      label: 'Quản lý Trọng tài',
      icon: UserCheck,
      roles: ['ADMIN'],
      badge: 'Admin',
    },
    {
      href: '/admin/settings',
      label: 'Cài đặt & Dữ liệu',
      icon: Settings,
      roles: ['ADMIN', 'SCORER'],
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-[#EFECE4] text-[#2D2A26] min-h-screen flex flex-col justify-between shrink-0 border-r border-[#DFD8CA]">
      <div>
        {/* Header Branding with Official Logo */}
        <div className="p-3 border-b border-[#DFD8CA] bg-[#E8E4DA]/60">
          <Link href="/" className="block group">
            <div className="bg-white/95 hover:bg-white rounded-xl px-2.5 py-1.5 transition-all shadow-xs border border-[#E5DFD3] flex items-center justify-center">
              <Image
                src="/images/istart-camp-2026-navbar-logo.png"
                alt="iSTART CAMP 2026"
                width={1024}
                height={474}
                className="w-full h-auto max-h-12 object-contain group-hover:scale-[1.02] transition-transform"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Current User & Role Profile Banner */}
        <div className="p-3.5 mx-3 my-3 rounded-2xl bg-white/80 border border-[#DFD8CA] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                isAdmin
                  ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300'
                  : 'bg-[#1A55E3] text-white'
              }`}
            >
              {role}
            </span>
            <span className="text-[10px] text-[#00a86b] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D284] animate-ping"></span>
              Đang trực
            </span>
          </div>

          <div className="text-xs font-black text-[#1E293B] truncate">
            {currentProfile?.full_name || 'Người vận hành'}
          </div>
          <div className="text-[11px] text-[#64748B] truncate">
            {currentProfile?.email || 'scorer@istartcamp.vn'}
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="mt-2.5 pt-2 border-t border-[#EAE5D9] flex items-center gap-1">
            <span className="text-[10px] text-[#7C746A]">Đổi vai trò:</span>
            <button
              onClick={() => loginAs('ADMIN')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                isAdmin
                  ? 'bg-amber-400 text-slate-900 font-black'
                  : 'bg-[#E5DFD3] text-[#5A5248] hover:text-[#1E293B]'
              }`}
            >
              ADMIN
            </button>
            <button
              onClick={() => loginAs('SCORER')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                !isAdmin
                  ? 'bg-[#1A55E3] text-white font-black'
                  : 'bg-[#E5DFD3] text-[#5A5248] hover:text-[#1E293B]'
              }`}
            >
              SCORER
            </button>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isAccessible = item.roles.includes(role);

            if (!isAccessible) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1A55E3] text-white shadow-xs'
                    : item.highlight
                    ? 'bg-[#1A55E3]/10 text-[#1A55E3] hover:bg-[#1A55E3]/20 border border-[#1A55E3]/25'
                    : 'text-[#5A5248] hover:text-[#1A55E3] hover:bg-white/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.highlight ? 'text-[#1A55E3]' : 'text-[#7C746A]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FF0854] text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Bottom Controls */}
      <div className="p-4 border-t border-[#DFD8CA] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#5A5248] hover:text-[#1A55E3] hover:bg-white/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> Xem Trang Bảng Điểm
          </span>
          <span className="text-[10px] text-[#1A55E3] font-bold px-1.5 py-0.5 rounded bg-[#1A55E3]/10">
            Public
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#FF0854] hover:bg-[#FF0854]/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
