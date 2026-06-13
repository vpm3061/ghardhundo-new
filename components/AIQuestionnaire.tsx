'use client'
import { useState } from 'react'
import { AI_QUESTIONS, calculateScore } from '@/lib/ai-scoring'
import type { AIAnswers } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Step = 'intro' | 'questions' | 'result'

const TIER_CONFIG = {
  HOT: {
    gradient: 'from-red-500/20 to-orange-500/10',
    border: 'rgba(239,68,68,0.3)',
    color: '#EF4444',
    glow: 'rgba(239,68,68,0.15)',
    label: '🔥 HOT LEAD',
    desc: "You're ready to buy! Our top advisors are standing by with perfect matches.",
  },
  WARM: {
    gradient: 'from-amber-500/20 to-yellow-500/10',
    border: 'rgba(245,158,11,0.3)',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.15)',
    label: '☀️ WARM LEAD',
    desc: "Great potential! Let us help you find your ideal property now.",
  },
  COLD: {
    gradient: 'from-blue-500/20 to-indigo-500/10',
    border: 'rgba(59,130,246,0.3)',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.15)',
    label: '💎 EXPLORING',
    desc: "Start your journey with our curated luxury property collection.",
  },
}

export default function AIQuestionnaire({ userId }: { userId: string }) {
  const [step, setStep] = useState<Step>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Partial<AIAnswers>>({})
  const [result, setResult] = useState<{ score: number; tier: 'HOT' | 'WARM' | 'COLD' } | null>(null)
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const handleAnswer = (value: string) => {
    const q = AI_QUESTIONS[currentQ]
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)
    if (currentQ < AI_QUESTIONS.length - 1) {
      setCurrentQ(c => c + 1)
    } else {
      setResult(calculateScore(newAnswers as AIAnswers))
      setStep('result')
    }
  }

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!result) return
    setSubmitting(true)
    const fullAnswers = answers as AIAnswers
    const { data: inserted } = await createClient()
      .from('leads')
      .insert({
        user_id: userId, name: formData.name, phone: formData.phone,
        budget: fullAnswers.budget, timeline: fullAnswers.timeline,
        loan_status: fullAnswers.loan_status, purpose: fullAnswers.purpose,
        city: fullAnswers.city, ai_score: result.score, tier: result.tier, status: 'New',
      })
      .select('id')
      .single()

    // Fire-and-forget: notify admin on HOT leads (score >= 70)
    if (inserted?.id && result.tier === 'HOT') {
      fetch('/api/notify-hot-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: inserted.id }),
      }).catch(() => {/* non-blocking */})
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  const progress = step === 'questions' ? (currentQ / AI_QUESTIONS.length) * 100 : 0

  /* ── INTRO ── */
  if (step === 'intro') {
    return (
      <div className="glass p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span className="text-xs font-700 tracking-wider uppercase" style={{ color: '#A78BFA' }}>AI Property Match</span>
        </div>
        <h2 className="font-heading text-2xl font-800 mb-2 text-[#F1F0FF]">
          Find your perfect property in 60 seconds
        </h2>
        <p className="text-[#8B8BA8] text-sm mb-6 leading-relaxed">
          Answer 5 quick questions — our AI calculates your buyer score and surfaces the best matches instantly.
        </p>
        <button onClick={() => setStep('questions')} className="btn-accent" suppressHydrationWarning>
          Start Matching →
        </button>
      </div>
    )
  }

  /* ── QUESTIONS ── */
  if (step === 'questions') {
    const q = AI_QUESTIONS[currentQ]
    return (
      <div className="glass p-6 md:p-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#8B8BA8]">Question {currentQ + 1} of {AI_QUESTIONS.length}</span>
            <span style={{ color: '#A78BFA' }}>{Math.round(progress + (100 / AI_QUESTIONS.length))}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress + (100 / AI_QUESTIONS.length)}%`, background: 'linear-gradient(to right, #7C3AED, #A78BFA)' }}
            />
          </div>
        </div>

        <h3 className="font-heading text-lg font-700 mb-5 text-[#F1F0FF]">{q.question}</h3>

        <div className="grid gap-2">
          {q.options.map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              suppressHydrationWarning
              className="text-left px-4 py-3.5 rounded-xl text-sm font-500 transition-all group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.1)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.4)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
              }}
            >
              <span className="text-[#8B8BA8] group-hover:text-[#F1F0FF] transition-colors">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ── RESULT ── */
  if (step === 'result' && result) {
    const tc = TIER_CONFIG[result.tier]
    return (
      <div className="glass p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-700 mb-5"
            style={{ background: tc.glow, border: `1px solid ${tc.border}`, color: tc.color }}>
            {tc.label}
          </div>

          {/* Score ring */}
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg width="112" height="112" viewBox="0 0 112 112" className="rotate-[-90deg]">
              <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="56" cy="56" r="46" fill="none" stroke={tc.color} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - result.score / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${tc.color}40)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-3xl font-800" style={{ color: tc.color }}>{result.score}</span>
              <span className="text-[#8B8BA8] text-[10px]">/ 100</span>
            </div>
          </div>

          <p className="text-[#8B8BA8] text-sm max-w-xs mx-auto">{tc.desc}</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmitLead} className="flex flex-col gap-3" suppressHydrationWarning>
            <h4 className="font-heading font-700 text-sm text-[#F1F0FF]">Get personalized recommendations</h4>
            <input
              type="text" className="input-dark" placeholder="Your name" required
              value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} suppressHydrationWarning
            />
            <input
              type="tel" className="input-dark" placeholder="Phone number" required
              value={formData.phone} onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))} suppressHydrationWarning
            />
            <button type="submit" disabled={submitting} className="btn-accent disabled:opacity-50" suppressHydrationWarning>
              {submitting ? 'Saving…' : 'Get Recommendations →'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <p className="font-heading font-700 text-[#F1F0FF] mb-1">Saved! Our team will reach out soon.</p>
            <button onClick={() => router.push('/properties')} className="btn-outline mt-3 text-sm" suppressHydrationWarning>
              Browse Properties →
            </button>
          </div>
        )}

        {!submitted && (
          <button
            onClick={() => { setStep('intro'); setCurrentQ(0); setAnswers({}); setResult(null) }}
            className="w-full text-center text-[#4A4A6A] text-xs mt-3 hover:text-[#8B8BA8] transition-colors"
            suppressHydrationWarning
          >
            Start over
          </button>
        )}
      </div>
    )
  }

  return null
}
