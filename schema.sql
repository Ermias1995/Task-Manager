-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables
create table workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users not null,
  role text default 'member', -- 'owner' or 'member'
  primary key (workspace_id, user_id)
);

create table projects (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo', -- 'todo', 'in_progress', 'done'
  assignee_id uuid references auth.users,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (CRITICAL)
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;

-- 4. RLS Policies (The "Membership Check" Pattern)

-- Workspaces: Can see only if you are a member
create policy "Workspace read access" on workspaces
  for select using (exists (select 1 from workspace_members where workspace_id = workspaces.id and user_id = auth.uid()));

-- Workspace Members: Can manage own membership
create policy "Members read own" on workspace_members for select using (auth.uid() = user_id);

-- Projects: Can see if project is in your workspace
create policy "Project read access" on projects
  for select using (exists (select 1 from workspace_members where workspace_id = projects.workspace_id and user_id = auth.uid()));

-- Tasks: Can see if task is in a project in your workspace
create policy "Task read access" on tasks
  for select using (
    exists (
      select 1 from projects 
      join workspace_members on projects.workspace_id = workspace_members.workspace_id
      where projects.id = tasks.project_id and workspace_members.user_id = auth.uid()
    )
  );
