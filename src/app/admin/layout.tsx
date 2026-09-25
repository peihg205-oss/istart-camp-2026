'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useScoringSystem } from '@/lib/store/scoringStore';
import Link from 'next/link';
import { ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentProfile } = useScoringSystem();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/admin/login';

  // Immediate redirect to login if unauthenticated
  useEffect(() => {
    if (mounted && !currentProfile && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [mounted, currentProfile, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] text-[#2D2A26] flex flex-col justify-center items-center p-4">
        {children}
      </div>
    );
  }

  // During initial mount / hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F5EE] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1A55E3] animate-spin" />
      </div>
    );
  }

  // If user is not authenticated, guard the route
  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] text-[#2D2A26] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E2DDD2] rounded-3xl p-8 text-center space-y-5 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#1E293B]">Yêu Cầu Đăng Nhập</h2>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc. Vui lòng đăng nhập với tư cách <strong>Admin</strong> hoặc <strong>Trọng tài</strong> để tiếp tục.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/admin/login"
              className="w-full py-3 px-4 rounded-2xl bg-[#1A55E3] hover:bg-[#1547bf] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Đăng nhập vào hệ thống</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 px-4 text-xs font-bold text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              ← Quay lại Bảng Xếp Hạng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F7F5EE] text-[#2D2A26]">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Mobile Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#EFECE4] border-b border-[#DFD8CA]">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-black text-sm text-[#1E293B]">
            <span className="text-[#1A55E3]">ISTART 2026</span> SCORING
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-900">
              {currentProfile.role}
            </span>
            <Link
              href="/admin/score"
              className="px-3 py-1.5 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] text-white text-xs font-bold shadow-xs"
            >
              + Chấm điểm
            </Link>
          </div>
        </header>

        {/* Dynamic Admin Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
