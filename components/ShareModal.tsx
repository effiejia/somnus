'use client'

import { useState, useEffect } from 'react'
import { generateShareToken, removeShareToken } from '@/lib/supabase'
import type { Dream } from '@/lib/types'

interface ShareModalProps {
  dream: Dream
  onClose: () => void
  onTokenChange: (token: string | null) => void
}

export default function ShareModal({ dream, onClose, onTokenChange }: ShareModalProps) {
  const [token, setToken] = useState<string | null>(dream.share_token)
  const [copied, setCopied] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const shareUrl = token ? `${window.location.origin}/share/${token}` : null

  useEffect(() => {
    if (!token) {
      setIsGenerating(true)
      generateShareToken(dream.id).then(t => {
        setToken(t)
        onTokenChange(t)
        setIsGenerating(false)
      })
    }
  }, [])

  function handleClose() {
    setIsClosing(true)
    setTimeout(onClose, 250)
  }

  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleNativeShare() {
    if (!shareUrl) return
    if (navigator.share) {
      await navigator.share({
        title: dream.title || 'A dream',
        text: 'Check out this dream on Somnus',
        url: shareUrl,
      })
    }
  }

  async function handleRemove() {
    setIsRemoving(true)
    await removeShareToken(dream.id)
    setToken(null)
    onTokenChange(null)
    setIsRemoving(false)
    handleClose()
  }

  const smsUrl = shareUrl ? `sms:?body=${encodeURIComponent(`Check out this dream on Somnus: ${shareUrl}`)}` : '#'
  const mailUrl = shareUrl ? `mailto:?subject=${encodeURIComponent(dream.title || 'A dream on Somnus')}&body=${encodeURIComponent(`I recorded a dream on Somnus and wanted to share it with you:\n\n${shareUrl}`)}` : '#'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-out fade-out duration-250' : 'animate-in fade-in duration-300'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-[#111111] border border-[#222222] rounded-2xl shadow-2xl fill-mode-forwards ${isClosing ? 'animate-out fade-out zoom-out-95 duration-250' : 'animate-in fade-in zoom-in-95 duration-300'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h2 className="font-serif font-medium text-lg text-[#ededed]">Share</h2>
          <button onClick={handleClose} className="text-[#6b6b6b] hover:text-[#ededed] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Share link */}
          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
            {isGenerating ? (
              <span className="text-[#555] text-sm flex-1">Generating link...</span>
            ) : (
              <span className="text-[#888] text-sm flex-1 truncate">{shareUrl}</span>
            )}
            <button
              onClick={handleCopy}
              disabled={isGenerating}
              className="flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-[#ededed] transition-colors disabled:opacity-40"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Send via */}
          <div className="space-y-2">
            <p className="text-[#555] text-xs uppercase tracking-wide">Send via</p>
            <div className="flex gap-2">
              <a
                href={smsUrl}
                className="flex-1 flex flex-col items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-xl py-3 transition-colors"
              >
                <svg className="w-5 h-5 text-[#ededed]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-[#aaa] text-xs">Message</span>
              </a>
              <a
                href={mailUrl}
                className="flex-1 flex flex-col items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-xl py-3 transition-colors"
              >
                <svg className="w-5 h-5 text-[#ededed]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="text-[#aaa] text-xs">Mail</span>
              </a>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  disabled={isGenerating}
                  className="flex-1 flex flex-col items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-xl py-3 transition-colors disabled:opacity-40"
                >
                  <svg className="w-5 h-5 text-[#ededed]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
                  </svg>
                  <span className="text-[#aaa] text-xs">More</span>
                </button>
              )}
            </div>
          </div>

          {/* Remove link */}
          {dream.share_token && (
            <>
              <div className="border-t border-[#1e1e1e]" />
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="w-full text-sm text-red-400 hover:text-red-300 py-1 transition-colors disabled:opacity-40"
              >
                {isRemoving ? 'Removing...' : 'Remove link'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
