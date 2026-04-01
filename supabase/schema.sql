create table if not exists public.game_saves (
  save_id text primary key,
  player_name text not null,
  player_data jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_game_saves_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_game_saves_updated_at on public.game_saves;
create trigger trg_game_saves_updated_at
before update on public.game_saves
for each row
execute function public.set_game_saves_updated_at();
