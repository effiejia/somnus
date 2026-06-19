'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DreamCard from '@/components/DreamCard'
import LoadingScreen from '@/components/LoadingScreen'
import { supabase, getDreams, deleteDream } from '@/lib/supabase'
import type { Dream } from '@/lib/types'

export default function DreamLogPage() {
  const router = useRouter()
  const [dreams, setDreams] = useState<Dream[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const cached = sessionStorage.getItem('somnus_dreams')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [filtered, setFiltered] = useState<Dream[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const cached = sessionStorage.getItem('somnus_dreams')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    return !sessionStorage.getItem('somnus_dreams')
  })
  const [showSplash, setShowSplash] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarInitial, setAvatarInitial] = useState(() => {
    if (typeof window === 'undefined') return '?'
    return sessionStorage.getItem('somnus_avatar') ?? '?'
  })

  useEffect(() => {
    if (!sessionStorage.getItem('somnus_splash_seen')) {
      setShowSplash(true)
    }
  }, [])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUserId(user.id)
      const initial = (user.email?.[0] ?? '?').toUpperCase()
      setAvatarInitial(initial)
      sessionStorage.setItem('somnus_avatar', initial)
      const data = await getDreams(user.id)
      setDreams(data)
      setFiltered(data)
      sessionStorage.setItem('somnus_dreams', JSON.stringify(data))
      setLoading(false)
    }
    init()
  }, [router])

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) { setFiltered(dreams); return }
    const lower = q.toLowerCase()
    setFiltered(dreams.filter(d =>
      d.title.toLowerCase().includes(lower) || d.body.toLowerCase().includes(lower)
    ))
  }, [dreams])

  async function handleDelete(id: string) {
    await deleteDream(id)
    const updated = dreams.filter(d => d.id !== id)
    setDreams(updated)
    setFiltered(updated)
  }

  async function handleDeleteSelected() {
    await Promise.all([...selected].map(id => deleteDream(id)))
    const updated = dreams.filter(d => !selected.has(d.id))
    setDreams(updated)
    setFiltered(updated)
    setSelected(new Set())
    setSelecting(false)
  }

  function handleAnalyze(dream: Dream) {
    router.push(`/dream/${dream.id}?analyze=true`)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (showSplash) return <LoadingScreen onDone={() => { sessionStorage.setItem('somnus_splash_seen', '1'); setShowSplash(false) }} />
  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />

  const isEmpty = dreams.length === 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar showSearch={!isEmpty} onSearch={handleSearch} avatarInitial={avatarInitial} onSignOut={handleSignOut} />

      <main className="max-w-3xl mx-auto px-4 md:px-0 pb-24">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-8 text-center">
            <h1 className="font-serif font-medium text-3xl text-[#ededed]">Dream log</h1>
            <p className="text-[#6b6b6b] text-sm max-w-xs">
              You haven&apos;t recorded any dreams yet. Tap the button below to begin.
            </p>
            <button
              onClick={() => router.push('/dream/new')}
              className="mt-4 bg-[#ededed] text-[#0a0a0a] px-6 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors"
            >
              New dream
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-6">
              <h1 className="font-serif font-medium text-3xl text-[#ededed]">Dream log</h1>
              <div className="flex items-center gap-3">
                {selecting ? (
                  <>
                    <button onClick={handleDeleteSelected} disabled={selected.size === 0} className="text-red-400 text-sm disabled:opacity-30">
                      Delete ({selected.size})
                    </button>
                    <button onClick={() => { setSelecting(false); setSelected(new Set()) }} className="text-[#6b6b6b] text-sm">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[#6b6b6b] text-sm">{dreams.length} dream{dreams.length !== 1 ? 's' : ''}</span>
                    <button onClick={() => setSelecting(true)} className="border border-[#333] rounded-full px-3 py-1 text-sm text-[#ededed] hover:border-[#555] transition-colors">
                      Select
                    </button>
                    <button className="text-[#6b6b6b]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-[#1a1a1a]">
              {filtered.map(dream => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  onAnalyze={handleAnalyze}
                  onDelete={handleDelete}
                  selecting={selecting}
                  selected={selected.has(dream.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-[#6b6b6b] text-sm py-16">No results</p>
              )}
            </div>
          </>
        )}
      </main>

      <button
        onClick={() => router.push('/dream/new')}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#ededed] text-[#0a0a0a] rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors text-xl font-light"
      >
        +
      </button>
    </div>
  )
}
