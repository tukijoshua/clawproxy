import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requirePlan } from '@/lib/api/require-plan'
import { isValidEmail } from '@/lib/utils/validation'
import { sendEmail } from '@/lib/email'
import { teamInviteEmail } from '@/lib/email-templates'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Require team plan
  const planCheck = await requirePlan(supabase, user.id, 'team')
  if (!planCheck.authorized) {
    return planCheck.response
  }

  const body = await request.json()
  const { email, role, personalMessage } = body as {
    email: string
    role: string
    personalMessage?: string
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (!['admin', 'member', 'viewer'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Get inviter's profile
  const { data: inviter } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const token = randomBytes(32).toString('hex')

  const { error: insertError } = await supabase.from('team_invitations').insert({
    inviter_id: user.id,
    email: email.toLowerCase(),
    role,
    token,
    personal_message: personalMessage || null,
  })

  if (insertError) {
    console.error('Failed to insert invitation:', insertError)
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
  }

  // Send invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clawproxy.ai'
  const inviterName = inviter?.name || user.email || 'A teammate'
  const template = teamInviteEmail({
    inviterName,
    teamName: `${inviterName}'s team`,
    role,
    personalMessage: personalMessage || undefined,
    acceptUrl: `${appUrl}/api/teams/invite/${token}?action=accept`,
    declineUrl: `${appUrl}/api/teams/invite/${token}?action=decline`,
  })

  sendEmail({ to: email.toLowerCase(), ...template }).catch(console.error)

  return NextResponse.json({ success: true })
}
