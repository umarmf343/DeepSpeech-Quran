"use client"

import { useMemo, type CSSProperties } from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type {
  ReaderChallengeCelebration,
  ReaderChallengeSnapshot,
} from "@/lib/reader/challenges"
import { cn } from "@/lib/utils"

import { ArrowRight, Gift, RotateCcw, Sparkles } from "lucide-react"

interface EggChallengeWidgetProps {
  snapshot: ReaderChallengeSnapshot | null
  celebration: ReaderChallengeCelebration | null
  loading?: boolean
  updating?: boolean
  onReset: () => void
  onDismissCelebration: () => void
}

const SPRINKLE_COLORS = [
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-rose-400",
  "bg-purple-400",
  "bg-lime-400",
]

export function EggChallengeWidget({
  snapshot,
  celebration,
  loading = false,
  updating = false,
  onReset,
  onDismissCelebration,
}: EggChallengeWidgetProps) {
  const state = snapshot?.state
  const definition = snapshot?.current
  const nextChallenge = snapshot?.next

  const goal = state?.goal ?? 10
  const progress = state?.progress ?? 0
  const roundsCompleted = state?.roundsCompleted ?? 0
  const totalCompletions = state?.totalCompletions ?? 0
  const roundsTarget = definition?.roundsToAdvance ?? 1

  const percent = goal > 0 ? Math.min(100, Math.round((progress / goal) * 100)) : 0
  const remainingVerses = Math.max(goal - progress, 0)
  const showCelebration = Boolean(celebration)

  const sprinkleOffsets = useMemo(() => {
    if (!showCelebration) return []
    const count = 16
    return Array.from({ length: count }).map((_, index) => {
      const angle = (index / count) * Math.PI * 2
      const radius = 70 + (index % 4) * 18
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius * -1
      const color = SPRINKLE_COLORS[index % SPRINKLE_COLORS.length]
      const delay = (index % 6) * 0.05
      return { x, y, color, delay }
    })
  }, [showCelebration])

  const progressCaption = percent >= 100
    ? "Egg cracked! Preparing the next blessing."
    : `${remainingVerses} Verse${remainingVerses === 1 ? "" : "s"} Left`

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br p-6 shadow-lg",
        definition?.gradientClass ?? "from-amber-50 via-rose-50 to-emerald-50",
      )}
      aria-label={definition ? `${definition.title} progress` : "Challenge progress"}
    >
      {showCelebration ? (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {sprinkleOffsets.map((item, index) => (
            <span
              key={`sprinkle-${index}`}
              className={cn("sprinkle-piece", item.color)}
              style={
                {
                  "--sprinkle-x": `${item.x}px`,
                  "--sprinkle-y": `${item.y}px`,
                  animationDelay: `${item.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      <div className="relative grid grid-cols-3 gap-4 sm:gap-6">
        <div className="flex min-w-0 flex-col items-center gap-4 rounded-2xl bg-white/70 p-4 text-center shadow-inner backdrop-blur-sm sm:p-6">
          <div className="relative h-24 w-20">
            <div
              className={cn(
                "egg-shell",
                showCelebration ? "egg-shell-cracked" : "egg-shell-pulse",
              )}
              aria-hidden="true"
            />
            <div
              className={cn(
                "egg-glow",
                showCelebration ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">
              {definition?.title ?? "Break the Egg"}
            </p>
            {definition?.tagline ? (
              <p className="text-sm font-medium text-slate-600">{definition.tagline}</p>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 rounded-2xl bg-white/80 p-3 shadow-inner backdrop-blur-sm sm:p-4">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-maroon-600">
            <span>Progress</span>
            <span>
              {progress}/{goal}
            </span>
          </div>
          <Progress
            value={percent}
            className="h-3 bg-amber-100"
            aria-hidden={false}
            aria-valuenow={percent}
          />
          <p className="text-xs text-slate-600">{progressCaption}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">
              Rounds: {Math.min(roundsCompleted, roundsTarget)}/{roundsTarget}
            </span>
            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
              Total completions: {totalCompletions}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span>{definition?.description ?? "Recite with presence to unlock the surprise."}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-emerald-700 hover:text-emerald-800"
              onClick={() => {
                onReset()
                onDismissCelebration()
              }}
              disabled={loading || updating}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl bg-white/80 p-3 shadow-inner backdrop-blur-sm sm:p-4">
          <div className="space-y-3">
            <p className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 bg-clip-text text-xs font-semibold uppercase tracking-[0.35em] text-transparent">
              Mystery Box
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center" aria-hidden="true">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/60 via-pink-400/60 to-amber-300/60 blur-md" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-inner ring-2 ring-purple-200">
                  {typeof nextChallenge?.icon === "string" ? (
                    <span className="text-2xl leading-none text-purple-500 drop-shadow-sm">
                      {nextChallenge.icon}
                    </span>
                  ) : (
                    <Gift className="h-6 w-6 text-purple-500 drop-shadow-sm" />
                  )}
                  <Sparkles className="pointer-events-none absolute -top-1 -right-1 h-4 w-4 text-amber-300" />
                  <Sparkles className="pointer-events-none absolute -bottom-1 -left-1 h-3 w-3 text-pink-300" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-800">
                  {nextChallenge?.title ?? "Unlock the Mystery"}
                </p>
                <p className="text-sm text-slate-500">
                  {nextChallenge?.tagline ?? "Gather your recitation keys to reveal the surprise inside."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              {nextChallenge
                ? `Stay steady to reach ${nextChallenge.title}.`
                : "Complete this challenge to reveal the next blessing."}
            </span>
            <ArrowRight className="h-4 w-4 text-purple-500" aria-hidden="true" />
          </div>
        </div>
      </div>

      {showCelebration ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-maroon-700">
          <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold shadow-md">
            <Sparkles className="mr-2 inline-block h-4 w-4 text-emerald-500" aria-hidden="true" />
            {celebration?.challengeTitle ?? "MashaAllah!"}
          </div>
          <p className="mt-2 max-w-sm text-xs text-slate-600">
            {celebration?.roundsTarget
              ? `Completed round ${celebration.completedRound} of ${celebration.roundsTarget}.`
              : "Another milestone unlocked."}
          </p>
        </div>
      ) : null}

      {(loading || updating) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-3 w-3 animate-ping rounded-full bg-emerald-500" aria-hidden="true" />
            Updating challenge…
          </div>
        </div>
      )}
    </section>
  )
}
