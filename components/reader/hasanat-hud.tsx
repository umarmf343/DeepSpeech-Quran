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
  breakTheEggGoal?: number
  breakTheEggCurrent?: number
  breakTheEggStreak?: number
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
  breakTheEggGoal,
  breakTheEggCurrent,
  breakTheEggStreak,
}: HasanatHudProps) {
  const goalProgress = useMemo(() => {
    if (!dailyGoal || dailyGoal <= 0 || !versesCompleted) return 0
    return Math.min(100, Math.round((versesCompleted / dailyGoal) * 100))
  }, [dailyGoal, versesCompleted])

  const breakTheEggProgress = useMemo(() => {
    if (!breakTheEggGoal || breakTheEggGoal <= 0 || !breakTheEggCurrent) return 0
    return Math.min(100, Math.round((breakTheEggCurrent / breakTheEggGoal) * 100))
  }, [breakTheEggCurrent, breakTheEggGoal])

  return (
    <section
      className="sticky top-16 z-40 w-full border-b border-emerald-100/60 bg-white/80 backdrop-blur-md dark:border-emerald-800/40 dark:bg-slate-950/80"
      role="region"
      aria-label="Hasanat witness bar"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-2 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 rounded-xl border border-emerald-100/60 bg-white/70 p-3 text-slate-700 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900/70 dark:text-slate-200">
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
          </div>
          {announcement ? (
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          ) : null}
        </div>

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

        <div className="flex flex-col justify-center gap-2 rounded-xl border border-emerald-100/60 bg-white/70 p-3 text-sm text-slate-600 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900/70 dark:text-slate-200">
          {isRamadan && ramadanMultiplier > 1 ? (
            <>
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Ramadan multiplier active
              </span>
              <p className="text-sm text-slate-700 dark:text-emerald-100">
                All recitation rewards are multiplied by ×{ramadanMultiplier.toLocaleString()}.
              </p>
            </>
          ) : (
            <p>Recite with presence. The reward is with Allah.</p>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-emerald-100/60 bg-white/70 p-3 text-sm text-slate-600 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900/70 dark:text-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-emerald-100">🥚 Break the Egg Challenge</p>
            {breakTheEggStreak ? (
              <span className="text-[11px] uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Streak: {breakTheEggStreak}
              </span>
            ) : null}
          </div>
          {breakTheEggGoal ? (
            <div className="space-y-1 text-xs">
              <p>
                Progress: {Math.min(breakTheEggCurrent ?? 0, breakTheEggGoal).toLocaleString()} /
                {breakTheEggGoal.toLocaleString()} focus actions
              </p>
              <Progress
                value={breakTheEggProgress}
                className={cn(
                  "h-1.5 bg-emerald-100",
                  breakTheEggProgress >= 100 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-emerald-400",
                )}
                aria-label="Break the Egg challenge progress"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Activate the Break the Egg challenge to start building momentum.
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Complete your focus actions to crack the egg and unlock bonus hasanat.
          </p>
        </div>
      </div>
    </section>
  )
}

