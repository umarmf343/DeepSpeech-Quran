"use client"

import { useState, useMemo, useEffect } from "react"
import { LESSONS, getLessonsByDay, getTotalDays } from "@/lib/lessons-data"
import { loadGameStats } from "@/lib/game-stats"
import { loadStreakData } from "@/lib/streak-utils"

export default function Dashboard({
  userProgress,
  dailyChallenge,
  onSelectLesson,
  onStartQuiz,
  onViewProfile,
  onViewGames,
  onViewSettings,
}) {
  const [filterDay, setFilterDay] = useState(1)
  const [gameStats, setGameStats] = useState(null)
  const [streakData, setStreakData] = useState(null)

  useEffect(() => {
    setGameStats(loadGameStats())
    setStreakData(loadStreakData())
  }, [])

  const lessonsForDay = useMemo(() => {
    return getLessonsByDay(filterDay)
  }, [filterDay])

  const totalDays = getTotalDays()
  const progressPercentage = (userProgress.completedLessons.length / LESSONS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-milk via-milk to-milk/95 px-4 py-8 md:px-8">
      {/* Premium Header */}
      <div className="mb-12 animate-slide-down">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-maroon mb-2">Q-KID</h1>
            <p className="text-lg text-maroon/70">Your Quranic Learning Journey</p>
            <p className="text-sm text-maroon/50 mt-2">
              Day {filterDay} of {totalDays}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={onViewGames} className="btn-secondary hover:shadow-lg transition-all">
              Games
            </button>
            <button onClick={onViewProfile} className="btn-primary hover:shadow-lg transition-all">
              Profile
            </button>
            <button
              onClick={onViewSettings}
              className="bg-white border-2 border-maroon/20 text-maroon font-bold py-2 px-4 rounded-lg hover:border-maroon transition-all"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Daily Challenge - Premium Card */}
      {dailyChallenge && !dailyChallenge.completed && (
        <div className="card-premium mb-8 p-8 border-2 border-gold/30 animate-scale-in">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-maroon mb-2">Daily Challenge</h2>
              <p className="text-maroon/70 mb-2">
                Complete Lesson {dailyChallenge.lessonId} with {dailyChallenge.challengeType} focus
              </p>
              <p className="text-sm text-gold font-semibold">+{dailyChallenge.bonusPoints} Bonus Points</p>
            </div>
            <div className="text-5xl animate-float">⭐</div>
          </div>
        </div>
      )}

      {/* Progress Section - Premium Design */}
      <div className="card-premium mb-8 p-8 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-maroon">Progress Overview</h2>
          <span className="text-3xl font-bold text-gold">{Math.round(progressPercentage)}%</span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-maroon/10 rounded-full h-3 overflow-hidden mb-8">
          <div
            className="bg-gradient-to-r from-maroon via-gold to-maroon h-full transition-all duration-1000 ease-out animate-pulse-glow"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-maroon/5 to-maroon/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-maroon">{userProgress.totalPoints}</p>
            <p className="text-xs text-maroon/60 mt-1">Total Points</p>
          </div>
          <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gold">{streakData?.currentStreak || 0}</p>
            <p className="text-xs text-maroon/60 mt-1">Day Streak</p>
          </div>
          <div className="bg-gradient-to-br from-maroon/5 to-maroon/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-maroon">{userProgress.completedLessons.length}</p>
            <p className="text-xs text-maroon/60 mt-1">Lessons Done</p>
          </div>
          <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gold">{gameStats?.gamesCompleted || 0}</p>
            <p className="text-xs text-maroon/60 mt-1">Games Played</p>
          </div>
        </div>
      </div>

      {/* Day Navigation */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-maroon mb-4">Select Day</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filterDay === day
                  ? "bg-maroon text-white shadow-lg scale-105"
                  : "bg-white text-maroon border-2 border-maroon/20 hover:border-maroon"
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons for Selected Day */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-maroon mb-6">Today's Lessons ({lessonsForDay.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessonsForDay.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`card-premium p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                userProgress.completedLessons.includes(lesson.id)
                  ? "border-2 border-green-400 bg-gradient-to-br from-green-50 to-green-100/50"
                  : "border-2 border-maroon/10"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-maroon/60 bg-maroon/10 px-3 py-1 rounded-full">
                  Lesson {index + 1}
                </span>
                {userProgress.completedLessons.includes(lesson.id) && (
                  <span className="text-2xl animate-bounce">✓</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-maroon mb-3">{lesson.title}</h3>
              <div className="text-5xl mb-4 text-center">{lesson.arabic}</div>
              <p className="text-sm text-maroon/70 mb-2">{lesson.translit}</p>
              <p className="text-xs text-maroon/50">{lesson.rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Section */}
      <div className="card-premium p-8 mb-8 border-2 border-gold/30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-maroon mb-2">Daily Quiz</h2>
            <p className="text-maroon/70">Test your knowledge on today's lessons</p>
          </div>
          <div className="text-4xl">📝</div>
        </div>
        <button onClick={onStartQuiz} className="w-full btn-secondary hover:shadow-lg transition-all py-4 text-lg">
          Start Quiz
        </button>
      </div>
    </div>
  )
}
