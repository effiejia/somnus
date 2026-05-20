'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getDreamByShareToken } from '@/lib/supabase'
import type { Dream } from '@/lib/types'

export default function SharedDreamPage() {
  const { token } = useParams() as { token: string }
  const [dream, setDream] = useState<Dream | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getDreamByShareToken(token).then(found => {
      if (found) setDream(found)
      else setNotFound(true)
    })
  }, [token])

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-[#ededed] mb-2">Dream not found</p>
          <p className="text-[#6b6b6b] text-sm">This link may have expired or been removed.</p>
        </div>
      </div>
    )
  }

  if (!dream) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="flex items-center px-6 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#ededed] rounded-sm flex items-center justify-center">
            <span className="text-[#0a0a0a] text-xs font-bold">S</span>
          </div>
          <span className="text-[#ededed] text-sm font-medium">Somnus</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-0 py-8 pb-24">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-[#ededed] leading-tight mb-2">{dream.title}</h1>
          <p className="text-[#6b6b6b] text-sm">
            {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="font-serif text-[#c0c0c0] text-base md:text-lg leading-relaxed space-y-6 whitespace-pre-wrap mb-12">
          {dream.body}
        </div>

        {dream.analysis && (
          <div className="border-t border-[#222] pt-8">
            <h2 className="font-serif text-lg text-[#ededed] mb-4">Analysis</h2>
            <div className="text-[#c0c0c0] text-base leading-relaxed font-serif space-y-4">
              {dream.analysis.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
