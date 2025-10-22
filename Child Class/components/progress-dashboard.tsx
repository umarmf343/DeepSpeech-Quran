"use client"

import { calculateLevel, getLevelName, getPointsToNextLevel, getProgressPercentage } from "@/lib/progress-utils"
import { getUnlockedAchievements, getNextAchievements } from "@/lib/achievements-data"

interface ProgressDashboardProps {
  userProgress: {
    currentDay: number
    completedLessons: string[]
    totalPoints: number
    streak: number
    achievements: string[]
    perfectScores?: number
    quizzesCompleted?: number
  }
}

export function ProgressDashboard({ userProgress }: ProgressDashboardProps) {
  const currentLevel = calculateLevel(userProgress.totalPoints)
  const pointsToNext = getPointsToNextLevel(userProgress.totalPoints)
  const progressPercentage = getProgressPercentage(userProgress.completedLessons)
  const unlockedAchievements = getUnlockedAchievements(userProgress)
  const nextAchievements = getNextAchievements(userProgress)

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <div className="bg-gradient-to-br from-maroon to-maroon/80 rounded-3xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm opacity-90">Current Level</p>
            <h2 className="text-4xl font-bold">{getLevelName(currentLevel)}</h2>
            <p className="text-lg opacity-90 mt-1">Level {currentLevel}</p>
          </div>
          <div className="text-6xl">⭐</div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Points to Next Level</span>
            <span className="text-lg font-bold">{pointsToNext}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gold h-full transition-all duration-500"
              style={{
                width: `${100 - (pointsToNext / 500) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-3xl font-bold text-maroon">{userProgress.totalPoints}</p>
          <p className="text-sm text-gray-600 mt-2">Total Points</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-3xl font-bold text-gold">{userProgress.streak}</p>
          <p className="text-sm text-gray-600 mt-2">Day Streak</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-3xl font-bold text-maroon">{userProgress.completedLessons.length}</p>
          <p className="text-sm text-gray-600 mt-2">Lessons Done</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-3xl font-bold text-maroon">{unlockedAchievements.length}</p>
          <p className="text-sm text-gray-600 mt-2">Achievements</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-maroon">Overall Progress</h3>
          <span className="text-2xl font-bold text-gold">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-maroon to-gold h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-3">{userProgress.completedLessons.length} of 60 lessons completed</p>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-maroon mb-4">Unlocked Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-gold/20 to-orange-100 rounded-2xl p-4 text-center border-2 border-gold"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="font-bold text-maroon text-sm">{achievement.name}</p>
                <p className="text-xs text-gray-600 mt-1">+{achievement.points} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Achievements */}
      {nextAchievements.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-maroon mb-4">Next Achievements</h3>
          <div className="space-y-3">
            {nextAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="text-3xl opacity-50">{achievement.icon}</div>
                <div className="flex-1">
                  <p className="font-bold text-maroon">{achievement.name}</p>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gold">+{achievement.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
