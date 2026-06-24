'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// Extend window so TypeScript knows about fbq
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface FormData {
  gender: string
  age: string
  frequency: string
  goal: string
  time: string
  firstName: string
  email: string
}

// ─── SIGNUP MODAL ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'gender',
    label: "First, a quick one —",
    question: "What's your gender?",
    subtext: "We personalise your training split based on this.",
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  },
  {
    id: 'age',
    label: "Got it.",
    question: "How old are you?",
    subtext: "Cognitive fitness goals shift at different life stages.",
    options: ['Under 25', '25–34', '35–44', '45–54', '55+'],
  },
  {
    id: 'frequency',
    label: "Good to know.",
    question: "How often do you train your brain right now?",
    subtext: "Be honest — we'll meet you where you are.",
    options: ['Never', 'Occasionally', 'A few times a week', 'Every day'],
  },
  {
    id: 'goal',
    label: "Perfect.",
    question: "What's your #1 goal?",
    subtext: "HONE will weight your 6 muscle groups around this.",
    options: ['Sharper Focus', 'Better Memory', 'Faster Reactions', 'All-round Performance'],
    colors: ['#B8F53C', '#A03CF5', '#3C8BF5', '#F58A3C'],
  },
  {
    id: 'time',
    label: "Almost there.",
    question: "When works best for your daily session?",
    subtext: "7 minutes. Your VERA coach will schedule reminders.",
    options: ['Early morning', 'During the day', 'Evening', 'No preference'],
  },
  {
    id: 'email',
    label: "Last step.",
    question: "Where should we send your personalised plan?",
    subtext: "No spam. Just your baseline HONE Score and first workout.",
    isEmail: true,
  },
]

function SignupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    gender: '', age: '', frequency: '', goal: '', time: '', firstName: '', email: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentStep = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  const handleOption = (option: string) => {
    const key = currentStep.id as keyof FormData
    setFormData(prev => ({ ...prev, [key]: option }))
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300)
    }
  }

  const handleSubmit = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        // Fire Meta Pixel Lead event — only fires on successful email capture
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Lead', {
            content_name: formData.goal || 'HONE Assessment',
            content_category: 'Brain Training',
          })
        }
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden" style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
        {/* Progress bar */}
        <div className="h-1 bg-border">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #B8F53C, #3C8BF5)' }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {submitted ? (
            // Success state
            <div className="text-center py-6 animate-fade-in">
              <div className="text-5xl mb-4">🎯</div>
              <div className="text-lime font-mono text-sm mb-2 uppercase tracking-widest">Assessment queued</div>
              <h3 className="text-2xl font-bold mb-3">Your HONE Score awaits.</h3>
              <p className="text-white/60 text-sm mb-6">
                We're building your personalised training plan. Check your inbox — your baseline assessment is on its way.
              </p>
              <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(184,245,60,0.08)', border: '1px solid rgba(184,245,60,0.2)' }}>
                <div className="text-lime text-xs font-mono uppercase tracking-widest mb-1">Sent to</div>
                <div className="font-semibold">{formData.email}</div>
              </div>
              <button onClick={onClose} className="text-white/40 text-sm hover:text-white transition-colors">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Step header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/40 text-xs font-mono uppercase tracking-widest">
                    {step + 1} / {STEPS.length}
                  </span>
                  <button onClick={onClose} className="text-white/30 hover:text-white text-xl transition-colors leading-none">✕</button>
                </div>
                <div className="text-lime text-sm font-medium mb-1">{currentStep.label}</div>
                <h3 className="text-xl sm:text-2xl font-bold leading-tight mb-2">{currentStep.question}</h3>
                <p className="text-white/50 text-sm">{currentStep.subtext}</p>
              </div>

              {/* Options or Email input */}
              {currentStep.isEmail ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/30 text-base outline-none transition-all focus:border-lime"
                    style={{ background: '#0A0A0F', border: '1px solid #1E1E2A' }}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={e => { setFormData(prev => ({ ...prev, email: e.target.value })); setError('') }}
                    className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/30 text-base outline-none transition-all focus:border-lime"
                    style={{ background: '#0A0A0F', border: '1px solid #1E1E2A' }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full rounded-xl py-4 font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: '#B8F53C', color: '#0A0A0F' }}
                  >
                    {loading ? 'Sending...' : 'Get My Training Plan →'}
                  </button>
                  <p className="text-white/30 text-xs text-center">No spam, ever. Unsubscribe anytime.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentStep.options?.map((option, i) => (
                    <button
                      key={option}
                      onClick={() => handleOption(option)}
                      className="w-full text-left rounded-xl px-4 py-3.5 font-medium text-base transition-all hover:border-lime/60 active:scale-[0.98]"
                      style={{
                        background: formData[currentStep.id as keyof FormData] === option
                          ? 'rgba(184,245,60,0.1)' : '#0A0A0F',
                        border: `1px solid ${formData[currentStep.id as keyof FormData] === option ? '#B8F53C' : '#1E1E2A'}`,
                        color: currentStep.colors ? currentStep.colors[i] : 'white',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Back button */}
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="mt-4 text-white/30 text-sm hover:text-white transition-colors"
                >
                  ← Back
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SCREENSHOT CAROUSEL ──────────────────────────────────────────────────────

const screenshots = [
  { src: '/screenshots/01_onboarding_splash.png', label: 'Hook' },
  { src: '/screenshots/02_baseline_score_reveal.png', label: 'Baseline Score' },
  { src: '/screenshots/03_home_dashboard.png', label: 'Dashboard' },
  { src: '/screenshots/04_active_session_focus.png', label: 'Focus Session' },
  { src: '/screenshots/06_set_rest_screen.png', label: 'Rest + Coach' },
  { src: '/screenshots/07_session_complete.png', label: 'Session Complete' },
  { src: '/screenshots/08_pr_card_personal_record.png', label: 'PR Card' },
  { src: '/screenshots/09_progress_history.png', label: 'Progress' },
  { src: '/screenshots/10_day90_milestone_card.png', label: 'Day 90' },
]

function ScreenshotCarousel({ onCTA }: { onCTA: () => void }) {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % screenshots.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative">
      {/* Main image */}
      <div className="flex justify-center mb-6">
        <div
          className="relative rounded-[2.5rem] overflow-hidden shadow-2xl"
          style={{
            width: 220, height: 390,
            boxShadow: '0 0 80px rgba(184,245,60,0.15), 0 40px 80px rgba(0,0,0,0.6)',
            border: '2px solid #1E1E2A',
          }}
        >
          <Image
            src={screenshots[active].src}
            alt={screenshots[active].label}
            fill
            className="object-cover transition-opacity duration-500"
            sizes="220px"
          />
        </div>
      </div>

      {/* Thumbnail strip */}
      <div ref={ref} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
        {screenshots.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200"
            style={{
              width: 40, height: 70,
              border: `2px solid ${active === i ? '#B8F53C' : 'transparent'}`,
              opacity: active === i ? 1 : 0.4,
            }}
          >
            <Image src={s.src} alt={s.label} width={40} height={70} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── MUSCLE GROUP CARD ────────────────────────────────────────────────────────

const muscles = [
  { name: 'FOCUS', icon: '◎', color: '#B8F53C', desc: 'Sustained attention and deep work' },
  { name: 'SPEED', icon: '⚡', color: '#3C8BF5', desc: 'Processing rate and reaction time' },
  { name: 'MEMORY', icon: '◈', color: '#A03CF5', desc: 'Working memory and recall' },
  { name: 'LOGIC', icon: '⬡', color: '#F58A3C', desc: 'Problem solving and pattern recognition' },
  { name: 'WORDS', icon: '◊', color: '#3CF5D1', desc: 'Verbal fluency and language processing' },
  { name: 'CONTROL', icon: '⊕', color: '#F5503C', desc: 'Impulse inhibition and decision quality' },
]

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: 'Marcus T.',
    role: 'Management Consultant, 38',
    text: "I've tried Lumosity, Elevate, everything. HONE is the only one that felt like actually training, not playing. The progressive overload is real.",
    score: 847,
    delta: '+163',
  },
  {
    name: 'Sarah K.',
    role: 'Product Manager, 29',
    text: "Hit my first FOCUS PR after 3 weeks. I genuinely couldn't believe a number on an app made me feel that proud. Shared the card immediately.",
    score: 912,
    delta: '+241',
  },
  {
    name: 'James R.',
    role: 'Retired Military, 45',
    text: "7 minutes every morning before coffee. My HONE Score has gone from 601 to 778 in 8 weeks. My reaction times have never been sharper.",
    score: 778,
    delta: '+177',
  },
]

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false)
  const [scoreVisible, setScoreVisible] = useState(false)
  const scoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setScoreVisible(true) },
      { threshold: 0.3 }
    )
    if (scoreRef.current) observer.observe(scoreRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-bg text-white overflow-x-hidden">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="font-black text-xl tracking-widest" style={{ letterSpacing: '0.15em' }}>
          H<span style={{ color: '#B8F53C' }}>O</span>NE
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: '#B8F53C', color: '#0A0A0F' }}
        >
          Start Free →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-16 px-5 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #B8F53C 0%, transparent 70%)' }} />

        <div className="relative max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-mono uppercase tracking-widest"
            style={{ background: 'rgba(184,245,60,0.1)', border: '1px solid rgba(184,245,60,0.3)', color: '#B8F53C' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse-slow" />
            Now available — free assessment
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] mb-5 tracking-tight">
            Your brain has{' '}
            <span style={{ color: '#B8F53C' }} className="lime-text-glow">6 muscle groups.</span>
            <br />
            You've been neglecting 4.
          </h1>

          <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-sm mx-auto">
            HONE is the first cognitive fitness app built like a gym program — with warm-ups, progressive overload, and a personal AI coach.
            <span className="text-white font-medium"> 7 minutes a day.</span>
          </p>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 rounded-2xl py-4 px-8 font-bold text-lg transition-all hover:scale-105 active:scale-95 lime-glow"
            style={{ background: '#B8F53C', color: '#0A0A0F' }}
          >
            Start My Free Assessment
            <span className="text-xl">→</span>
          </button>
          <p className="mt-3 text-white/30 text-xs">Takes 60 seconds. No credit card.</p>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="py-6 px-5" style={{ background: '#13131A', borderTop: '1px solid #1E1E2A', borderBottom: '1px solid #1E1E2A' }}>
        <div className="max-w-lg mx-auto flex items-center justify-around gap-4 text-center">
          {[
            { num: '47K+', label: 'Waitlist' },
            { num: '4.9★', label: 'Beta rating' },
            { num: '7 min', label: 'Daily session' },
            { num: '90 days', label: 'To transform' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="font-mono font-bold text-xl" style={{ color: '#B8F53C' }}>{num}</div>
              <div className="text-white/40 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCREENSHOTS ── */}
      <section className="py-16 px-5">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="text-lime text-xs font-mono uppercase tracking-widest mb-3">The App</div>
            <h2 className="text-3xl font-black leading-tight">Built for people who<br />take performance seriously.</h2>
          </div>
          <ScreenshotCarousel onCTA={() => setModalOpen(true)} />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-5" style={{ background: '#13131A' }}>
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="text-lime text-xs font-mono uppercase tracking-widest mb-3">The Method</div>
            <h2 className="text-3xl font-black">7 minutes. Every day.<br />Watch what happens.</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '01',
                title: 'Baseline assessment',
                desc: 'VERA runs a 7-minute diagnostic across all 6 cognitive muscle groups and assigns your starting HONE Score (0–1000).',
                color: '#B8F53C',
              },
              {
                num: '02',
                title: 'Daily structured workout',
                desc: 'Warm-up → Set 1 → Rest → Set 2 → Rest → Set 3/Finisher → Cooldown. Your AI coach adapts difficulty after every session.',
                color: '#3C8BF5',
              },
              {
                num: '03',
                title: 'PR Cards + weekly benchmarks',
                desc: 'Hit a personal record in any muscle group and HONE generates a shareable PR Card. Your Weekly 1-Rep Max updates every Sunday.',
                color: '#A03CF5',
              },
            ].map(({ num, title, desc, color }) => (
              <div key={num} className="rounded-2xl p-5 flex gap-4 items-start"
                style={{ background: '#0A0A0F', border: '1px solid #1E1E2A' }}>
                <div className="font-mono text-2xl font-bold flex-shrink-0 w-10" style={{ color }}>{num}</div>
                <div>
                  <div className="font-bold mb-1">{title}</div>
                  <div className="text-white/50 text-sm leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 MUSCLE GROUPS ── */}
      <section className="py-16 px-5">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="text-lime text-xs font-mono uppercase tracking-widest mb-3">The Science</div>
            <h2 className="text-3xl font-black">6 cognitive muscle groups.<br />Most apps train 1.</h2>
            <p className="text-white/50 mt-3 text-sm max-w-sm mx-auto">
              Every HONE workout trains a deliberate combination. Progressive overload ensures you're always working at the edge of your ability.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {muscles.map(({ name, icon, color, desc }) => (
              <div key={name} className="rounded-2xl p-4 transition-all hover:scale-[1.02]"
                style={{ background: '#13131A', border: `1px solid ${color}22` }}>
                <div className="text-2xl mb-2" style={{ color }}>{icon}</div>
                <div className="font-bold text-sm font-mono mb-1" style={{ color }}>{name}</div>
                <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HONE SCORE ── */}
      <section ref={scoreRef} className="py-16 px-5" style={{ background: '#13131A' }}>
        <div className="max-w-lg mx-auto text-center">
          <div className="text-lime text-xs font-mono uppercase tracking-widest mb-3">Your Weekly Benchmark</div>
          <h2 className="text-3xl font-black mb-4">One number to beat.</h2>
          <p className="text-white/50 text-sm mb-10 max-w-sm mx-auto">
            Your HONE Score is a composite of all 6 muscle groups, updated weekly. It's your cognitive 1-Rep Max.
          </p>

          <div className="relative inline-block mb-8">
            <div className="w-40 h-40 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: 'conic-gradient(#B8F53C 0% 68%, #1E1E2A 68% 100%)',
                padding: '3px',
              }}>
              <div className="w-full h-full rounded-full flex flex-col items-center justify-center"
                style={{ background: '#0A0A0F' }}>
                <div className="font-mono font-bold text-4xl" style={{ color: '#B8F53C' }}>
                  {scoreVisible ? '684' : '---'}
                </div>
                <div className="text-white/40 text-xs font-mono uppercase tracking-widest mt-1">HONE SCORE</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'FOCUS', val: 71, color: '#B8F53C' },
              { label: 'SPEED', val: 58, color: '#3C8BF5' },
              { label: 'MEMORY', val: 64, color: '#A03CF5' },
              { label: 'LOGIC', val: 79, color: '#F58A3C' },
              { label: 'WORDS', val: 55, color: '#3CF5D1' },
              { label: 'CONTROL', val: 68, color: '#F5503C' },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: '#0A0A0F', border: '1px solid #1E1E2A' }}>
                <div className="text-xs font-mono mb-1.5" style={{ color }}>{label}</div>
                <div className="w-full bg-border rounded-full h-1 mb-1">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: scoreVisible ? `${val}%` : '0%', background: color }} />
                </div>
                <div className="text-white/50 text-xs font-mono">{val}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PR CARD VIRAL SECTION ── */}
      <section className="py-16 px-5">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="text-lime text-xs font-mono uppercase tracking-widest mb-3">Viral Moment</div>
            <h2 className="text-3xl font-black">The PR Card.</h2>
            <p className="text-white/50 mt-3 text-sm max-w-xs mx-auto">
              Hit a personal record in any muscle group and HONE generates a shareable graphic. People don't just share gains — they share proof.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative rounded-[2rem] overflow-hidden"
              style={{
                width: 240, height: 424,
                border: '2px solid rgba(184,245,60,0.3)',
                boxShadow: '0 0 60px rgba(184,245,60,0.2)',
              }}>
              <Image
                src="/screenshots/08_pr_card_personal_record.png"
                alt="HONE PR Card"
                fill
                className="object-cover"
                sizes="240px"
              />
            </div>
          </div>

          <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(184,245,60,0.05)', border: '1px solid rgba(184,245,60,0.2)' }}>
            <div className="text-lime font-bold mb-1">FOCUS 912 — PERSONAL RECORD</div>
            <div className="text-white/50 text-sm">One tap. Auto-generated. Ready for Stories.</div>
          </div>
        </div>
      </section>

      {/* ── DAY 90 TRANSFORMATION ── */}
      <section className="py-16 px-5" style={{ background: '#13131A' }}>
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="text-lime text-xs font-mono uppercase tracking-widest mb-3">90-Day Challenge</div>
            <h2 className="text-3xl font-black">641 → 903.<br />In 90 days.</h2>
            <p className="text-white/50 mt-3 text-sm max-w-xs mx-auto">
              Every user who completes 90 consecutive days gets a personalised transformation card. This is what makes people share.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative rounded-[2rem] overflow-hidden"
              style={{
                width: 240, height: 424,
                border: '2px solid rgba(60,139,245,0.3)',
                boxShadow: '0 0 60px rgba(60,139,245,0.2)',
              }}>
              <Image
                src="/screenshots/10_day90_milestone_card.png"
                alt="Day 90 Milestone"
                fill
                className="object-cover"
                sizes="240px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── VERA AI COACH ── */}
      <section className="py-16 px-5">
        <div className="max-w-lg mx-auto">
          <div className="rounded-3xl overflow-hidden" style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
            <div className="p-6">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-mono uppercase tracking-widest"
                style={{ background: 'rgba(60,139,245,0.1)', border: '1px solid rgba(60,139,245,0.3)', color: '#3C8BF5' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: '#3C8BF5' }} />
                AI Coach
              </div>
              <h2 className="text-2xl font-black mb-3">Meet VERA.</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Voice. Endurance. Recall. Adaptation. Your personal cognitive coach adapts difficulty in real-time, monitors fatigue patterns, and tells you when to push — and when to rest.
              </p>

              <div className="rounded-xl p-4" style={{ background: '#0A0A0F', border: '1px solid #1E1E2A' }}>
                <div className="text-xs font-mono mb-2" style={{ color: '#3C8BF5' }}>VERA — POST SESSION NOTE</div>
                <p className="text-white/70 text-sm italic leading-relaxed">
                  "Your FOCUS response time dropped 18ms in the final set — classic late-session fatigue. Tomorrow: lighter intensity, priority on CONTROL. Sleep before 11pm if you can."
                </p>
              </div>
            </div>

            <div className="relative h-48 overflow-hidden">
              <Image
                src="/screenshots/06_set_rest_screen.png"
                alt="VERA Rest Screen"
                fill
                className="object-cover object-top"
                sizes="500px"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #13131A 0%, transparent 30%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 px-5" style={{ background: '#13131A' }}>
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="text-lime text-xs font-mono uppercase tracking-widest mb-3">Beta Users</div>
            <h2 className="text-3xl font-black">What happens after<br />7 minutes a day.</h2>
          </div>

          <div className="space-y-4">
            {testimonials.map(({ name, role, text, score, delta }) => (
              <div key={name} className="rounded-2xl p-5" style={{ background: '#0A0A0F', border: '1px solid #1E1E2A' }}>
                <p className="text-white/80 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-white/40 text-xs">{role}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold" style={{ color: '#B8F53C' }}>{score}</div>
                    <div className="text-xs font-mono" style={{ color: '#B8F53C' }}>{delta} pts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="py-16 px-5">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="text-lime text-xs font-mono uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-3xl font-black">Start free.<br />Upgrade when you're hooked.</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl p-5" style={{ background: '#13131A', border: '1px solid #1E1E2A' }}>
              <div className="flex justify-between items-center mb-3">
                <div className="font-bold">Free</div>
                <div className="font-mono text-xl font-bold">$0</div>
              </div>
              <ul className="space-y-2 text-sm text-white/60">
                {['3 workouts per week', 'HONE Score tracking', 'Progress history (30 days)', 'VERA coach (basic)'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span style={{ color: '#B8F53C' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(184,245,60,0.08), rgba(60,139,245,0.08))', border: '1px solid rgba(184,245,60,0.3)' }}>
              <div className="absolute top-3 right-3 text-xs font-mono px-2 py-1 rounded-full"
                style={{ background: '#B8F53C', color: '#0A0A0F' }}>
                MOST POPULAR
              </div>
              <div className="flex justify-between items-center mb-3">
                <div className="font-bold" style={{ color: '#B8F53C' }}>HONE Pro</div>
                <div>
                  <div className="font-mono text-xl font-bold">$9.99<span className="text-sm text-white/40">/mo</span></div>
                  <div className="text-white/40 text-xs text-right">$59.99/yr</div>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-white/80">
                {[
                  'Unlimited daily workouts',
                  'All 6 cognitive muscle groups',
                  'VERA coach — full adaptive mode',
                  'PR Cards + Social sharing',
                  'Split programme selector',
                  'Unlimited progress history',
                  '90-Day Transformation Card',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span style={{ color: '#B8F53C' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-5" style={{ background: '#13131A', borderTop: '1px solid #1E1E2A' }}>
        <div className="max-w-lg mx-auto text-center">
          <div className="text-lime text-xs font-mono uppercase tracking-widest mb-4">Sharpen daily.</div>
          <h2 className="text-4xl font-black mb-4 leading-tight">
            Your brain deserves<br />the same effort<br />
            <span style={{ color: '#B8F53C' }}>as everything else.</span>
          </h2>
          <p className="text-white/50 text-base mb-8 max-w-sm mx-auto">
            Join 47,000+ people on the waitlist. Your HONE Score assessment is free.
          </p>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 rounded-2xl py-4 px-8 font-bold text-lg transition-all hover:scale-105 active:scale-95 lime-glow mb-4"
            style={{ background: '#B8F53C', color: '#0A0A0F' }}
          >
            Start My Free Assessment →
          </button>

          <p className="text-white/20 text-xs">No credit card. 60-second signup. Cancel anytime.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-5" style={{ borderTop: '1px solid #1E1E2A' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="font-black text-base tracking-widest">
            H<span style={{ color: '#B8F53C' }}>O</span>NE
          </div>
          <div className="text-white/20 text-xs">© 2026 HONE. honeyourmind.app</div>
        </div>
      </footer>

      {/* ── MODAL ── */}
      {modalOpen && <SignupModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
