'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: 'success', title, message }),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast({ type: 'error', title, message }),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast({ type: 'info', title, message }),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: 'warning', title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((t) => {
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
                t.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-white'
                  : t.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/50 text-white'
                  : t.type === 'warning'
                  ? 'bg-amber-950/90 border-amber-500/50 text-white'
                  : 'bg-slate-900/90 border-blue-500/50 text-white'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-black tracking-wide">{t.title}</h5>
                {t.message && (
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5 leading-snug">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white transition-colors shrink-0 p-1"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
