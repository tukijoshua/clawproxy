import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { budgetAlertEmail, loopKilledEmail } from '@/lib/email-templates'

type NotifyType = 'budget_75' | 'budget_90' | 'loop_killed'

interface NotifyBody {
  type: NotifyType
  to: string
  data: Record<string, unknown>
}

export async function POST(request: Request) {
  // Authenticate via internal secret
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.INTERNAL_API_SECRET

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as NotifyBody
  const { type, to, data } = body

  if (!type || !to || !data) {
    return NextResponse.json(
      { error: 'Missing required fields: type, to, data' },
      { status: 400 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clawproxy.ai'
  let template: { subject: string; html: string }

  switch (type) {
    case 'budget_75':
      template = budgetAlertEmail({
        name: (data.name as string) || '',
        percentage: 75,
        currentSpend: (data.currentSpend as string) || '$0',
        dailyBudget: (data.dailyBudget as string) || '$0',
        dashboardUrl: `${appUrl}/dashboard`,
      })
      break

    case 'budget_90':
      template = budgetAlertEmail({
        name: (data.name as string) || '',
        percentage: 90,
        currentSpend: (data.currentSpend as string) || '$0',
        dailyBudget: (data.dailyBudget as string) || '$0',
        dashboardUrl: `${appUrl}/dashboard`,
      })
      break

    case 'loop_killed':
      template = loopKilledEmail({
        name: (data.name as string) || '',
        savedAmount: (data.savedAmount as string) || '$0',
        agentLabel: (data.agentLabel as string) || 'Unknown agent',
        loopCount: (data.loopCount as number) || 0,
        dashboardUrl: `${appUrl}/dashboard`,
      })
      break

    default:
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
  }

  const result = await sendEmail({ to, ...template })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: result.id })
}
