import React from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { formatCreatedDate, formatDueDate } from '../lib/validation';
import type { TaskPriority, TaskRecord } from '../types/task';

interface TaskListProps {
  tasks: TaskRecord[];
  totalTaskCount: number;
  loading: boolean;
  togglingIds: Record<string, boolean>;
  onToggleComplete: (task: TaskRecord) => void;
  onEditTask: (task: TaskRecord) => void;
  onDeleteRequest: (task: TaskRecord) => void;
  onCreateTask: () => void;
  onResetFilters: () => void;
}

const PRIORITY_TEXT: Record<
  TaskPriority,
  { label: string; colorClass: string }
> = {
  high: { label: 'High priority', colorClass: 'text-red-700 font-semibold' },
  medium: { label: 'Medium priority', colorClass: 'text-amber-700 font-medium' },
  low: { label: 'Low priority', colorClass: 'text-[#5B5670]' },
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalTaskCount,
  loading,
  togglingIds,
  onToggleComplete,
  onEditTask,
  onDeleteRequest,
  onCreateTask,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div
        className="rounded-xl border border-[#E8E5F0] bg-white divide-y divide-[#EFEFF5]"
        aria-busy="true"
        aria-label="Loading tasks"
      >
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="p-4 sm:p-5 flex items-start gap-4">
            <div className="h-6 w-6 rounded-md bg-[#F5F3FF] shrink-0 animate-pulse mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-[#F5F3FF] animate-pulse" />
              <div className="h-3.5 w-72 max-w-full rounded bg-[#FAF9FD] animate-pulse" />
              <div className="h-3 w-40 rounded bg-[#FAF9FD] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (totalTaskCount === 0) {
    return (
      <div className="rounded-xl border border-[#E8E5F0] bg-white px-6 py-14 text-center">
        <div className="mx-auto mb-4 h-11 w-11 rounded-xl bg-[#F5F3FF] text-[#6D28D9] flex items-center justify-center">
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="text-base font-display font-bold text-[#181424]">
          No tasks yet
        </h3>
        <p className="mt-1.5 text-sm text-[#5B5670] max-w-sm mx-auto">
          Create your first task with a title, priority, and optional due date to start tracking your work.
        </p>
        <button
          type="button"
          onClick={onCreateTask}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5B21B6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add First Task</span>
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-[#E8E5F0] bg-white px-6 py-12 text-center">
        <h3 className="text-base font-display font-bold text-[#181424]">
          No matching tasks
        </h3>
        <p className="mt-1.5 text-sm text-[#5B5670]">
          Adjust your search query or filters to see your other tasks.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#E8E5F0] bg-white px-4 py-2 text-xs font-semibold text-[#181424] hover:bg-[#F5F3FF] hover:border-[#D6CCFA] transition-colors whitespace-nowrap"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E8E5F0] bg-white divide-y divide-[#EFEFF5]">
      {tasks.map((task) => {
        const isToggling = Boolean(togglingIds[task.id]);
        const priorityInfo = PRIORITY_TEXT[task.priority] ?? PRIORITY_TEXT.medium;
        const dueInfo = formatDueDate(task.due_date, task.is_completed);
        const createdText = formatCreatedDate(task.created_at);

        return (
          <article
            key={task.id}
            className="group px-4 py-4 sm:px-5 sm:py-4.5 flex items-start gap-3.5 hover:bg-[#FAF9FD] transition-colors"
          >
            {/* Completion Toggle */}
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              disabled={isToggling}
              aria-label={
                task.is_completed
                  ? `Mark "${task.title}" as pending`
                  : `Mark "${task.title}" as completed`
              }
              aria-pressed={task.is_completed}
              className="mt-0.5 flex h-10 w-10 -ml-2 -mt-1.5 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] shrink-0"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                  task.is_completed
                    ? 'border-[#6D28D9] bg-[#6D28D9] text-white'
                    : 'border-[#C8C2D8] bg-white group-hover:border-[#6D28D9]'
                }`}
              >
                {isToggling ? (
                  <Loader2
                    className={`h-3.5 w-3.5 animate-spin ${
                      task.is_completed ? 'text-white' : 'text-[#6D28D9]'
                    }`}
                    aria-hidden="true"
                  />
                ) : task.is_completed ? (
                  <Check className="h-3.5 w-3.5 stroke-[2.6]" aria-hidden="true" />
                ) : null}
              </span>
            </button>

            {/* Task Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm sm:text-[15px] font-semibold leading-snug break-words ${
                      task.is_completed
                        ? 'line-through text-[#78718E]'
                        : 'text-[#181424]'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p
                      className={`mt-1 text-sm leading-relaxed break-words ${
                        task.is_completed ? 'text-[#8E88A3]' : 'text-[#5B5670]'
                      }`}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Clean unboxed inline metadata (no pill wrappers) */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#78718E]">
                    <span className={`inline-flex items-center gap-1 ${priorityInfo.colorClass}`}>
                      {task.priority === 'high' && (
                        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                      )}
                      <span>{priorityInfo.label}</span>
                    </span>

                    <span aria-hidden="true">·</span>

                    <span
                      className={
                        task.is_completed
                          ? 'text-emerald-700 font-medium'
                          : 'text-[#5B5670]'
                      }
                    >
                      {task.is_completed ? 'Completed' : 'Pending'}
                    </span>

                    {dueInfo && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`inline-flex items-center gap-1 font-mono-tabular ${
                            dueInfo.isOverdue
                              ? 'text-red-700 font-semibold'
                              : dueInfo.isToday
                                ? 'text-[#6D28D9] font-medium'
                                : 'text-[#5B5670]'
                          }`}
                        >
                          <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span>{dueInfo.label}</span>
                        </span>
                      </>
                    )}

                    {createdText && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          Added {createdText}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Row Actions */}
                <div className="flex items-center gap-1 shrink-0 -mr-1.5 sm:mt-0 mt-1">
                  <button
                    type="button"
                    onClick={() => onEditTask(task)}
                    aria-label={`Edit "${task.title}"`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#5B5670] hover:bg-[#F5F3FF] hover:text-[#4C1D95] focus-visible:outline-2 focus-visible:outline-[#6D28D9] transition-colors whitespace-nowrap"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(task)}
                    aria-label={`Delete "${task.title}"`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#5B5670] hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
