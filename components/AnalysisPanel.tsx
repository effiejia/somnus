'use client'

import { useEffect, useRef } from 'react'

interface AnalysisPanelProps {
  analysis: string
  onClose: () => void
}

export default function AnalysisPanel({ analysis, onClose }: AnalysisPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — slides up from bottom, covers ~80% on mobile, fixed height on desktop */}
      <div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border border-[#222222] rounded-t-2xl
                   max-h-[80vh] md:max-h-[60vh] overflow-y-auto
                   animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center justify-between p-5 pb-4 border-b border-[#222222]">
          <h2 className="font-serif text-lg text-[#ededed]">Analysis</h2>
          <button onClick={onClose} className="text-[#6b6b6b] hover:text-[#ededed] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 md:p-8 max-w-2xl mx-auto">
          <div className="text-[#c0c0c0] text-sm md:text-base leading-relaxed font-serif space-y-4">
            {analysis.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
