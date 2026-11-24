import React, { useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import type { TaskRecord } from '../types/task';

interface DeleteConfirmModalProps {
  task: TaskRecord | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  task,
  deleting,
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    if (!task) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, deleting, onCancel]);

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="fixed inset-0 bg-[#181424]/35 backdrop-blur-[1px]"
        onClick={() => {
          if (!deleting) onCancel();
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#E8E5F0] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="text-base font-display font-bold text-[#181424]"
              >
                Delete task?
              </h2>
              <p className="mt-1 text-sm text-[#5B5670] leading-relaxed">
                This will permanently remove{' '}
                <span className="font-semibold text-[#181424] break-words">
                  &ldquo;{task.title}&rdquo;
                </span>{' '}
                from your DoList account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            aria-label="Close confirmation dialog"
            className="rounded-lg p-1.5 text-[#78718E] hover:bg-[#FAF9FD] hover:text-[#181424] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-[#E8E5F0] bg-white px-4 py-2 text-sm font-semibold text-[#181424] hover:bg-[#FAF9FD] focus-visible:outline-2 focus-visible:outline-[#6D28D9] disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            {deleting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            <span>{deleting ? 'Deleting...' : 'Delete Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
