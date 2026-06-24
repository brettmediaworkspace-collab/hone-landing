import { NextRequest, NextResponse } from 'next/server'

// Storage abstraction: fs in local dev, Vercel KV in production.
// To enable production storage: Vercel dashboard → Storage → Create KV → link to this project.
async function appendSubmission(submission: object) {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import('@vercel/kv')
    await kv.lpush('hone:submissions', JSON.stringify(submission))
  } else {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const file = path.join(process.cwd(), 'data', 'submissions.json')
    let existing: object[] = []
    try {
      existing = JSON.parse(await fs.readFile(file, 'utf-8'))
    } catch {}
    existing.push(submission)
    await fs.writeFile(file, JSON.stringify(existing, null, 2))
  }
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

    await appendSubmission(submission)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
