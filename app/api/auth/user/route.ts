import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Auto-create profile if trigger didn't fire (e.g. signed up before schema was run)
  if (!data) {
    const { data: created, error: insertErr } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || '',
      })
      .select('*')
      .single()

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }
    data = created
  }

  return NextResponse.json(data)
}
