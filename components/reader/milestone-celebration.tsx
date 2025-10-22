"use client"

import { useEffect, useMemo, useState } from "react"

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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const confettiPieces = useMemo(() => {
    if (!show || !isClient) return []
    return Array.from({ length: 24 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      duration: 1.6 + Math.random() * 0.8,
    }))
  }, [isClient, show])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <style>{`
          @keyframes nurBloomCelebrationConfetti {
            0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
            100% { transform: translateY(120vh) rotate(420deg); opacity: 0; }
          }
        `}</style>
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className="absolute block h-2 w-2 rounded-full bg-gradient-to-br from-emerald-300 via-teal-400 to-sky-400 opacity-80"
            style={{
              left: `${piece.left}%`,
              animationName: "nurBloomCelebrationConfetti",
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              animationTimingFunction: "ease-in",
              animationFillMode: "forwards",
            }}
          />
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

