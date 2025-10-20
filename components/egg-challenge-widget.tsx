"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import type { EggChallengeSnapshot } from "@/lib/egg-challenge-store"

interface CelebrationElement {
  id: string
  left: number
  delay: number
  color: string
}

interface EggChallengeWidgetProps {
  state: EggChallengeSnapshot | null
}

const CELEBRATION_DURATION = 2200

const celebratoryColors = ["#f7b267", "#f4845f", "#f25c54", "#a4de02", "#6dd47e", "#4cb5ae", "#7f5af0"]

export function EggChallengeWidget({ state }: EggChallengeWidgetProps) {
  const [lastCelebratedTarget, setLastCelebratedTarget] = useState<number | null>(null)
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [droplets, setDroplets] = useState<CelebrationElement[]>([])
  const [confetti, setConfetti] = useState<CelebrationElement[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener("change", onChange)
    return () => mediaQuery.removeEventListener("change", onChange)
  }, [])

  const progressPercentage = useMemo(() => {
    if (!state) return 0
    return Math.round(state.percentage * 100)
  }, [state])

  const remainingMessage = useMemo(() => {
    if (!state) return ""

    const remainingText = `${state.remaining} verse${state.remaining === 1 ? "" : "s"}`

    if (state.phase === "growth") {
      return state.remaining === 0
        ? "Your tree just flourished—celebrate the new canopy!"
        : `Nurture your tree: ${remainingText} until stage ${state.growth.activeStage}.`
    }

    if (state.remaining === 0 && state.previousTarget) {
      return `Takbir! The ${state.previousTarget}-verse egg has hatched. Aim for ${state.target} next!`
    }

    return `Recite ${remainingText} to hatch the ${state.target}-verse egg.`
  }, [state])

  const currentEmoji = useMemo(() => {
    if (!state) return "🥚"

    if (state.phase === "growth") {
      if (state.growth.completedStages >= state.growth.totalStages) {
        return "🌳"
      }
      if (state.growth.completedStages >= 2) {
        return "🌲"
      }
      return "🌱"
    }

    if (state.previousTarget && state.previousTarget >= state.target) {
      return "🐣"
    }

    return state.percentage >= 1 ? "🐣" : "🥚"
  }, [state])

  const growthLeaves = useMemo(() => {
    if (!state) return []

    return Array.from({ length: state.growth.totalStages }).map((_, index) => {
      const stage = index + 1
      const isCompleted = stage <= state.growth.completedStages
      const isActive = stage === state.growth.activeStage
      return {
        stage,
        isCompleted,
        isActive,
      }
    })
  }, [state])

  const triggerCelebration = useCallback(
    (target: number) => {
      if (prefersReducedMotion) return

      const dropletPayload: CelebrationElement[] = Array.from({ length: 14 }).map((_, index) => ({
        id: `droplet-${Date.now()}-${index}`,
        left: Math.random() * 80 + 10,
        delay: index * 60,
        color: celebratoryColors[index % celebratoryColors.length],
      }))

      const confettiPayload: CelebrationElement[] = Array.from({ length: 20 }).map((_, index) => ({
        id: `confetti-${Date.now()}-${index}`,
        left: Math.random() * 100,
        delay: index * 45,
        color: celebratoryColors[(index + 3) % celebratoryColors.length],
      }))

      setIsCelebrating(true)
      setDroplets(dropletPayload)
      setConfetti(confettiPayload)

      const timeout = setTimeout(() => {
        setIsCelebrating(false)
        setDroplets([])
        setConfetti([])
      }, CELEBRATION_DURATION)

      return () => clearTimeout(timeout)
    },
    [prefersReducedMotion],
  )

  useEffect(() => {
    if (!state || !state.celebration) {
      return
    }

    if (state.celebration.target === lastCelebratedTarget) {
      return
    }

    setLastCelebratedTarget(state.celebration.target)
    const cleanup = triggerCelebration(state.celebration.target)

    return cleanup
  }, [state, lastCelebratedTarget, triggerCelebration])

  if (!state) {
    return null
  }

  return (
    <section
      aria-live="polite"
      data-phase={state.phase}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br p-6 text-maroon-900 shadow-lg transition-colors duration-500",
        state.phase === "growth"
          ? "from-emerald-100 via-emerald-50 to-white"
          : "from-amber-50 via-white to-rose-50",
        isCelebrating && !prefersReducedMotion && "egg-celebrating",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent)]" aria-hidden="true" />

      <div className="relative flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-maroon-500">
              Break the Egg Challenge
            </p>
            <h2 className="text-2xl font-bold text-maroon-900">
              Level {state.level} · Target {state.target} verses
            </h2>
          </div>
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full text-4xl transition-transform duration-500",
              isCelebrating && !prefersReducedMotion ? "scale-110" : "scale-100",
              state.phase === "growth"
                ? "bg-emerald-200/70 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                : "bg-amber-100/70 shadow-[0_0_25px_rgba(245,158,11,0.35)]",
            )}
          >
            {currentEmoji}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-center">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-maroon-700">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/60">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    state.phase === "growth"
                      ? "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                      : "bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500",
                  )}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-maroon-700">
                {state.count} / {state.target} verses recited
              </p>
            </div>

            <div className="relative overflow-visible">
              <p className="text-base font-medium text-maroon-800">{remainingMessage}</p>
              <div className="egg-message-shower" aria-hidden="true">
                {droplets.map((droplet) => (
                  <span
                    key={droplet.id}
                    style={{
                      left: `${droplet.left}%`,
                      animationDelay: `${droplet.delay}ms`,
                      backgroundColor: droplet.color,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="egg-growth-visual">
              <div className="egg-growth-trunk" aria-hidden="true" />
              <div className="egg-growth-leaves">
                {growthLeaves.map((leaf) => (
                  <span
                    key={leaf.stage}
                    data-active={leaf.isActive}
                    data-complete={leaf.isCompleted}
                    style={{ transitionDelay: `${leaf.stage * 80}ms` }}
                  />
                ))}
              </div>
              <p className="mt-4 text-center text-sm font-medium text-maroon-700">
                {state.phase === "growth"
                  ? `Growth stage ${state.growth.activeStage} of ${state.growth.totalStages}`
                  : `${state.crackedEggs} / ${state.level} eggs cracked`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!prefersReducedMotion && confetti.length > 0 && (
        <div className="egg-confetti" aria-hidden="true">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}ms`,
                backgroundColor: piece.color,
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
