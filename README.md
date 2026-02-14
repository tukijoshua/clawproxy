# ClawProxy - AI Cost Optimization Proxy

An intelligent proxy that routes AI agent requests to the most cost-effective model based on task complexity. Save 60-70% on LLM costs without sacrificing quality.

## Features

- **Smart Request Routing** - Automatically classifies request complexity and routes to cheaper models when appropriate
- **Cost Savings Dashboard** - Real-time analytics showing spend, savings, and routing decisions
- **Multi-step Onboarding** - Guided setup flow for connecting your AI agents
- **Team Management** - Invite team members and manage API keys
- **Runaway Loop Detection** - Automatically kills stuck agent loops to prevent budget blowouts
- **Budget Enforcement** - Set spending limits per agent or team

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** Supabase
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Stripe (setup ready)
- **Email:** Resend (setup ready)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- (Optional) Stripe account for payments
- (Optional) Resend account for emails

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clawproxy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
- Supabase URL and keys (from your Supabase project settings)
- Stripe keys (optional, for payment integration)
- Resend API key (optional, for email integration)

4. Set up the database:
- Go to your Supabase project dashboard
- Navigate to the SQL Editor
- Run the SQL commands from `docs/DATABASE_SCHEMA.md`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
/app
  ├── (public)           # Public routes (landing page)
  ├── (dashboard)        # Protected dashboard routes
  │   └── dashboard/     # Dashboard home, agents, analytics, settings
  ├── api/               # API endpoints (proxy, keys, onboarding)
  ├── auth/              # Authentication pages
  │   ├── login/
  │   ├── signup/
  │   └── callback/
  ├── onboarding/        # Multi-step onboarding flow
  └── docs/              # Documentation page

/components
  ├── landing/           # Landing page components
  ├── dashboard/         # Dashboard components
  └── ui/                # Reusable UI components

/lib
  ├── supabase/          # Supabase client configuration
  ├── proxy/             # Proxy routing logic
  ├── api/               # API helpers
  └── hooks/             # React hooks
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## License

This project is private and proprietary to ClawProxy.

---

**Built with Claude Code.**
