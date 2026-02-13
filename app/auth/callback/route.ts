import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If ?next= is an external URL (e.g. Whop checkout), redirect directly
      if (next && (next.startsWith('https://') || next.startsWith('http://'))) {
        return NextResponse.redirect(next)
      }

      // Check if user has completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let redirectTo = next || '/dashboard'

      if (!next && user) {
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed, name, created_at')
          .eq('id', user.id)
          .single()

        if (!profile?.onboarding_completed) {
          redirectTo = '/onboarding'
        }

        // Send welcome email for new OAuth signups (created within last 60s)
        if (
          profile &&
          !profile.onboarding_completed &&
          user.email &&
          new Date().getTime() - new Date(profile.created_at).getTime() < 60_000
        ) {
          const template = welcomeEmail({ name: profile.name || '' })
          sendEmail({ to: user.email, ...template }).catch(console.error)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectTo}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
