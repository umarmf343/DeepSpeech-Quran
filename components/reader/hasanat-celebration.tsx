"use client"

import { useEffect } from "react"

import { HasanatCelebrationPayload } from "@/hooks/use-hasanat-tracker"
import { cn } from "@/lib/utils"

interface HasanatCelebrationProps {
  celebration: HasanatCelebrationPayload | null
  onClose: () => void
  nightMode?: boolean
}

export function HasanatCelebration({ celebration, onClose, nightMode = false }: HasanatCelebrationProps) {
  useEffect(() => {
    if (!celebration) return
    const timeout = window.setTimeout(onClose, 2500)
    return () => window.clearTimeout(timeout)
  }, [celebration, onClose])

  if (!celebration) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] flex items-center justify-center transition-opacity",
        nightMode ? "bg-slate-900/90" : "bg-white/95",
      )}
      role="status"
      aria-live="assertive"
    >
      <div
        className={cn(
          "mx-6 max-w-lg rounded-3xl border px-8 py-10 text-center shadow-2xl",
          nightMode
            ? "border-emerald-500/40 bg-slate-950/90 text-emerald-100"
            : "border-emerald-200 bg-white/80 text-emerald-900",
        )}
      >
        <p className="text-sm uppercase tracking-widest text-emerald-500">MashaAllah</p>
        <h2 className="mt-2 text-3xl font-bold">{celebration.title}</h2>
        <p className="mt-3 text-base leading-relaxed">{celebration.message}</p>
        <blockquote className="mt-4 text-sm italic text-emerald-700 dark:text-emerald-200">
          “{celebration.verse}”
        </blockquote>
        {celebration.emphasis ? (
          <p className="mt-4 text-sm font-semibold text-amber-600 dark:text-amber-300">{celebration.emphasis}</p>
        ) : null}
      </div>
    </div>
  )
}

