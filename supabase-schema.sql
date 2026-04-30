create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text default 'parent',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create table if not exists public.children (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  birthdate date,
  created_at timestamptz not null default now()
);

alter table public.children enable row level security;

drop policy if exists "Users can manage their own children" on public.children;

create policy "Users can manage their own children"
on public.children
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.game_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  child_id uuid references public.children(id) on delete cascade,
  level_id integer not null,
  stage_id integer not null,
  stars integer not null default 0,
  points integer not null default 0,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_progress_unique_stage unique (user_id, child_id, level_id, stage_id)
);

alter table public.game_progress enable row level security;

drop policy if exists "Users can manage their own progress" on public.game_progress;

create policy "Users can manage their own progress"
on public.game_progress
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
