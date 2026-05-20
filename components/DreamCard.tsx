'use client'

import { useRouter } from 'next/navigation'
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
  onDelete: (id: string) => void
  selecting: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
}

export default function DreamCard({ dream, onAnalyze, onDelete, selecting, selected, onToggleSelect }: DreamCardProps) {
  const router = useRouter()

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
      className={`group relative border-b border-[#1a1a1a] px-4 md:px-0 py-4 cursor-pointer transition-colors hover:bg-[#111111] md:hover:bg-transparent ${
        selected ? 'bg-[#111111]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {selecting && (
              <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${selected ? 'bg-blue-500 border-blue-500' : 'border-[#444]'}`} />
            )}
            <h3 className="font-serif text-[#ededed] text-base leading-snug truncate">
              {dream.title || 'Untitled'}
            </h3>
          </div>
          <p className="text-[#6b6b6b] text-sm leading-snug line-clamp-1">
            <span className="text-[#444]">{formatRelativeDate(dream.created_at)}</span>
            {dream.body && <> &bull; {dream.body}</>}
          </p>
        </div>

        {/* Action buttons — visible on hover (desktop) or always on mobile */}
        {!selecting && (
          <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onAnalyze(dream) }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-3.328-6.66a2.5 2.5 0 0 1 2.704-3.516l2.2.44V4.5A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l3.328-6.66a2.5 2.5 0 0 0-2.704-3.516l-2.2.44V4.5A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
              Analyze
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(dream.id) }}
              className="text-[#444] hover:text-[#888] p-1 transition-colors"
              aria-label="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
