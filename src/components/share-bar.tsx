'use client'

import { useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'

export function ShareBar({ tripTitle }: { tripTitle: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-md text-white rounded-full px-5 py-3 shadow-2xl border border-white/10">
        <Share2 className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium hidden sm:block max-w-[200px] truncate">{tripTitle}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5 text-green-400" /> Copied!</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> Copy Link</>
          )}
        </button>
      </div>
    </div>
  )
}
