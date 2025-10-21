"use client"

import { CSSProperties, useEffect, useMemo } from "react"

import { HasanatCelebrationPayload } from "@/hooks/use-hasanat-tracker"
import { cn } from "@/lib/utils"

interface HasanatCelebrationProps {
  celebration: HasanatCelebrationPayload | null
  onClose: () => void
  nightMode?: boolean
}

type ConfettiStyle = CSSProperties & {
  "--confetti-rotation"?: string
  "--confetti-drift"?: string
}

export function HasanatCelebration({ celebration, onClose, nightMode = false }: HasanatCelebrationProps) {
  useEffect(() => {
    if (!celebration) return
    const timeout = window.setTimeout(onClose, 3200)
    return () => window.clearTimeout(timeout)
  }, [celebration, onClose])

  const confettiPieces = useMemo(() => {
    if (!celebration) return []

    const colors = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#fb7185", "#facc15"]
    return Array.from({ length: 28 }, (_, index) => {
      const horizontal = ((index * 37) % 100) + (index % 3 === 0 ? 8 : 0)
      const delay = (index % 12) * -0.18
      const duration = 2 + ((index * 11) % 16) / 10
      const rotation = (index * 47) % 360
      const drift = ((index % 6) - 2) * 6
      const height = 0.85 + (((index * 5) % 6) / 10)
      const width = 0.28 + (((index * 7) % 5) / 25)

      const style: ConfettiStyle = {
        left: `${Math.min(96, Math.max(4, horizontal))}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        backgroundColor: colors[index % colors.length],
        height: `${height}rem`,
        width: `${width}rem`,
        "--confetti-rotation": `${rotation}deg`,
        "--confetti-drift": `${drift}vw`,
      }

      return {
        key: `${celebration.id}-confetti-${index}`,
        style,
      }
    })
  }, [celebration])

  if (!celebration) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] flex items-center justify-center overflow-hidden px-4 py-10",
        nightMode ? "bg-slate-900/95" : "bg-white/95",
      )}
      role="status"
      aria-live="assertive"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confettiPieces.map((piece) => (
          <span key={piece.key} className="hasanat-confetti-piece" style={piece.style} aria-hidden="true" />
        ))}
      </div>
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-[2.5rem] border px-8 py-10 text-center shadow-[0_20px_80px_rgba(15,118,110,0.25)]",
          nightMode
            ? "border-emerald-500/40 bg-slate-950/90 text-emerald-100"
            : "border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-100/90 text-emerald-900",
        )}
      >
        <div className="absolute -top-6 inline-flex items-center rounded-full bg-emerald-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
          🎉 Congratulations
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.4em] text-emerald-500">MashaAllah</p>
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{celebration.title}</h2>
        <p
          className={cn(
            "max-w-lg text-base leading-relaxed",
            nightMode ? "text-emerald-100/90" : "text-emerald-800/90",
          )}
        >
          {celebration.message}
        </p>
        <blockquote
          className={cn(
            "max-w-lg text-sm italic",
            nightMode ? "text-emerald-200/90" : "text-emerald-700",
          )}
        >
          “{celebration.verse}”
        </blockquote>
        {celebration.emphasis ? (
          <p
            className={cn(
              "text-sm font-semibold uppercase tracking-[0.3em]",
              nightMode ? "text-amber-300" : "text-amber-500",
            )}
          >
            {celebration.emphasis}
          </p>
        ) : null}
      </div>
    </div>
  )
}

