"use client"

import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface MilestoneCelebrationProps {
  show: boolean
  title?: string
  message: string
  ctaLabel?: string
  onClose: () => void
}

export function MilestoneCelebration({ show, title, message, ctaLabel = "Keep going", onClose }: MilestoneCelebrationProps) {
  const confettiPieces = useMemo(() => {
    if (!show) return []
    return Array.from({ length: 24 }, (_, index) => index)
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="egg-confetti pointer-events-none" aria-hidden>
        {confettiPieces.map((index) => (
          <span key={index} />
        ))}
      </div>
      <div className="relative mx-4 w-full max-w-md rounded-3xl border border-amber-200/80 bg-gradient-to-br from-cream-50/95 via-white to-amber-50/90 p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-maroon-500 text-white shadow-lg">
          <Sparkles className="h-10 w-10" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-maroon-900">{title ?? "MashaAllah!"}</h2>
        <p className="mt-2 text-sm text-maroon-700">{message}</p>
        <Button
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-maroon-500 to-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
          onClick={onClose}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}

