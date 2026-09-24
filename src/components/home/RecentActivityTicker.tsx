'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, PlusCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { ScoreTransaction } from '@/types';

interface RecentActivityTickerProps {
  transactions: ScoreTransaction[];
}

export function RecentActivityTicker({ transactions }: RecentActivityTickerProps) {
  // Show up to 6 recent transactions
  const recent = transactions.slice(0, 6);

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
      {/* Title */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D284] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D284]"></span>
          </span>
          <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            HOẠT ĐỘNG CHẤM ĐIỂM GẦN NHẤT
          </h4>
        </div>
        <div className="text-xs font-semibold text-[#1A55E3] flex items-center gap-1">
          <Radio className="w-3.5 h-3.5" />
          Trực tiếp
        </div>
      </div>

      {/* Ticker List or Empty State */}
      {recent.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-[#1A55E3] mx-auto mb-2 opacity-60 animate-pulse" />
          <p className="text-xs font-bold text-slate-700">Chưa có giao dịch chấm điểm</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Bảng điểm đang kết nối thời gian thực, sẵn sàng ghi nhận những điểm số đầu tiên!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((tx) => {
            const isPositive = tx.points_awarded >= 0;
            return (
              <div
                key={tx.id}
                className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-[#1A55E3]/5 border border-slate-100 transition-all text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {/* Score icon */}
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isPositive
                        ? 'bg-[#00D284]/15 text-[#009b62]'
                        : 'bg-[#FF0854]/15 text-[#FF0854]'
                    }`}
                  >
                    {isPositive ? (
                      <PlusCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teams/${tx.team?.code}`}
                        className="font-black text-slate-900 hover:text-[#1A55E3] transition-colors"
                      >
                        {tx.team?.code || 'ĐỘI'}
                      </Link>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-700 line-clamp-1">
                        {tx.activity?.name || 'Hoạt động'}
                      </span>
                    </div>

                    {tx.notes && (
                      <p className="text-slate-500 mt-0.5 line-clamp-1 italic">
                        &ldquo;{tx.notes}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3 inline" />
                      <span>{formatTime(tx.created_at)}</span>
                      <span>•</span>
                      <span>Bởi {tx.created_by_name || 'Trọng tài'}</span>
                    </div>
                  </div>
                </div>

                {/* Point badge */}
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl font-black text-xs sm:text-sm ${
                      isPositive
                        ? 'bg-[#00D284] text-white shadow-xs'
                        : 'bg-[#FF0854] text-white shadow-xs'
                    }`}
                  >
                    {isPositive ? `+${tx.points_awarded}` : tx.points_awarded}đ
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <Link
          href="/activities"
          className="text-xs font-bold text-[#1A55E3] hover:text-[#1547bf] inline-flex items-center gap-1"
        >
          Xem tất cả tiêu chí chấm điểm <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
