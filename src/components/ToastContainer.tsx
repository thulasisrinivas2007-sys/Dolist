import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types/task';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-150 ${
              isError
                ? 'border-red-200 text-[#181424]'
                : isSuccess
                  ? 'border-emerald-200 text-[#181424]'
                  : 'border-[#E8E5F0] text-[#181424]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isError ? (
                <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
              ) : isSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <Info className="h-4 w-4 text-[#6D28D9]" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#181424] leading-snug">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-1 text-xs text-[#5B5670] leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg p-1.5 text-[#78718E] hover:bg-[#F5F3FF] hover:text-[#181424] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
