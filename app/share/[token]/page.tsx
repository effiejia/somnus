'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AnalysisPanel from '@/components/AnalysisPanel'
import { DeleteIcon } from '@/components/icons'
import { getDreamByShareToken, saveSharedDream, removeSharedWithMe, supabase } from '@/lib/supabase'
import type { Dream } from '@/lib/types'

export default function SharedDreamPage() {
  const { token } = useParams() as { token: string }
  const router = useRouter()
  const [dream, setDream] = useState<Dream | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [sharerEmail, setSharerEmail] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [avatarInitial] = useState(() => {
    if (typeof window === 'undefined') return 'E'
    return sessionStorage.getItem('somnus_avatar') ?? 'E'
  })

  useEffect(() => {
    async function load() {
      let found = await getDreamByShareToken(token)
      if (!found) {
        try {
          const cached = sessionStorage.getItem('somnus_mock_shared_dream')
          if (cached) found = JSON.parse(cached)
        } catch { /* ignore */ }
      }
      if (!found) { setNotFound(true); return }
      setDream(found)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id === found.user_id) return

      try {
        const email = await saveSharedDream(found.id)
        setSharerEmail(email)
        setIsSaved(true)
      } catch {
        // Already saved — fetch sharer email from shared_with_me
        const { data } = await supabase
          .from('shared_with_me')
          .select('sharer_email')
          .eq('dream_id', found.id)
          .single()
        if (data) setSharerEmail(data.sharer_email)
        setIsSaved(true)
      }
    }
    load()
  }, [token])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleRemove() {
    if (!dream) return
    await removeSharedWithMe(dream.id)
    router.push('/')
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center px-8">
          <p className="font-serif text-2xl text-[#ededed] mb-2">Dream not found</p>
          <p className="text-[#6b6b6b] text-sm">This link may have expired or been removed.</p>
        </div>
      </div>
    )
  }

  if (!dream) return <div className="min-h-screen bg-[#0a0a0a]" />

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar avatarInitial={avatarInitial} onSignOut={handleSignOut} />

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 py-4 pb-32">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="font-serif font-medium text-3xl text-[#ededed] leading-tight">
              {dream.title || 'Untitled'}
            </h1>
            <p className="text-[#6b6b6b] text-sm mt-1">
              {sharerEmail && <><span className="text-[#555]">From {sharerEmail}</span>{' · '}</>}
              {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {' at '}
              {new Date(dream.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            {dream.analysis && (
              <button
                onClick={() => setShowPanel(true)}
                className="text-sm px-3 py-1 rounded-full border border-[#333] text-[#ededed] hover:border-[#555] transition-colors"
              >
                View analysis
              </button>
            )}
            {isSaved && (
              <div className="relative group">
                <button onClick={handleRemove} className="text-[#6b6b6b] hover:text-red-400 p-1 transition-colors">
                  <DeleteIcon className="w-4 h-4" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Remove
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="font-serif-thin text-[#c0c0c0] text-base md:text-lg leading-relaxed whitespace-pre-wrap">
          {dream.body}
        </p>
      </main>

      {showPanel && dream.analysis && (
        <AnalysisPanel analysis={dream.analysis} onClose={() => setShowPanel(false)} />
      )}
    </div>
  )
}
