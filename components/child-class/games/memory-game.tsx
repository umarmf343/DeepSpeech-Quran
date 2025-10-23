"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { LESSONS } from "@/lib/child-class/lessons-data"
import type { ChildLesson } from "@/types/child-class"

interface MemoryGameProps {
  onComplete: (score: number) => void
  onBack: () => void
}

export function MemoryGame({ onComplete, onBack }: MemoryGameProps) {
  const [score, setScore] = useState<number>(0)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState<number>(0)

  const gameLessons = useMemo<ChildLesson[]>(() => LESSONS.slice(0, 6), [])
  const cards = useMemo<ChildLesson[]>(() => [...gameLessons, ...gameLessons].sort(() => Math.random() - 0.5), [gameLessons])
  const lastProcessedPair = useRef<string | null>(null)

  useEffect(() => {
    if (flipped.length !== 2) {
      lastProcessedPair.current = null
      return
    }
    if (typeof window === "undefined") return

    const [first, second] = flipped
    const firstCard = cards[first]
    const secondCard = cards[second]
    if (!firstCard || !secondCard) return

    const pairKey = `${Math.min(first, second)}-${Math.max(first, second)}`
    const isNewPair = lastProcessedPair.current !== pairKey
    lastProcessedPair.current = pairKey

    if (isNewPair) {
      setMoves((prev) => prev + 1)
    }

    let resetTimeout: number | null = null
    let completionTimeout: number | null = null

    if (firstCard.id === secondCard.id) {
      const cardId = firstCard.id
      let didMatch = false
      let updatedMatchedCount = 0
      let updatedScore = 0

      setMatched((prevMatched) => {
        if (prevMatched.includes(cardId)) {
          return prevMatched
        }

        didMatch = true
        const updatedMatched = [...prevMatched, cardId]
        updatedMatchedCount = updatedMatched.length
        return updatedMatched
      })

      if (didMatch) {
        setScore((prevScore) => {
          const nextScore = prevScore + 30
          updatedScore = nextScore
          return nextScore
        })

        if (updatedMatchedCount === gameLessons.length) {
          completionTimeout = window.setTimeout(() => onComplete(updatedScore), 500)
        }
      }

      resetTimeout = window.setTimeout(() => setFlipped([]), 800)
    } else {
      resetTimeout = window.setTimeout(() => setFlipped([]), 800)
    }

    return () => {
      if (resetTimeout) window.clearTimeout(resetTimeout)
      if (completionTimeout) window.clearTimeout(completionTimeout)
    }
  }, [flipped, cards, gameLessons.length, onComplete])

  const toggleFlip = (index: number) => {
    if (flipped.includes(index) || matched.includes(cards[index]?.id ?? -1)) return
    if (flipped.length < 2) {
      setFlipped((prev) => [...prev, index])
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
            {cards.map((card, index) => {
              const isRevealed = flipped.includes(index) || matched.includes(card.id)
              return (
                <button
                  key={index}
                  onClick={() => toggleFlip(index)}
                  className={`aspect-square rounded-2xl font-bold text-[3.75rem] transition-all duration-300 transform hover:scale-105 ${
                    isRevealed
                      ? "bg-gradient-to-br from-maroon/10 to-gold/10 border-2 border-maroon/20 text-black"
                      : "bg-gradient-to-br from-maroon to-maroon/80 border-2 border-maroon text-white"
                  }`}
                >
                  {isRevealed ? card.arabic : "?"}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
