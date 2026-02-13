-- ClawProxy Database Schema
-- Run in Supabase SQL Editor

-- ─── Plan enum ──────────────────────────────────────────────────────
create type public.plan as enum ('starter', 'pro', 'team');

-- ─── Users table ────────────────────────────────────────────────────
create table public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text,
  plan public.plan not null default 'starter',
  role text,
  agent_count int not null default 0,
  onboarding_completed boolean not null default false,
  whop_membership_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── API keys table ─────────────────────────────────────────────────
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  key_hash text not null,
  key_prefix text not null,
  label text not null default 'Default Agent',
  scope text not null default 'full',
  is_active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_api_keys_key_hash on public.api_keys (key_hash);
create index idx_api_keys_user_id on public.api_keys (user_id);

-- ─── Trigger: auto-create public.users row on signup ────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Trigger: auto-update updated_at ────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger on_api_keys_updated
  before update on public.api_keys
  for each row execute procedure public.handle_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.api_keys enable row level security;

-- Users: read own row
create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

-- Users: update own row
create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

-- API keys: full CRUD on own keys
create policy "Users can read own keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

create policy "Users can insert own keys"
  on public.api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can update own keys"
  on public.api_keys for update
  using (auth.uid() = user_id);

create policy "Users can delete own keys"
  on public.api_keys for delete
  using (auth.uid() = user_id);
