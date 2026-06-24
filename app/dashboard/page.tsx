'use client'

import { useState, useEffect, useCallback } from 'react'

interface Submission {
  id: string
  timestamp: string
  gender: string
  age: string
  frequency: string
  goal: string
  time: string
  firstName: string
  email: string
}

const DASHBOARD_PASSWORD = 'hone2026'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatCard({ label, value, color = '#B8F53C' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
      <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
      <div className="font-mono font-bold text-2xl" style={{ color }}>{value}</div>
    </div>
  )
}

function groupBy(arr: Submission[], key: keyof Submission) {
  return arr.reduce<Record<string, number>>((acc, s) => {
    const v = s[key] || 'Unknown'
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})
}

function BreakdownBar({ data, color }: { data: Record<string, number>; color: string }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  if (!total) return <div className="text-white/30 text-sm">No data yet</div>
  return (
    <div className="space-y-2">
      {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
        <div key={key} className="flex items-center gap-3">
          <div className="text-sm text-white/70 w-32 truncate">{key}</div>
          <div className="flex-1 bg-border rounded-full h-1.5">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(count / total) * 100}%`, background: color }} />
          </div>
          <div className="text-xs font-mono text-white/40 w-8 text-right">{count}</div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'overview' | 'table'>('overview')

  const fetchSubmissions = useCallback(async (password: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/submissions', {
        headers: { 'x-dashboard-password': password },
      })
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem('hone_dash_auth')
    if (stored === DASHBOARD_PASSWORD) {
      setAuthed(true)
      fetchSubmissions(stored)
    }
  }, [fetchSubmissions])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === DASHBOARD_PASSWORD) {
      sessionStorage.setItem('hone_dash_auth', pw)
      setAuthed(true)
      fetchSubmissions(pw)
    } else {
      setPwError('Incorrect password.')
    }
  }

  const exportCSV = () => {
    if (!submissions.length) return
    const headers = ['ID', 'Timestamp', 'Gender', 'Age', 'Frequency', 'Goal', 'Time', 'First Name', 'Email']
    const rows = submissions.map(s => [
      s.id, s.timestamp, s.gender, s.age, s.frequency, s.goal, s.time, s.firstName, s.email
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hone-submissions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── LOGIN ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="font-black text-3xl tracking-widest mb-2">
              H<span style={{ color: '#B8F53C' }}>O</span>NE
            </div>
            <div className="text-white/40 text-sm">Submission Dashboard</div>
          </div>

          <form onSubmit={handleLogin} className="rounded-2xl p-6"
            style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
            <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError('') }}
              placeholder="Enter dashboard password"
              className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 text-base outline-none mb-3"
              style={{ background: '#0A0A0F', border: '1px solid #1E1E2A' }}
              autoFocus
            />
            {pwError && <p className="text-red-400 text-sm mb-3">{pwError}</p>}
            <button type="submit"
              className="w-full rounded-xl py-3 font-bold text-base"
              style={{ background: '#B8F53C', color: '#0A0A0F' }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── STATS ──
  const today = new Date().toDateString()
  const todayCount = submissions.filter(s => new Date(s.timestamp).toDateString() === today).length

  const genderData = groupBy(submissions, 'gender')
  const ageData = groupBy(submissions, 'age')
  const goalData = groupBy(submissions, 'goal')
  const timeData = groupBy(submissions, 'time')

  // ── DASHBOARD ──
  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1E1E2A' }}>
        <div>
          <div className="font-black text-lg tracking-widest">
            H<span style={{ color: '#B8F53C' }}>O</span>NE
            <span className="text-white/30 text-xs font-normal ml-2 tracking-normal">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchSubmissions(DASHBOARD_PASSWORD)}
            className="text-white/40 text-xs hover:text-white transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid #1E1E2A' }}>
            ↻ Refresh
          </button>
          <button onClick={exportCSV}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: '#B8F53C', color: '#0A0A0F' }}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="p-5 max-w-2xl mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Total signups" value={loading ? '...' : submissions.length} />
          <StatCard label="Today" value={loading ? '...' : todayCount} color="#3C8BF5" />
          <StatCard label="Conv. rate" value="—" color="#A03CF5" />
        </div>

        {/* View toggle */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                background: view === v ? '#B8F53C' : '#13131A',
                color: view === v ? '#0A0A0F' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${view === v ? '#B8F53C' : '#1E1E2A'}`,
              }}>
              {v}
            </button>
          ))}
        </div>

        {view === 'overview' ? (
          <div className="space-y-4">
            {/* Goal breakdown */}
            <div className="rounded-2xl p-5" style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Primary Goal</div>
              <BreakdownBar data={goalData} color="#B8F53C" />
            </div>
            <div className="rounded-2xl p-5" style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Gender</div>
              <BreakdownBar data={genderData} color="#3C8BF5" />
            </div>
            <div className="rounded-2xl p-5" style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Age Range</div>
              <BreakdownBar data={ageData} color="#A03CF5" />
            </div>
            <div className="rounded-2xl p-5" style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Preferred Training Time</div>
              <BreakdownBar data={timeData} color="#F58A3C" />
            </div>
          </div>
        ) : (
          /* Table view */
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1E1E2A' }}>
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-sm">
                {loading ? 'Loading...' : 'No submissions yet. Share your landing page to start collecting data.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#13131A', borderBottom: '1px solid #1E1E2A' }}>
                      {['Date', 'Name', 'Email', 'Goal', 'Age', 'Gender'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-white/30">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...submissions].reverse().map((s, i) => (
                      <tr key={s.id}
                        style={{
                          background: i % 2 === 0 ? '#0A0A0F' : '#13131A',
                          borderBottom: '1px solid #1E1E2A',
                        }}>
                        <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{formatDate(s.timestamp)}</td>
                        <td className="px-4 py-3 text-white/80">{s.firstName || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: '#B8F53C' }}>{s.email}</td>
                        <td className="px-4 py-3 text-white/70">{s.goal || '—'}</td>
                        <td className="px-4 py-3 text-white/50">{s.age || '—'}</td>
                        <td className="px-4 py-3 text-white/50">{s.gender || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
