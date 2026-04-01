create table if not exists public.game_saves (
  save_id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  player_name text not null,
  player_data jsonb not null,
  save_permission text not null default 'owner_write',
  updated_at timestamptz not null default now()
);

alter table public.game_saves
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table public.game_saves
  add column if not exists save_permission text not null default 'owner_write';

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'user',
  save_permission text not null default 'owner_write',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_game_saves_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_user_profiles_updated_at();

drop trigger if exists trg_game_saves_updated_at on public.game_saves;
create trigger trg_game_saves_updated_at
before update on public.game_saves
for each row
execute function public.set_game_saves_updated_at();

create index if not exists idx_game_saves_owner_id on public.game_saves(owner_id);
create index if not exists idx_user_profiles_role on public.user_profiles(role);
