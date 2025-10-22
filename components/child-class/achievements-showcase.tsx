"use client"

import { ACHIEVEMENT_DEFINITIONS } from "@/lib/child-class/achievements-data"

interface AchievementsShowcaseProps {
  unlockedIds: string[]
}

export function AchievementsShowcase({ unlockedIds }: AchievementsShowcaseProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-maroon mb-6">All Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              className={`rounded-2xl p-6 transition-all duration-300 ${
                isUnlocked
                  ? "bg-gradient-to-br from-gold/20 to-orange-100 border-2 border-gold"
                  : "bg-gray-100 border-2 border-gray-300 opacity-60"
              }`}
            >
              <div className="text-5xl mb-3">{achievement.icon}</div>
              <h3 className="font-bold text-maroon mb-1">{achievement.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-maroon bg-maroon/10 px-2 py-1 rounded">
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
