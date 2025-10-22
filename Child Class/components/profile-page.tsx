"use client"

import { ProgressDashboard } from "./progress-dashboard"
import { AchievementsShowcase } from "./achievements-showcase"
import { getUnlockedAchievements } from "@/lib/achievements-data"

export default function ProfilePage({ userProgress, onBack }) {
  const unlockedAchievements = getUnlockedAchievements(userProgress)
  const unlockedIds = unlockedAchievements.map((a) => a.id)

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-maroon">Your Profile</h1>
        <button
          onClick={onBack}
          className="bg-maroon hover:bg-maroon/90 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
        >
          Back
        </button>
      </div>

      {/* Progress Dashboard */}
      <div className="max-w-6xl mx-auto mb-12">
        <ProgressDashboard userProgress={userProgress} />
      </div>

      {/* Achievements Showcase */}
      <div className="max-w-6xl mx-auto">
        <AchievementsShowcase unlockedIds={unlockedIds} />
      </div>
    </div>
  )
}
