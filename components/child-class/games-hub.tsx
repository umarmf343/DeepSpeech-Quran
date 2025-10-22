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
    <div className="min-h-screen bg-gradient-to-br from-milk via-milk to-milk/95 px-4 py-8 md:px-8">
      {/* Premium Header */}
      <div className="flex justify-between items-center mb-12 animate-slide-down">
        <button
          onClick={onBack}
          className="bg-white hover:bg-maroon/10 text-maroon font-bold py-2 px-4 rounded-lg transition-all duration-300 border-2 border-maroon/20"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-5xl font-bold text-maroon">Games Hub</h1>
          <p className="text-maroon/60 mt-2">Learn while having fun!</p>
        </div>
        <div className="text-center bg-white px-6 py-3 rounded-lg border-2 border-gold/30">
          <div className="text-2xl font-bold text-gold">{userProgress.totalPoints}</div>
          <div className="text-xs text-maroon/60">Total Points</div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {games.map((game, idx) => (
          <div
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className="card-premium p-8 cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-maroon/10 hover:border-gold/50 animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`bg-gradient-to-br ${game.color} rounded-2xl p-6 mb-6 text-6xl text-center`}>
              {game.icon}
            </div>
            <h2 className="text-2xl font-bold text-maroon mb-3">{game.title}</h2>
            <p className="text-maroon/70 mb-6">{game.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-maroon bg-maroon/10 px-3 py-1 rounded-full">
                {game.difficulty}
              </span>
              <span className="text-2xl text-gold">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Game Stats */}
      <div className="max-w-6xl mx-auto">
        <div className="card-premium p-8 border-2 border-gold/30">
          <h2 className="text-2xl font-bold text-maroon mb-8">Your Game Stats</h2>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="card-premium p-6 text-center border-2 border-maroon/10">
              <p className="text-4xl font-bold text-maroon">3</p>
              <p className="text-sm text-maroon/60 mt-2">Games Available</p>
            </div>
            <div className="card-premium p-6 text-center border-2 border-gold/30">
              <p className="text-4xl font-bold text-gold">{gameStats?.gamesCompleted || 0}</p>
              <p className="text-sm text-maroon/60 mt-2">Games Completed</p>
            </div>
            <div className="card-premium p-6 text-center border-2 border-maroon/10">
              <p className="text-4xl font-bold text-maroon">{gameScore}</p>
              <p className="text-sm text-maroon/60 mt-2">Last Score</p>
            </div>
          </div>
          {gameStats && (
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 text-center border-2 border-blue-200">
                <p className="text-sm text-blue-700 font-semibold mb-2">Best Matching</p>
                <p className="text-3xl font-bold text-blue-600">{gameStats.bestScores.matching}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-6 text-center border-2 border-purple-200">
                <p className="text-sm text-purple-700 font-semibold mb-2">Best Spelling</p>
                <p className="text-3xl font-bold text-purple-600">{gameStats.bestScores.spelling}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl p-6 text-center border-2 border-pink-200">
                <p className="text-sm text-pink-700 font-semibold mb-2">Best Memory</p>
                <p className="text-3xl font-bold text-pink-600">{gameStats.bestScores.memory}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
