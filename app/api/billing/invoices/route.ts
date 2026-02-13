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

  const { data: profile } = await supabase
    .from('users')
    .select('whop_membership_id')
    .eq('id', user.id)
    .single()

  if (!profile?.whop_membership_id || !process.env.WHOP_API_KEY) {
    return NextResponse.json({ invoices: [] })
  }

  try {
    const res = await fetch(
      `https://api.whop.com/api/v5/payments?membership_id=${profile.whop_membership_id}`,
      {
        headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
      },
    )

    if (!res.ok) {
      return NextResponse.json({ invoices: [] })
    }

    const payments = await res.json()

    const invoices =
      payments.data?.map((p: Record<string, unknown>) => ({
        id: p.id,
        date: (p.paid_at as string) || (p.created_at as string),
        amount: p.final_amount,
        currency: (p.currency as string) || 'usd',
        status: (p.substatus as string) || (p.status as string),
        cardBrand: (p.payment_method as Record<string, unknown>)?.card
          ? ((p.payment_method as Record<string, Record<string, string>>).card.brand)
          : null,
        cardLast4: (p.payment_method as Record<string, unknown>)?.card
          ? ((p.payment_method as Record<string, Record<string, string>>).card.last4)
          : null,
      })) || []

    return NextResponse.json({ invoices })
  } catch {
    return NextResponse.json({ invoices: [] })
  }
}
