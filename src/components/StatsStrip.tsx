import React from 'react';

interface StatsStripProps {
  total: number;
  pending: number;
  completed: number;
  loading: boolean;
}

export const StatsStrip: React.FC<StatsStripProps> = ({
  total,
  pending,
  completed,
  loading,
}) => {
  const completionPct =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const cards = [
    {
      label: 'Total Tasks',
      value: total,
      detail:
        total === 0
          ? 'No tasks recorded yet'
          : `${completionPct}% completion rate`,
      valueClass: 'text-[#181424]',
    },
    {
      label: 'Pending',
      value: pending,
      detail:
        pending === 0
          ? 'All tasks completed'
          : `${pending} ${pending === 1 ? 'task' : 'tasks'} remaining`,
      valueClass: 'text-[#6D28D9]',
    },
    {
      label: 'Completed',
      value: completed,
      detail:
        completed === 0
          ? 'None completed yet'
          : `${completed} ${completed === 1 ? 'task' : 'tasks'} finished`,
      valueClass: 'text-emerald-700',
    },
  ];

  return (
    <section
      aria-label="Task summary"
      className="grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-[#E8E5F0] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#EFEFF5]"
    >
      {cards.map((card) => (
        <div key={card.label} className="px-5 py-4">
          <p className="text-xs font-medium text-[#5B5670]">{card.label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-14 rounded bg-[#F5F3FF] animate-pulse" />
          ) : (
            <p
              className={`mt-1 text-2xl sm:text-3xl font-display font-bold font-mono-tabular tracking-tight ${card.valueClass}`}
            >
              {card.value}
            </p>
          )}
          <p className="mt-1 text-xs text-[#78718E]">{card.detail}</p>
        </div>
      ))}
    </section>
  );
};
