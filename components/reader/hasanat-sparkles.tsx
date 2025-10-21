"use client"

import { useEffect } from "react"

import { SparkleEvent } from "@/hooks/use-hasanat-tracker"
import { cn } from "@/lib/utils"

interface HasanatSparkleEmitterProps {
  events: SparkleEvent[]
  reducedMotion?: boolean
  onComplete: (id: string) => void
  children: React.ReactNode
}

export function HasanatSparkleEmitter({ events, reducedMotion = false, onComplete, children }: HasanatSparkleEmitterProps) {
  useEffect(() => {
    if (!reducedMotion) return
    const timers = events.map((event) =>
      window.setTimeout(() => {
        onComplete(event.id)
      }, 900),
    )
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [events, onComplete, reducedMotion])

  return (
    <div className="relative inline-flex items-center">
      {children}
      <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
        {events.map((event) => (
          <Sparkle key={event.id} event={event} reducedMotion={reducedMotion} onComplete={onComplete} />
        ))}
      </div>
    </div>
  )
}

interface SparkleProps {
  event: SparkleEvent
  reducedMotion: boolean
  onComplete: (id: string) => void
}

function Sparkle({ event, reducedMotion, onComplete }: SparkleProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onComplete(event.id), reducedMotion ? 900 : 1300)
    return () => window.clearTimeout(timeout)
  }, [event.id, onComplete, reducedMotion])

  if (reducedMotion) {
    return (
      <span
        className="absolute right-0 top-0 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white shadow-lg"
      >
        +{event.amount.toLocaleString()}
      </span>
    )
  }

  const horizontalDrift = (Math.random() - 0.5) * 60
  const duration = 1100 + Math.random() * 500

  return (
    <span
      className={cn(
        "absolute -top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/90 via-emerald-400/80 to-sky-400/80 px-2 py-1 text-xs font-semibold text-white shadow-lg",
        "animate-[hasanat-sparkle-float_var(--sparkle-duration)_ease-out_forwards]",
      )}
      style={{
        right: `${Math.random() * 40}%`,
        transform: `translate3d(${horizontalDrift}px, 0, 0)`,
        // @ts-expect-error -- CSS custom property
        "--sparkle-duration": `${duration}ms`,
      }}
    >
      +{event.amount.toLocaleString()}
      {event.emphasis ? <span className="text-[0.65rem] font-normal">{event.emphasis}</span> : null}
    </span>
  )
}

