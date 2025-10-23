"use client"

import { ACHIEVEMENT_DEFINITIONS } from "@/lib/child-class/achievements-data"

interface AchievementsShowcaseProps {
  unlockedIds: string[]
}

export function AchievementsShowcase({ unlockedIds }: AchievementsShowcaseProps) {
  return (
    <div className="kid-card p-8">
      <h2 className="mb-6 text-3xl font-extrabold text-maroon">All Achievements</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              className={`rounded-2xl p-6 transition-all duration-300 ${
                isUnlocked
                  ? "bg-gradient-to-br from-amber-100 to-orange-100 shadow-lg"
                  : "bg-white/70 text-maroon/50 shadow-inner"
              }`}
            >
              <div className="text-5xl mb-3">{achievement.icon}</div>
              <h3 className="mb-1 text-maroon font-extrabold">{achievement.name}</h3>
              <p className="mb-3 text-sm text-maroon/70">{achievement.description}</p>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-maroon/70">
                  +{achievement.points} pts
                </span>
                {isUnlocked && <span className="text-lg">✓</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
