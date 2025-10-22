"use client"

import { useMemo } from "react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface HasanatChallengeInfo {
  title: string
  icon?: string
  goal: number
  current: number
  roundsCompleted: number
  roundsTarget: number
  difficultyLevel: number
  totalCompletions: number
}

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
  challengeInfo?: HasanatChallengeInfo
}

export function HasanatHud({
  totalHasanat: _totalHasanat,
  dailyHasanat: _dailyHasanat,
  sessionHasanat: _sessionHasanat,
  dailyGoal,
  versesCompleted,
  ramadanMultiplier = 1,
  isRamadan = false,
  announcement,
  breakTheEggGoal,
  breakTheEggCurrent,
  breakTheEggStreak,
  challengeInfo,
}: HasanatHudProps) {
  const goalProgress = useMemo(() => {
    if (!dailyGoal || dailyGoal <= 0 || !versesCompleted) return 0
    return Math.min(100, Math.round((versesCompleted / dailyGoal) * 100))
  }, [dailyGoal, versesCompleted])

  const challengeGoal = challengeInfo?.goal ?? breakTheEggGoal ?? 0
  const challengeCurrent = challengeInfo?.current ?? breakTheEggCurrent ?? 0
  const challengeProgress = useMemo(() => {
    if (!challengeGoal || challengeGoal <= 0) return 0
    return Math.min(100, Math.round((challengeCurrent / challengeGoal) * 100))
  }, [challengeCurrent, challengeGoal])

  const challengeIcon = challengeInfo?.icon ?? "🥚"
  const challengeTitle = challengeInfo?.title ?? "Break the Egg Challenge"
  const challengeRoundsCompleted = challengeInfo?.roundsCompleted ?? breakTheEggStreak ?? 0
  const challengeRoundsTarget = challengeInfo?.roundsTarget ?? (breakTheEggGoal ? 5 : 0)
  const challengeLevelLabel = challengeInfo ? `Level ${challengeInfo.difficultyLevel}` : undefined
  const challengeTotalCompletions = challengeInfo?.totalCompletions ?? null

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
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-2 sm:px-6 lg:px-8">
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

        <div className="flex flex-col gap-2 rounded-xl border border-emerald-100/60 bg-white/70 p-3 text-sm text-slate-600 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900/70 dark:text-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-emerald-100">
              {challengeIcon} {challengeTitle}
            </p>
            {challengeInfo ? (
              <span className="text-[11px] uppercase tracking-wide text-amber-700 dark:text-amber-300">
                {challengeLevelLabel ?? "Levelled"}
              </span>
            ) : breakTheEggStreak ? (
              <span className="text-[11px] uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Streak: {breakTheEggStreak}
              </span>
            ) : null}
          </div>
          {challengeGoal > 0 ? (
            <div className="space-y-1 text-xs">
              <p>
                Progress: {Math.min(challengeCurrent, challengeGoal).toLocaleString()} /{challengeGoal.toLocaleString()} verses
              </p>
              <Progress
                value={challengeProgress}
                className={cn(
                  "h-1.5 bg-emerald-100",
                  challengeProgress >= 100 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-emerald-400",
                )}
                aria-label={`${challengeTitle} progress`}
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Activate the Break the Egg challenge to start building momentum.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-300">
            {challengeRoundsTarget > 0 ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">
                Rounds {Math.min(challengeRoundsCompleted, challengeRoundsTarget)}/{challengeRoundsTarget}
              </span>
            ) : null}
            {challengeTotalCompletions != null ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
                {challengeTotalCompletions.toLocaleString()} completions
              </span>
            ) : null}
          </div>
          {challengeInfo ? null : (
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Complete your focus actions to crack the egg and unlock bonus hasanat.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

