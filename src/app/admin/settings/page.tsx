'use client';

import React, { useState } from 'react';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  Settings,
  Download,
  RotateCcw,
  Database,
  Radio,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminSettingsPage() {
  const toast = useToast();
  const {
    rankedTeams,
    activities,
    transactions,
    auditLogs,
    isRealtimeConnected,
    isDemoMode,
    loadDemoData,
    wipeDataToZero,
    currentProfile,
  } = useScoringSystem();

  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [msg, setMsg] = useState('');

  // Export JSON
  const handleExportJson = () => {
    const backupData = {
      event: 'IStart Camp 2026',
      exported_at: new Date().toISOString(),
      teams: rankedTeams,
      activities,
      transactions,
      audit_logs: auditLogs,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `istart_camp_2026_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    const m = 'Đã xuất toàn bộ dữ liệu ra tệp JSON thành công.';
    setMsg(m);
    toast.success(m);
    setTimeout(() => setMsg(''), 3000);
  };

  // Export CSV of Leaderboard
  const handleExportCsv = () => {
    let csv = 'Hang,Ma_Doi,Ten_Doi,Tong_Diem,Khau_Hieu\n';
    rankedTeams.forEach((t) => {
      csv += `${t.rank},"${t.code}","${t.name}",${t.total_score},"${t.motto || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `istart_camp_2026_leaderboard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    const m = 'Đã xuất bảng tổng sắp ra tệp CSV thành công.';
    setMsg(m);
    toast.success(m);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleWipeToZero = () => {
    wipeDataToZero();
    setWipeConfirm(false);
    const m = 'Đã xóa toàn bộ điểm số về 0! Sẵn sàng cho giải đấu chính thức.';
    setMsg(m);
    toast.warning(m);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleReloadDemo = () => {
    loadDemoData();
    const m = 'Đã nạp bộ dữ liệu DEMO mẫu sinh động (23 giao dịch & bảng xếp hạng)!';
    setMsg(m);
    toast.success(m);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 text-[#2D2A26]">
      {/* Header */}
      <div className="pb-4 border-b border-[#DFD8CA]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A55E3]/10 text-[#1A55E3] border border-[#1A55E3]/25 text-xs font-black uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5" /> Quản Trị Hệ Thống
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
          CÀI ĐẶT & KẾT NỐI HỆ THỐNG
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] font-medium">
          Chuyển đổi linh hoạt giữa Dữ liệu Demo trình chiếu và Database chạy giải thật.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-[#00D284]/15 border border-[#00D284]/40 text-[#00a86b] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00D284]" />
          <span>{msg}</span>
        </div>
      )}

      {/* Demo vs Live Database Guide */}
      <div className="bg-sky-50 border border-sky-200 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1A55E3]/15 text-[#1A55E3] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1E293B]">
              Hướng Dẫn: Chạy Demo & Kết Nối Database Thật
            </h3>
            <p className="text-xs text-[#1A55E3] font-medium">
              Hệ thống hiện đang chạy chế độ Hybrid Demo có đầy đủ giao dịch mẫu để bạn kiểm tra giao diện.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-sky-200 space-y-2">
            <div className="font-bold text-[#1A55E3] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              GIAI ĐOẠN 1: TRÌNH CHIẾU DEMO
            </div>
            <p className="text-[#5A5248] text-[11px] leading-relaxed">
              Bạn có thể sử dụng dữ liệu mẫu gồm 14 đội, 23 lượt chấm điểm, bục vinh quang và biểu đồ để duyệt giao diện công khai và thử nghiệm các tính năng Admin.
            </p>
            <button
              onClick={handleReloadDemo}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#1A55E3]/15 text-[#1A55E3] border border-[#1A55E3]/30 hover:bg-[#1A55E3] hover:text-white font-bold transition-all text-xs"
            >
              🔄 Nạp lại dữ liệu DEMO mẫu
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-sky-200 space-y-2">
            <div className="font-bold text-[#00a86b] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              GIAI ĐOẠN 2: CHẠY THẬT VỚI SUPABASE
            </div>
            <p className="text-[#5A5248] text-[11px] leading-relaxed">
              Khi bắt đầu giải thật: Thêm <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> vào file <code className="text-[#1A55E3] bg-sky-50 px-1 py-0.5 rounded">.env.local</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#1E293B] border border-[#E2DDD2] flex items-center justify-center">
            <Radio className="w-5 h-5 text-[#00a86b]" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1E293B]">
              Trạng Thái Kết Nối Đám Mây & Realtime
            </h3>
            <p className="text-xs text-[#64748B]">
              Theo dõi đồng bộ cơ sở dữ liệu và kênh phát Realtime tức thời
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2] space-y-1">
            <div className="text-[#64748B]">Chế độ vận hành:</div>
            <div className="font-bold text-[#1E293B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {isDemoMode ? 'Hybrid Local Store (Đang hoạt động mượt mà)' : 'Supabase Cloud Live'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2] space-y-1">
            <div className="text-[#64748B]">Kênh Realtime Broadcast:</div>
            <div className="font-bold text-[#1E293B] flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#00a86b]" />
              {isRealtimeConnected ? 'Đang kết nối liên tục (Active)' : 'Ngoại tuyến'}
            </div>
          </div>
        </div>
      </div>

      {/* Data Export Card */}
      <div className="bg-white border border-[#E2DDD2] rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-black text-[#1E293B] flex items-center gap-2">
          <Download className="w-5 h-5 text-[#1A55E3]" />
          Xuất Báo Cáo & Sao Lưu Dữ Liệu
        </h3>
        <p className="text-xs text-[#64748B]">
          Tải xuống toàn bộ bảng tổng sắp hoặc bản sao lưu giao dịch và audit log để đối soát sau chương trình trại.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE5DB] text-[#1E293B] border border-[#D5CDC0] font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00a86b]" />
            <span>Xuất Bảng Tổng Sắp (CSV)</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE5DB] text-[#1E293B] border border-[#D5CDC0] font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#1A55E3]" />
            <span>Xuất Toàn Bộ Giao Dịch & Log (JSON)</span>
          </button>
        </div>
      </div>

      {/* Reset & Wipe Danger Zone (Admin only) */}
      {currentProfile?.role === 'ADMIN' && (
        <div className="bg-white border border-rose-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#FF0854] font-black text-sm">
            <AlertTriangle className="w-5 h-5" />
            Quản Lý Vòng Đấu & Thiết Lập Lại Dữ Liệu
          </div>
          <p className="text-xs text-[#64748B]">
            Chọn thao tác phù hợp tùy theo bạn đang muốn demo kiểm tra hay chuẩn bị bước vào thi đấu chính thức:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Action 1: Load Demo */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD2] space-y-3">
              <div className="font-bold text-[#1E293B] text-xs">1. Nạp Dữ Liệu DEMO Mẫu</div>
              <p className="text-[#64748B] text-[11px]">
                Nạp lại toàn bộ 23 giao dịch mẫu ban đầu để kiểm tra bảng xếp hạng, bục vinh quang và lịch sử chấm điểm.
              </p>
              <button
                onClick={handleReloadDemo}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#EAE5DB] text-[#1A55E3] border border-[#D5CDC0] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nạp Dữ Liệu Demo Mẫu</span>
              </button>
            </div>

            {/* Action 2: Wipe To Zero */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
              <div className="font-bold text-[#FF0854] text-xs">2. Xóa Sạch Điểm (Về 0đ) Để Chạy Thật</div>
              <p className="text-[#64748B] text-[11px]">
                Xóa sạch mọi giao dịch điểm và audit log. Toàn bộ 14 đội sẽ về 0 điểm sẵn sàng cho giờ khai mạc trại.
              </p>
              {!wipeConfirm ? (
                <button
                  onClick={() => setWipeConfirm(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-100 hover:bg-[#FF0854] text-[#FF0854] hover:text-white border border-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xóa sạch điểm về 0 để thi đấu</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-[#FF0854] font-bold">
                    Xác nhận đưa bảng xếp hạng về 0 điểm?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleWipeToZero}
                      className="flex-1 py-1.5 rounded-lg bg-[#FF0854] hover:bg-[#d90444] text-white font-bold text-xs"
                    >
                      Xác nhận xóa
                    </button>
                    <button
                      onClick={() => setWipeConfirm(false)}
                      className="flex-1 py-1.5 rounded-lg bg-[#EAE5DB] text-[#5A5248] font-bold text-xs"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
