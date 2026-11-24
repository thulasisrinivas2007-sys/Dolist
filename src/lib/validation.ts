import type { TaskFormValues, TaskPriority } from '../types/task';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return null;
}

export function validatePassword(
  password: string,
  mode: 'login' | 'register'
): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (mode === 'register' && password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null;
}

export function validateTaskForm(values: TaskFormValues): {
  valid: boolean;
  errors: Partial<Record<keyof TaskFormValues, string>>;
} {
  const errors: Partial<Record<keyof TaskFormValues, string>> = {};
  const trimmedTitle = values.title.trim();
  const trimmedDescription = values.description.trim();

  if (!trimmedTitle) {
    errors.title = 'Task title is required.';
  } else if (trimmedTitle.length > 120) {
    errors.title = 'Task title must be 120 characters or fewer.';
  }

  if (trimmedDescription.length > 1000) {
    errors.description = 'Description must be 1000 characters or fewer.';
  }

  if (!VALID_PRIORITIES.includes(values.priority)) {
    errors.priority = 'Select a valid priority level.';
  }

  if (values.due_date) {
    if (!DATE_REGEX.test(values.due_date)) {
      errors.due_date = 'Enter a valid date (YYYY-MM-DD).';
    } else {
      const parsed = new Date(`${values.due_date}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        errors.due_date = 'Enter a valid calendar date.';
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatDueDate(
  dateStr: string | null,
  isCompleted: boolean
): { label: string; isOverdue: boolean; isToday: boolean } | null {
  if (!dateStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;

  const due = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatted = due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (diffDays === 0) {
    return { label: `Due today (${formatted})`, isOverdue: false, isToday: true };
  }
  if (diffDays < 0 && !isCompleted) {
    return { label: `Overdue · ${formatted}`, isOverdue: true, isToday: false };
  }
  return { label: `Due ${formatted}`, isOverdue: false, isToday: false };
}

export function formatCreatedDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getFriendlyErrorMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.';

  const message =
    typeof err === 'object' && 'message' in err && typeof err.message === 'string'
      ? err.message
      : typeof err === 'string'
        ? err
        : 'An unexpected error occurred.';

  const code =
    typeof err === 'object' && 'code' in err && typeof err.code === 'string'
      ? err.code
      : '';

  if (code === '42P01' || message.includes('relation "public.tasks" does not exist')) {
    return 'The "tasks" table was not found in Supabase. Open "Database & SQL" in the sidebar and run the setup SQL in your Supabase SQL Editor.';
  }
  if (code === '42501' || message.toLowerCase().includes('row-level security')) {
    return 'Permission denied by Row Level Security. Make sure you are signed in and the RLS policies from the setup SQL are enabled.';
  }
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }
  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Please confirm your email address via the verification link sent to your inbox before signing in.';
  }
  if (message.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (message.toLowerCase().includes('failed to fetch')) {
    return 'Unable to reach Supabase. Check your internet connection and verify VITE_SUPABASE_URL.';
  }

  return message;
}
