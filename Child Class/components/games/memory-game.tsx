"use client"

import { useState, useEffect } from "react"
import { LESSONS } from "@/lib/lessons-data"

export function MemoryGame({ onComplete, onBack }) {
  const [score, setScore] = useState(0)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)

  const gameLessons = LESSONS.slice(0, 6)
  const cards = [...gameLessons, ...gameLessons].sort(() => Math.random() - 0.5)

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(moves + 1)

      const [first, second] = flipped
      if (cards[first].id === cards[second].id) {
        setMatched([...matched, cards[first].id])
        setScore(score + 30)

        if (matched.length + 1 === gameLessons.length) {
          setTimeout(() => onComplete(score + 30), 500)
        }
      }

      setTimeout(() => setFlipped([]), 800)
    }
  }, [flipped])

  const toggleFlip = (index) => {
    if (flipped.includes(index) || matched.includes(cards[index].id)) return
    if (flipped.length < 2) {
      setFlipped([...flipped, index])
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="bg-maroon/20 hover:bg-maroon/30 text-maroon font-bold py-2 px-4 rounded-lg transition-all duration-300"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-maroon">Memory Game</h1>
        <div className="text-2xl font-bold text-gold">{score} pts</div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto mb-8 flex gap-4 justify-center">
        <div className="bg-white rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-maroon">{matched.length}</p>
          <p className="text-sm text-gray-600">Matched</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-maroon">{moves}</p>
          <p className="text-sm text-gray-600">Moves</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="grid grid-cols-3 gap-4">
            {cards.map((card, index) => (
              <button
                key={index}
                onClick={() => toggleFlip(index)}
                className={`aspect-square rounded-2xl font-bold text-3xl transition-all duration-300 transform hover:scale-105 ${
                  flipped.includes(index) || matched.includes(card.id)
                    ? "bg-gradient-to-br from-maroon/10 to-gold/10 border-2 border-maroon/20"
                    : "bg-gradient-to-br from-maroon to-maroon/80 border-2 border-maroon"
                }`}
              >
                {flipped.includes(index) || matched.includes(card.id) ? card.arabic : "?"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
