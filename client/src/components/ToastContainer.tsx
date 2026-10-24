import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />,
          info: <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />,
        };

        const bgClass = {
          success: 'bg-slate-900/95 border-emerald-500/40 text-emerald-200',
          warning: 'bg-slate-900/95 border-amber-500/40 text-amber-200',
          error: 'bg-slate-900/95 border-rose-500/40 text-rose-200',
          info: 'bg-slate-900/95 border-brand-500/40 text-indigo-200',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${bgClass}`}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 text-xs leading-relaxed text-slate-200 font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
