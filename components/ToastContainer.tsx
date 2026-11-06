'use client';

import React from 'react';
import { usePortal } from '@/context/PortalContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = usePortal();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl p-3.5 shadow-xl border transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-emerald-900/95 border-emerald-700 text-white'
                : isError
                ? 'bg-rose-900/95 border-rose-700 text-white'
                : 'bg-cisd-navy-900/95 border-cisd-navy-700 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
              {isError && <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />}
              {!isSuccess && !isError && <Info className="h-4 w-4 text-cisd-gold-400 flex-shrink-0" />}
              <p className="text-xs font-medium leading-snug break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-300 hover:text-white p-0.5 rounded transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
