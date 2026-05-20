'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('signin')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-7 h-7 bg-[#ededed] rounded-sm flex items-center justify-center">
            <span className="text-[#0a0a0a] text-xs font-bold">S</span>
          </div>
          <span className="text-[#ededed] text-sm font-medium">Somnus</span>
        </div>

        <h1 className="font-serif text-2xl text-[#ededed] mb-1 text-center">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-[#6b6b6b] text-sm text-center mb-8">
          {mode === 'signin' ? 'Sign in to your dream log' : 'Start recording your dreams'}
        </p>

        {message && (
          <p className="text-green-400 text-sm text-center mb-6">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-[#ededed] placeholder-[#444] outline-none focus:border-[#444] transition-colors text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-[#ededed] placeholder-[#444] outline-none focus:border-[#444] transition-colors text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ededed] text-[#0a0a0a] rounded-lg py-3 text-sm font-medium hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[#6b6b6b] text-sm mt-6">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="text-[#ededed] hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
