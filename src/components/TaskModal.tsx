import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { validateTaskForm } from '../lib/validation';
import type { TaskFormValues, TaskPriority, TaskRecord } from '../types/task';

interface TaskModalProps {
  isOpen: boolean;
  editingTask: TaskRecord | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const DEFAULT_VALUES: TaskFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  editingTask,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<TaskFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskFormValues, string>>
  >({});

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setValues({
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        due_date: editingTask.due_date ?? '',
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
    setErrors({});
  }, [isOpen, editingTask]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTaskForm(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    await onSubmit(values);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div
        className="fixed inset-0 bg-[#181424]/35 backdrop-blur-[1px]"
        onClick={() => {
          if (!submitting) onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-[#E8E5F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EFEFF5] px-6 py-4">
          <h2
            id="task-modal-title"
            className="text-lg font-display font-bold text-[#181424]"
          >
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-[#78718E] hover:bg-[#F5F3FF] hover:text-[#181424] focus-visible:outline-2 focus-visible:outline-[#6D28D9] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-[#181424]"
              >
                Title <span className="text-red-600">*</span>
              </label>
              <span className="text-xs font-mono-tabular text-[#78718E]">
                {values.title.trim().length}/120
              </span>
            </div>
            <input
              id="task-title"
              type="text"
              maxLength={120}
              autoFocus
              value={values.title}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={submitting}
              placeholder="e.g., Prepare Q4 product roadmap"
              aria-invalid={Boolean(errors.title)}
              className="w-full rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2.5 text-sm text-[#181424] placeholder:text-[#8E88A3] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:bg-[#FAF9FD]"
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="task-description"
                className="block text-sm font-medium text-[#181424]"
              >
                Description
              </label>
              <span className="text-xs font-mono-tabular text-[#78718E]">
                {values.description.trim().length}/1000
              </span>
            </div>
            <textarea
              id="task-description"
              rows={3}
              maxLength={1000}
              value={values.description}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={submitting}
              placeholder="Optional notes, context, or checklist details"
              aria-invalid={Boolean(errors.description)}
              className="w-full rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2.5 text-sm text-[#181424] placeholder:text-[#8E88A3] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:bg-[#FAF9FD] resize-y"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-priority"
                className="block text-sm font-medium text-[#181424] mb-1.5"
              >
                Priority
              </label>
              <select
                id="task-priority"
                value={values.priority}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    priority: e.target.value as TaskPriority,
                  }))
                }
                disabled={submitting}
                className="w-full rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2.5 text-sm text-[#181424] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:bg-[#FAF9FD]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.priority && (
                <p className="mt-1.5 text-xs text-red-600">{errors.priority}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="task-due-date"
                className="block text-sm font-medium text-[#181424] mb-1.5"
              >
                Due date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={values.due_date}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, due_date: e.target.value }))
                }
                disabled={submitting}
                aria-invalid={Boolean(errors.due_date)}
                className="w-full rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2.5 text-sm font-mono-tabular text-[#181424] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:bg-[#FAF9FD]"
              />
              {errors.due_date && (
                <p className="mt-1.5 text-xs text-red-600">{errors.due_date}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFEFF5]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-[#E8E5F0] bg-white px-4 py-2 text-sm font-semibold text-[#181424] hover:bg-[#FAF9FD] focus-visible:outline-2 focus-visible:outline-[#6D28D9] disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5B21B6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              <span>
                {submitting
                  ? editingTask
                    ? 'Saving changes...'
                    : 'Adding task...'
                  : editingTask
                    ? 'Save Changes'
                    : 'Add Task'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
