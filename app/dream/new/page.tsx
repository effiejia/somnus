'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase, createDream } from '@/lib/supabase'

function fallbackTitle(body: string): string {
  const trimmed = body.trim()
  if (!trimmed) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const words = trimmed.split(/\s+/).slice(0, 6).join(' ')
  const title = words.charAt(0).toUpperCase() + words.slice(1)
  return trimmed.split(/\s+/).length > 6 ? title + '…' : title
}

async function generateTitle(body: string): Promise<string> {
  try {
    const res = await fetch('/api/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    const json = await res.json()
    if (json.title) return json.title
  } catch { /* fall through */ }
  return fallbackTitle(body)
}

export default function NewDreamPage() {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login')
      else setUserId(user.id)
    })
  }, [router])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
  }, [body])

  async function handleSave() {
    if (!body.trim() || !userId) return
    setSaving(true)
    const title = await generateTitle(body)
    const dream = await createDream(userId, title, body)
    router.push(`/dream/${dream.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 md:px-0 py-4 pb-32">
        <div className="flex items-center justify-between mb-8">
          <p className="text-[#6b6b6b] text-sm">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' at '}
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/')} className="border border-[#333] rounded-full px-3 py-1.5 text-sm text-[#ededed] hover:border-[#555] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !body.trim()}
              className="bg-[#ededed] text-[#0a0a0a] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white transition-colors disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What did you dream about?"
          rows={1}
          className="w-full font-serif-thin text-[#c0c0c0] text-base md:text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder-[#333] break-words"
        />
      </main>

    </div>
  )
}
