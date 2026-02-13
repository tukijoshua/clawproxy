import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role to bypass RLS for token lookups
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (!action || !['accept', 'decline'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Use ?action=accept or ?action=decline' },
      { status: 400 },
    )
  }

  // Look up the invitation
  const { data: invitation, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  if (invitation.status !== 'pending') {
    return NextResponse.json(
      { error: `This invitation has already been ${invitation.status}` },
      { status: 400 },
    )
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await supabase
      .from('team_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id)

    return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
  }

  // Update status
  const newStatus = action === 'accept' ? 'accepted' : 'declined'
  await supabase
    .from('team_invitations')
    .update({ status: newStatus })
    .eq('id', invitation.id)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clawproxy.com'

  if (action === 'accept') {
    // Redirect to signup/dashboard
    return NextResponse.redirect(`${appUrl}/dashboard`)
  }

  return NextResponse.json({ message: 'Invitation declined' })
}
