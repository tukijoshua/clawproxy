# Kreos.agency - AI-Powered Product Studio Platform

A Next.js application featuring a public landing page and private client dashboard for managing product development projects.

## Features

### Public Landing Page
- Hero section with animated grid background
- Problem/Solution presentation
- Services showcase with pricing
- Multi-step onboarding flow

### Client Dashboard
- Project overview and management
- Kanban board for task tracking
- File upload and management
- Real-time messaging
- Payment tracking

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
cd kreosagency
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
- Stripe keys (optional, for future payment integration)
- Resend API key (optional, for future email integration)

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
  │   └── dashboard/     # Dashboard home and project pages
  ├── auth/              # Authentication pages
  │   ├── login/
  │   ├── signup/
  │   └── callback/
  └── start/             # Onboarding flow

/components
  ├── landing/           # Landing page components
  │   ├── Hero.tsx
  │   ├── Problem.tsx
  │   ├── Solution.tsx
  │   └── Services.tsx
  ├── dashboard/         # Dashboard components (TBD)
  ├── onboarding/        # Onboarding components (TBD)
  └── ui/                # Reusable UI components
      ├── Button.tsx
      ├── Input.tsx
      ├── Card.tsx
      └── Modal.tsx

/lib
  ├── supabase/          # Supabase client configuration
  │   ├── client.ts      # Client-side Supabase client
  │   ├── server.ts      # Server-side Supabase client
  │   └── types.ts       # TypeScript types for database
  └── utils/             # Utility functions
      ├── format.ts      # Formatting utilities
      └── validation.ts  # Validation utilities

/docs
  └── DATABASE_SCHEMA.md # Complete database setup guide
```

## Key Components

### Landing Page Components

- **Hero**: Main hero section with CTA buttons
- **Problem**: Highlights issues with traditional agencies
- **Solution**: Showcases Kreos's approach and timeline comparison
- **Services**: Displays service offerings with pricing

### Dashboard Components

- **Dashboard Home**: Overview of all client projects
- **Project Detail**: Detailed view with tabs for:
  - Overview (timeline and progress)
  - Progress Board (Kanban board)
  - Files (file management)
  - Messages (communication)
  - Payment (payment info)

### UI Components

- **Button**: Customizable button with variants and loading states
- **Input**: Form input with label, error, and helper text
- **Card**: Container component with hover effects
- **Modal**: Accessible modal dialog

## Database Schema

The application uses the following main tables:

- **clients**: User accounts and profiles
- **projects**: Project information and status
- **tasks**: Kanban board tasks
- **messages**: Client-team communication
- **files**: File metadata (files stored in Supabase Storage)
- **payments**: Payment tracking and Stripe integration

See `docs/DATABASE_SCHEMA.md` for complete schema and setup instructions.

## Authentication

Authentication is handled by Supabase Auth with email/password login. The auth flow includes:

1. User signs up or logs in
2. Supabase handles session management
3. Protected routes check for valid session
4. Users are redirected to dashboard on successful auth

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## Future Enhancements

- [ ] Real-time updates using Supabase Realtime
- [ ] File upload functionality with drag-and-drop
- [ ] Stripe payment integration
- [ ] Email notifications with Resend
- [ ] Admin dashboard for team members
- [ ] WebSocket-based messaging
- [ ] PDF export for project reports
- [ ] Calendar integration for deadlines

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow the existing component structure
- Use Tailwind CSS for styling (avoid custom CSS)
- Prefer server components unless interactivity is needed

### Component Guidelines

- Keep components small and focused
- Use proper TypeScript types
- Add error handling
- Include loading states
- Make components accessible

### Git Workflow

1. Create feature branch from main
2. Make changes and commit with clear messages
3. Push to remote
4. Create pull request for review

## Support

For issues and questions:
- Check the documentation in `/docs`
- Review the database schema
- Check Supabase logs for auth/database issues

## License

This project is private and proprietary to Kreos.agency.

---

**Built with Claude Code - Ship 10x faster.**
