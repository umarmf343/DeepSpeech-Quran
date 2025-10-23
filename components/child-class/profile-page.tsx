"use client"

import { ProgressDashboard } from "./progress-dashboard"
import { AchievementsShowcase } from "./achievements-showcase"
import { getUnlockedAchievements } from "@/lib/child-class/achievements-data"
import type { ChildProgress } from "@/types/child-class"

interface ProfilePageProps {
  userProgress: ChildProgress
  onBack: () => void
}

export default function ProfilePage({ userProgress, onBack }: ProfilePageProps) {
  const unlockedAchievements = getUnlockedAchievements(userProgress)
  const unlockedIds = unlockedAchievements.map((a) => a.id)

  return (
    <div className="relative min-h-screen px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-10 h-44 w-44 rounded-full bg-white/45 blur-3xl"></div>
        <div className="absolute bottom-0 right-12 h-52 w-52 rounded-full bg-gradient-to-br from-maroon/20 via-amber-200/50 to-transparent blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl font-extrabold text-maroon">Your Profile</h1>
        <button
          onClick={onBack}
          className="rounded-full bg-gradient-to-r from-maroon via-maroon/90 to-maroon/80 px-5 py-2 text-sm font-extrabold text-[var(--color-milk)] shadow-[0_10px_25px_rgba(123,51,96,0.25)] transition-transform duration-300 hover:scale-105"
        >
          Back
        </button>
      </div>

      {/* Progress Dashboard */}
      <div className="relative z-10 mx-auto mb-12 max-w-6xl">
        <ProgressDashboard userProgress={userProgress} />
      </div>

      {/* Achievements Showcase */}
      <div className="relative z-10 mx-auto max-w-6xl">
        <AchievementsShowcase unlockedIds={unlockedIds} />
      </div>
    </div>
  )
}
