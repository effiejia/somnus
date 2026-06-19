'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateShareToken } from '@/lib/supabase'
import type { Dream } from '@/lib/types'

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours < 24 && date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}


interface DreamCardProps {
  dream: Dream
  onAnalyze: (dream: Dream) => void
  onViewAnalysis: (dream: Dream) => void
  onDelete: (id: string) => void
  selecting: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
}

export default function DreamCard({ dream, onAnalyze, onViewAnalysis, onDelete, selecting, selected, onToggleSelect }: DreamCardProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const isAnalyzed = !!dream.analysis
  const isStale = isAnalyzed && dream.body !== dream.analyzed_body

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const token = dream.share_token ?? await generateShareToken(dream.id)
    await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClick() {
    if (selecting) {
      onToggleSelect(dream.id)
    } else {
      router.push(`/dream/${dream.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`group/card relative border-b border-[#1a1a1a] py-4 cursor-pointer transition-colors hover:bg-[#111111] md:hover:bg-transparent ${selecting ? 'px-4' : ''} ${
        selected ? 'bg-[#111111]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-16">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {selecting && (
              <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${selected ? 'bg-blue-500 border-blue-500' : 'border-[#444]'}`} />
            )}
            <h3 className="font-serif font-medium text-[#ededed] text-base leading-snug truncate">
              {dream.title || 'Untitled'}
            </h3>
          </div>
          <p className="text-[#6b6b6b] text-sm leading-snug truncate">
            <span className="text-[#444]">{formatRelativeDate(dream.created_at)}</span>
            {dream.body && <>{' · '}{dream.body}</>}
          </p>
        </div>

        {/* Action buttons — visible on hover (desktop) or always on mobile */}
        {!selecting && (
          <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity flex-shrink-0">
            {!isAnalyzed && (
              <button
                onClick={(e) => { e.stopPropagation(); onAnalyze(dream) }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1 rounded-full transition-colors"
              >
                Analyze
              </button>
            )}
            {isAnalyzed && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onViewAnalysis(dream) }}
                  className="border border-[#333] hover:border-[#555] text-[#ededed] text-sm px-3 py-1 rounded-full transition-colors"
                >
                  View analysis
                </button>
                {isStale && (
                  <div className="relative group/btn">
                    <button
                      onClick={(e) => { e.stopPropagation(); onAnalyze(dream) }}
                      className="text-[#6b6b6b] hover:text-[#ededed] p-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </button>
                    <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                      Re-analyze
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="relative group/btn">
              <button onClick={handleShare} className="text-[#6b6b6b] hover:text-[#ededed] p-1 transition-colors">
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
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                {copied ? 'Copied!' : 'Share'}
              </span>
            </div>
            <div className="relative group/btn">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(dream.id) }}
                className="text-[#444] hover:text-[#888] p-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs text-[#aaa] bg-[#1e1e1e] whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                Delete
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
