'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AnalysisPanel from '@/components/AnalysisPanel'
import { getDream, updateDream, deleteDream } from '@/lib/supabase'
import { RefreshIcon, ShareIcon, DeleteIcon } from '@/components/icons'
import ShareModal from '@/components/ShareModal'
import type { Dream } from '@/lib/types'

const MOCK_ANALYSIS = true

const MOCK_ANALYSIS_TEXT = `**Emotional tone:** Anxious undercurrent softened by moments of wonder — the dream oscillates between unease and awe.

**Key symbols:**
- *Falling water* — transition, the unconscious releasing something held for too long
- *Unfamiliar house* — unexplored aspects of the self; rooms not yet entered
- *The figure at the door* — an unresolved relationship or decision waiting for acknowledgement

**Patterns:** This dream continues a recurring theme of threshold imagery. You are standing at edges — doorways, shorelines, the tops of staircases — without crossing them. This may reflect waking hesitation around a significant change.

**Possible interpretation:** Part of you is ready to move forward; another part is still cataloguing what would be left behind. The anxiety isn't a warning — it's the feeling of momentum building.

**Suggested reflection:** What would it mean to step through the door?`

export default function DreamEntryPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  const [dream, setDream] = useState<Dream | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = sessionStorage.getItem('somnus_dreams')
      if (!cached) return null
      const dreams: Dream[] = JSON.parse(cached)
      return dreams.find(d => d.id === id) ?? null
    } catch { return null }
  })
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  // Sync editable fields when dream loads
  useEffect(() => {
    if (dream) {
      setTitle(dream.title)
      setBody(dream.body)
    }
  }, [dream?.id])

  // Auto-resize textarea
  useEffect(() => {
    const ta = bodyRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
  }, [body])

  useEffect(() => {
    async function load() {
      const found = await getDream(id)
      if (!found) { router.replace('/'); return }
      setDream(found)
      setTitle(found.title)
      setBody(found.body)
      if (searchParams.get('analyze') === 'true' && !found.analysis) {
        setTimeout(() => runAnalysis(found), 300)
      }
      if (searchParams.get('view') === 'true' && found.analysis) {
        setShowPanel(true)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function scheduleSave(newTitle: string, newBody: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(newTitle, newBody), 1000)
  }

  async function save(newTitle: string, newBody: string) {
    if (!dream) return
    await updateDream(dream.id, { title: newTitle, body: newBody })
    setDream(prev => {
      if (!prev) return prev
      const updated = { ...prev, title: newTitle, body: newBody }
      // Update sessionStorage cache
      try {
        const cached = sessionStorage.getItem('somnus_dreams')
        if (cached) {
          const dreams: Dream[] = JSON.parse(cached)
          const idx = dreams.findIndex(d => d.id === dream.id)
          if (idx !== -1) { dreams[idx] = updated; sessionStorage.setItem('somnus_dreams', JSON.stringify(dreams)) }
        }
      } catch { /* ignore */ }
      return updated
    })
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    scheduleSave(e.target.value, body)
  }

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
    scheduleSave(title, e.target.value)
  }

  function handleBlur(newTitle: string, newBody: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    save(newTitle, newBody)
  }

  const runAnalysis = useCallback(async (d: Dream) => {
    setIsAnalyzing(true)
    try {
      let analysis: string
      if (MOCK_ANALYSIS) {
        await new Promise(r => setTimeout(r, 1200))
        analysis = MOCK_ANALYSIS_TEXT
      } else {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dreamId: d.id, title: d.title, body: d.body }),
        })
        const json = await res.json()
        analysis = json.analysis ?? 'No analysis returned.'
      }
      await updateDream(d.id, { analysis, analyzed_body: d.body })
      setDream(prev => prev ? { ...prev, analysis, analyzed_body: d.body } : prev)
    } catch {
      alert('Analysis failed. Check your API key in .env.local.')
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  async function handleDelete() {
    if (!confirm('Delete this dream?')) return
    await deleteDream(id)
    router.replace('/')
  }

  if (!dream) return null

  const hasText = body.trim() !== ''
  const isAnalyzed = !!dream.analysis
  const isStale = isAnalyzed && body !== dream.analyzed_body

  type ButtonMode = 'disabled' | 'analyze' | 'view' | 'analyzing'
  const buttonMode: ButtonMode = isAnalyzing ? 'analyzing'
    : !hasText ? 'disabled'
    : !isAnalyzed ? 'analyze'
    : 'view'

  // Pass current body/title into runAnalysis so it uses latest edits
  const currentDreamForAnalysis = { ...dream, title, body }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 py-4 pb-32">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <input
              value={title}
              onChange={handleTitleChange}
              onBlur={() => handleBlur(title, body)}
              placeholder="Untitled"
              className="font-serif font-medium text-3xl text-[#ededed] leading-tight bg-transparent border-none outline-none w-full placeholder-[#333]"
            />
            <p className="text-[#6b6b6b] text-sm mt-1">
              {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {' at '}
              {new Date(dream.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {(new Date(dream.updated_at).getTime() - new Date(dream.created_at).getTime() > 300_000) && (
                <>
                  {' · Edited '}
                  {new Date(dream.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) !==
                   new Date(dream.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    ? new Date(dream.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' at '
                    : 'at '}
                  {new Date(dream.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            {buttonMode === 'disabled' && (
              <button disabled className="text-sm px-3 py-1 rounded-full bg-[#1a1a1a] text-[#444] cursor-not-allowed">
                Analyze
              </button>
            )}
            {buttonMode === 'analyze' && (
              <button
                onClick={() => runAnalysis(currentDreamForAnalysis)}
                className="text-sm px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Analyze
              </button>
            )}
            {buttonMode === 'analyzing' && (
              <button disabled className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-blue-600/40 text-blue-300 cursor-not-allowed">
                <span className="w-3 h-3 border-2 border-blue-400/40 border-t-blue-300 rounded-full animate-spin" />
                Analyzing...
              </button>
            )}
            {buttonMode === 'view' && (
              <button
                onClick={() => setShowPanel(true)}
                className="text-sm px-3 py-1 rounded-full border border-[#333] text-[#ededed] hover:border-[#555] transition-colors"
              >
                View analysis
              </button>
            )}

            {/* Re-analyze icon — only when stale */}
            {isStale && !isAnalyzing && (
              <div className="relative group">
                <button
                  onClick={() => runAnalysis(currentDreamForAnalysis)}
                  className="text-[#6b6b6b] hover:text-[#ededed] p-1 transition-colors"
                >
                  <RefreshIcon className="w-4 h-4" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Re-analyze
                </span>
              </div>
            )}

            <div className="relative group">
              <button onClick={() => setShowShareModal(true)} className="text-[#6b6b6b] hover:text-[#ededed] p-1 transition-colors">
                <ShareIcon className="w-4 h-4" />
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Share
              </span>
            </div>

            <div className="relative group">
              <button onClick={handleDelete} className="text-[#6b6b6b] hover:text-red-400 p-1 transition-colors">
                <DeleteIcon className="w-4 h-4" />
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Delete
              </span>
            </div>
          </div>
        </div>

        <textarea
          ref={bodyRef}
          value={body}
          onChange={handleBodyChange}
          onBlur={() => handleBlur(title, body)}
          placeholder="Write your dream..."
          rows={1}
          className="w-full font-serif-thin text-[#c0c0c0] text-base md:text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder-[#333] break-words"
        />
      </main>

      {showPanel && dream.analysis && (
        <AnalysisPanel analysis={dream.analysis} onClose={() => setShowPanel(false)} />
      )}

      {showShareModal && (
        <ShareModal
          dream={dream}
          onClose={() => setShowShareModal(false)}
          onTokenChange={(token) => setDream(prev => prev ? { ...prev, share_token: token } : prev)}
        />
      )}
    </div>
  )
}
