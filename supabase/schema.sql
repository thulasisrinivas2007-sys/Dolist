-- DoList Supabase Database Schema & Row Level Security (RLS)
-- Run this script in your Supabase Project -> SQL Editor.

-- 1. Create the tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 120),
  description text not null default '' check (char_length(description) <= 1000),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Helpful indexes for per-user queries and sorting
create index if not exists tasks_user_id_created_at_idx
  on public.tasks (user_id, created_at desc);

create index if not exists tasks_user_id_is_completed_idx
  on public.tasks (user_id, is_completed);

-- 3. Enable Row Level Security (RLS)
alter table public.tasks enable row level security;

-- 4. Drop existing policies if re-running this script cleanly
drop policy if exists "Users can view their own tasks" on public.tasks;
drop policy if exists "Users can insert their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can delete their own tasks" on public.tasks;

-- 5. Strict per-user RLS policies
create policy "Users can view their own tasks"
  on public.tasks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks
  for delete
  to authenticated
  using (auth.uid() = user_id);
