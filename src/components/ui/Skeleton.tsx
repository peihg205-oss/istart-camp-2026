import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-2xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function PodiumSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto pt-10 px-4">
      <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
        <Skeleton className="w-full max-w-[260px] h-48 rounded-3xl" />
        <Skeleton className="w-full max-w-[260px] h-24 rounded-t-3xl hidden md:block" />
      </div>
      <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
        <Skeleton className="w-full max-w-[280px] h-60 rounded-3xl" />
        <Skeleton className="w-full max-w-[280px] h-36 rounded-t-3xl hidden md:block" />
      </div>
      <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
        <Skeleton className="w-full max-w-[260px] h-44 rounded-3xl" />
        <Skeleton className="w-full max-w-[260px] h-16 rounded-t-3xl hidden md:block" />
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <Skeleton className="w-48 h-8 rounded-xl" />
        <Skeleton className="w-64 h-8 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="w-full h-14 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
