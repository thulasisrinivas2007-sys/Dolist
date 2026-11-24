export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatusFilter = 'all' | 'pending' | 'completed';

export type TaskPriorityFilter = 'all' | TaskPriority;

export type SidebarSection = 'all' | 'pending' | 'completed' | 'high' | 'setup';

export interface TaskRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
