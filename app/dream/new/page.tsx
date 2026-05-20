'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import type { Dream } from '@/lib/types'

export default function NewDreamPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSave() {
    if (!title.trim() && !body.trim()) return
    setSaving(true)

    const dream: Dream = {
      id: crypto.randomUUID(),
      user_id: 'demo-user',
      title: title || 'Untitled',
      body,
      analysis: null,
      share_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const stored = localStorage.getItem('somnus_dreams')
    const existing: Dream[] = stored ? JSON.parse(stored) : []
    localStorage.setItem('somnus_dreams', JSON.stringify([dream, ...existing]))

    router.push(`/dream/${dream.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 md:px-0 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-[#6b6b6b] text-sm">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' at '}
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-[#6b6b6b] text-sm hover:text-[#ededed] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (!title.trim() && !body.trim())}
              className="bg-[#ededed] text-[#0a0a0a] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white transition-colors disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>

        <input
          className="w-full bg-transparent font-serif text-3xl text-[#ededed] placeholder-[#333] outline-none mb-6"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        <textarea
          className="w-full bg-transparent text-[#c0c0c0] text-base leading-relaxed placeholder-[#333] outline-none resize-none min-h-[50vh]"
          placeholder="What did you dream about?"
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </main>
    </div>
  )
}
