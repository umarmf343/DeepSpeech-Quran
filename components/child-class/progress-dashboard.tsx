"use client"

import { calculateLevel, getLevelName, getPointsToNextLevel, getProgressPercentage } from "@/lib/child-class/progress-utils"
import { getUnlockedAchievements, getNextAchievements } from "@/lib/child-class/achievements-data"
import type { ChildProgress } from "@/types/child-class"

interface ProgressDashboardProps {
  userProgress: ChildProgress
}

export function ProgressDashboard({ userProgress }: ProgressDashboardProps) {
  const currentLevel = calculateLevel(userProgress.totalPoints)
  const pointsToNext = getPointsToNextLevel(userProgress.totalPoints)
  const progressPercentage = getProgressPercentage(userProgress.completedLessons)
  const unlockedAchievements = getUnlockedAchievements(userProgress)
  const nextAchievements = getNextAchievements(userProgress)
  const statsPillGradients = ["kid-pill-bubblegum", "kid-pill-sunny", "kid-pill-mint", "kid-pill-sunset"]

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <div className="kid-card kid-gradient-sunset p-8 text-maroon">
        <div className="relative flex justify-between items-start mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-maroon/60">Current Level</p>
            <h2 className="text-4xl font-extrabold text-maroon">{getLevelName(currentLevel)}</h2>
            <p className="mt-1 text-lg text-maroon/70">Level {currentLevel}</p>
          </div>
          <div className="text-6xl animate-bounce-soft">⭐</div>
        </div>

        <div className="relative mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-maroon/70">Points to Next Level</span>
            <span className="text-lg font-black text-maroon">{pointsToNext}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-maroon/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 transition-all duration-500"
              style={{
                width: `${100 - (pointsToNext / 500) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`kid-pill ${statsPillGradients[0]} rounded-3xl p-6 text-center shadow-lg`}>
          <p className="text-3xl font-black text-maroon">{userProgress.totalPoints}</p>
          <p className="mt-2 text-sm text-maroon/70">Total Points</p>
        </div>
        <div className={`kid-pill ${statsPillGradients[1]} rounded-3xl p-6 text-center shadow-lg`}>
          <p className="text-3xl font-black text-maroon">{userProgress.streak}</p>
          <p className="mt-2 text-sm text-maroon/70">Day Streak</p>
        </div>
        <div className={`kid-pill ${statsPillGradients[2]} rounded-3xl p-6 text-center shadow-lg`}>
          <p className="text-3xl font-black text-maroon">{userProgress.completedLessons.length}</p>
          <p className="mt-2 text-sm text-maroon/70">Lessons Done</p>
        </div>
        <div className={`kid-pill ${statsPillGradients[3]} rounded-3xl p-6 text-center shadow-lg`}>
          <p className="text-3xl font-black text-maroon">{unlockedAchievements.length}</p>
          <p className="mt-2 text-sm text-maroon/70">Achievements</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="kid-card kid-gradient-mint p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-maroon">Overall Progress</h3>
          <span className="rounded-full bg-white/80 px-4 py-2 text-2xl font-black text-maroon shadow-inner">{progressPercentage}%</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-maroon/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-maroon via-amber-300 to-pink-400 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="mt-3 text-sm text-maroon/70">{userProgress.completedLessons.length} of 60 lessons completed</p>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="kid-card kid-gradient-bubblegum p-8">
          <h3 className="mb-4 text-xl font-extrabold text-maroon">Unlocked Achievements</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="kid-card kid-gradient-sunny p-4 text-center"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="text-sm font-extrabold text-maroon">{achievement.name}</p>
                <p className="mt-1 text-xs text-maroon/70">+{achievement.points} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Achievements */}
      {nextAchievements.length > 0 && (
        <div className="kid-card kid-gradient-tropical p-8">
          <h3 className="mb-4 text-xl font-extrabold text-maroon">Next Achievements</h3>
          <div className="space-y-3">
            {nextAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="kid-card kid-gradient-mint flex items-center gap-4 p-4 text-maroon"
              >
                <div className="text-3xl text-maroon/60">{achievement.icon}</div>
                <div className="flex-1">
                  <p className="font-extrabold text-maroon">{achievement.name}</p>
                  <p className="text-sm text-maroon/70">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-maroon">+{achievement.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
