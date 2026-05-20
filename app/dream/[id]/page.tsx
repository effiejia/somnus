'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AnalysisPanel from '@/components/AnalysisPanel'
import { getDream, updateDream, deleteDream, generateShareToken } from '@/lib/supabase'
import type { Dream } from '@/lib/types'

type AnalysisState = 'idle' | 'analyzing' | 'done'

function DecorativeDate({ iso }: { iso: string }) {
  const date = new Date(iso)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return (
    <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-between overflow-hidden">
      <div className="flex flex-col items-start pl-4 md:pl-0 gap-16">
        <span className="font-serif text-[18vw] md:text-[12rem] leading-none text-[#ededed]/[0.04] font-bold">{String(month).padStart(2, '0')}</span>
        <span className="font-serif text-[18vw] md:text-[12rem] leading-none text-[#ededed]/[0.04] font-bold">{String(day).padStart(2, '0')}</span>
      </div>
      <div className="flex flex-col items-end pr-4 md:pr-0 gap-16">
        <span className="font-serif text-[18vw] md:text-[12rem] leading-none text-[#ededed]/[0.025] font-bold">{String(month).padStart(2, '0')}</span>
        <span className="font-serif text-[18vw] md:text-[12rem] leading-none text-[#ededed]/[0.025] font-bold">{String(day).padStart(2, '0')}</span>
      </div>
    </div>
  )
}

export default function DreamEntryPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  const [dream, setDream] = useState<Dream | null>(null)
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle')
  const [showPanel, setShowPanel] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const found = await getDream(id)
      if (!found) { router.replace('/'); return }
      setDream(found)
      if (found.analysis) setAnalysisState('done')
      if (searchParams.get('analyze') === 'true' && !found.analysis) {
        setTimeout(() => runAnalysis(found), 300)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const runAnalysis = useCallback(async (d: Dream) => {
    setAnalysisState('analyzing')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId: d.id, title: d.title, body: d.body }),
      })
      const json = await res.json()
      const analysis: string = json.analysis ?? 'No analysis returned.'
      await updateDream(d.id, { analysis })
      setDream(prev => prev ? { ...prev, analysis } : prev)
      setAnalysisState('done')
    } catch {
      setAnalysisState('idle')
      alert('Analysis failed. Check your API key in .env.local.')
    }
  }, [])

  async function handleShare() {
    if (!dream) return
    const token = dream.share_token ?? await generateShareToken(dream.id)
    setDream(prev => prev ? { ...prev, share_token: token } : prev)
    await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!confirm('Delete this dream?')) return
    await deleteDream(id)
    router.replace('/')
  }

  if (!dream) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <Navbar />
      <DecorativeDate iso={dream.created_at} />

      <main className="relative z-10 max-w-2xl mx-auto px-4 md:px-0 py-4 pb-32">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#ededed] leading-tight">{dream.title}</h1>
            <p className="text-[#6b6b6b] text-sm mt-1">
              {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {' at '}
              {new Date(dream.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            <button
              onClick={() => analysisState !== 'analyzing' ? runAnalysis(dream) : undefined}
              disabled={analysisState === 'analyzing'}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                analysisState === 'analyzing'
                  ? 'bg-blue-600/40 text-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-3.328-6.66a2.5 2.5 0 0 1 2.704-3.516l2.2.44V4.5A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l3.328-6.66a2.5 2.5 0 0 0-2.704-3.516l-2.2.44V4.5A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
              {analysisState === 'done' ? 'Re-analyze' : 'Analyze'}
            </button>
            <button onClick={handleShare} className="text-[#6b6b6b] hover:text-[#ededed] p-1 transition-colors" title={copied ? 'Link copied!' : 'Share'}>
              {copied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                </svg>
              )}
            </button>
            <button onClick={handleDelete} className="text-[#6b6b6b] hover:text-red-400 p-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="font-serif text-[#c0c0c0] text-base md:text-lg leading-relaxed space-y-6 whitespace-pre-wrap">
          {dream.body}
        </div>
      </main>

      {analysisState !== 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center pb-6">
          <button
            onClick={() => analysisState === 'done' ? setShowPanel(true) : undefined}
            disabled={analysisState === 'analyzing'}
            className={`flex items-center gap-3 px-8 py-3 rounded-full text-sm font-medium transition-all shadow-2xl ${
              analysisState === 'analyzing'
                ? 'bg-[#1a1a1a] border border-[#333] text-[#6b6b6b] cursor-not-allowed'
                : 'bg-[#1a1a1a] border border-[#333] text-[#ededed] hover:border-[#555]'
            }`}
          >
            {analysisState === 'analyzing' ? (
              <>
                <span className="w-4 h-4 border-2 border-[#555] border-t-[#ededed] rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              'View analysis'
            )}
          </button>
        </div>
      )}

      {showPanel && dream.analysis && (
        <AnalysisPanel analysis={dream.analysis} onClose={() => setShowPanel(false)} />
      )}
    </div>
  )
}
