-- Migration: Add request_logs table + budget columns
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xhmrwhbwutlrkqasgegw/sql

-- 1. Budget columns on users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_budget decimal DEFAULT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_budget decimal DEFAULT NULL;

-- 2. Request logs table
CREATE TABLE IF NOT EXISTS public.request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  api_key_id uuid REFERENCES public.api_keys ON DELETE SET NULL,
  model text NOT NULL,
  requested_model text,
  provider text NOT NULL DEFAULT 'openrouter',
  prompt_tokens int NOT NULL DEFAULT 0,
  completion_tokens int NOT NULL DEFAULT 0,
  total_tokens int NOT NULL DEFAULT 0,
  cost decimal NOT NULL DEFAULT 0,
  estimated_direct_cost decimal NOT NULL DEFAULT 0,
  latency_ms int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  cache_hit boolean NOT NULL DEFAULT false,
  agent_label text,
  error_message text,
  request_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_request_logs_user_id ON public.request_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON public.request_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_request_logs_api_key_id ON public.request_logs (api_key_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_user_created ON public.request_logs (user_id, created_at DESC);

-- 4. RLS (service_role only — no user policies)
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;
