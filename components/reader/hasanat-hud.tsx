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

export function HasanatHud({ dailyGoal, versesCompleted, announcement }: HasanatHudProps) {
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
      {announcement ? (
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      ) : null}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-2 rounded-xl border border-emerald-100/60 bg-white/70 p-3 text-xs text-slate-600 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900/70 dark:text-slate-200">
          {dailyGoal ? (
            <div className="space-y-1">
              <p className="font-medium text-slate-700 dark:text-slate-100">
                Daily intention: {Math.min(versesCompleted ?? 0, dailyGoal)}/{dailyGoal} verses
              </p>
              <Progress
                value={goalProgress}
                className={cn("h-1.5 bg-emerald-100", goalProgress >= 100 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-emerald-400")}
                aria-label="Daily goal progress"
              />
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-300">
              Set a daily intention to see your progress here.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

