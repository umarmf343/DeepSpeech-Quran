"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEggSessionTimer } from "@/hooks/use-egg-session"
import { cn } from "@/lib/utils"

const DEFAULT_DURATION = 120

export function BreakEggTimer() {
  const { state, duration, timeLeft, isRunning, isLoading, start, reset } = useEggSessionTimer(DEFAULT_DURATION)
  const [showCelebration, setShowCelebration] = useState(false)
  const lastCelebrationRef = useRef<string | null>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const progress = useMemo(() => {
    if (duration === 0) return 0
    const elapsed = duration - timeLeft
    return Math.min(Math.max(elapsed / duration, 0), 1)
  }, [duration, timeLeft])

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [timeLeft])

  useEffect(() => {
    if (!state?.lastCompletedAt) return
    if (lastCelebrationRef.current === state.lastCompletedAt) return

    lastCelebrationRef.current = state.lastCompletedAt
    setShowCelebration(true)
  }, [state?.lastCompletedAt])

  useEffect(() => {
    if (!showCelebration) {
      return
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowCelebration(false)
    }, 5000)

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [showCelebration])

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  const handleStart = async () => {
    try {
      await start()
    } catch (error) {
      console.error("Unable to start Break the Egg session:", error)
    }
  }

  const handleReset = async () => {
    try {
      await reset()
    } catch (error) {
      console.error("Unable to reset Break the Egg session:", error)
    }
  }

  return (
    <div className="w-full">
      <Card className="relative overflow-hidden border border-blue-100/70 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Break the Egg Challenge</p>
              <h2 className="text-2xl font-bold text-slate-900">2-minute focused recitation sprint</h2>
            </div>
            <EggProgressIcon progress={progress} />
          </div>

          <div className="space-y-4">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-indigo-100">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 transition-[width] duration-500",
                  isRunning ? "shadow-[0_0_15px_rgba(99,102,241,0.35)]" : "",
                )}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-medium text-slate-700">Time left: {formattedTime}</p>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleStart}
                  disabled={isRunning || isLoading}
                  className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading && !isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Start 2-minute session
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="rounded-full border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/70 p-4 text-sm text-slate-600 shadow-inner">
            <p>
              Stay focused for the full two minutes to crack the shell. You have completed
              <span className="mx-1 font-semibold text-indigo-600">{state?.totalCompleted ?? 0}</span>
              sessions so far.
            </p>
          </div>
        </CardContent>
      </Card>

      <div
        className={cn(
          "fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 transition-opacity",
          showCelebration ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!showCelebration}
      >
        <div className="max-w-md transform rounded-3xl bg-white p-6 text-center shadow-2xl transition-all">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-4xl">🎉</div>
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Congratulations!</h3>
          <p className="mt-2 text-slate-600">
            You completed the Break the Egg focus sprint. Keep the momentum going and aim for the next egg!
          </p>
          <Button
            onClick={() => setShowCelebration(false)}
            className="mt-6 rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
          >
            Keep going
          </Button>
        </div>
      </div>
    </div>
  )
}

function EggProgressIcon({ progress }: { progress: number }) {
  const stage = useMemo(() => {
    if (progress === 0) {
      return "initial" as const
    }

    if (progress < 0.9) {
      return "cracking" as const
    }

    return "broken" as const
  }, [progress])

  const stageLabel = useMemo(() => {
    switch (stage) {
      case "initial":
        return "Shell intact"
      case "cracking":
        return "Cracking the shell"
      case "broken":
        return "Egg cracked!"
      default:
        return "Shell intact"
    }
  }, [stage])

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
      <div className="flex h-14 w-14 items-center justify-center">
        {stage === "initial" && (
          <svg
            key="initial"
            viewBox="0 0 64 64"
            className="egg-stage-enter h-12 w-12 egg-shadow"
            role="img"
            aria-label="Egg shell intact"
          >
            <path
              className="egg-shell"
              d="M32 6c-9.94 0-18 10.08-18 22.5S22.06 54 32 54s18-9.58 18-21.5S41.94 6 32 6z"
            />
          </svg>
        )}
        {stage === "cracking" && (
          <svg
            key="cracking"
            viewBox="0 0 64 64"
            className="egg-stage-enter h-12 w-12 egg-shadow"
            role="img"
            aria-label="Egg shell cracking"
          >
            <path
              className="egg-shell"
              d="M32 6c-9.94 0-18 10.08-18 22.5S22.06 54 32 54s18-9.58 18-21.5S41.94 6 32 6z"
            />
            <polyline className="egg-crack-line egg-crack-line-animated" points="24 28 30 34 26 38 34 44 30 48 38 54" />
          </svg>
        )}
        {stage === "broken" && (
          <svg
            key="broken"
            viewBox="0 0 64 64"
            className="egg-stage-enter h-12 w-12 egg-shadow"
            role="img"
            aria-label="Egg shell broken"
          >
            <g className="egg-top-piece">
              <path
                className="egg-shell"
                d="M32 6c-9.94 0-18 10.08-18 22.5 0 3.32.5 6.49 1.42 9.4L24 32l4 6 6-6 6 4 6-6c.96-3.16 1.5-6.63 1.5-10 0-12.42-8.06-22.5-18-22.5z"
              />
            </g>
            <path
              className="egg-shell"
              d="M15.5 38.5C18.87 47.96 25.03 54 32 54s13.13-6.04 16.5-15.5L44 38l-6 6-6-4-6 6-6-5.5z"
            />
            <circle className="egg-yolk" cx="32" cy="44" r="6" />
          </svg>
        )}
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Egg status</p>
        <p className="text-sm font-semibold text-slate-700">{stageLabel}</p>
      </div>
    </div>
  )
}
