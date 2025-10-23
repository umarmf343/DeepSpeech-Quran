"use client"

import { type CSSProperties, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SurahCompletionCelebrationProps {
  visible: boolean
  surahName?: string
  surahNumber?: number
  onClose: () => void
  onNextSurah: () => void
  hasNextSurah: boolean
}

export function SurahCompletionCelebration({
  visible,
  surahName,
  surahNumber,
  onClose,
  onNextSurah,
  hasNextSurah,
}: SurahCompletionCelebrationProps) {
  const [showNextButton, setShowNextButton] = useState(false)

  useEffect(() => {
    if (!visible) {
      setShowNextButton(false)
      return
    }

    const timeout = window.setTimeout(() => setShowNextButton(true), 1600)
    return () => window.clearTimeout(timeout)
  }, [visible])

  const confettiPieces = useMemo(() => {
    if (!visible) return []

    const colors = ["#34d399", "#fcd34d", "#38bdf8", "#a78bfa", "#f472b6", "#fb7185"]
    return Array.from({ length: 56 }, (_, index) => {
      const horizontal = ((index * 41) % 100) + (index % 2 === 0 ? 6 : -4)
      const delay = (index % 10) * -0.18
      const duration = 2.4 + ((index * 13) % 12) / 10
      const rotation = (index * 53) % 360
      const drift = ((index % 7) - 3) * 7
      const height = 0.85 + (((index * 5) % 6) / 10)
      const width = 0.28 + (((index * 7) % 5) / 25)

      return {
        key: `surah-celebration-confetti-${index}`,
        style: {
          left: `${Math.min(96, Math.max(4, horizontal))}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          backgroundColor: colors[index % colors.length],
          height: `${height}rem`,
          width: `${width}rem`,
          "--confetti-rotation": `${rotation}deg`,
          "--confetti-drift": `${drift}vw`,
        } as CSSProperties,
      }
    })
  }, [visible])

  const popSparks = useMemo(() => {
    if (!visible) return []

    const colors = ["#34d399", "#22c55e", "#0ea5e9", "#fbbf24", "#f472b6", "#10b981"]
    return Array.from({ length: 48 }, (_, index) => {
      const top = 12 + ((index * 11) % 78)
      const left = 6 + ((index * 19) % 88)
      const delay = (index % 14) * -0.12
      const duration = 1.8 + ((index * 7) % 10) / 10
      const size = 0.35 + (((index * 5) % 7) / 10)
      const drift = ((index % 5) - 2) * 0.9

      return {
        key: `surah-celebration-pop-${index}`,
        style: {
          top: `${Math.min(94, Math.max(6, top))}%`,
          left: `${Math.min(94, Math.max(6, left))}%`,
          "--spark-delay": `${delay}s`,
          "--spark-duration": `${duration}s`,
          "--spark-size": `${size}rem`,
          "--spark-color": colors[index % colors.length],
          "--spark-drift": `${drift}rem`,
        } as CSSProperties,
      }
    })
  }, [visible])

  if (!visible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-emerald-950/60 backdrop-blur-sm"
      role="dialog"
      aria-live="assertive"
      aria-modal="true"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {popSparks.map((spark) => (
          <span key={spark.key} className="celebration-pop-spark" style={spark.style} aria-hidden="true" />
        ))}
        {confettiPieces.map((piece) => (
          <span key={piece.key} className="confetti-piece" style={piece.style} aria-hidden="true" />
        ))}
      </div>

      <div
        className={cn(
          "relative z-10 mx-4 flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-emerald-400/60",
          "bg-gradient-to-br from-emerald-50/95 via-white/95 to-emerald-100/90 px-8 py-10 text-center shadow-[0_20px_60px_rgba(16,185,129,0.35)]",
        )}
      >
        <div className="pointer-events-none absolute -top-8 inline-flex items-center rounded-full bg-emerald-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
          🌟 Surah Complete
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">MashaAllah!</p>
        <h2 className="text-3xl font-black tracking-tight text-emerald-900">
          {surahName ? `You finished ${surahName}` : "You've completed this Surah"}
        </h2>
        {surahNumber ? (
          <p className="text-sm font-medium text-emerald-700/80">Surah #{surahNumber}</p>
        ) : null}
        <p className="max-w-sm text-sm text-emerald-700/90">
          Your recitation streak just bloomed. Keep the momentum and continue to the next chapter of the Quran!
        </p>

        {!showNextButton ? (
          <p className="text-sm font-medium text-emerald-600/80">Sprinkling blessings...</p>
        ) : (
          <div className="flex w-full flex-col items-center gap-3">
            <Button
              type="button"
              onClick={
                hasNextSurah
                  ? () => {
                      onNextSurah()
                    }
                  : undefined
              }
              disabled={!hasNextSurah}
              className="w-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition-transform hover:-translate-y-0.5 hover:bg-emerald-600"
              title={
                hasNextSurah
                  ? "Continue your journey with the next Surah"
                  : "MashaAllah! You've completed the final Surah"
              }
            >
              Next Surah
            </Button>
            {!hasNextSurah ? (
              <p className="text-xs font-medium text-emerald-600/80">
                You've reached the end of the Mushaf—take a moment to soak it in! 🎉
              </p>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-emerald-700 hover:text-emerald-800"
            >
              Stay on this Surah
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
