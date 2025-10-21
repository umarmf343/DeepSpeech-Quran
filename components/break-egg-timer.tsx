"use client"

import { useEffect, useMemo, useRef, useId } from "react"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEggSessionTimer } from "@/hooks/use-egg-session"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

const DEFAULT_DURATION = 120

export function BreakEggTimer() {
  const { state, duration, timeLeft, isRunning, isLoading, start, reset } = useEggSessionTimer(DEFAULT_DURATION)
  const lastCelebrationRef = useRef<string | null>(null)
  const { triggerCelebration } = useUser()

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
    triggerCelebration({
      title: "Takbir!",
      message: "You completed the Break the Egg focus sprint. Keep the momentum going and aim for the next egg!",
      asset: "egg",
      rewardCopy: `Sessions cracked: ${state.totalCompleted ?? 0}`,
    })
  }, [state?.lastCompletedAt, state?.totalCompleted, triggerCelebration])

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

  const handleToggle = async () => {
    if (isRunning) {
      await handleReset()
      return
    }

    await handleStart()
  }

  return (
    <div className="w-full">
      <Card className="relative overflow-hidden border border-blue-100/70 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)] md:gap-6">
            <div className="col-span-1 space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Break the Egg Challenge</p>
              <h2 className="text-2xl font-bold text-slate-900">2-minute focused recitation sprint</h2>
            </div>
            <div className="col-span-1 flex items-center justify-end">
              <EggProgressIcon progress={progress} />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-indigo-100">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 transition-[width] duration-500",
                    isRunning ? "shadow-[0_0_15px_rgba(99,102,241,0.35)]" : "",
                  )}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg font-medium text-slate-700">Time left: {formattedTime}</p>
                <div className="grid w-full grid-cols-1 gap-3 sm:w-auto">
                  <Button
                    onClick={handleToggle}
                    disabled={isLoading}
                    className="w-full rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                    aria-pressed={isRunning}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isRunning ? "Stop" : "Start"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 rounded-2xl bg-white/70 p-4 text-sm text-slate-600 shadow-inner">
              <p>
                Stay focused for the full two minutes to crack the shell. You have completed
                <span className="mx-1 font-semibold text-indigo-600">{state?.totalCompleted ?? 0}</span>
                sessions so far.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

function EggProgressIcon({ progress }: { progress: number }) {
  const uniqueId = useId()
  const gradientId = useMemo(
    () => `egg-shell-gradient-${uniqueId.replace(/:/g, "")}`,
    [uniqueId],
  )
  const glowId = `${gradientId}-glow`

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
            <defs>
              <linearGradient id={gradientId} x1="18" x2="46" y1="10" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fff7c2" />
                <stop offset="55%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
              <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 42) rotate(90) scale(14 12)">
                <stop offset="0%" stopColor="rgba(253, 224, 71, 0.6)" />
                <stop offset="100%" stopColor="rgba(253, 224, 71, 0)" />
              </radialGradient>
            </defs>
            <g className="egg-icon">
              <path
                className="egg-shell-base"
                d="M32 6c-8.8 0-16 9.9-16 21.8 0 6.4 2 12.3 5.2 17.1 3.5 5.3 7.9 9.1 10.8 9.1s7.3-3.8 10.8-9.1C45.9 40.1 48 34.2 48 27.8 48 15.9 40.8 6 32 6z"
                fill={`url(#${gradientId})`}
              />
              <path
                className="egg-shell-highlight"
                d="M24 18.5c-3 3.5-4.8 8.7-4.8 13.8 0 2.7.5 5.4 1.4 7.8 1.6-1.4 3.5-2.6 5.4-3.5 6-2.8 9.4-8.3 10.6-12.5-3.6-4.9-8.2-7.6-12.6-5.6z"
              />
              <ellipse className="egg-shell-glow" cx="32" cy="44" rx="11" ry="8" fill={`url(#${glowId})`} />
            </g>
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
