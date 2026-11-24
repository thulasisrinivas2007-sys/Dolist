import { supabase } from '../lib/supabase';
import type { TaskFormValues, TaskRecord } from '../types/task';

function requireClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
    );
  }
  return supabase;
}

export async function fetchTasks(userId: string): Promise<TaskRecord[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('tasks')
    .select('id, user_id, title, description, priority, due_date, is_completed, created_at')
    .eq('user_id', userId)
    .order('is_completed', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as TaskRecord[];
}

export async function createTask(
  userId: string,
  values: TaskFormValues
): Promise<TaskRecord> {
  const client = requireClient();
  const payload = {
    user_id: userId,
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    due_date: values.due_date ? values.due_date : null,
    is_completed: false,
  };

  const { data, error } = await client
    .from('tasks')
    .insert(payload)
    .select('id, user_id, title, description, priority, due_date, is_completed, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data as TaskRecord;
}

export async function updateTask(
  userId: string,
  taskId: string,
  values: TaskFormValues
): Promise<TaskRecord> {
  const client = requireClient();
  const payload = {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    due_date: values.due_date ? values.due_date : null,
  };

  const { data, error } = await client
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('id, user_id, title, description, priority, due_date, is_completed, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data as TaskRecord;
}

export async function toggleTaskCompletion(
  userId: string,
  taskId: string,
  isCompleted: boolean
): Promise<TaskRecord> {
  const client = requireClient();
  const { data, error } = await client
    .from('tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('id, user_id, title, description, priority, due_date, is_completed, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data as TaskRecord;
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}
