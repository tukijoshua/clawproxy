/* ── Shared layout ─────────────────────────────────────────────── */

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F0EFED;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EFED;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E2E1DC;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:28px 32px 0;">
          <span style="font-size:20px;color:#111110;letter-spacing:-0.027em;font-weight:600;">ClawProxy</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:24px 32px 32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #E2E1DC;">
          <p style="margin:0;font-size:12px;color:#8F8F87;line-height:1.5;">
            &copy; ${new Date().getFullYear()} ClawProxy. All rights reserved.<br>
            <a href="https://clawproxy.ai" style="color:#8F8F87;text-decoration:underline;">clawproxy.ai</a>
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#B8B8B0;line-height:1.5;">
            Built with love by <a href="https://x.com/TukiFromKL" style="color:#B8B8B0;text-decoration:underline;">Tuki Joshua</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#17803D;color:#FFFFFF;font-size:14px;font-weight:500;text-decoration:none;padding:10px 24px;border-radius:6px;margin:8px 0;">${text}</a>`;
}

/* ── 1. Welcome ───────────────────────────────────────────────── */

export function welcomeEmail({ name }: { name: string }): {
  subject: string;
  html: string;
} {
  const firstName = (name || '').split(' ')[0] || 'there';
  return {
    subject: `Welcome to ClawProxy, ${firstName}! Your AI costs are about to drop.`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#111110;font-weight:600;">Hey ${firstName}!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#55554F;line-height:1.7;">
        Welcome to ClawProxy. You just made one of the smartest decisions for your AI workflow. Most developers are overpaying by 60-70% on LLM costs without even knowing it.
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#55554F;line-height:1.7;">
        That changes today. ClawProxy sits between your agents and the API, automatically routing each request to the cheapest model that can handle it. Same quality. Way less spend.
      </p>
      <div style="margin:0 0 24px;padding:16px 20px;background:#E8F5EC;border-radius:8px;">
        <p style="margin:0;font-size:14px;color:#0A5C26;line-height:1.6;font-weight:600;">
          Here's your 2-minute setup:
        </p>
        <ol style="margin:8px 0 0;padding-left:20px;font-size:14px;color:#0A5C26;line-height:2;">
          <li>Generate your ClawProxy API key from the dashboard</li>
          <li>Point your agent config to your ClawProxy endpoint</li>
          <li>Watch your costs drop in real time</li>
        </ol>
      </div>
      ${button('Open Your Dashboard', 'https://clawproxy.ai/dashboard')}
      <p style="margin:20px 0 0;font-size:13px;color:#8F8F87;line-height:1.6;">
        If you have any questions, just reply to this email. I read every message personally.<br><br>
        &mdash; Tuki Joshua, Creator of ClawProxy
      </p>
    `),
  };
}

/* ── 2. Team Invite ───────────────────────────────────────────── */

export function teamInviteEmail({
  inviterName,
  teamName,
  role,
  personalMessage,
  acceptUrl,
  declineUrl,
}: {
  inviterName: string;
  teamName: string;
  role: string;
  personalMessage?: string;
  acceptUrl: string;
  declineUrl: string;
}): { subject: string; html: string } {
  const messageBlock = personalMessage
    ? `<div style="margin:16px 0;padding:12px 16px;background:#FAFAF8;border:1px solid #E2E1DC;border-radius:8px;">
        <p style="margin:0;font-size:13px;color:#8F8F87;">Personal message:</p>
        <p style="margin:4px 0 0;font-size:14px;color:#111110;line-height:1.5;">"${personalMessage}"</p>
      </div>`
    : '';

  return {
    subject: `${inviterName} invited you to join ${teamName} on ClawProxy`,
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:22px;color:#111110;font-weight:600;">You're invited!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#55554F;line-height:1.6;">
        <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> as a <strong>${role}</strong> on ClawProxy.
      </p>
      ${messageBlock}
      <div style="margin:20px 0;">
        ${button('Accept Invite', acceptUrl)}
        &nbsp;&nbsp;
        <a href="${declineUrl}" style="font-size:14px;color:#8F8F87;text-decoration:underline;">Decline</a>
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:#8F8F87;">This invitation expires in 7 days.</p>
    `),
  };
}

/* ── 3. Budget Alert ──────────────────────────────────────────── */

export function budgetAlertEmail({
  name,
  percentage,
  currentSpend,
  dailyBudget,
  dashboardUrl,
}: {
  name: string;
  percentage: 75 | 90;
  currentSpend: string;
  dailyBudget: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const displayName = name || 'there';
  const isUrgent = percentage === 90;

  return {
    subject: `${isUrgent ? '⚠️ ' : ''}Budget alert: ${percentage}% of daily limit reached`,
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:22px;color:${isUrgent ? '#D93025' : '#111110'};font-weight:600;">
        ${isUrgent ? 'Urgent: ' : ''}${percentage}% budget reached
      </h1>
      <p style="margin:0 0 16px;font-size:15px;color:#55554F;line-height:1.6;">
        Hey ${displayName}, your agents have used <strong>${percentage}%</strong> of today's budget.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;border:1px solid #E2E1DC;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#8F8F87;border-bottom:1px solid #E2E1DC;">Current spend</td>
          <td style="padding:12px 16px;font-size:14px;color:#111110;border-bottom:1px solid #E2E1DC;text-align:right;font-weight:600;">${currentSpend}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#8F8F87;">Daily budget</td>
          <td style="padding:12px 16px;font-size:14px;color:#111110;text-align:right;font-weight:600;">${dailyBudget}</td>
        </tr>
      </table>
      <p style="margin:0 0 16px;font-size:14px;color:#55554F;line-height:1.6;">
        ${isUrgent ? 'Your agents will be paused when the budget is exhausted.' : 'Consider adjusting your budget or routing rules to avoid hitting the limit.'}
      </p>
      ${button('View Dashboard', dashboardUrl)}
    `),
  };
}

/* ── 4. Loop Killed ───────────────────────────────────────────── */

export function loopKilledEmail({
  name,
  savedAmount,
  agentLabel,
  loopCount,
  dashboardUrl,
}: {
  name: string;
  savedAmount: string;
  agentLabel: string;
  loopCount: number;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const displayName = name || 'there';

  return {
    subject: `Loop detected & killed — saved you ${savedAmount}`,
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:22px;color:#111110;font-weight:600;">Loop detected & stopped</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#55554F;line-height:1.6;">
        Hey ${displayName}, ClawProxy detected a runaway loop from <strong>${agentLabel}</strong> and automatically killed it.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;border:1px solid #E2E1DC;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#8F8F87;border-bottom:1px solid #E2E1DC;">Agent</td>
          <td style="padding:12px 16px;font-size:14px;color:#111110;border-bottom:1px solid #E2E1DC;text-align:right;">${agentLabel}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#8F8F87;border-bottom:1px solid #E2E1DC;">Repeated requests</td>
          <td style="padding:12px 16px;font-size:14px;color:#111110;border-bottom:1px solid #E2E1DC;text-align:right;">${loopCount}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#8F8F87;">Estimated savings</td>
          <td style="padding:12px 16px;font-size:14px;color:#17803D;text-align:right;font-weight:600;">${savedAmount}</td>
        </tr>
      </table>
      ${button('Review in Dashboard', dashboardUrl)}
    `),
  };
}

/* ── 5. Payment Failed ────────────────────────────────────────── */

export function paymentFailedEmail({
  name,
  updatePaymentUrl,
}: {
  name: string;
  updatePaymentUrl: string;
}): { subject: string; html: string } {
  const displayName = name || 'there';

  return {
    subject: 'Action required: Payment failed',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:22px;color:#D93025;font-weight:600;">Payment failed</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#55554F;line-height:1.6;">
        Hey ${displayName}, we couldn't process your latest payment. Please update your payment method to keep your plan active.
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#55554F;line-height:1.6;">
        If the issue isn't resolved within 7 days, your account will be downgraded to the Starter plan.
      </p>
      ${button('Update Payment Method', updatePaymentUrl)}
    `),
  };
}

/* ── 6. Subscription Cancelled ────────────────────────────────── */

export function subscriptionCancelledEmail({
  name,
  plan,
  reactivateUrl,
}: {
  name: string;
  plan: string;
  reactivateUrl: string;
}): { subject: string; html: string } {
  const displayName = name || 'there';

  return {
    subject: 'Your ClawProxy subscription has been cancelled',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:22px;color:#111110;font-weight:600;">Subscription cancelled</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#55554F;line-height:1.6;">
        Hey ${displayName}, your <strong>${plan}</strong> plan has been cancelled and your account has been moved to the Starter plan.
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#55554F;line-height:1.6;">
        You'll lose access to premium features like advanced routing rules, team collaboration, and higher rate limits. You can reactivate anytime to pick up where you left off.
      </p>
      ${button('Reactivate Plan', reactivateUrl)}
    `),
  };
}

/* ── 7. Weekly Summary ────────────────────────────────────────── */

export function weeklySummaryEmail({
  name,
  totalSaved,
  requestCount,
  topAgent,
  weekRange,
  dashboardUrl,
}: {
  name: string;
  totalSaved: string;
  requestCount: number;
  topAgent: string;
  weekRange: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const displayName = name || 'there';

  return {
    subject: `Your weekly ClawProxy summary — ${totalSaved} saved`,
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:22px;color:#111110;font-weight:600;">Weekly Summary</h1>
      <p style="margin:0 0 4px;font-size:13px;color:#8F8F87;">${weekRange}</p>
      <p style="margin:0 0 20px;font-size:15px;color:#55554F;line-height:1.6;">
        Hey ${displayName}, here's how ClawProxy performed for you this week.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;border:1px solid #E2E1DC;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#8F8F87;border-bottom:1px solid #E2E1DC;">Total saved</td>
          <td style="padding:12px 16px;font-size:14px;color:#17803D;border-bottom:1px solid #E2E1DC;text-align:right;font-weight:600;">${totalSaved}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#8F8F87;border-bottom:1px solid #E2E1DC;">Requests proxied</td>
          <td style="padding:12px 16px;font-size:14px;color:#111110;border-bottom:1px solid #E2E1DC;text-align:right;">${requestCount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#8F8F87;">Top agent</td>
          <td style="padding:12px 16px;font-size:14px;color:#111110;text-align:right;">${topAgent}</td>
        </tr>
      </table>
      ${button('View Full Analytics', dashboardUrl)}
    `),
  };
}
