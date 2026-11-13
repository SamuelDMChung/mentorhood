-- LIVE SCHEMA REFERENCE for Mentorhood Math Portal, first deployed 2026-11-13.
-- Already installed on project itfucxbclbccoaidvqab. DO NOT rerun on existing project.

-- MENTORHOOD MATH — NEW SUPABASE PROJECT ONLY
-- Run once in the NEW Mentorhood project. Do not run in Griff EWP / EWP Material Forecast.
-- The SQL creates a minimal, isolated team project tracker and members-only video catalog.

create table public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null check (role in ('owner','staff','learner')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  description text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  details text not null default '',
  status text not null default 'queued' check (status in ('queued','in_progress','review','done')),
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  assigned_to uuid references public.team_members(user_id) on delete set null,
  due_date date,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text not null default '',
  category text not null default 'General',
  embed_url text not null check (char_length(btrim(embed_url)) between 1 and 2000),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index tasks_project_status_idx on public.tasks(project_id,status);
create index tasks_assigned_to_idx on public.tasks(assigned_to);
create index videos_published_order_idx on public.videos(is_published,sort_order);

create function public.touch_task_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger tasks_touch_updated_at before update on public.tasks
for each row execute function public.touch_task_updated_at();
revoke all on function public.touch_task_updated_at() from public, anon, authenticated;

alter table public.team_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.videos enable row level security;

-- Avoid broad access grants. The authenticated grants still REQUIRE RLS policies.
revoke all on public.team_members,public.projects,public.tasks,public.videos from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.team_members to authenticated;
grant select,insert,delete on public.projects,public.tasks to authenticated;
grant update(name,description) on public.projects to authenticated;
grant update(project_id,title,details,status,priority,assigned_to,due_date) on public.tasks to authenticated;
grant select,insert,delete on public.videos to authenticated;
grant update(title,description,category,embed_url,is_published,sort_order) on public.videos to authenticated;

-- Members may read ONLY their own membership. Client cannot grant roles.
create policy "members_read_self" on public.team_members
for select to authenticated using (user_id = (select auth.uid()) and is_active);

-- Staff (including owner) can collaborate on all internal projects/tasks.
create policy "staff_read_projects" on public.projects for select to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')));
create policy "staff_add_projects" on public.projects for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')));
create policy "staff_update_projects" on public.projects for update to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')))
with check (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')));
create policy "staff_delete_projects" on public.projects for delete to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')));

create policy "staff_read_tasks" on public.tasks for select to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')));
create policy "staff_add_tasks" on public.tasks for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')));
create policy "staff_update_tasks" on public.tasks for update to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')))
with check (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')));
create policy "staff_delete_tasks" on public.tasks for delete to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role in ('owner','staff')));

-- Approved members may see published video catalog entries.
-- IMPORTANT: An embed URL is NOT an access control boundary for paid/private videos.
create policy "members_read_published_videos" on public.videos for select to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and (is_published or m.role = 'owner')));
-- The owner can manage video rows; RLS protects content even with browser publishable key.
create policy "owner_insert_videos" on public.videos for insert to authenticated
with check (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role = 'owner'));
create policy "owner_update_videos" on public.videos for update to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role = 'owner'))
with check (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role = 'owner'));
create policy "owner_delete_videos" on public.videos for delete to authenticated
using (exists (select 1 from public.team_members m where m.user_id = (select auth.uid()) and m.is_active and m.role = 'owner'));

-- Next: invite a user via Authentication > Users, then use that account's exact UUID:
-- insert into public.team_members(user_id,display_name,role)
-- values ('REPLACE-WITH-REAL-AUTH-USER-UUID','Owner name','owner');
