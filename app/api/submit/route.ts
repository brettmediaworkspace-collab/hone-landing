import { NextRequest, NextResponse } from 'next/server'
import { confirmationEmail } from '@/lib/confirmationEmail'

async function appendSubmission(submission: object) {
  if (process.env.REDIS_URL) {
    const Redis = (await import('ioredis')).default
    const redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, enableReadyCheck: false })
    await redis.lpush('hone:submissions', JSON.stringify(submission))
    await redis.quit()
  } else {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const file = path.join(process.cwd(), 'data', 'submissions.json')
    let existing: object[] = []
    try { existing = JSON.parse(await fs.readFile(file, 'utf-8')) } catch {}
    existing.push(submission)
    await fs.writeFile(file, JSON.stringify(existing, null, 2))
  }
}

async function sendConfirmationEmail(firstName: string, email: string, goal: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping confirmation email')
    return
  }
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: 'HONE <hone@appsplosh.com>',
    to: email,
    subject: "You're on the list. HONE is coming.",
    html: confirmationEmail(firstName, goal),
  })
  if (error) {
    console.error('Resend error:', JSON.stringify(error))
    throw new Error(`Email failed: ${error.message}`)
  }
  console.log('Email sent:', data?.id)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const submission = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      gender: body.gender || '',
      age: body.age || '',
      frequency: body.frequency || '',
      goal: body.goal || '',
      time: body.time || '',
      firstName: body.firstName || '',
      email: body.email || '',
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    }

    if (!submission.email || !submission.email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Store submission and send email concurrently
    await Promise.all([
      appendSubmission(submission),
      sendConfirmationEmail(submission.firstName, submission.email, submission.goal),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
