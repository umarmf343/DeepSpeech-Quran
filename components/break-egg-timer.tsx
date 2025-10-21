"use client"

import { useEffect, useMemo, useRef } from "react"

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

  return (
    <div className="w-full">
      <Card className="relative overflow-hidden border border-blue-100/70 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Break the Egg Challenge</p>
            <h2 className="text-2xl font-bold text-slate-900">2-minute focused recitation sprint</h2>
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

    </div>
  )
}
