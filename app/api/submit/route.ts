import { NextRequest, NextResponse } from 'next/server'

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
