import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate raw key: cp_sk_ + 48 hex chars
  const rawKey = `cp_sk_${crypto.randomBytes(24).toString('hex')}`
  const keyPrefix = rawKey.slice(0, 12)
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  const { error } = await supabase.from('api_keys').insert({
    user_id: user.id,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    label: 'Default Agent',
    scope: 'full',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return the raw key exactly once — it's never stored in plain text
  return NextResponse.json({ key: rawKey })
}
