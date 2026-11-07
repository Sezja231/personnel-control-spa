-- Виконати у Supabase SQL Editor власником проєкту.
-- Спільна робоча область: один набір даних для авторизованих користувачів цього проєкту.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','user')),
  created_at timestamptz not null default now()
);
alter table public.user_roles enable row level security;
drop policy if exists "Users can read own role" on public.user_roles;
create policy "Users can read own role" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'); $$;
create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','user')); $$;
revoke all on function public.is_admin() from public;
revoke all on function public.is_member() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_member() to authenticated;

create table if not exists public.personnel_shared_workspace (
  workspace_id uuid primary key,
  data jsonb not null default '{"soldiers":[],"assignments":[]}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.personnel_shared_workspace enable row level security;
drop policy if exists "Users can read own personnel workspace" on public.personnel_shared_workspace;
drop policy if exists "Users can insert own personnel workspace" on public.personnel_shared_workspace;
drop policy if exists "Users can update own personnel workspace" on public.personnel_shared_workspace;
drop policy if exists "Members can read shared workspace" on public.personnel_shared_workspace;
drop policy if exists "Admins can insert shared workspace" on public.personnel_shared_workspace;
drop policy if exists "Admins can update shared workspace" on public.personnel_shared_workspace;
create policy "Members can read shared workspace" on public.personnel_shared_workspace for select to authenticated using (public.is_member());
create policy "Admins can insert shared workspace" on public.personnel_shared_workspace for insert to authenticated with check (public.is_admin());
create policy "Admins can update shared workspace" on public.personnel_shared_workspace for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Після створення користувачів у Supabase Auth призначте ролі від імені власника проєкту.
-- Адміністратор:
-- insert into public.user_roles(user_id, role)
-- select id, 'admin' from auth.users where email = 'admin@example.com'
-- on conflict (user_id) do update set role = 'admin';
-- Звичайний користувач (доступ на читання спільного хмарного знімка):
-- insert into public.user_roles(user_id, role)
-- select id, 'user' from auth.users where email = 'viewer@example.com'
-- on conflict (user_id) do update set role = 'user';
-- Не надавайте service_role ключ браузерному застосунку.
