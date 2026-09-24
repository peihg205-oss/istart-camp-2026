'use client';

import React from 'react';
import { useScoringSystem } from '@/lib/store/scoringStore';
import {
  Activity as ActivityIcon,
  Trophy,
  Layers,
} from 'lucide-react';

export default function ActivitiesPage() {
  const { activities } = useScoringSystem();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A55E3]/10 text-blue-900 border border-[#1A55E3]/20 text-xs font-bold uppercase tracking-wider">
          <ActivityIcon className="w-3.5 h-3.5 text-[#1A55E3]" />
          Hạng mục Tranh tài & Thể lệ
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          DANH MỤC THỬ THÁCH & QUY CHẾ ĐIỂM
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          Chi tiết 4 cơ chế chấm điểm: Cố định (Fixed), Xếp hạng (Ranking), Theo số lần (Quantity), và Công thức tính trọng số (Formula).
        </p>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((act) => {
          const rule = act.scoring_rule;
          return (
            <div
              key={act.id}
              id={act.code.toLowerCase()}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      act.category === 'ACADEMIC'
                        ? 'bg-blue-100 text-[#1A55E3]'
                        : act.category === 'CHALLENGE'
                        ? 'bg-purple-100 text-purple-700'
                        : act.category === 'DISCIPLINE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {act.category}
                  </span>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {act.is_repeatable ? 'Nhiều lần (Lũy tiến)' : '1 lần duy nhất'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-slate-900 group-hover:text-[#1A55E3] transition-colors mb-2">
                  {act.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {act.description}
                </p>

                {/* Rule Breakdown Box */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2.5 mb-6">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-[#1A55E3]" />
                    Cơ chế: {act.rule_type}
                  </div>

                  {/* FIXED Rule rendering */}
                  {act.rule_type === 'FIXED' && (
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>Điểm chuẩn khi hoàn thành:</span>
                      <span className="font-black text-sm text-blue-800 bg-[#1A55E3]/10 border border-blue-100 px-2 py-0.5 rounded-lg">
                        +{((rule?.config as { points?: number })?.points) ?? 15} điểm
                      </span>
                    </div>
                  )}

                  {/* RANKING Rule rendering */}
                  {act.rule_type === 'RANKING' && (
                    <div className="space-y-1.5">
                      {Object.entries(
                        (rule?.config as { ranks?: Record<string, number> })?.ranks || {}
                      ).map(([rank, pts]) => (
                        <div
                          key={rank}
                          className="flex items-center justify-between text-slate-700 font-medium"
                        >
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-500" /> Hạng {rank}:
                          </span>
                          <span className="font-bold text-blue-800">+{pts} điểm</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* QUANTITY Rule rendering */}
                  {act.rule_type === 'QUANTITY' && (
                    <div className="space-y-1 text-[11px]">
                      {((rule?.config as { items?: Array<{ id: string; label: string; points: number }> })?.items || []).map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-slate-700 py-0.5"
                          >
                            <span className="truncate mr-2">• {item.label}:</span>
                            <span
                              className={`font-black shrink-0 ${
                                item.points > 0 ? 'text-[#00D284]' : 'text-[#FF0854]'
                              }`}
                            >
                              {item.points > 0 ? `+${item.points}` : item.points}đ/lần
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* FORMULA Rule rendering */}
                  {act.rule_type === 'FORMULA' && (
                    <div className="space-y-1">
                      <div className="font-medium text-slate-700">
                        {((rule?.config as { description?: string })?.description) ||
                          'Điểm = Sáng × 40% + Chiều × 60%'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono bg-white p-1.5 rounded-lg border border-slate-200">
                        {((rule?.config as { expression?: string })?.expression) || 'round(morning * 0.4 + afternoon * 0.6)'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Public Info */}
              <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-between border border-slate-200">
                <span className="text-[11px] text-slate-500">Trạng thái thi đấu:</span>
                <span className="inline-flex items-center gap-1 text-[#00D284] font-black">
                  <span className="w-2 h-2 rounded-full bg-[#00D284] animate-pulse"></span>
                  Đang diễn ra
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
