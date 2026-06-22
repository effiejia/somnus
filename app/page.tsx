'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DreamCard, { formatRelativeDate } from '@/components/DreamCard'
import { DeleteIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'
import { supabase, getDreams, deleteDream, getSharedWithMe, removeSharedWithMe } from '@/lib/supabase'
import type { Dream, SharedDream } from '@/lib/types'

const MOCK_SHARED = process.env.NODE_ENV === 'development'

const MOCK_SHARED_ENTRIES: SharedDream[] = [
  {
    id: 'mock-shared-1',
    viewer_id: 'mock-viewer',
    dream_id: 'mock-dream-1',
    sharer_email: 'afoyer@example.com',
    saved_at: new Date().toISOString(),
    dream: {
      id: 'mock-dream-1',
      user_id: 'mock-user',
      title: 'The glass hallway',
      body: 'I was walking through a hallway made entirely of glass. Each panel reflected a different version of me — some younger, some I didn\'t recognise at all.',
      analysis: null,
      analyzed_body: null,
      share_token: 'mock-token-1',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    },
  },
  {
    id: 'mock-shared-2',
    viewer_id: 'mock-viewer',
    dream_id: 'mock-dream-2',
    sharer_email: 'afoyer@example.com',
    saved_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    dream: {
      id: 'mock-dream-2',
      user_id: 'mock-user',
      title: 'Running through the airport',
      body: 'Late for a flight I couldn\'t find on the departures board. Every gate number I reached turned into a different one.',
      analysis: '**Emotional tone:** High anxiety with an undercurrent of helplessness.\n\n**Key symbols:**\n- *The airport* — transition, anticipation of change\n- *Missing gate* — fear of missing an opportunity\n\n**Possible interpretation:** A deadline or decision is weighing on you.',
      analyzed_body: 'Late for a flight I couldn\'t find on the departures board.',
      share_token: 'mock-token-2',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    },
  },
]

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
  const [tab, setTab] = useState<'my' | 'shared'>('my')
  const [sharedWithMe, setSharedWithMe] = useState<SharedDream[]>([])
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
      const shared = await getSharedWithMe(user.id)
      setSharedWithMe(MOCK_SHARED ? [...MOCK_SHARED_ENTRIES, ...shared] : shared)
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

  async function handleRemoveSelected() {
    await Promise.all([...selected].map(id => removeSharedWithMe(id)))
    setSharedWithMe(prev => prev.filter(e => !selected.has(e.dream_id)))
    setSelected(new Set())
    setSelecting(false)
  }

  function handleAnalyze(dream: Dream) {
    router.push(`/dream/${dream.id}?analyze=true`)
  }

  function handleViewAnalysis(dream: Dream) {
    router.push(`/dream/${dream.id}?view=true`)
  }

  async function handleRemoveShared(dreamId: string) {
    await removeSharedWithMe(dreamId)
    setSharedWithMe(prev => prev.filter(s => s.dream_id !== dreamId))
  }

  function handleTokenChange(id: string, token: string | null) {
    const update = (list: Dream[]) => list.map(d => d.id === id ? { ...d, share_token: token } : d)
    setDreams(prev => update(prev))
    setFiltered(prev => update(prev))
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
            <h1 className="font-serif font-medium text-3xl text-[#ededed] py-6">Dream log</h1>

            {/* Tab strip + controls */}
            <div className="flex items-center justify-between border-b border-[#1a1a1a] h-11">
              <div className="flex gap-4">
                <button
                  onClick={() => { setTab('my'); setSelecting(false); setSelected(new Set()) }}
                  className={`pb-3 text-sm transition-colors ${tab === 'my' ? 'text-[#ededed] border-b-2 border-[#ededed] -mb-px' : 'text-[#555] hover:text-[#888]'}`}
                >
                  My dreams
                </button>
                <button
                  onClick={() => { setTab('shared'); setSelecting(false); setSelected(new Set()) }}
                  className={`pb-3 text-sm transition-colors flex items-center gap-1.5 ${tab === 'shared' ? 'text-[#ededed] border-b-2 border-[#ededed] -mb-px' : 'text-[#555] hover:text-[#888]'}`}
                >
                  Shared with you
                  {sharedWithMe.length > 0 && (
                    <span className={`text-xs rounded-full px-1.5 py-0.5 ${tab === 'shared' ? 'bg-[#222] text-[#888]' : 'bg-[#1a1a1a] text-[#555]'}`}>
                      {sharedWithMe.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {tab === 'my' && (
                  selecting ? (
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
                    </>
                  )
                )}
                {tab === 'shared' && (
                  selecting ? (
                    <>
                      <button onClick={handleRemoveSelected} disabled={selected.size === 0} className="text-red-400 text-sm disabled:opacity-30">
                        Remove ({selected.size})
                      </button>
                      <button onClick={() => { setSelecting(false); setSelected(new Set()) }} className="text-[#6b6b6b] text-sm">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[#6b6b6b] text-sm">{sharedWithMe.length} dream{sharedWithMe.length !== 1 ? 's' : ''}</span>
                      <button onClick={() => setSelecting(true)} className="border border-[#333] rounded-full px-3 py-1 text-sm text-[#ededed] hover:border-[#555] transition-colors">
                        Select
                      </button>
                    </>
                  )
                )}
              </div>
            </div>

            {tab === 'my' && (
              <div>
                {filtered.map(dream => (
                  <DreamCard
                    key={dream.id}
                    dream={dream}
                    onAnalyze={handleAnalyze}
                    onViewAnalysis={handleViewAnalysis}
                    onDelete={handleDelete}
                    onTokenChange={handleTokenChange}
                    selecting={selecting}
                    selected={selected.has(dream.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-[#6b6b6b] text-sm py-16">No results</p>
                )}
              </div>
            )}

            {tab === 'shared' && (
              <div>
                {sharedWithMe.length === 0 ? (
                  <p className="text-center text-[#6b6b6b] text-sm py-16">No dreams have been shared with you yet.</p>
                ) : (
                  sharedWithMe.map(entry => (
                    <div
                      key={entry.id}
                      onClick={() => {
                        if (selecting) { toggleSelect(entry.dream_id); return }
                        if (MOCK_SHARED && entry.id.startsWith('mock-')) {
                          sessionStorage.setItem('somnus_mock_shared_dream', JSON.stringify(entry.dream))
                        }
                        router.push(`/share/${entry.dream.share_token}`)
                      }}
                      className={`group/card relative border-b border-[#1a1a1a] px-4 py-4 cursor-pointer transition-colors hover:bg-[#111111] md:hover:bg-transparent ${selected.has(entry.dream_id) ? 'bg-[#111111]' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-16">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center flex-shrink-0 text-xs text-[#ededed] uppercase">
                            {entry.sharer_email[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-serif font-medium text-[#ededed] text-lg leading-snug truncate mb-1">
                              {entry.dream.title || 'Untitled'}
                            </h3>
                            <p className="text-[#6b6b6b] text-sm leading-snug truncate">
                              <span className="text-[#444]">{formatRelativeDate(entry.dream.created_at)}</span>
                              {entry.dream.body && <>{' · '}{entry.dream.body}</>}
                            </p>
                          </div>
                        </div>
                        <div className="relative flex-shrink-0 flex items-center">
                          {selecting && (
                            <div className="absolute inset-0 flex items-center justify-end">
                              <div className={`w-4 h-4 rounded-full border ${selected.has(entry.dream_id) ? 'bg-blue-500 border-blue-500' : 'border-[#444]'}`} />
                            </div>
                          )}
                          <div className={`flex items-center gap-2 transition-opacity flex-shrink-0 ${selecting ? 'opacity-0 pointer-events-none' : 'opacity-100 md:opacity-0 md:group-hover/card:opacity-100'}`}>
                            <div className="relative group/btn">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveShared(entry.dream_id) }}
                                className="text-[#6b6b6b] hover:text-[#888] p-1 transition-colors"
                                aria-label="Remove"
                              >
                                <DeleteIcon className="w-4 h-4" />
                              </button>
                              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                Remove
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
