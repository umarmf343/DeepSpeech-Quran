"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Sparkles, TreePine } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"

const focusableSelectors = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function CelebrationOverlay() {
  const { celebration, closeCelebration } = useUser()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (event: MediaQueryListEvent | MediaQueryList) => {
      setReduceMotion("matches" in event ? event.matches : (event as MediaQueryList).matches)
    }
    handler(mediaQuery)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (!celebration.active) return
    const overlay = overlayRef.current
    if (!overlay) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    overlay.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeCelebration()
      }
      if (event.key === "Tab") {
        const focusable = overlay.querySelectorAll<HTMLElement>(focusableSelectors)
        if (focusable.length === 0) {
          event.preventDefault()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [celebration.active, closeCelebration])

  const confettiPieces = useMemo(() => {
    if (!celebration.active || reduceMotion) return []
    return Array.from({ length: 18 }, (_, index) => ({
      id: index,
      delay: index * 80,
      horizontal: (index % 6) * 12,
    }))
  }, [celebration.active, reduceMotion])

  if (!celebration.active) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
    >
      <div
        ref={overlayRef}
        tabIndex={-1}
        className="relative mx-4 w-full max-w-md rounded-3xl border border-amber-200/70 bg-gradient-to-br from-cream-50/95 via-white to-amber-50/95 p-6 text-center shadow-2xl outline-none"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-maroon-500 text-white shadow-lg">
          {celebration.asset === "tree" ? <TreePine className="h-10 w-10" /> : <Sparkles className="h-10 w-10" />}
        </div>
        <h2 className="mt-4 text-2xl font-bold text-maroon-900">
          {celebration.title ?? "Takbir!"}
        </h2>
        <p className="mt-2 text-sm text-maroon-700">{celebration.message}</p>
        {celebration.rewardCopy && (
          <p className="mt-4 rounded-full bg-maroon-50 px-4 py-1 text-sm font-semibold text-maroon-700">
            {celebration.rewardCopy}
          </p>
        )}
        <Button
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-maroon-500 to-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:-translate-y-1"
          onClick={() => closeCelebration()}
        >
          Continue journey
        </Button>
        {!reduceMotion && (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className={cn(
                  "confetti-piece",
                  piece.id % 3 === 0
                    ? "bg-amber-400"
                    : piece.id % 3 === 1
                      ? "bg-maroon-500"
                      : "bg-emerald-400",
                )}
                style={{
                  left: `${piece.horizontal}%`,
                  animationDelay: `${piece.delay}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
