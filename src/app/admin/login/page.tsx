'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  LogOut,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

type TabMode = 'ADMIN' | 'SCORER' | 'CUSTOM';

export default function AdminLoginPage() {
  const router = useRouter();
  const { currentProfile, loginWithCredentials, logout } = useScoringSystem();

  const [activeTab, setActiveTab] = useState<TabMode>('ADMIN');
  const [email, setEmail] = useState('admin@istartcamp.vn');
  const [password, setPassword] = useState('iSER2026!secret');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Switch role mode and pre-fill credentials for quick test/demo
  const handleTabChange = (mode: TabMode) => {
    setActiveTab(mode);
    setError('');
    if (mode === 'ADMIN') {
      setEmail('admin@istartcamp.vn');
      setPassword('iSER2026!secret');
    } else if (mode === 'SCORER') {
      setEmail('scorer@istartcamp.vn');
      setPassword('iSER2026!secret');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginWithCredentials(email, password);
      if (!res.success) {
        setError(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 500);
    } catch {
      setError('Đã xảy ra sự cố khi xác thực. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-6 text-[#2D2A26]">
      {/* Brand Header with Official 3D Logo */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block group">
          <div className="relative w-64 sm:w-72 aspect-[21/10] mx-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
            <Image
              src="/images/istart-camp-2026-logo-3d.png"
              alt="iSTART CAMP 2026 - Official Logo"
              fill
              sizes="(max-width: 768px) 85vw, 300px"
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Slogan Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#DFD8CA] text-xs font-black text-[#1E293B] shadow-xs">
          <span>
            UNLOCK THE <span className="text-[#1A55E3]">iSER</span> IN YOU
          </span>
          <Key className="w-3.5 h-3.5 text-amber-500 inline" />
        </div>

        <div>
          <h1 className="text-base sm:text-lg font-black text-[#1E293B] uppercase tracking-wide">
            Cổng Điều Phối & Giám Sát Chấm Điểm
          </h1>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Hệ thống quản lý, giám sát và kiểm toán điểm thi đấu thời gian thực
          </p>
        </div>
      </div>

      {/* If already logged in, show active session notification */}
      {currentProfile && (
        <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-5 shadow-sm space-y-3 bg-gradient-to-b from-emerald-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Phiên đăng nhập đang hoạt động
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                currentProfile.role === 'ADMIN'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-[#1A55E3] text-white'
              }`}
            >
              {currentProfile.role}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAE5DB] text-[#1A55E3] flex items-center justify-center font-black text-sm shrink-0 border border-[#DFD8CA]">
              {currentProfile.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-[#1E293B] truncate">
                {currentProfile.full_name}
              </p>
              <p className="text-[11px] text-[#64748B] truncate">{currentProfile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="py-2.5 px-3 rounded-xl bg-[#1A55E3] hover:bg-[#1547bf] text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Vào Bảng Quản Trị</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đổi tài khoản</span>
            </button>
          </div>
        </div>
      )}

      {/* Login Card in Warm Beige Palette */}
      <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        {/* Role Selector Segmented Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#5A5248]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Chọn vai trò hoặc tài khoản:
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2]">
            <button
              type="button"
              onClick={() => handleTabChange('ADMIN')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                activeTab === 'ADMIN'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('SCORER')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                activeTab === 'SCORER'
                  ? 'bg-[#1A55E3] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>TRỌNG TÀI</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('CUSTOM')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                activeTab === 'CUSTOM'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <span>TÙY CHỈNH</span>
            </button>
          </div>

          <div className="text-[11px] text-[#64748B] px-1">
            {activeTab === 'ADMIN' && (
              <p className="flex items-center gap-1 text-amber-800 font-medium">
                👑 <strong>ADMIN:</strong> Toàn quyền kiểm toán, hủy/sửa điểm, phân quyền trọng tài & quy tắc.
              </p>
            )}
            {activeTab === 'SCORER' && (
              <p className="flex items-center gap-1 text-[#1A55E3] font-medium">
                ⚖️ <strong>SCORER:</strong> Quyền chấm điểm các thử thách và cập nhật bảng xếp hạng tức thì.
              </p>
            )}
            {activeTab === 'CUSTOM' && (
              <p className="text-slate-600">
                ✏️ <strong>Tùy chỉnh:</strong> Nhập địa chỉ email và mật khẩu riêng do BTC cấp.
              </p>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-[#FF0854]/10 border border-[#FF0854]/30 text-[#e0074a] text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#FF0854]" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Xác thực thành công! Đang chuyển hướng vào hệ thống...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5A5248] flex items-center justify-between">
              <span>Email Trọng Tài / Quản Trị:</span>
              {activeTab !== 'CUSTOM' && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Tài khoản có sẵn
                </span>
              )}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@istartcamp.vn"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-xs text-[#1E293B] focus:border-[#1A55E3] focus:bg-white outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5A5248]">Mật Khẩu Truy Cập:</label>
              <button
                type="button"
                onClick={() => setPassword('iSER2026!secret')}
                className="text-[10px] text-[#1A55E3] hover:underline font-semibold"
                title="Điền mật khẩu mặc định"
              >
                Gợi ý: iSER2026!secret
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D5CDC0] text-xs text-[#1E293B] focus:border-[#1A55E3] focus:bg-white outline-none transition-all shadow-inner font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#5A5248]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#1A55E3] border-[#D5CDC0] focus:ring-[#1A55E3]"
              />
              <span className="font-medium">Ghi nhớ đăng nhập trên máy này</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-2xl bg-[#1A55E3] hover:bg-[#1547bf] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực thông tin bảo mật...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Đăng nhập thành công!</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Security Info & Back to Home */}
        <div className="space-y-3 pt-3 border-t border-[#EAE5D9]">
          <div className="flex items-center justify-center gap-2 text-[10px] text-[#64748B]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Mã hóa SSL 256-bit • Đồng bộ dữ liệu Realtime</span>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs font-bold text-[#64748B] hover:text-[#1A55E3] transition-colors inline-flex items-center gap-1"
            >
              <span>← Quay lại Bảng Xếp Hạng Công Khai</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
