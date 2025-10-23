"use client"

import { useEffect, useMemo, useState } from "react"

import Dashboard from "@/components/child-class/dashboard"
import GamesHub from "@/components/child-class/games-hub"
import LandingPage from "@/components/child-class/landing-page"
import LessonPage from "@/components/child-class/lesson-page"
import ProfilePage from "@/components/child-class/profile-page"
import QuizPage from "@/components/child-class/quiz-page"
import SettingsPage from "@/components/child-class/settings-page"
import type { DailyChallenge } from "@/lib/child-class/daily-challenge"
import { loadDailyChallenge } from "@/lib/child-class/daily-challenge"
import {
  loadParentalControls,
  loadSessionTime,
  saveSessionTime,
  type ParentalControls,
  type SessionTime,
} from "@/lib/child-class/parental-controls"
import { getLessonsByDay, getTotalDays } from "@/lib/child-class/lessons-data"
import { getUnlockedAchievements } from "@/lib/child-class/achievements-data"
import { updateStreak } from "@/lib/child-class/streak-utils"
import type { ChildLesson, ChildProgress } from "@/types/child-class"

const INITIAL_PROGRESS: ChildProgress = {
  currentDay: 1,
  completedLessons: [],
  totalPoints: 0,
  streak: 0,
  achievements: [],
  perfectScores: 0,
  quizzesCompleted: 0,
}

type PageKey = "landing" | "dashboard" | "lesson" | "quiz" | "games" | "profile" | "settings"

const PROGRESS_STORAGE_KEY = "qkidProgress"

export default function KidClassPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>("landing")
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const [userProgress, setUserProgress] = useState<ChildProgress>(INITIAL_PROGRESS)
  const [selectedLesson, setSelectedLesson] = useState<ChildLesson | null>(null)
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false)

  const totalDays = useMemo(() => getTotalDays(), [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const savedProgress = window.localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (savedProgress) {
      const parsed: ChildProgress = JSON.parse(savedProgress)
      const updatedStreak = updateStreak()
      setUserProgress({ ...parsed, streak: updatedStreak.currentStreak })
      setCurrentPage("dashboard")
    }

    const challenge = loadDailyChallenge()
    setDailyChallenge(challenge)

    const session = loadSessionTime()
    if (!session.startTime || Date.now() - session.startTime > 86_400_000) {
      saveSessionTime({ startTime: Date.now(), totalTime: 0 })
    }
  }, [])

  useEffect(() => {
    setIsTransitioning(true)
    const timeout = window.setTimeout(() => setIsTransitioning(false), 300)
    return () => window.clearTimeout(timeout)
  }, [currentPage])

  useEffect(() => {
    if (typeof window === "undefined") return

    const unlockedAchievements = getUnlockedAchievements(userProgress).map((achievement) => achievement.id)
    const hasSameAchievements =
      unlockedAchievements.length === userProgress.achievements.length &&
      unlockedAchievements.every((id) => userProgress.achievements.includes(id))

    if (!hasSameAchievements) {
      setUserProgress((prev) => ({ ...prev, achievements: unlockedAchievements }))
      return
    }

    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...userProgress, achievements: unlockedAchievements }),
    )
  }, [userProgress])

  useEffect(() => {
    const controls: ParentalControls = loadParentalControls()
    if (!controls.enabled) return

    const interval = window.setInterval(() => {
      const session: SessionTime = loadSessionTime()
      const elapsedMinutes = (Date.now() - session.startTime) / 60_000
      if (elapsedMinutes > controls.sessionTimeLimit) {
        setShowSessionWarning(true)
      }
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  const handleNavigate = (nextPage: PageKey) => {
    setCurrentPage(nextPage)
  }

  const handleStartLearning = () => {
    handleNavigate("dashboard")
  }

  const handleSelectLesson = (lesson: ChildLesson) => {
    setSelectedLesson(lesson)
    handleNavigate("lesson")
  }

  const handleLessonComplete = (points: number) => {
    if (!selectedLesson) {
      handleNavigate("dashboard")
      return
    }

    const updatedStreak = updateStreak()

    setUserProgress((prev) => {
      const alreadyCompleted = prev.completedLessons.includes(selectedLesson.id)
      const completedLessons = alreadyCompleted
        ? prev.completedLessons
        : [...prev.completedLessons, selectedLesson.id]

      const nextDay = (() => {
        for (let day = 1; day <= totalDays; day++) {
          const lessonsForDay = getLessonsByDay(day)
          if (lessonsForDay.length === 0) continue
          const isDayComplete = lessonsForDay.every((lesson) => completedLessons.includes(lesson.id))
          if (!isDayComplete) {
            return day
          }
        }
        return totalDays
      })()

      return {
        ...prev,
        completedLessons,
        totalPoints: prev.totalPoints + points,
        currentDay: nextDay,
        perfectScores: points === 100 ? prev.perfectScores + 1 : prev.perfectScores,
        streak: updatedStreak.currentStreak,
      }
    })

    setSelectedLesson(null)
    setCurrentPage("dashboard")
  }

  const handleStartQuiz = () => {
    handleNavigate("quiz")
  }

  const handleQuizComplete = (points: number) => {
    setUserProgress((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      quizzesCompleted: prev.quizzesCompleted + 1,
    }))
    setCurrentPage("dashboard")
  }

  const handleViewProfile = () => handleNavigate("profile")
  const handleViewGames = () => handleNavigate("games")
  const handleViewSettings = () => handleNavigate("settings")

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard")
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-kid-sky font-kid text-maroon">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-white/40 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-10 right-16 h-44 w-44 rounded-full bg-gradient-to-br from-maroon/20 to-gold/30 blur-3xl animate-bounce-soft"></div>
        <div className="absolute top-1/3 right-1/4 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200/60 via-pink-100/50 to-transparent blur-2xl"></div>
      </div>
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="kid-card kid-gradient-sunset p-8 max-w-md text-center animate-scale-in">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-3xl font-bold text-maroon mb-2">Session Time Limit</h2>
            <p className="text-maroon/70 mb-6">You've reached your daily learning time limit. Great job!</p>
            <button
              onClick={() => {
                setShowSessionWarning(false)
                setCurrentPage("dashboard")
              }}
              className="kid-button kid-button-bubblegum kid-button-contrast w-full py-3 text-base"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <div
        className={`relative transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}
      >
        {currentPage === "landing" && <LandingPage onStart={handleStartLearning} />}
        {currentPage === "dashboard" && (
          <Dashboard
            userProgress={userProgress}
            dailyChallenge={dailyChallenge}
            onSelectLesson={handleSelectLesson}
            onStartQuiz={handleStartQuiz}
            onViewProfile={handleViewProfile}
            onViewGames={handleViewGames}
            onViewSettings={handleViewSettings}
          />
        )}
        {currentPage === "lesson" && selectedLesson && (
          <LessonPage lesson={selectedLesson} onComplete={handleLessonComplete} onBack={handleBackToDashboard} />
        )}
        {currentPage === "quiz" && <QuizPage onComplete={handleQuizComplete} onBack={handleBackToDashboard} />}
        {currentPage === "games" && <GamesHub userProgress={userProgress} onBack={handleBackToDashboard} />}
        {currentPage === "profile" && <ProfilePage userProgress={userProgress} onBack={handleBackToDashboard} />}
        {currentPage === "settings" && <SettingsPage onBack={handleBackToDashboard} />}
      </div>
    </main>
  )
}
