'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'quick-setup', label: 'Quick Setup' },
  { id: 'api-reference', label: 'API Reference' },
  { id: 'smart-routing', label: 'Smart Routing' },
  { id: 'routing-rules', label: 'Custom Routing Rules' },
  { id: 'loop-detection', label: 'Loop Detection' },
  { id: 'budget-controls', label: 'Budget Controls' },
  { id: 'analytics', label: 'Analytics & Dashboard' },
  { id: 'team-management', label: 'Team Management' },
  { id: 'plans', label: 'Plans & Pricing' },
  { id: 'faq', label: 'FAQ' },
];

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group rounded-[8px] overflow-hidden my-[16px]" style={{ backgroundColor: '#1E1E1E' }}>
      <div className="flex items-center justify-between px-[16px] py-[8px] border-b border-[#333]">
        <span className="text-[11px] text-[#888] uppercase tracking-wider">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[11px] text-[#888] hover:text-white transition cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="px-[16px] py-[14px] overflow-x-auto text-[13px] leading-[1.7]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <code className="text-[#D4D4D4]">{code}</code>
      </pre>
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[22px] sm:text-[26px] leading-[1.2] text-[#111110] mt-[48px] mb-[16px] scroll-mt-[100px]" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.02em' }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[16px] sm:text-[18px] leading-[1.3] text-[#111110] mt-[28px] mb-[10px] font-semibold">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] sm:text-[15px] leading-[1.7] text-[#55554F] mb-[12px]">
      {children}
    </p>
  );
}

function Badge({ children, color = 'green' }: { children: React.ReactNode; color?: 'green' | 'blue' | 'purple' }) {
  const colors = {
    green: { bg: '#E8F5EC', text: '#0A5C26', border: '#17803D' },
    blue: { bg: '#EFF6FF', text: '#1E40AF', border: '#3B82F6' },
    purple: { bg: '#F3E8FF', text: '#6B21A8', border: '#7C3AED' },
  };
  const c = colors[color];
  return (
    <span className="inline-flex items-center h-[22px] px-[8px] rounded-[4px] text-[11px] font-medium uppercase tracking-wider" style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {children}
    </span>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: unknown } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EFED' }}>
      {/* Navbar */}
      <div className="sticky top-0 z-50 flex justify-center pt-[16px] px-[16px] pb-[8px]" style={{ backgroundColor: '#F0EFED' }}>
        <nav className="flex items-center justify-between w-full max-w-[1200px] h-[46px] px-[16px] rounded-[4px]" style={{ backgroundColor: '#1A1A1A' }}>
          <Link href="/" className="flex items-center">
            <span className="text-[24px] text-white" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.027em' }}>
              ClawProxy
            </span>
          </Link>
          <div className="flex items-center gap-[12px]">
            <span className="text-[13px] text-[#888] hidden sm:inline">Documentation</span>
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth/signup'}
              className="flex items-center justify-center h-[27px] px-[10px] rounded-[4px] bg-white text-[12px] text-[#1A1A1A] hover:opacity-90 transition"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {isLoggedIn ? 'Dashboard' : 'Get Started'}
            </Link>
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-[16px] flex gap-[40px] pb-[80px]">
        {/* Sidebar - table of contents */}
        <aside className="hidden lg:block w-[220px] shrink-0 sticky top-[80px] self-start pt-[24px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#8F8F87] mb-[12px] px-[12px]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
            On this page
          </p>
          <nav className="flex flex-col gap-[2px]">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`text-[13px] leading-[1.4] px-[12px] py-[6px] rounded-[6px] transition ${
                  activeSection === s.id
                    ? 'text-[#17803D] bg-[#E8F5EC]'
                    : 'text-[#55554F] hover:text-[#111110] hover:bg-white'
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main docs content */}
        <main className="flex-1 min-w-0 pt-[24px]">
          <div className="bg-white border border-[#E2E1DC] rounded-[14px] px-[24px] sm:px-[40px] py-[32px] sm:py-[48px]">
            {/* Hero */}
            <h1 className="text-[32px] sm:text-[42px] leading-[1.1] text-[#111110] mb-[16px]" style={{ fontFamily: 'PP Mondwest, serif', letterSpacing: '-0.03em' }}>
              ClawProxy Documentation
            </h1>
            <P>
              Everything you need to set up ClawProxy, configure smart routing, and start saving on your AI costs. This guide covers the full API, dashboard features, and advanced configuration.
            </P>

            {/* ── Getting Started ─────────────────── */}
            <H2 id="getting-started">Getting Started</H2>
            <P>
              ClawProxy is an OpenAI-compatible proxy that sits between your AI agents and LLM providers. It automatically routes each request to the cheapest model capable of handling it, detects and kills runaway loops, and enforces hard spending limits.
            </P>
            <H3>How it works</H3>
            <P>
              Your agents send requests to ClawProxy instead of directly to OpenRouter/Anthropic/OpenAI. ClawProxy analyzes each request, applies your routing rules, forwards it to the optimal provider, logs the result, and returns the response. Your agents see no difference — the API is fully OpenAI-compatible.
            </P>
            <div className="bg-[#FAFAF8] border border-[#E2E1DC] rounded-[10px] px-[20px] py-[16px] my-[16px]">
              <p className="text-[13px] leading-[1.6] text-[#55554F] m-0">
                <strong className="text-[#111110]">Your Agent</strong> → <strong className="text-[#17803D]">ClawProxy</strong> → <strong className="text-[#111110]">OpenRouter / Anthropic / OpenAI</strong>
              </p>
            </div>

            {/* ── Quick Setup ─────────────────────── */}
            <H2 id="quick-setup">Quick Setup</H2>
            <P>Get up and running in under 2 minutes.</P>

            <H3>1. Create an account</H3>
            <P>
              Sign up at <Link href="/auth/signup" className="text-[#17803D] hover:underline">clawproxy.ai/auth/signup</Link>. You&apos;ll get a free Starter plan with 10,000 requests/month.
            </P>

            <H3>2. Generate an API key</H3>
            <P>
              After completing onboarding, go to <strong>Settings → API Keys</strong> and generate your first key. It looks like <code className="text-[13px] bg-[#F0EFED] px-[6px] py-[2px] rounded">cp_sk_a8f3x9d2e5b1c7f4...</code>
            </P>

            <H3>3. Configure your agent</H3>
            <P>Point your agent to ClawProxy by updating the base URL and adding your key:</P>

            <CodeBlock lang="json" code={`{
  "apiBaseUrl": "https://clawproxy.ai/api/proxy/v1",
  "customHeaders": {
    "x-clawproxy-key": "cp_sk_YOUR_KEY_HERE"
  }
}`} />

            <P>Or use the Authorization header (Bearer token):</P>

            <CodeBlock lang="bash" code={`curl https://clawproxy.ai/api/proxy/v1/chat/completions \\
  -H "Authorization: Bearer cp_sk_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`} />

            <H3>4. Environment variables</H3>
            <P>For OpenClaw or similar agents, set these environment variables:</P>
            <CodeBlock lang="bash" code={`OPENCLAW_API_BASE_URL=https://clawproxy.ai/api/proxy/v1
OPENCLAW_CUSTOM_HEADERS=x-clawproxy-key:cp_sk_YOUR_KEY_HERE`} />

            {/* ── API Reference ──────────────────── */}
            <H2 id="api-reference">API Reference</H2>
            <P>
              ClawProxy exposes an OpenAI-compatible API. Any tool or SDK that works with OpenAI will work with ClawProxy — just change the base URL.
            </P>

            <H3>Base URL</H3>
            <CodeBlock lang="text" code="https://clawproxy.ai/api/proxy/v1" />

            <H3>Authentication</H3>
            <P>Pass your API key using either method:</P>
            <ul className="text-[14px] leading-[1.8] text-[#55554F] pl-[20px] mb-[16px] list-disc">
              <li><code className="text-[13px] bg-[#F0EFED] px-[6px] py-[2px] rounded">Authorization: Bearer cp_sk_...</code> header</li>
              <li><code className="text-[13px] bg-[#F0EFED] px-[6px] py-[2px] rounded">x-clawproxy-key: cp_sk_...</code> header</li>
            </ul>

            <H3>POST /chat/completions</H3>
            <P>Create a chat completion. Supports all standard OpenAI parameters including streaming.</P>
            <CodeBlock lang="json" code={`{
  "model": "anthropic/claude-sonnet-4",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Explain quantum computing in one sentence."}
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 500
}`} />

            <H3>Supported models</H3>
            <P>ClawProxy supports all models available on OpenRouter:</P>
            <div className="overflow-x-auto my-[16px]">
              <table className="w-full text-[13px] border border-[#E2E1DC] rounded-[8px] overflow-hidden">
                <thead>
                  <tr className="bg-[#FAFAF8]">
                    <th className="text-left px-[16px] py-[10px] text-[#8F8F87] font-medium border-b border-[#E2E1DC]">Model</th>
                    <th className="text-left px-[16px] py-[10px] text-[#8F8F87] font-medium border-b border-[#E2E1DC]">Input $/M</th>
                    <th className="text-left px-[16px] py-[10px] text-[#8F8F87] font-medium border-b border-[#E2E1DC]">Output $/M</th>
                    <th className="text-left px-[16px] py-[10px] text-[#8F8F87] font-medium border-b border-[#E2E1DC]">Best for</th>
                  </tr>
                </thead>
                <tbody className="text-[#55554F]">
                  {[
                    ['google/gemini-2.0-flash-lite-001', '$0.075', '$0.30', 'Simple tasks, status checks'],
                    ['anthropic/claude-3.5-haiku', '$0.80', '$4.00', 'Medium tasks, summaries'],
                    ['openai/gpt-4o-mini', '$0.15', '$0.60', 'Quick responses, chat'],
                    ['openai/gpt-4o', '$2.50', '$10.00', 'Complex analysis'],
                    ['anthropic/claude-sonnet-4', '$3.00', '$15.00', 'Code, reasoning'],
                    ['anthropic/claude-opus-4', '$15.00', '$75.00', 'Most complex tasks'],
                  ].map(([model, input, output, use]) => (
                    <tr key={model} className="border-b border-[#E2E1DC] last:border-0">
                      <td className="px-[16px] py-[10px] font-mono text-[12px] text-[#111110]">{model}</td>
                      <td className="px-[16px] py-[10px]">{input}</td>
                      <td className="px-[16px] py-[10px]">{output}</td>
                      <td className="px-[16px] py-[10px]">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <H3>GET /models</H3>
            <P>List all available models. Proxied directly from OpenRouter.</P>

            <H3>Response format</H3>
            <P>Responses are identical to the OpenAI format. ClawProxy adds an <code className="text-[13px] bg-[#F0EFED] px-[6px] py-[2px] rounded">x-clawproxy-model</code> header showing the actual model used (may differ from requested if routing rules applied).</P>

            {/* ── Smart Routing ──────────────────── */}
            <H2 id="smart-routing">Smart Routing</H2>
            <P>
              ClawProxy analyzes the complexity of each request and routes it to the cheapest model that can handle it. This is the core feature that saves you 60-70% on LLM costs.
            </P>
            <div className="bg-[#FAFAF8] border border-[#E2E1DC] rounded-[10px] px-[20px] py-[16px] my-[16px]">
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <Badge color="green">Simple</Badge>
                  <span className="text-[13px] text-[#55554F]">Heartbeats, status checks, file scans → Flash-Lite ($0.075/M)</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Badge color="blue">Medium</Badge>
                  <span className="text-[13px] text-[#55554F]">Emails, summaries, translations → Haiku ($0.80/M)</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Badge color="purple">Complex</Badge>
                  <span className="text-[13px] text-[#55554F]">Architecture, debugging, code gen → Opus ($15/M)</span>
                </div>
              </div>
            </div>
            <P>
              The classifier adds ~15ms per request. For most workloads, cheaper models respond faster, so total latency often <em>decreases</em>.
            </P>

            {/* ── Routing Rules ──────────────────── */}
            <H2 id="routing-rules">Custom Routing Rules</H2>
            <P>
              Override the automatic routing with your own rules. Go to <strong>Settings → Rules</strong> in the dashboard to create rules.
            </P>
            <H3>Rule types</H3>
            <ul className="text-[14px] leading-[1.8] text-[#55554F] pl-[20px] mb-[16px] list-disc">
              <li><strong>Model override</strong> — Force a specific model for matching requests (e.g., always use Opus for code review)</li>
              <li><strong>Priority</strong> — Rules with higher priority are evaluated first</li>
              <li><strong>Conditions</strong> — Match on model name, agent label, or request content</li>
            </ul>

            <H3>API: Manage rules</H3>
            <CodeBlock lang="bash" code={`# List rules
GET /api/rules

# Create rule
POST /api/rules
{
  "name": "Always use Opus for code",
  "rule_type": "model_override",
  "conditions": {"model_pattern": "anthropic/*"},
  "action_value": "anthropic/claude-opus-4",
  "priority": 10
}

# Update rule
PUT /api/rules/{id}

# Delete rule
DELETE /api/rules/{id}`} />

            {/* ── Loop Detection ─────────────────── */}
            <H2 id="loop-detection">Loop Detection</H2>
            <P>
              When an agent gets stuck in a loop — sending the same request over and over — ClawProxy detects the pattern and kills it automatically. This prevents runaway costs that can reach hundreds of dollars overnight.
            </P>
            <H3>How it works</H3>
            <P>
              ClawProxy hashes each request (model + last 3 messages, truncated to 200 chars). If it sees more than 10 identical hashes in 60 seconds from the same user, it returns a <code className="text-[13px] bg-[#F0EFED] px-[6px] py-[2px] rounded">429</code> status and logs the event as <code className="text-[13px] bg-[#F0EFED] px-[6px] py-[2px] rounded">loop_killed</code>.
            </P>
            <H3>Response when loop detected</H3>
            <CodeBlock lang="json" code={`{
  "error": {
    "message": "Loop detected: identical request repeated 11 times in 60s",
    "type": "loop_detected",
    "code": 429
  }
}`} />
            <P>
              <Badge>Pro</Badge> <Badge>Team</Badge> — Loop detection is available on Pro and Team plans.
            </P>

            {/* ── Budget Controls ────────────────── */}
            <H2 id="budget-controls">Budget Controls</H2>
            <P>
              Set hard spending limits so you never get surprised by a bill. Go to <strong>Settings → General</strong> to configure budgets.
            </P>
            <H3>Daily budget</H3>
            <P>
              Maximum spend per day. When reached, non-essential requests return <code className="text-[13px] bg-[#F0EFED] px-[6px] py-[2px] rounded">429 budget_exceeded</code>.
            </P>
            <H3>Monthly budget</H3>
            <P>
              Maximum spend per calendar month. Same behavior as daily budget.
            </P>
            <H3>Budget alerts</H3>
            <P>
              ClawProxy sends email alerts at 75% and 90% of your daily budget, so you can take action before hitting the limit.
            </P>
            <H3>API: Manage budgets</H3>
            <CodeBlock lang="bash" code={`# Get current budgets
GET /api/settings

# Update budgets
PUT /api/settings
{
  "daily_budget": 5.00,
  "monthly_budget": 100.00
}`} />
            <P>
              <Badge>Pro</Badge> <Badge>Team</Badge> — Spending limits are available on Pro and Team plans.
            </P>

            {/* ── Analytics ──────────────────────── */}
            <H2 id="analytics">Analytics &amp; Dashboard</H2>
            <P>
              The ClawProxy dashboard gives you full visibility into your AI spending.
            </P>
            <H3>Overview</H3>
            <P>See total spend, savings, request count, active agents, and model distribution at a glance.</P>
            <H3>Live feed</H3>
            <P>Real-time stream of every request passing through ClawProxy, including model used, tokens, cost, latency, and status.</P>
            <H3>Per-agent breakdown</H3>
            <P>Track costs per agent (API key). See which agents are costing the most and where you&apos;re saving.</P>
            <H3>Analytics API</H3>
            <CodeBlock lang="bash" code={`# Overview stats
GET /api/analytics/overview?range=week&agent=all

# Recent requests (live feed)
GET /api/analytics/requests?limit=50

# Per-agent stats
GET /api/analytics/agents`} />

            {/* ── Team Management ────────────────── */}
            <H2 id="team-management">Team Management</H2>
            <P>
              Invite team members to share your ClawProxy account. Each member gets their own API keys and can view analytics.
            </P>
            <H3>Inviting members</H3>
            <P>
              Go to <strong>Settings → Team</strong> and enter the email address of the person you want to invite. They&apos;ll receive an email with a link to join.
            </P>
            <H3>Roles</H3>
            <ul className="text-[14px] leading-[1.8] text-[#55554F] pl-[20px] mb-[16px] list-disc">
              <li><strong>Admin</strong> — Full access to all settings, billing, and team management</li>
              <li><strong>Member</strong> — Can create API keys and view analytics, but can&apos;t manage billing or team</li>
            </ul>
            <P>
              <Badge color="purple">Team</Badge> — Team management is available on the Team plan (up to 25 seats).
            </P>

            {/* ── Plans ──────────────────────────── */}
            <H2 id="plans">Plans &amp; Pricing</H2>
            <div className="overflow-x-auto my-[16px]">
              <table className="w-full text-[13px] border border-[#E2E1DC] rounded-[8px] overflow-hidden">
                <thead>
                  <tr className="bg-[#FAFAF8]">
                    <th className="text-left px-[16px] py-[10px] text-[#8F8F87] font-medium border-b border-[#E2E1DC]">Feature</th>
                    <th className="text-center px-[16px] py-[10px] text-[#8F8F87] font-medium border-b border-[#E2E1DC]">Starter ($0)</th>
                    <th className="text-center px-[16px] py-[10px] text-[#8F8F87] font-medium border-b border-[#E2E1DC]">Pro ($29)</th>
                    <th className="text-center px-[16px] py-[10px] text-[#8F8F87] font-medium border-b border-[#E2E1DC]">Team ($79)</th>
                  </tr>
                </thead>
                <tbody className="text-[#55554F]">
                  {[
                    ['Requests/month', '10,000', 'Unlimited', 'Unlimited'],
                    ['Agents', '1', '3', 'Unlimited'],
                    ['Smart routing', 'Yes', 'Yes', 'Yes'],
                    ['Loop detection', 'No', 'Yes', 'Yes'],
                    ['Context compression', 'No', 'Yes', 'Yes'],
                    ['Spending limits', 'No', 'Yes', 'Yes'],
                    ['Analytics history', '7 days', '90 days', '90 days'],
                    ['CSV export', 'No', 'Yes', 'Yes'],
                    ['Custom routing rules', 'No', '3 rules', 'Unlimited'],
                    ['Team members', 'No', 'No', 'Up to 25'],
                    ['Priority support', 'No', 'No', 'Yes'],
                  ].map(([feature, starter, pro, team]) => (
                    <tr key={feature} className="border-b border-[#E2E1DC] last:border-0">
                      <td className="px-[16px] py-[10px] text-[#111110] font-medium">{feature}</td>
                      <td className="px-[16px] py-[10px] text-center">{starter}</td>
                      <td className="px-[16px] py-[10px] text-center">{pro}</td>
                      <td className="px-[16px] py-[10px] text-center">{team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── FAQ ────────────────────────────── */}
            <H2 id="faq">FAQ</H2>

            {[
              {
                q: 'Will my agents notice the difference?',
                a: 'No. ClawProxy is fully OpenAI-compatible. Requests and responses look identical to your agents. The only difference is the base URL.',
              },
              {
                q: 'What if ClawProxy goes down?',
                a: 'If ClawProxy is unreachable, your agents will get a connection error just like they would if OpenAI went down. We recommend having a fallback configuration that points directly to your provider.',
              },
              {
                q: 'Do you store my prompts or responses?',
                a: 'No. ClawProxy only logs metadata (model, tokens, cost, latency). We never store prompt content or response content. Your data passes through encrypted and is not retained.',
              },
              {
                q: 'Can I use my own OpenRouter/Anthropic API keys?',
                a: 'Currently, ClawProxy uses its own provider keys to route requests. We pass savings from volume pricing to you. Support for bring-your-own-key is planned.',
              },
              {
                q: 'What happens when I hit my budget limit?',
                a: 'New requests receive a 429 status with a "budget_exceeded" error. Your agents should handle this gracefully. You can increase your budget at any time from the Settings page.',
              },
              {
                q: "What's the refund policy?",
                a: "If ClawProxy doesn't save you more than it costs in your first 30 days, we'll refund your subscription in full. No questions asked.",
              },
              {
                q: 'How do I cancel my subscription?',
                a: 'Go to Settings → Billing and click "Cancel subscription". Your account will be downgraded to the Starter plan at the end of your billing cycle.',
              },
            ].map((item) => (
              <div key={item.q} className="mb-[20px]">
                <H3>{item.q}</H3>
                <P>{item.a}</P>
              </div>
            ))}

            {/* ── Footer ────────────────────────── */}
            <div className="mt-[48px] pt-[24px] border-t border-[#E2E1DC] flex flex-col sm:flex-row items-center justify-between gap-[12px]">
              <P>
                Need help? Reach out on{' '}
                <a href="https://x.com/TukiFromKL" target="_blank" rel="noopener noreferrer" className="text-[#17803D] hover:underline">
                  Twitter / X
                </a>{' '}
                or{' '}
                <a href="https://github.com/tukijoshua" target="_blank" rel="noopener noreferrer" className="text-[#17803D] hover:underline">
                  GitHub
                </a>.
              </P>
              <span className="text-[12px] text-[#8F8F87]" style={{ fontFamily: 'Aeonik Pro, sans-serif' }}>
                Built with love by{' '}
                <a href="https://x.com/TukiFromKL" target="_blank" rel="noopener noreferrer" className="text-[#17803D] hover:underline">
                  Tuki Joshua
                </a>
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
