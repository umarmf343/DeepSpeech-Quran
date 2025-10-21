"use client"

import { useMemo } from "react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface HasanatHudProps {
  totalHasanat: number
  dailyHasanat: number
  sessionHasanat: number
  dailyGoal?: number
  versesCompleted?: number
  ramadanMultiplier?: number
  isRamadan?: boolean
  announcement?: string
}

export function HasanatHud({
  totalHasanat,
  dailyHasanat,
  sessionHasanat,
  dailyGoal,
  versesCompleted,
  ramadanMultiplier = 1,
  isRamadan = false,
  announcement,
}: HasanatHudProps) {
  const goalProgress = useMemo(() => {
    if (!dailyGoal || dailyGoal <= 0 || !versesCompleted) return 0
    return Math.min(100, Math.round((versesCompleted / dailyGoal) * 100))
  }, [dailyGoal, versesCompleted])

  return (
    <section
      className="sticky top-16 z-40 w-full border-b border-emerald-100/60 bg-white/80 backdrop-blur-md dark:border-emerald-800/40 dark:bg-slate-950/80"
      role="region"
      aria-label="Hasanat witness bar"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
            Witnessed letters for Allah
          </span>
          <p className="text-lg font-semibold text-slate-900 dark:text-emerald-100">
            🕌 {totalHasanat.toLocaleString()} Hasanat
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-300">
              Today: {dailyHasanat.toLocaleString()} • Session: {sessionHasanat.toLocaleString()}
            </span>
          </p>
          {announcement ? (
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-200 sm:text-right">
          {dailyGoal ? (
            <div className="space-y-1">
              <p>
                Daily intention: {Math.min(versesCompleted ?? 0, dailyGoal)}/{dailyGoal} verses
              </p>
              <Progress
                value={goalProgress}
                className={cn("h-1.5 bg-emerald-100", goalProgress >= 100 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-emerald-400")}
                aria-label="Daily goal progress"
              />
            </div>
          ) : null}
          <div className="text-xs">
            {isRamadan && ramadanMultiplier > 1 ? (
              <span className="text-amber-700 dark:text-amber-300">
                Ramadan multiplier active ×{ramadanMultiplier.toLocaleString()}
              </span>
            ) : (
              <span>Recite with presence. The reward is with Allah.</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

