-- Huddle Up schema for Supabase Postgres
-- Run in Supabase SQL Editor after creating project

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  avatar_color text not null default '#C8FF00',
  created_at timestamptz not null default now()
);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  overall_budget numeric,
  invite_code text not null unique,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists projects_invite_code_idx on public.projects (invite_code);
create index if not exists projects_owner_id_idx on public.projects (owner_id);

-- Project members
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  color text not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists project_members_user_id_idx on public.project_members (user_id);

-- Sections (tabs)
create table if not exists public.tabs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);

create index if not exists tabs_project_id_idx on public.tabs (project_id);

-- Items
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tab_id uuid not null references public.tabs(id) on delete restrict,
  name text not null,
  done boolean not null default false,
  cost numeric,
  budget numeric,
  url text,
  image_url text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists items_project_id_idx on public.items (project_id);

-- Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote smallint not null check (vote in (1, -1)),
  unique (item_id, user_id)
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Guest'),
    coalesce(new.raw_user_meta_data->>'avatar_color', '#C8FF00')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tabs enable row level security;
alter table public.items enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

-- Profiles: users manage own profile
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Helper: is project member
create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- Projects
create policy "projects_select_member" on public.projects
  for select using (public.is_project_member(id));
create policy "projects_insert_auth" on public.projects
  for insert with check (auth.uid() = owner_id);
create policy "projects_update_member" on public.projects
  for update using (public.is_project_member(id));
create policy "projects_delete_owner" on public.projects
  for delete using (owner_id = auth.uid());

-- Project members
create policy "members_select" on public.project_members
  for select using (public.is_project_member(project_id));
create policy "members_insert" on public.project_members
  for insert with check (auth.uid() = user_id or public.is_project_member(project_id));
create policy "members_delete_own" on public.project_members
  for delete using (user_id = auth.uid());

-- Tabs
create policy "tabs_select" on public.tabs
  for select using (public.is_project_member(project_id));
create policy "tabs_insert" on public.tabs
  for insert with check (public.is_project_member(project_id));
create policy "tabs_update" on public.tabs
  for update using (public.is_project_member(project_id));
create policy "tabs_delete" on public.tabs
  for delete using (public.is_project_member(project_id));

-- Items
create policy "items_select" on public.items
  for select using (public.is_project_member(project_id));
create policy "items_insert" on public.items
  for insert with check (public.is_project_member(project_id));
create policy "items_update" on public.items
  for update using (public.is_project_member(project_id));
create policy "items_delete" on public.items
  for delete using (public.is_project_member(project_id));

-- Votes
create policy "votes_select" on public.votes
  for select using (
    exists (select 1 from public.items i where i.id = item_id and public.is_project_member(i.project_id))
  );
create policy "votes_upsert" on public.votes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Comments
create policy "comments_select" on public.comments
  for select using (
    exists (select 1 from public.items i where i.id = item_id and public.is_project_member(i.project_id))
  );
create policy "comments_insert" on public.comments
  for insert with check (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

-- Storage bucket for item photos
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'item-photos');
create policy "photos_auth_upload" on storage.objects
  for insert with check (bucket_id = 'item-photos' and auth.role() = 'authenticated');
create policy "photos_auth_delete" on storage.objects
  for delete using (bucket_id = 'item-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Realtime
alter publication supabase_realtime add table public.items;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.tabs;
alter publication supabase_realtime add table public.projects;
