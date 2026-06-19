import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const ppEiko = localFont({
  src: [
    { path: '../public/fonts/PPEiko-Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/fonts/PPEiko-LightItalic.otf', weight: '300', style: 'italic' },
  ],
  variable: '--font-serif',
})

const ppEikoThin = localFont({
  src: [{ path: '../public/fonts/PPEiko-Thin.otf', weight: '400', style: 'normal' }],
  variable: '--font-serif-thin',
})

const ppNeueMontreal = localFont({
  src: [
    { path: '../public/fonts/PPNeueMontreal-Book.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/PPNeueMontreal-Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/fonts/PPNeueMontreal-Italic.otf', weight: '400', style: 'italic' },
  ],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Somnus',
  description: 'Record, analyze, and share your dreams.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ppEiko.variable} ${ppEikoThin.variable} ${ppNeueMontreal.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-[#ededed] antialiased">
        {children}
      </body>
    </html>
  )
}
