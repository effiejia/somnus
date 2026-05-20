'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DreamCard from '@/components/DreamCard'
import LoadingScreen from '@/components/LoadingScreen'
import type { Dream } from '@/lib/types'

// Placeholder user — replaced by real auth later
const MOCK_USER_ID = 'demo-user'

export default function DreamLogPage() {
  const router = useRouter()
  const [dreams, setDreams] = useState<Dream[]>([])
  const [filtered, setFiltered] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load from localStorage until Supabase is configured
    const stored = localStorage.getItem('somnus_dreams')
    const data: Dream[] = stored ? JSON.parse(stored) : []
    setDreams(data)
    setFiltered(data)
    setLoading(false)
  }, [])

  function saveDreams(updated: Dream[]) {
    localStorage.setItem('somnus_dreams', JSON.stringify(updated))
    setDreams(updated)
    setFiltered(updated)
  }

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setFiltered(dreams)
    } else {
      const lower = q.toLowerCase()
      setFiltered(dreams.filter(d =>
        d.title.toLowerCase().includes(lower) || d.body.toLowerCase().includes(lower)
      ))
    }
  }, [dreams])

  function handleDelete(id: string) {
    saveDreams(dreams.filter(d => d.id !== id))
  }

  function handleDeleteSelected() {
    saveDreams(dreams.filter(d => !selected.has(d.id)))
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

  if (showSplash) {
    return <LoadingScreen onDone={() => setShowSplash(false)} />
  }

  const isEmpty = dreams.length === 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar showSearch={!isEmpty} onSearch={handleSearch} />

      <main className="max-w-2xl mx-auto px-0 md:px-4 pb-24">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-8 text-center">
            <h1 className="font-serif text-3xl text-[#ededed]">Dream log</h1>
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
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-0 py-6">
              <div>
                <h1 className="font-serif text-3xl text-[#ededed]">Dream log</h1>
              </div>
              <div className="flex items-center gap-3">
                {selecting ? (
                  <>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selected.size === 0}
                      className="text-red-400 text-sm disabled:opacity-30"
                    >
                      Delete ({selected.size})
                    </button>
                    <button onClick={() => { setSelecting(false); setSelected(new Set()) }} className="text-[#6b6b6b] text-sm">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[#6b6b6b] text-sm">{dreams.length} dream{dreams.length !== 1 ? 's' : ''}</span>
                    <button
                      onClick={() => setSelecting(true)}
                      className="border border-[#333] rounded-full px-3 py-1 text-sm text-[#ededed] hover:border-[#555] transition-colors"
                    >
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

            {/* Dream list */}
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

      {/* FAB */}
      <button
        onClick={() => router.push('/dream/new')}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#ededed] text-[#0a0a0a] rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors text-xl font-light"
      >
        +
      </button>
    </div>
  )
}
