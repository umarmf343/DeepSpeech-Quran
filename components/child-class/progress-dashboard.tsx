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

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon to-maroon/85 p-8 text-[var(--color-milk)] shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-16 h-44 w-44 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-10 h-48 w-48 rounded-full bg-amber-200/20 blur-3xl"></div>
        </div>
        <div className="relative flex justify-between items-start mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Current Level</p>
            <h2 className="text-4xl font-extrabold">{getLevelName(currentLevel)}</h2>
            <p className="mt-1 text-lg text-white/80">Level {currentLevel}</p>
          </div>
          <div className="text-6xl animate-bounce-soft">⭐</div>
        </div>

        <div className="relative mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/80">Points to Next Level</span>
            <span className="text-lg font-black">{pointsToNext}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-white transition-all duration-500"
              style={{
                width: `${100 - (pointsToNext / 500) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="kid-pill rounded-3xl p-6 text-center shadow-lg">
          <p className="text-3xl font-black text-maroon">{userProgress.totalPoints}</p>
          <p className="mt-2 text-sm text-maroon/70">Total Points</p>
        </div>
        <div className="kid-pill rounded-3xl p-6 text-center shadow-lg">
          <p className="text-3xl font-black text-maroon">{userProgress.streak}</p>
          <p className="mt-2 text-sm text-maroon/70">Day Streak</p>
        </div>
        <div className="kid-pill rounded-3xl p-6 text-center shadow-lg">
          <p className="text-3xl font-black text-maroon">{userProgress.completedLessons.length}</p>
          <p className="mt-2 text-sm text-maroon/70">Lessons Done</p>
        </div>
        <div className="kid-pill rounded-3xl p-6 text-center shadow-lg">
          <p className="text-3xl font-black text-maroon">{unlockedAchievements.length}</p>
          <p className="mt-2 text-sm text-maroon/70">Achievements</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="kid-card p-8">
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
        <div className="kid-card p-8">
          <h3 className="mb-4 text-xl font-extrabold text-maroon">Unlocked Achievements</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-4 text-center shadow-lg"
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
        <div className="kid-card p-8">
          <h3 className="mb-4 text-xl font-extrabold text-maroon">Next Achievements</h3>
          <div className="space-y-3">
            {nextAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-4 rounded-2xl bg-white/80 p-4 shadow-sm">
                <div className="text-3xl text-maroon/40">{achievement.icon}</div>
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
