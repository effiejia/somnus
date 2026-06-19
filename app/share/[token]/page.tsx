'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { getDreamByShareToken, saveSharedDream, supabase } from '@/lib/supabase'
import type { Dream } from '@/lib/types'

export default function SharedDreamPage() {
  const { token } = useParams() as { token: string }
  const [dream, setDream] = useState<Dream | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [sharerEmail, setSharerEmail] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const found = await getDreamByShareToken(token)
      if (!found) { setNotFound(true); return }
      setDream(found)

      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id !== found.user_id) {
        try {
          const email = await saveSharedDream(found.id)
          setSharerEmail(email)
          setSaved(true)
        } catch { /* already saved or RPC unavailable */ }
      }
    }
    load()
  }, [token])

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
      {/* Minimal header */}
      <header className="flex items-center px-4 h-14 border-b border-[#111]">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-2">
          <div className="w-6 h-6 bg-[#ededed] rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-[#0a0a0a] text-xs font-bold leading-none">S</span>
          </div>
          <span className="text-[#ededed] text-sm font-medium">Somnus</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-0 py-8 pb-24">
        {/* Attribution banner */}
        {saved && sharerEmail && (
          <div className="mb-6 flex items-center gap-2 text-sm text-[#6b6b6b]">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Shared by <span className="text-[#aaa]">{sharerEmail}</span> · Saved to your Shared with you tab</span>
          </div>
        )}

        {/* Title and meta */}
        <div className="mb-8">
          <h1 className="font-serif font-medium text-3xl text-[#ededed] leading-tight mb-2">
            {dream.title || 'Untitled'}
          </h1>
          <p className="text-[#6b6b6b] text-sm">
            {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' at '}
            {new Date(dream.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Body */}
        <div className="font-serif-thin text-[#c0c0c0] text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-12">
          {dream.body}
        </div>

        {/* Analysis */}
        {dream.analysis && (
          <div className="border-t border-[#1a1a1a] pt-8">
            <h2 className="font-serif font-medium text-lg text-[#ededed] mb-5">Analysis</h2>
            <div className="text-[#c0c0c0] text-base leading-relaxed">
              <ReactMarkdown
                components={{
                  strong: ({ children }) => <strong className="font-semibold text-[#ededed]">{children}</strong>,
                  em: ({ children }) => <em className="italic text-[#aaa]">{children}</em>,
                  ul: ({ children }) => <ul className="list-none space-y-1 my-2">{children}</ul>,
                  li: ({ children }) => <li className="flex gap-2"><span className="text-[#444] select-none">–</span><span>{children}</span></li>,
                  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                }}
              >
                {dream.analysis}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
