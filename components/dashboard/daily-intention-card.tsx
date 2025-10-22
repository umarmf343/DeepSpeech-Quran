"use client"

import { useEffect, useMemo, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { dailyGoalConfig, type DailyGoalSnapshot } from "@/lib/daily-goal-store"

interface DailyIntentionCardProps {
  className?: string
}

export function DailyIntentionCard({ className }: DailyIntentionCardProps) {
  const [dailyGoal, setDailyGoal] = useState<DailyGoalSnapshot | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadDailyGoal = async () => {
      try {
        const response = await fetch("/api/daily-goal")
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const data = (await response.json()) as { dailyGoal?: DailyGoalSnapshot }
        if (isMounted && data?.dailyGoal) {
          setDailyGoal(data.dailyGoal)
        }
      } catch (error) {
        console.warn("Unable to load daily goal progress", error)
      }
    }

    void loadDailyGoal()

    return () => {
      isMounted = false
    }
  }, [])

  const { count, target, progress } = useMemo(() => {
    const goalTarget = dailyGoal?.target ?? dailyGoalConfig.defaultTarget
    const goalCount = Math.min(dailyGoal?.count ?? 0, goalTarget)
    const percentage = goalTarget > 0 ? Math.round((goalCount / goalTarget) * 100) : 0
    return {
      count: goalCount,
      target: goalTarget,
      progress: Math.min(100, Math.max(0, percentage)),
    }
  }, [dailyGoal])

  return (
    <Card
      className={cn(
        "border border-emerald-100/60 bg-white/70 text-xs text-slate-600 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900/70 dark:text-slate-200",
        className,
      )}
      role="group"
      aria-labelledby="daily-intention-title"
    >
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <p id="daily-intention-title" className="font-medium text-slate-700 dark:text-slate-100">
            Daily intention: {count}/{target} verses
          </p>
          <Progress
            value={progress}
            className={cn(
              "h-1.5 bg-emerald-100",
              progress >= 100 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-emerald-400",
            )}
            aria-label="Daily goal progress"
          />
        </div>
        {progress >= 100 ? (
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
            Goal complete — keep reciting for extra blessings!
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
