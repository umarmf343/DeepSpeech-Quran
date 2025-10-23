"use client"

import { useState, useMemo, useEffect, type CSSProperties } from "react"
import { LESSONS, getLessonsByDay, getTotalDays } from "@/lib/child-class/lessons-data"
import { AutoFitText } from "@/components/common/AutoFitText"
import { AudioPlayButton } from "./audio-play-button"
import { loadGameStats, type GameStats } from "@/lib/child-class/game-stats"
import { loadStreakData, type StreakData } from "@/lib/child-class/streak-utils"
import type { DailyChallenge } from "@/lib/child-class/daily-challenge"
import type { ChildLesson, ChildProgress } from "@/types/child-class"

interface DashboardProps {
  userProgress: ChildProgress
  dailyChallenge?: DailyChallenge | null
  onSelectLesson: (lesson: ChildLesson) => void
  onStartQuiz: () => void
  onViewProfile: () => void
  onViewGames: () => void
  onViewSettings: () => void
}

export default function Dashboard({
  userProgress,
  dailyChallenge,
  onSelectLesson,
  onStartQuiz,
  onViewProfile,
  onViewGames,
  onViewSettings,
}: DashboardProps) {
  const [filterDay, setFilterDay] = useState<number>(1)
  const [gameStats, setGameStats] = useState<GameStats | null>(null)
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [lastSyncedDay, setLastSyncedDay] = useState<number>(1)

  const lessonGradients = [
    "kid-gradient-bubblegum",
    "kid-gradient-sunny",
    "kid-gradient-mint",
    "kid-gradient-sunset",
    "kid-gradient-tropical",
  ]

  const heartPalette = useMemo(() => {
    const palette = [
      "#f472b6",
      "#60a5fa",
      "#facc15",
      "#fb923c",
      "#86efac",
      "#c084fc",
      "#f472b6",
      "#8b5cf6",
      "#2dd4bf",
      "#facc15",
    ]

    for (let i = palette.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[palette[i], palette[j]] = [palette[j], palette[i]]
    }

    return palette
  }, [])

  useEffect(() => {
    setGameStats(loadGameStats())
    setStreakData(loadStreakData())
  }, [])

  const totalDays = getTotalDays()

  useEffect(() => {
    const nextDay = Math.max(1, Math.min(userProgress.currentDay, totalDays))
    setFilterDay((prev) => {
      if (prev > nextDay) {
        return nextDay
      }
      if (prev < nextDay && lastSyncedDay !== nextDay) {
        return nextDay
      }
      return prev
    })
    if (lastSyncedDay !== nextDay) {
      setLastSyncedDay(nextDay)
    }
  }, [lastSyncedDay, totalDays, userProgress.currentDay])

  const lessonsForDay = useMemo<ChildLesson[]>(() => {
    return getLessonsByDay(filterDay)
  }, [filterDay])
  const progressPercentage = (userProgress.completedLessons.length / LESSONS.length) * 100
  const qKidLetters = ["Q", "-", "K", "I", "D"]

  return (
    <div className="relative min-h-screen px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute -top-12 left-6 h-40 w-40 rounded-full bg-white/40 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 right-10 h-48 w-48 rounded-full bg-gradient-to-br from-maroon/15 via-amber-200/40 to-transparent blur-3xl"></div>

      {/* Premium Header */}
      <div className="relative z-10 mb-10 animate-slide-down">
        <div className="kid-card kid-gradient-bubblegum flex flex-col gap-6 rounded-3xl p-8 text-left md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-maroon/60">Today&apos;s Adventure</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold text-maroon">
              Welcome back, {" "}
              <span className="qkid-animated-word" aria-hidden="true">
                {qKidLetters.map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className="qkid-letter"
                    style={{ "--qkid-offset": index } as CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span className="sr-only">Q-KID</span>!
            </h1>
            <p className="mt-3 text-maroon/70">
              Day {filterDay} of {totalDays} • Keep the streak glowing bright ✨
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={onViewGames}
              className="kid-pill kid-pill-tropical flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-105"
            >
              <span className="text-lg">🎮</span> Games
            </button>
            <button
              onClick={onViewProfile}
              className="kid-pill kid-pill-bubblegum flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-105"
            >
              <span className="text-lg">🧒</span> Profile
            </button>
            <button
              onClick={onViewSettings}
              className="kid-button kid-button-sunset px-5 py-2 text-sm font-semibold"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Daily Challenge - Premium Card */}
      {dailyChallenge && !dailyChallenge.completed && (
        <div className="relative z-10 mb-8 animate-scale-in">
          <div className="kid-card kid-gradient-sunny flex flex-col gap-4 rounded-3xl p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-maroon">Glitter Challenge</h2>
              <p className="mt-1 text-maroon/70">
                Complete Lesson {dailyChallenge.lessonId} with a focus on {dailyChallenge.challengeType} today.
              </p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-maroon shadow-sm">
                <span>✨ Bonus</span> +{dailyChallenge.bonusPoints} points
              </p>
            </div>
            <div className="text-6xl animate-float-slow">🌟</div>
          </div>
        </div>
      )}

      {/* Progress Section - Premium Design */}
      <div className="relative z-10 mb-8 animate-slide-up">
        <div className="kid-card kid-gradient-mint p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-maroon/60">Progress Overview</p>
              <h2 className="text-3xl font-extrabold text-maroon">You&apos;re shining so bright!</h2>
            </div>
            <span className="rounded-full bg-white/70 px-5 py-2 text-3xl font-black text-maroon shadow-inner">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="mb-8 h-4 w-full overflow-hidden rounded-full bg-maroon/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-maroon via-amber-400 to-pink-400 transition-all duration-1000 ease-out animate-pulse-glow"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="kid-pill kid-pill-bubblegum rounded-3xl p-5 text-center shadow-lg">
              <p className="text-3xl font-black text-maroon">{userProgress.totalPoints}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-maroon/60">Points</p>
            </div>
            <div className="kid-pill kid-pill-sunny rounded-3xl p-5 text-center shadow-lg">
              <p className="text-3xl font-black text-maroon">{streakData?.currentStreak || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-maroon/60">Streak</p>
            </div>
            <div className="kid-pill kid-pill-mint rounded-3xl p-5 text-center shadow-lg">
              <p className="text-3xl font-black text-maroon">{userProgress.completedLessons.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-maroon/60">Lessons</p>
            </div>
            <div className="kid-pill kid-pill-sunset rounded-3xl p-5 text-center shadow-lg">
              <p className="text-3xl font-black text-maroon">{gameStats?.gamesCompleted || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-maroon/60">Games</p>
            </div>
          </div>
        </div>
      </div>

      {/* Day Navigation */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h3 className="text-lg font-extrabold text-maroon">Choose Your Mission</h3>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-maroon/70">
            {totalDays} Days
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const hasReachedDay = day <= userProgress.currentDay
            const isActive = filterDay === day

            const baseClasses =
              "bg-gradient-to-r from-[#ff4d6d] via-[#ff2d88] to-[#ff1b8d] text-white shadow-[0_12px_32px_rgba(255,45,136,0.3)] hover:from-[#102147] hover:via-[#143166] hover:to-[#1a4286] hover:shadow-[0_16px_36px_rgba(16,33,71,0.45)] hover:scale-105 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_rgba(255,255,255,0)_60%)] before:opacity-70 before:transition-opacity before:duration-300 before:content-[''] hover:before:opacity-100"
            const unlockedClasses =
              "ring-2 ring-white/80 after:absolute after:bottom-[-25%] after:left-1/2 after:h-12 after:w-12 after:-translate-x-1/2 after:rounded-full after:bg-white/30 after:blur-2xl after:content-['']"
            const upcomingClasses = "opacity-80"

            const heartColor = heartPalette[(day - 1) % heartPalette.length]

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setFilterDay(day)
                }}
                className={`relative flex-shrink-0 overflow-hidden rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 ${baseClasses} ${
                  hasReachedDay ? unlockedClasses : upcomingClasses
                } ${isActive ? "ring-4 ring-white/90" : ""}`}
              >
                <span className="relative z-[1] flex items-center gap-2">
                  <span
                    className="text-lg"
                    style={{
                      color: heartColor,
                      textShadow: "0 0 6px rgba(255,255,255,0.9)",
                    }}
                  >
                    ♥
                  </span>
                  Day {day}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lessons for Selected Day */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-extrabold text-maroon">Today&apos;s Lessons ({lessonsForDay.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessonsForDay.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`kid-card ${
                lessonGradients[index % lessonGradients.length]
              } cursor-pointer flex flex-col items-center gap-3 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] sm:gap-4 sm:p-6 ${
                userProgress.completedLessons.includes(lesson.id)
                  ? "kid-card-completed"
                  : ""
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="grid w-full grid-cols-2 gap-3 text-center sm:gap-4">
                <div className="col-span-2 mb-1 flex w-full flex-wrap items-center justify-center gap-2 sm:justify-between">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-maroon/70 shadow-sm">
                    Lesson {index + 1}
                  </span>
                  {userProgress.completedLessons.includes(lesson.id) && (
                    <span className="text-xl animate-bounce sm:text-2xl">✓</span>
                  )}
                </div>
                <h3 className="col-span-2 text-base font-extrabold text-maroon sm:text-lg">{lesson.title}</h3>
                <div className="col-span-1 flex min-h-[5.5rem] items-center justify-center">
                  <AutoFitText maxFontSize={88} minFontSize={44} className="text-black font-black">
                    {lesson.arabic}
                  </AutoFitText>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <AudioPlayButton
                    audioSrc={lesson.audioSrc}
                    fallbackText={lesson.arabic}
                    label={`Play pronunciation for ${lesson.title}`}
                    className="h-14 w-14 justify-self-center border border-white/70 bg-white/95 text-maroon shadow-lg"
                  />
                </div>
                <p className="col-span-2 text-sm text-maroon/70 sm:text-base">{lesson.translit}</p>
                <p className="col-span-2 text-xs uppercase tracking-widest text-maroon/50">{lesson.rule}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Section */}
      <div className="relative z-10 mb-8 flex flex-col">
        <div className="kid-card kid-gradient-sunset flex flex-col gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-maroon">Daily Quiz</h2>
            <p className="mt-1 text-maroon/70">Test your knowledge on today&apos;s lessons</p>
          </div>
          <div className="text-5xl animate-bounce-soft">📝</div>
        </div>
        <button
          onClick={onStartQuiz}
          className="kid-button kid-button-tropical mt-4 self-end px-6 py-2 text-sm font-extrabold"
        >
          Start Quiz
        </button>
      </div>
    </div>
  )
}
