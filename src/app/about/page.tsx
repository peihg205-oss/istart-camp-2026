'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Sparkles, CheckCircle2, Calendar, MapPin, Building2, Key } from 'lucide-react';
import Link from 'next/link';
import { GoldenStar3D } from '@/components/ui/BannerGraphicElements';

export default function AboutPage() {
  const iserValues = [
    {
      letter: '⚡',
      title: 'Dynamic (Năng động & Tiên phong)',
      desc: 'Sức trẻ nhiệt huyết, tinh thần xông pha trong mọi thử thách thực tế của trại và khả năng thích ứng linh hoạt trước mọi thay đổi.',
      color: 'bg-amber-500',
    },
    {
      letter: '💡',
      title: 'Innovative (Đổi mới sáng tạo)',
      desc: 'Tư duy phá cách, tìm kiếm lời giải thông minh cho các bài thực hành học thuật Lab 1 & Lab 2 và thử thách chiến lược Hero.',
      color: 'bg-[#1A55E3]',
    },
    {
      letter: '🌐',
      title: 'Global-minded (Tư duy toàn cầu)',
      desc: 'Tầm nhìn hội nhập quốc tế của sinh viên Trường Quốc tế, sẵn sàng kết nối, hợp tác đa văn hóa cùng Keuka College & HELP University.',
      color: 'bg-indigo-600',
    },
    {
      letter: '🎓',
      title: 'iSER Identity (Bản sắc iSER)',
      desc: 'Khắc sâu niềm tự hào iSER, gìn giữ chuẩn mực kỷ luật trại, thấu cảm và đồng hành kiên cường vì màu cờ sắc áo của 14 đội thi.',
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="relative w-48 sm:w-64 aspect-[21/10] mx-auto hover:scale-105 transition-transform duration-300 drop-shadow-lg">
          <Image
            src="/images/istart-camp-2026-logo-3d.png"
            alt="iSTART CAMP 2026"
            fill
            sizes="(max-width: 768px) 80vw, 260px"
            priority
            className="object-contain"
          />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full banner-pill-slogan text-xs font-black text-slate-900 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>UNLOCK THE <span className="text-[#1A55E3]">iSER</span> IN YOU</span>
          <Key className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          VỀ ĐẠI HỘI ISTART CAMP 2026
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
          IStart Camp 2026 là ngày hội lớn của Tân sinh viên K25, quy tụ 14 đội tuyển tranh tài để khởi đầu hành trình đại học rực rỡ và khám phá trọn vẹn bản sắc sinh viên iSER.
        </p>
      </div>

      {/* Official Banner Showcase */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-slate-200/80 bg-white">
        <div className="relative w-full aspect-[21/9]">
          <Image
            src="/images/istart-camp-2026-banner.png"
            alt="Official Banner iStart Camp 2026"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Thời gian tổ chức</div>
            <div className="text-base font-black text-slate-900">25.09.2026</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1A55E3]/10 text-[#1A55E3] flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Địa điểm sự kiện</div>
            <div className="text-sm font-black text-slate-900">Nhà thi đấu Cầu Giấy (35 Trần Quý Kiên, HN)</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Đơn vị chủ trì</div>
            <div className="text-sm font-black text-slate-900">Trường Quốc Tế (VNU-IS) & ĐHQGHN</div>
          </div>
        </div>
      </div>

      {/* iSER Values Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            BỐN TRỤ CỘT iSER
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kim chỉ nam dẫn lối cho mọi hoạt động và tinh thần thi đấu của toàn trại
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {iserValues.map((val) => (
            <div
              key={val.title}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4 hover:border-blue-400 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${val.color} text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md`}
              >
                {val.letter}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">{val.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Transparency Pledge */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1A55E3] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              Cam Kết Tính Điểm Minh Bạch & Chuẩn Hóa
            </h3>
            <p className="text-xs text-blue-200">
              Nguyên tắc vận hành của Hệ thống Chấm điểm IStart Camp 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800 text-xs sm:text-sm">
          <div className="space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 text-base">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              Giao Dịch Bất Biến
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Không bao giờ ghi đè trực tiếp điểm tổng của đội. Mọi điểm số cộng hoặc trừ đều được lưu thành từng giao dịch (Transaction) có mã định danh.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-blue-400 flex items-center gap-1.5 text-base">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              Kiểm Toán Toàn Diện (Audit Trail)
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Mọi thao tác Tạo (Create), Sửa (Edit), Hủy (Undo) đều lưu trữ chi tiết thời gian, trọng tài thực hiện và lý do giải trình bắt buộc.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Cập Nhật Tức Thời (Realtime)
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Trại sinh có thể theo dõi bảng tổng sắp và biến động thứ hạng ngay khi trọng tài vừa xác nhận mà không cần tải lại trang.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1A55E3] hover:bg-[#1547bf] text-white font-black text-sm shadow-md transition-all hover:scale-105"
          >
            Theo dõi Bảng xếp hạng ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
