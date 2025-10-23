"use client"

import { useState, useEffect } from "react"
import { LetterMatchingGame } from "./games/letter-matching-game"
import { SpellingGame } from "./games/spelling-game"
import { MemoryGame } from "./games/memory-game"
import { updateGameStats, loadGameStats, type GameStats } from "@/lib/child-class/game-stats"
import type { ChildProgress } from "@/types/child-class"

type GameId = "matching" | "spelling" | "memory"

interface GamesHubProps {
  userProgress: ChildProgress
  onBack: () => void
}

export default function GamesHub({ userProgress, onBack }: GamesHubProps) {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)
  const [gameScore, setGameScore] = useState<number>(0)
  const [gameStats, setGameStats] = useState<GameStats | null>(null)

  useEffect(() => {
    setGameStats(loadGameStats())
  }, [])

  const games: Array<{ id: GameId; title: string; description: string; icon: string; difficulty: string; color: string }> = [
    {
      id: "matching",
      title: "Letter Matching",
      description: "Match Arabic letters with their transliterations",
      icon: "🎯",
      difficulty: "Easy",
      color: "from-blue-100 to-blue-50",
    },
    {
      id: "spelling",
      title: "Spelling Challenge",
      description: "Spell Arabic words correctly",
      icon: "✍️",
      difficulty: "Medium",
      color: "from-purple-100 to-purple-50",
    },
    {
      id: "memory",
      title: "Memory Game",
      description: "Remember and match letter pairs",
      icon: "🧠",
      difficulty: "Hard",
      color: "from-pink-100 to-pink-50",
    },
  ]

  const handleGameComplete = (score: number) => {
    if (!selectedGame) return
    const updatedStats = updateGameStats(selectedGame, score)
    setGameStats(updatedStats)
    setGameScore(score)
    setSelectedGame(null)
  }

  if (selectedGame === "matching") {
    return <LetterMatchingGame onComplete={handleGameComplete} onBack={() => setSelectedGame(null)} />
  }

  if (selectedGame === "spelling") {
    return <SpellingGame onComplete={handleGameComplete} onBack={() => setSelectedGame(null)} />
  }

  if (selectedGame === "memory") {
    return <MemoryGame onComplete={handleGameComplete} onBack={() => setSelectedGame(null)} />
  }

  return (
    <div className="relative min-h-screen px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-6 h-44 w-44 rounded-full bg-white/45 blur-3xl"></div>
        <div className="absolute bottom-0 right-12 h-56 w-56 rounded-full bg-gradient-to-br from-maroon/20 via-pink-100/60 to-transparent blur-3xl"></div>
      </div>

      {/* Premium Header */}
      <div className="relative z-10 mb-12 animate-slide-down">
        <div className="kid-card flex flex-col gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onBack}
            className="kid-pill flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-105"
          >
            ← Back
          </button>
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-maroon/60">Playful Practice</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-maroon">Games Hub</h1>
            <p className="mt-2 text-maroon/70">Learn while having fun!</p>
          </div>
          <div className="kid-pill rounded-3xl px-6 py-3 text-center">
            <div className="text-2xl font-black text-maroon">{userProgress.totalPoints}</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-maroon/60">Total Points</div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="relative z-10 mx-auto mb-12 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game, idx) => (
          <div
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className="kid-card cursor-pointer p-8 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`mb-6 rounded-2xl bg-gradient-to-br ${game.color} p-6 text-center text-6xl`}>
              {game.icon}
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-maroon">{game.title}</h2>
            <p className="mb-6 text-maroon/70">{game.description}</p>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-maroon/70">
                {game.difficulty}
              </span>
              <span className="text-2xl text-maroon">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Game Stats */}
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="kid-card p-8">
          <h2 className="mb-8 text-2xl font-extrabold text-maroon">Your Game Stats</h2>
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="kid-pill rounded-3xl p-6 text-center shadow-lg">
              <p className="text-4xl font-black text-maroon">3</p>
              <p className="mt-2 text-sm text-maroon/70">Games Available</p>
            </div>
            <div className="kid-pill rounded-3xl p-6 text-center shadow-lg">
              <p className="text-4xl font-black text-maroon">{gameStats?.gamesCompleted || 0}</p>
              <p className="mt-2 text-sm text-maroon/70">Games Completed</p>
            </div>
            <div className="kid-pill rounded-3xl p-6 text-center shadow-lg">
              <p className="text-4xl font-black text-maroon">{gameScore}</p>
              <p className="mt-2 text-sm text-maroon/70">Last Score</p>
            </div>
          </div>
          {gameStats && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 p-6 text-center shadow-lg">
                <p className="mb-2 text-sm font-semibold text-blue-700">Best Matching</p>
                <p className="text-3xl font-black text-blue-600">{gameStats.bestScores.matching}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-purple-100 to-purple-50 p-6 text-center shadow-lg">
                <p className="mb-2 text-sm font-semibold text-purple-700">Best Spelling</p>
                <p className="text-3xl font-black text-purple-600">{gameStats.bestScores.spelling}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-pink-100 to-pink-50 p-6 text-center shadow-lg">
                <p className="mb-2 text-sm font-semibold text-pink-700">Best Memory</p>
                <p className="text-3xl font-black text-pink-600">{gameStats.bestScores.memory}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
