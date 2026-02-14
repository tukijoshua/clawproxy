# ClawProxy

**Your AI agents are burning money. ClawProxy fixes that.**

> **[clawproxy.ai](https://clawproxy.ai)** | **[@TukiFromKL](https://x.com/TukiFromKL)**

ClawProxy is an intelligent proxy that sits between your AI agents and LLM providers. It automatically classifies request complexity and routes simple tasks to cheaper models while keeping premium models for complex work. The result: **60-70% cost savings** with zero quality loss.

Average user goes from **$312/mo to $84/mo** on LLM spend.

[![Twitter Follow](https://img.shields.io/twitter/follow/TukiFromKL?style=social)](https://x.com/TukiFromKL)

---

## How It Works

```
Your Agent  -->  ClawProxy Proxy  -->  Smart Router  -->  Best Model for the Job
                     |                      |
              Budget Check           Complexity Check
              Loop Detection         Routing Rules
```

1. **Get your API key** (30 seconds) - Sign up at [clawproxy.ai](https://clawproxy.ai) and generate an API key
2. **Point your agent to ClawProxy** (60 seconds) - Swap your base URL to `https://www.clawproxy.ai/api/proxy/v1`
3. **Watch your bill drop** - ClawProxy handles the rest automatically

---

## Connect Your Agent

There are two ways to configure your agent to route through ClawProxy.

### Option 1: Automatic Setup (Recommended)

Run a single command in your terminal:

```bash
curl -fsSL https://www.clawproxy.ai/setup | bash
```

The script will:
1. Ask for your ClawProxy API key (starts with `cp_sk_`)
2. Auto-detect your OpenClaw config file (`~/.openclaw/openclaw.json`)
3. Create a backup of your current config
4. Patch the config to route through ClawProxy
5. Verify the changes

After the script completes, restart your agent:

```bash
openclaw restart
```

### Option 2: Manual Setup

Open your OpenClaw config file:

```bash
~/.openclaw/openclaw.json
# or
~/.config/openclaw/openclaw.json
```

Add or merge the following into your config:

```json
{
  "models": {
    "providers": {
      "anthropic": {
        "baseUrl": "https://www.clawproxy.ai/api/proxy/v1",
        "headers": {
          "x-clawproxy-key": "cp_sk_your_api_key_here"
        },
        "models": [
          { "id": "claude-opus-4-0-20250514", "name": "Claude Opus 4", "contextWindow": 200000, "maxTokens": 32000 },
          { "id": "claude-opus-4-6", "name": "Claude Opus 4.6", "contextWindow": 200000, "maxTokens": 32000 },
          { "id": "claude-sonnet-4-5-20250929", "name": "Claude Sonnet 4.5", "contextWindow": 200000, "maxTokens": 16000 },
          { "id": "claude-sonnet-4-0-20250514", "name": "Claude Sonnet 4", "contextWindow": 200000, "maxTokens": 16000 },
          { "id": "claude-haiku-4-5-20251001", "name": "Claude Haiku 4.5", "contextWindow": 200000, "maxTokens": 8192 }
        ]
      }
    }
  }
}
```

Save the file and restart your agent:

```bash
openclaw gateway restart
```

### What Changed

The only thing that changes is the `baseUrl`. Instead of sending requests directly to Anthropic:

```
// Before (direct to Anthropic)
"baseUrl": "https://api.anthropic.com"

// After (routed through ClawProxy)
"baseUrl": "https://www.clawproxy.ai/api/proxy/v1"
```

Your agent doesn't notice any difference. Requests and responses look identical. ClawProxy just routes them smarter.

### Verify Connection

After configuring, go to your [ClawProxy dashboard](https://clawproxy.ai/dashboard) and check that your agent shows as **Connected**. You can also trigger a test request from the onboarding flow to verify everything is working.

### Supported Headers

ClawProxy accepts your API key via any of these headers:

| Header | Example |
|--------|---------|
| `x-clawproxy-key` | `cp_sk_your_key` (recommended) |
| `Authorization` | `Bearer cp_sk_your_key` |
| `x-api-key` | `cp_sk_your_key` |

---

## Features

### Smart Model Routing
Automatically classifies every request by complexity. Simple tasks (file reads, formatting, basic Q&A) get routed to cheaper models like Gemini Flash Lite at **$0.075/M tokens**. Complex tasks (architecture decisions, multi-file refactors) stay on Claude Opus 4.6 at $15/M tokens. Your agents don't notice the difference.

### Runaway Loop Detection
Hashes the last 3 messages of every request. If the same request appears more than 10 times in 60 seconds, ClawProxy kills it automatically. Prevents those $50-200+ overnight bills from stuck agent loops. You get an email alert when a loop is killed.

### Hard Budget Enforcement
Set daily and monthly spending limits. When you hit the cap, requests are rejected with a clear error. Get email alerts at 75% and 90% thresholds so you can adjust before hitting the limit.

### Full Cost Analytics
Real-time dashboard showing actual spend vs. what you would have paid without ClawProxy. Per-agent cost tracking, model distribution charts, request-level logs, and CSV export. See exactly where every dollar goes.

### Custom Routing Rules
Override the default router with your own rules. Pin specific tasks to specific models, route by source model, set priorities. Up to 5 rules on Pro, unlimited on Team.

### Team Management
Invite up to 25 team members with role-based access. Track per-member costs. Shared analytics and budget controls across your team.

### API Key Management
Generate multiple API keys with custom labels per agent. Track connection status (Connected, Idle, Disconnected), last-used timestamps, and per-key spend.

---

## Supported Models & Pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Google Gemini 2.0 Flash Lite | $0.075 | $0.30 |
| Google Gemini 2.0 Flash | $0.10 | $0.40 |
| OpenAI GPT-4o Mini | $0.15 | $0.60 |
| DeepSeek V3 | $0.27 | $1.10 |
| Meta Llama 3.3 70B | $0.39 | $0.39 |
| Anthropic Claude Haiku 3.5 / 4.5 | $0.80 | $4.00 |
| OpenAI GPT-4o | $2.50 | $10.00 |
| Anthropic Claude Sonnet 4 / 4.5 | $3.00 | $15.00 |
| Anthropic Claude Opus 4 / 4.6 | $15.00 | $75.00 |

All models routed via OpenRouter for maximum reliability.

---

## Plans

| Feature | Starter (Free) | Pro ($29/mo) | Team ($79/mo) |
|---------|:--------------:|:------------:|:-------------:|
| Agents | 1 | 3 | Unlimited |
| Requests | 10,000/mo | Unlimited | Unlimited |
| History | 7 days | 90 days | 90 days |
| Loop Detection | - | Yes | Yes |
| Budget Limits | - | Yes | Yes |
| CSV Export | - | Yes | Yes |
| Routing Rules | - | 5 | Unlimited |
| Team Members | 1 | 1 | 25 |

---

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom design system
- **Framer Motion** - Animations and page transitions
- **Lucide React** - Icon library
- **Zustand** - Lightweight state management
- **React Dropzone** - File upload handling

### Backend
- **Next.js API Routes** - 25+ serverless API endpoints
- **Supabase** - PostgreSQL database with Row Level Security
- **Supabase Auth** - Email/password authentication with JWT sessions
- **OpenRouter** - Unified LLM provider API (routes to Anthropic, OpenAI, Google, Meta, DeepSeek)
- **Whop** - Subscription billing and membership management
- **Resend** - Transactional email service (7 email templates)
- **Vercel Functions** - Serverless compute with streaming support
- **Vercel Cron** - Scheduled jobs (weekly summary emails)

### Database (Supabase PostgreSQL)
- **5 tables**: `users`, `api_keys`, `routing_rules`, `request_logs`, `team_invitations`
- **Row Level Security** on all tables
- **Auto-triggers** for user creation on signup and `updated_at` timestamps
- **Indexed** on `key_hash`, `user_id`, `created_at` for fast lookups

### Design System
- **Fonts**: PP Mondwest (display), Aeonik Pro (body), Inter (UI), JetBrains Mono (code)
- **Colors**: Brand green (#17803D), warm beige background (#F0EFED), gray palette
- **Responsive**: Mobile-first with Tailwind breakpoints

---

## Architecture

### Proxy Request Flow

```
1. Agent sends request to /api/proxy/v1/messages
2. Extract API key from x-clawproxy-key / Authorization / x-api-key header
3. Validate key (SHA256 hash lookup in api_keys table)
4. Fetch user plan & budget settings
5. Budget check → reject if daily/monthly limit exceeded
6. Loop detection → hash last 3 messages, reject if >10 identical in 60s
7. Apply routing rules → user-defined model overrides by priority
8. Forward request to OpenRouter with resolved model
9. Stream response back to agent (SSE support)
10. Log request metrics (tokens, cost, latency, status)
11. Calculate savings (actual cost vs. estimated direct cost)
```

### Core Modules (`lib/proxy/`)

| Module | Purpose |
|--------|---------|
| `auth.ts` | API key validation, SHA256 hash lookup, plan fetching |
| `budget-guard.ts` | Daily/monthly spend checks, limit enforcement |
| `loop-detector.ts` | Request hashing, 60s window counting, loop killing |
| `router.ts` | Routing rule matching by priority, model override resolution |
| `cost.ts` | Token-based cost calculation, savings estimation |
| `models.ts` | Model ID normalization, pricing lookup, provider mapping |

---

## API Endpoints

### Proxy
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/proxy/v1/[...path]` | Main proxy endpoint (routing, budget, streaming) |
| GET | `/api/proxy/v1/[...path]` | Model list passthrough |
| POST | `/api/proxy/test` | Test proxy connection |

### API Keys
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/keys/generate` | Generate new API key |
| GET | `/api/keys` | List all keys |
| PUT | `/api/keys/[id]` | Update key label |
| DELETE | `/api/keys/[id]` | Revoke key |

### Analytics
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/overview` | Dashboard stats & charts |
| GET | `/api/analytics/agents` | Per-agent breakdown |
| GET | `/api/analytics/requests` | Request-level logs |

### Routing Rules
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/rules` | List rules |
| POST | `/api/rules` | Create rule |
| PUT | `/api/rules/[id]` | Update rule |
| DELETE | `/api/rules/[id]` | Delete rule |

### Billing (Whop)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/billing/webhook` | Whop webhook handler |
| GET | `/api/billing/status` | Subscription status |
| GET | `/api/billing/invoices` | Invoice history |
| POST | `/api/billing/cancel` | Cancel subscription |
| POST | `/api/billing/resume` | Resume subscription |

### Auth & Onboarding
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/auth/user` | Current user profile |
| POST | `/api/auth/welcome` | Send welcome email |
| POST | `/api/onboarding/complete` | Complete onboarding |
| POST | `/api/onboarding/test-connection` | Verify agent connection |

### Team
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/teams/invite` | Send team invite |
| POST | `/api/teams/invite/[token]` | Accept invite |

---

## Pages

### Public
- `/` - Landing page (hero, problem/solution, setup steps, features, pricing, FAQ)
- `/docs` - API documentation

### Auth
- `/auth/signup` - Create account
- `/auth/login` - Sign in
- `/auth/confirm-email` - Email verification
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - New password form
- `/auth/callback` - OAuth/email confirmation handler

### Onboarding (4-step flow)
- `/onboarding` - Role selection (technical / non-technical) & agent count
- `/onboarding/how-it-works` - How ClawProxy works walkthrough
- `/onboarding/setup` - Auto or manual setup instructions
- `/onboarding/api-key` - API key generation

### Dashboard
- `/dashboard` - Overview (stats, cost chart, model distribution, agent performance)
- `/dashboard/agents` - Agent management & key generation
- `/dashboard/analytics` - Request logs, filters, CSV export (Pro+)
- `/dashboard/live-feed` - Real-time request stream
- `/dashboard/pricing` - Plan comparison & upgrade
- `/dashboard/settings` - Account settings
- `/dashboard/settings/keys` - API key management
- `/dashboard/settings/rules` - Routing rules editor (Pro+)
- `/dashboard/settings/billing` - Subscription management
- `/dashboard/settings/team` - Team invitations & roles (Team plan)

---

## Email Templates

ClawProxy sends 7 automated emails via Resend:

| Email | Trigger |
|-------|---------|
| **Welcome** | User signs up |
| **Team Invite** | Admin invites a team member |
| **Budget Alert** | Spend reaches 75% or 90% of limit |
| **Loop Killed** | Runaway agent loop detected and killed |
| **Payment Failed** | Subscription payment fails (7-day grace) |
| **Subscription Cancelled** | Plan downgraded to Starter |
| **Weekly Summary** | Cron job every Monday (savings, request count, top agent) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenRouter API key
- Whop account (for billing)
- Resend account (for emails)

### Installation

```bash
git clone https://github.com/tukijoshua/clawproxy.git
cd clawproxy
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Fill in your keys:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Whop (Billing)
WHOP_API_KEY=whop_xxxxx
WHOP_WEBHOOK_SECRET=whsec_xxxxx
WHOP_PRO_PLAN_ID=plan_xxxxx
WHOP_TEAM_PLAN_ID=plan_xxxxx

# Resend (Email)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=ClawProxy <notifications@clawproxy.ai>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_SECRET=your_64_char_random_string
```

### Database Setup

Run the schema in your Supabase SQL Editor:

```bash
# The full schema is in supabase/schema.sql
# Creates: users, api_keys, routing_rules, request_logs, team_invitations
# Includes: RLS policies, indexes, triggers
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables
4. Deploy

Vercel automatically handles:
- Serverless API routes
- Cron jobs (`/api/cron/weekly-summary`)
- Edge middleware for auth
- Streaming SSE responses

---

## Project Structure

```
clawproxy/
├── app/
│   ├── (public)/              # Public landing page
│   ├── (dashboard)/           # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── agents/        # Agent management
│   │       ├── analytics/     # Cost analytics
│   │       ├── live-feed/     # Real-time request stream
│   │       ├── pricing/       # Plan comparison
│   │       ├── settings/      # Keys, rules, billing, team
│   │       └── page.tsx       # Dashboard overview
│   ├── api/
│   │   ├── proxy/v1/          # Core proxy endpoint
│   │   ├── keys/              # API key CRUD
│   │   ├── rules/             # Routing rules CRUD
│   │   ├── analytics/         # Analytics endpoints
│   │   ├── billing/           # Whop billing
│   │   ├── teams/             # Team invitations
│   │   ├── auth/              # Auth helpers
│   │   ├── onboarding/        # Onboarding flow
│   │   └── cron/              # Scheduled jobs
│   ├── auth/                  # Auth pages (login, signup, etc.)
│   ├── onboarding/            # 4-step onboarding flow
│   ├── docs/                  # API documentation
│   └── page.tsx               # Landing page
├── components/
│   ├── landing/               # Hero, Solution, FAQ, etc.
│   ├── dashboard/             # Dashboard-specific components
│   └── ui/                    # Reusable UI primitives
├── lib/
│   ├── proxy/                 # Core proxy logic
│   │   ├── auth.ts            # API key validation
│   │   ├── budget-guard.ts    # Spending limit enforcement
│   │   ├── loop-detector.ts   # Runaway loop detection
│   │   ├── router.ts          # Routing rule engine
│   │   ├── cost.ts            # Cost calculation
│   │   └── models.ts          # Model normalization & pricing
│   ├── supabase/              # Supabase client (client + server)
│   ├── constants.ts           # Plans, limits, pricing config
│   ├── email.ts               # Resend email sender
│   └── email-templates.ts     # 7 HTML email templates
├── supabase/
│   └── schema.sql             # Full database schema
├── middleware.ts               # Auth middleware (JWT refresh, route protection)
└── tailwind.config.ts          # Custom design system
```

---

## Built By

**Tuki Joshua** - [@TukiFromKL](https://x.com/TukiFromKL)

- Platform: [clawproxy.ai](https://clawproxy.ai)
- Twitter/X: [x.com/TukiFromKL](https://x.com/TukiFromKL)

Built with [Claude Code](https://claude.ai/claude-code).

---

## License

This project is private and proprietary.
