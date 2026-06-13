'use client'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const error = searchParams.get('error')

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirect}` },
    })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)', animation: 'float-orb 8s ease-in-out infinite', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.4) 0%, transparent 70%)', animation: 'float-orb 10s ease-in-out infinite 2s', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.5) 0%, transparent 70%)', animation: 'float-orb 12s ease-in-out infinite 4s', filter: 'blur(50px)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 0 32px rgba(124,58,237,0.5)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            </div>
          </div>
          <h1 className="font-heading text-4xl font-800 tracking-tight text-[#F1F0FF] mb-2">GharDhundo</h1>
          <p className="text-[#8B8BA8] text-sm">AI-powered real estate for India</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(18,18,26,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px' }}>
          <h2 className="font-heading text-xl font-800 mb-1 text-[#F1F0FF]">Welcome back</h2>
          <p className="text-[#8B8BA8] text-sm mb-7">Sign in to continue your property search</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              Authentication failed. Please try again.
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 px-4 font-600 text-sm transition-all"
            style={{ background: '#fff', color: '#0A0A0F', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-[#4A4A6A]" style={{ background: 'rgba(18,18,26,0.85)' }}>Secure sign-in</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#4A4A6A]">
            {['🔒 256-bit encryption', '✓ GDPR compliant', '🇮🇳 India-first'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <p className="text-center text-[#4A4A6A] text-xs mt-5">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>
}
