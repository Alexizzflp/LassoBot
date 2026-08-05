'use client'

import { useEffect } from 'react'

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:transform-none sm:right-6 z-[100] toast-enter w-[90%] sm:w-auto max-w-sm">
      <div className="flex items-center gap-3 bg-emerald-900/90 border border-emerald-500/40 text-emerald-100 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm">
        <span className="text-lg">✓</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}
