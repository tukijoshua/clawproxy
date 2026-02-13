import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { subscriptionCancelledEmail, paymentFailedEmail } from '@/lib/email-templates'

// Use service role key to bypass RLS for webhook updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: Request) {
  const event = await request.json()

  try {
    switch (event.type) {
      // User paid successfully → upgrade their plan
      case 'membership.went_valid': {
        const whopEmail = event.data?.user?.email
        const planId = event.data?.plan?.id
        const whopUserId = event.data?.user?.id
        const membershipId = event.data?.id

        if (!whopEmail) break

        const plan =
          planId === process.env.WHOP_PRO_PLAN_ID
            ? 'pro'
            : planId === process.env.WHOP_TEAM_PLAN_ID
              ? 'team'
              : null

        if (!plan) break

        await supabase
          .from('users')
          .update({
            plan,
            whop_user_id: whopUserId,
            whop_membership_id: membershipId,
            payment_failed: false,
          })
          .eq('email', whopEmail.toLowerCase())

        break
      }

      // Subscription cancelled or payment failed → downgrade
      case 'membership.went_invalid': {
        const whopEmail = event.data?.user?.email
        if (!whopEmail) break

        // Read user name + plan before downgrade
        const { data: invalidUser } = await supabase
          .from('users')
          .select('name, plan')
          .eq('email', whopEmail.toLowerCase())
          .single()

        await supabase
          .from('users')
          .update({
            plan: 'starter',
            whop_membership_id: null,
          })
          .eq('email', whopEmail.toLowerCase())

        // Send cancellation email
        if (invalidUser) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clawproxy.com'
          const template = subscriptionCancelledEmail({
            name: invalidUser.name || '',
            plan: invalidUser.plan || 'pro',
            reactivateUrl: `${appUrl}/dashboard/pricing`,
          })
          sendEmail({ to: whopEmail.toLowerCase(), ...template }).catch(console.error)
        }

        break
      }

      // Payment failed (Whop auto-retries)
      case 'payment.failed': {
        const whopEmail = event.data?.user?.email
        if (!whopEmail) break

        await supabase
          .from('users')
          .update({ payment_failed: true })
          .eq('email', whopEmail.toLowerCase())

        // Send payment failed email
        const { data: failedUser } = await supabase
          .from('users')
          .select('name')
          .eq('email', whopEmail.toLowerCase())
          .single()

        if (failedUser) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clawproxy.com'
          const template = paymentFailedEmail({
            name: failedUser.name || '',
            updatePaymentUrl: `${appUrl}/dashboard/settings/billing`,
          })
          sendEmail({ to: whopEmail.toLowerCase(), ...template }).catch(console.error)
        }

        break
      }

      // Successful payment clears failure flag
      case 'payment.succeeded': {
        const whopEmail = event.data?.user?.email
        if (!whopEmail) break

        await supabase
          .from('users')
          .update({ payment_failed: false })
          .eq('email', whopEmail.toLowerCase())

        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
  }

  // Always return 200 so Whop doesn't retry
  return NextResponse.json({ received: true })
}
