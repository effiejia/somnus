'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavbarProps {
  showSearch?: boolean
  onSearch?: (q: string) => void
  avatarInitial?: string
}

export default function Navbar({ showSearch = false, onSearch, avatarInitial = 'E' }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <>
      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col p-4 md:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSearchOpen(false); setQuery(''); onSearch?.('') }} className="text-[#6b6b6b]">
              ✕
            </button>
            <input
              autoFocus
              className="flex-1 bg-transparent text-[#ededed] placeholder-[#6b6b6b] outline-none text-base"
              placeholder="Search dreams..."
              value={query}
              onChange={handleChange}
            />
          </div>
          <div className="mt-4 h-px bg-[#222222]" />
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-6 h-14 bg-[#0a0a0a]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#ededed] rounded-sm flex items-center justify-center">
            <span className="text-[#0a0a0a] text-xs font-bold">S</span>
          </div>
          <span className="text-[#ededed] text-sm font-medium hidden sm:block">Somnus</span>
        </Link>

        {/* Desktop search */}
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 bg-[#111111] border border-[#222222] rounded-full px-4 py-1.5 w-64">
            <svg className="w-3.5 h-3.5 text-[#6b6b6b]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="bg-transparent text-[#ededed] placeholder-[#6b6b6b] outline-none text-sm w-full"
              placeholder="Search"
              value={query}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Mobile search trigger */}
          {showSearch && (
            <button className="md:hidden text-[#6b6b6b]" onClick={() => setSearchOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          )}
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center text-xs text-[#ededed]">
            {avatarInitial}
          </div>
        </div>
      </nav>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div className="h-14" />
    </>
  )
}
