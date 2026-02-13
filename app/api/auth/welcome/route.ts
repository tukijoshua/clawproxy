import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const template = welcomeEmail({ name: profile?.name || '' })
  const result = await sendEmail({ to: user.email, ...template })

  return NextResponse.json({ success: result.success })
}
