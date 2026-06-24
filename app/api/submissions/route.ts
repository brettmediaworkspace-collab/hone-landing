import { NextRequest, NextResponse } from 'next/server'

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'hone2026'

async function getSubmissions(): Promise<object[]> {
  if (process.env.REDIS_URL) {
    const Redis = (await import('ioredis')).default
    const redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, enableReadyCheck: false })
    const raw = await redis.lrange('hone:submissions', 0, -1)
    await redis.quit()
    return raw.map(s => JSON.parse(s)).reverse()
  } else {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const file = path.join(process.cwd(), 'data', 'submissions.json')
    try { return JSON.parse(await fs.readFile(file, 'utf-8')) } catch { return [] }
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('x-dashboard-password')
  if (auth !== DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const submissions = await getSubmissions()
    return NextResponse.json({ submissions })
  } catch (err) {
    console.error('Submissions fetch error:', err)
    return NextResponse.json({ submissions: [] })
  }
}
