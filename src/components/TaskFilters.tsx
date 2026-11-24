import React from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import type { TaskPriorityFilter, TaskStatusFilter } from '../types/task';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatusFilter;
  onStatusChange: (status: TaskStatusFilter) => void;
  priorityFilter: TaskPriorityFilter;
  onPriorityChange: (priority: TaskPriorityFilter) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

const STATUS_OPTIONS: Array<{ value: TaskStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search by title */}
      <div className="relative flex-1 max-w-md">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78718E]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title..."
          aria-label="Search tasks by title"
          className="w-full rounded-lg border border-[#E8E5F0] bg-white pl-10 pr-9 py-2.5 text-sm text-[#181424] placeholder:text-[#8E88A3] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#78718E] hover:bg-[#F5F3FF] hover:text-[#181424]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Status segmented control + Priority filter */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className="inline-flex items-center rounded-lg border border-[#E8E5F0] bg-[#FAF9FD] p-1"
          role="group"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => {
            const active = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(option.value)}
                aria-pressed={active}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#4C1D95] shadow-xs'
                    : 'text-[#5B5670] hover:text-[#181424]'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as TaskPriorityFilter)}
          aria-label="Filter by priority"
          className="rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#181424] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 whitespace-nowrap"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E5F0] bg-white px-3 py-2 text-xs font-semibold text-[#5B5670] hover:bg-[#F5F3FF] hover:text-[#4C1D95] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
