"use client"

import { useState, useEffect } from "react"
import LandingPage from "@/components/landing-page"
import Dashboard from "@/components/dashboard"
import LessonPage from "@/components/lesson-page"
import QuizPage from "@/components/quiz-page"
import ProfilePage from "@/components/profile-page"
import SettingsPage from "@/components/settings-page"
import GamesHub from "@/components/games-hub"
import { getUnlockedAchievements } from "@/lib/achievements-data"
import { updateStreak } from "@/lib/streak-utils"
import { loadDailyChallenge } from "@/lib/daily-challenge"
import { loadParentalControls, loadSessionTime, saveSessionTime } from "@/lib/parental-controls"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("landing")
  const [previousPage, setPreviousPage] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [userProgress, setUserProgress] = useState({
    currentDay: 1,
    completedLessons: [],
    totalPoints: 0,
    streak: 0,
    achievements: [],
    perfectScores: 0,
    quizzesCompleted: 0,
  })
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 300)
    return () => clearTimeout(timer)
  }, [currentPage])

  // Load user progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("qkidProgress")
    if (saved) {
      const progress = JSON.parse(saved)
      const updatedStreak = updateStreak()
      setUserProgress({ ...progress, streak: updatedStreak.currentStreak })
      setCurrentPage("dashboard")
    }

    const challenge = loadDailyChallenge()
    setDailyChallenge(challenge)

    const session = loadSessionTime()
    if (!session.startTime || Date.now() - session.startTime > 86400000) {
      saveSessionTime({ startTime: Date.now(), totalTime: 0 })
    }
  }, [])

  // Save progress to localStorage and update achievements
  useEffect(() => {
    const unlockedAchievements = getUnlockedAchievements(userProgress)
    const updatedProgress = {
      ...userProgress,
      achievements: unlockedAchievements.map((a) => a.id),
    }
    localStorage.setItem("qkidProgress", JSON.stringify(updatedProgress))
  }, [userProgress])

  useEffect(() => {
    const controls = loadParentalControls()
    if (!controls.enabled) return

    const interval = setInterval(() => {
      const session = loadSessionTime()
      const elapsedMinutes = (Date.now() - session.startTime) / 60000
      if (elapsedMinutes > controls.sessionTimeLimit) {
        setShowSessionWarning(true)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleStartLearning = () => {
    setPreviousPage(currentPage)
    setCurrentPage("dashboard")
  }

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson)
    setPreviousPage(currentPage)
    setCurrentPage("lesson")
  }

  const handleLessonComplete = (points) => {
    setUserProgress((prev) => ({
      ...prev,
      completedLessons: [...prev.completedLessons, selectedLesson.id],
      totalPoints: prev.totalPoints + points,
      currentDay: Math.min(prev.currentDay + 1, 60),
      perfectScores: points === 100 ? prev.perfectScores + 1 : prev.perfectScores,
    }))
    setCurrentPage("dashboard")
  }

  const handleStartQuiz = () => {
    setPreviousPage(currentPage)
    setCurrentPage("quiz")
  }

  const handleQuizComplete = (points) => {
    setUserProgress((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      quizzesCompleted: prev.quizzesCompleted + 1,
    }))
    setCurrentPage("dashboard")
  }

  const handleViewProfile = () => {
    setPreviousPage(currentPage)
    setCurrentPage("profile")
  }

  const handleViewGames = () => {
    setPreviousPage(currentPage)
    setCurrentPage("games")
  }

  const handleViewSettings = () => {
    setPreviousPage(currentPage)
    setCurrentPage("settings")
  }

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-milk via-milk to-milk/95">
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-premium rounded-3xl p-8 max-w-md text-center animate-scale-in border-2 border-gold/30">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-maroon mb-4">Session Time Limit</h2>
            <p className="text-maroon/70 mb-6">You've reached your daily learning time limit. Great job!</p>
            <button
              onClick={() => {
                setShowSessionWarning(false)
                setCurrentPage("dashboard")
              }}
              className="btn-primary hover:shadow-lg transition-all w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className={`transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
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
        {currentPage === "lesson" && (
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
