"use client"

import { useState, useEffect } from "react"
import { LESSONS } from "@/lib/lessons-data"

export function LetterMatchingGame({ onComplete, onBack }) {
  const [score, setScore] = useState(0)
  const [matches, setMatches] = useState(0)
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [matchedPairs, setMatchedPairs] = useState([])

  // Get 5 random lessons for the game
  const gameLessons = LESSONS.slice(0, 5)
  const rightSide = [...gameLessons].sort(() => Math.random() - 0.5)

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft.id === selectedRight.id) {
        setScore(score + 20)
        setMatches(matches + 1)
        setMatchedPairs([...matchedPairs, selectedLeft.id])
        setSelectedLeft(null)
        setSelectedRight(null)

        if (matches + 1 === gameLessons.length) {
          setTimeout(() => onComplete(score + 20), 500)
        }
      } else {
        setTimeout(() => {
          setSelectedLeft(null)
          setSelectedRight(null)
        }, 500)
      }
    }
  }, [selectedLeft, selectedRight])

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
        <h1 className="text-3xl font-bold text-maroon">Letter Matching</h1>
        <div className="text-2xl font-bold text-gold">{score} pts</div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-maroon">
            Matched: {matches} of {gameLessons.length}
          </span>
          <span className="text-sm font-bold text-maroon">{Math.round((matches / gameLessons.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-maroon to-gold h-full transition-all duration-300 rounded-full"
            style={{
              width: `${(matches / gameLessons.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Game Board */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Side - Arabic */}
            <div>
              <h3 className="text-xl font-bold text-maroon mb-4">Arabic Letters</h3>
              <div className="space-y-3">
                {gameLessons.map((lesson) => (
                  <button
                    key={`left-${lesson.id}`}
                    onClick={() => !matchedPairs.includes(lesson.id) && setSelectedLeft(lesson)}
                    disabled={matchedPairs.includes(lesson.id)}
                    className={`w-full text-4xl font-bold py-6 px-4 rounded-2xl transition-all duration-300 ${
                      matchedPairs.includes(lesson.id)
                        ? "bg-green-100 border-2 border-green-400 opacity-50"
                        : selectedLeft?.id === lesson.id
                          ? "bg-maroon text-white border-2 border-maroon"
                          : "bg-gradient-to-r from-maroon/10 to-gold/10 border-2 border-maroon/20 hover:border-maroon"
                    }`}
                  >
                    {lesson.arabic}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Transliteration */}
            <div>
              <h3 className="text-xl font-bold text-maroon mb-4">Transliteration</h3>
              <div className="space-y-3">
                {rightSide.map((lesson) => (
                  <button
                    key={`right-${lesson.id}`}
                    onClick={() => !matchedPairs.includes(lesson.id) && setSelectedRight(lesson)}
                    disabled={matchedPairs.includes(lesson.id)}
                    className={`w-full text-lg font-bold py-6 px-4 rounded-2xl transition-all duration-300 ${
                      matchedPairs.includes(lesson.id)
                        ? "bg-green-100 border-2 border-green-400 opacity-50"
                        : selectedRight?.id === lesson.id
                          ? "bg-maroon text-white border-2 border-maroon"
                          : "bg-gradient-to-r from-maroon/10 to-gold/10 border-2 border-maroon/20 hover:border-maroon text-maroon"
                    }`}
                  >
                    {lesson.translit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
