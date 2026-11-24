import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AlertCircle, Loader2, Menu, Plus, RefreshCw } from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { BrandMark } from './components/BrandMark';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SetupGuide } from './components/SetupGuide';
import { Sidebar } from './components/Sidebar';
import { StatsStrip } from './components/StatsStrip';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { ToastContainer } from './components/ToastContainer';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { getFriendlyErrorMessage } from './lib/validation';
import {
  createTask,
  deleteTask,
  fetchTasks,
  toggleTaskCompletion,
  updateTask,
} from './services/taskService';
import type {
  SidebarSection,
  TaskFormValues,
  TaskPriorityFilter,
  TaskRecord,
  TaskStatusFilter,
  ToastMessage,
} from './types/task';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [signingOut, setSigningOut] = useState(false);

  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<SidebarSection>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] =
    useState<TaskPriorityFilter>('all');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [savingTask, setSavingTask] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TaskRecord | null>(null);
  const [deletingTask, setDeletingTask] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: ToastMessage['type'], title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          pushToast('error', 'Session error', getFriendlyErrorMessage(error));
        }
        setSession(data.session ?? null);
        setAuthLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        pushToast('error', 'Session error', getFriendlyErrorMessage(err));
        setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) {
        setTasks([]);
        setTasksError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pushToast]);

  const loadTasks = useCallback(async () => {
    if (!session?.user?.id) return;
    setTasksLoading(true);
    setTasksError(null);
    try {
      const rows = await fetchTasks(session.user.id);
      setTasks(rows);
    } catch (err) {
      const friendly = getFriendlyErrorMessage(err);
      setTasksError(friendly);
      pushToast('error', 'Could not load tasks', friendly);
    } finally {
      setTasksLoading(false);
    }
  }, [session?.user?.id, pushToast]);

  useEffect(() => {
    if (session?.user?.id) {
      void loadTasks();
    }
  }, [session?.user?.id, loadTasks]);

  const counts = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let high = 0;
    for (const task of tasks) {
      if (task.is_completed) {
        completed += 1;
      } else {
        pending += 1;
      }
      if (task.priority === 'high' && !task.is_completed) {
        high += 1;
      }
    }
    return {
      all: tasks.length,
      pending,
      completed,
      high,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (statusFilter === 'pending' && task.is_completed) return false;
      if (statusFilter === 'completed' && !task.is_completed) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      if (query && !task.title.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all';

  const handleSelectSection = (section: SidebarSection) => {
    setActiveSection(section);
    if (section === 'all') {
      setStatusFilter('all');
      setPriorityFilter('all');
    } else if (section === 'pending') {
      setStatusFilter('pending');
      setPriorityFilter('all');
    } else if (section === 'completed') {
      setStatusFilter('completed');
      setPriorityFilter('all');
    } else if (section === 'high') {
      setStatusFilter('pending');
      setPriorityFilter('high');
    }
  };

  const handleStatusChange = (status: TaskStatusFilter) => {
    setStatusFilter(status);
    if (activeSection === 'setup') return;
    if (status === 'all' && priorityFilter === 'all') {
      setActiveSection('all');
    } else if (status === 'pending' && priorityFilter === 'all') {
      setActiveSection('pending');
    } else if (status === 'completed' && priorityFilter === 'all') {
      setActiveSection('completed');
    } else if (status === 'pending' && priorityFilter === 'high') {
      setActiveSection('high');
    } else {
      setActiveSection('all');
    }
  };

  const handlePriorityChange = (priority: TaskPriorityFilter) => {
    setPriorityFilter(priority);
    if (activeSection === 'setup') return;
    if (priority === 'high' && statusFilter === 'pending') {
      setActiveSection('high');
    } else if (priority === 'all' && statusFilter === 'pending') {
      setActiveSection('pending');
    } else if (priority === 'all' && statusFilter === 'completed') {
      setActiveSection('completed');
    } else {
      setActiveSection('all');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    if (activeSection !== 'setup') {
      setActiveSection('all');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const openEditModal = (task: TaskRecord) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (values: TaskFormValues) => {
    if (!session?.user?.id) return;
    setSavingTask(true);
    try {
      if (editingTask) {
        const updated = await updateTask(session.user.id, editingTask.id, values);
        setTasks((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        pushToast('success', 'Task updated', `"${updated.title}" has been saved.`);
      } else {
        const created = await createTask(session.user.id, values);
        setTasks((prev) => [created, ...prev]);
        pushToast('success', 'Task created', `"${created.title}" added to your list.`);
      }
      setTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      pushToast(
        'error',
        editingTask ? 'Failed to update task' : 'Failed to create task',
        getFriendlyErrorMessage(err)
      );
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleComplete = async (task: TaskRecord) => {
    if (!session?.user?.id || togglingIds[task.id]) return;

    const nextState = !task.is_completed;
    setTogglingIds((prev) => ({ ...prev, [task.id]: true }));
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, is_completed: nextState } : item
      )
    );

    try {
      const updated = await toggleTaskCompletion(
        session.user.id,
        task.id,
        nextState
      );
      setTasks((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      pushToast(
        'success',
        nextState ? 'Task completed' : 'Task reopened',
        `"${updated.title}" marked as ${nextState ? 'completed' : 'pending'}.`
      );
    } catch (err) {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id ? { ...item, is_completed: task.is_completed } : item
        )
      );
      pushToast(
        'error',
        'Could not update status',
        getFriendlyErrorMessage(err)
      );
    } finally {
      setTogglingIds((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!session?.user?.id || !deleteTarget) return;
    setDeletingTask(true);
    try {
      await deleteTask(session.user.id, deleteTarget.id);
      setTasks((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      pushToast('success', 'Task deleted', `"${deleteTarget.title}" was removed.`);
      setDeleteTarget(null);
    } catch (err) {
      pushToast(
        'error',
        'Could not delete task',
        getFriendlyErrorMessage(err)
      );
    } finally {
      setDeletingTask(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      pushToast('info', 'Signed out', 'You have been signed out of DoList.');
    } catch (err) {
      pushToast('error', 'Sign-out failed', getFriendlyErrorMessage(err));
    } finally {
      setSigningOut(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9FD] flex flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" aria-hidden="true" />
        <p className="text-sm font-medium text-[#5B5670]">Loading DoList workspace...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <AuthPage
          onSuccessToast={(title, description) =>
            pushToast('success', title, description)
          }
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const sectionHeading =
    activeSection === 'setup'
      ? 'Database & SQL Setup'
      : activeSection === 'pending'
        ? 'Pending Tasks'
        : activeSection === 'completed'
          ? 'Completed Tasks'
          : activeSection === 'high'
            ? 'High Priority Tasks'
            : 'All Tasks';

  return (
    <div className="min-h-screen bg-[#FAF9FD] flex flex-col lg:flex-row">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onNewTask={openCreateModal}
        userEmail={session.user.email ?? 'Authenticated user'}
        onSignOut={handleSignOut}
        signingOut={signingOut}
        counts={counts}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header bar (<= 64px height) */}
        <header className="lg:hidden sticky top-0 z-30 h-16 border-b border-[#E8E5F0] bg-white px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg p-2 -ml-2 text-[#181424] hover:bg-[#F5F3FF] focus-visible:outline-2 focus-visible:outline-[#6D28D9]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <BrandMark size="sm" />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6D28D9] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#5B21B6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Task</span>
          </button>
        </header>

        {/* Desktop top context header */}
        <header className="hidden lg:flex h-16 border-b border-[#E8E5F0] bg-white px-8 items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-[#5B5670]">
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#181424]">{sectionHeading}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeSection !== 'setup' && (
              <button
                type="button"
                onClick={() => void loadTasks()}
                disabled={tasksLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#5B5670] hover:bg-[#FAF9FD] hover:text-[#181424] focus-visible:outline-2 focus-visible:outline-[#6D28D9] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${tasksLoading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>Refresh</span>
              </button>
            )}
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5B21B6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Task</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-[#181424]">
                {sectionHeading}
              </h1>
              <p className="mt-1 text-sm text-[#5B5670]">
                {activeSection === 'setup'
                  ? 'Schema definition and Row Level Security policies for your Supabase project.'
                  : 'Track priorities, deadlines, and completion across your personal task list.'}
              </p>
            </div>
            {activeSection !== 'setup' && (
              <p className="text-xs font-mono-tabular text-[#78718E] whitespace-nowrap">
                Showing {filteredTasks.length} of {tasks.length}{' '}
                {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            )}
          </div>

          {activeSection === 'setup' ? (
            <SetupGuide />
          ) : (
            <>
              <StatsStrip
                total={counts.all}
                pending={counts.pending}
                completed={counts.completed}
                loading={tasksLoading}
              />

              {tasksError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="h-5 w-5 text-red-600 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#181424]">
                        Unable to sync tasks with Supabase
                      </p>
                      <p className="mt-0.5 text-sm text-[#5B5670]">{tasksError}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectSection('setup')}
                      className="rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#181424] hover:bg-[#F5F3FF] whitespace-nowrap"
                    >
                      View SQL Setup
                    </button>
                    <button
                      type="button"
                      onClick={() => void loadTasks()}
                      className="rounded-lg bg-[#6D28D9] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#5B21B6] whitespace-nowrap"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              <TaskFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                priorityFilter={priorityFilter}
                onPriorityChange={handlePriorityChange}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
              />

              <TaskList
                tasks={filteredTasks}
                totalTaskCount={tasks.length}
                loading={tasksLoading}
                togglingIds={togglingIds}
                onToggleComplete={(task) => void handleToggleComplete(task)}
                onEditTask={openEditModal}
                onDeleteRequest={setDeleteTarget}
                onCreateTask={openCreateModal}
                onResetFilters={handleResetFilters}
              />
            </>
          )}
        </main>
      </div>

      <TaskModal
        isOpen={taskModalOpen}
        editingTask={editingTask}
        submitting={savingTask}
        onClose={() => {
          if (!savingTask) {
            setTaskModalOpen(false);
            setEditingTask(null);
          }
        }}
        onSubmit={handleSaveTask}
      />

      <DeleteConfirmModal
        task={deleteTarget}
        deleting={deletingTask}
        onCancel={() => {
          if (!deletingTask) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
