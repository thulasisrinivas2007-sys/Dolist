import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Database,
  Flame,
  LayoutList,
  Loader2,
  LogOut,
  Plus,
  X,
} from 'lucide-react';
import type { SidebarSection } from '../types/task';
import { BrandMark } from './BrandMark';

interface SidebarProps {
  activeSection: SidebarSection;
  onSelectSection: (section: SidebarSection) => void;
  onNewTask: () => void;
  userEmail: string;
  onSignOut: () => void;
  signingOut: boolean;
  counts: {
    all: number;
    pending: number;
    completed: number;
    high: number;
  };
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onNewTask,
  userEmail,
  onSignOut,
  signingOut,
  counts,
  mobileOpen,
  onCloseMobile,
}) => {
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const navItems: Array<{
    id: SidebarSection;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> = [
    {
      id: 'all',
      label: 'All Tasks',
      icon: <LayoutList className="h-4 w-4" aria-hidden="true" />,
      count: counts.all,
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: <Clock className="h-4 w-4" aria-hidden="true" />,
      count: counts.pending,
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
      count: counts.completed,
    },
    {
      id: 'high',
      label: 'High Priority',
      icon: <Flame className="h-4 w-4" aria-hidden="true" />,
      count: counts.high,
    },
    {
      id: 'setup',
      label: 'Database & SQL',
      icon: <Database className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  const handleSelect = (section: SidebarSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-[#E8E5F0]">
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#EFEFF5] shrink-0">
        <BrandMark size="sm" />
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden rounded-lg p-2 text-[#5B5670] hover:bg-[#F5F3FF] hover:text-[#181424] focus-visible:outline-2 focus-visible:outline-[#6D28D9]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={() => {
            onNewTask();
            onCloseMobile();
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5B21B6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>New Task</span>
        </button>
      </div>

      <nav aria-label="Workspace views" className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#F5F3FF] text-[#4C1D95] font-semibold'
                  : 'text-[#5B5670] hover:bg-[#FAF9FD] hover:text-[#181424]'
              }`}
            >
              <span className="inline-flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-[#6D28D9]' : 'text-[#78718E]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`font-mono-tabular text-xs ${
                    isActive ? 'text-[#6D28D9] font-semibold' : 'text-[#78718E]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#EFEFF5] p-4 space-y-3 shrink-0">
        <div className="min-w-0">
          <p className="text-xs text-[#78718E]">Signed in as</p>
          <p className="text-sm font-medium text-[#181424] truncate" title={userEmail}>
            {userEmail}
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#181424] hover:bg-[#FAF9FD] hover:border-[#D6CCFA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] disabled:opacity-60 transition-colors whitespace-nowrap"
        >
          {signingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="h-3.5 w-3.5 text-[#5B5670]" aria-hidden="true" />
          )}
          <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-[#181424]/30 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
