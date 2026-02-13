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
  whop_user_id text,
  whop_membership_id text,
  cancel_reason text,
  payment_failed boolean not null default false,
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

-- ─── Routing rules table ──────────────────────────────────────────────
create table public.routing_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  name text not null,
  rule_type text not null default 'model_override',
  conditions jsonb not null default '{}',
  action_value text not null,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_routing_rules_user_id on public.routing_rules (user_id);

-- ─── Team invitations table ────────────────────────────────────
create type public.invitation_status as enum ('pending', 'accepted', 'declined', 'expired');

create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.users on delete cascade,
  email text not null,
  role text not null default 'member',
  token text not null unique,
  personal_message text,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_team_invitations_token on public.team_invitations (token);
create index idx_team_invitations_email on public.team_invitations (email);
create index idx_team_invitations_inviter_id on public.team_invitations (inviter_id);

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

create trigger on_routing_rules_updated
  before update on public.routing_rules
  for each row execute procedure public.handle_updated_at();

create trigger on_team_invitations_updated
  before update on public.team_invitations
  for each row execute procedure public.handle_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.api_keys enable row level security;

-- Users: read own row
create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

-- Users: insert own row (for auto-create fallback)
create policy "Users can insert own row"
  on public.users for insert
  with check (auth.uid() = id);

-- Users: update own row
create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

-- Routing rules: enable RLS
alter table public.routing_rules enable row level security;

-- Routing rules: full CRUD on own rules
create policy "Users can read own rules"
  on public.routing_rules for select
  using (auth.uid() = user_id);

create policy "Users can insert own rules"
  on public.routing_rules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rules"
  on public.routing_rules for update
  using (auth.uid() = user_id);

create policy "Users can delete own rules"
  on public.routing_rules for delete
  using (auth.uid() = user_id);

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

-- ─── Team invitations RLS ─────────────────────────────────────
alter table public.team_invitations enable row level security;

create policy "Users can read own invitations"
  on public.team_invitations for select
  using (auth.uid() = inviter_id);

create policy "Users can insert own invitations"
  on public.team_invitations for insert
  with check (auth.uid() = inviter_id);
