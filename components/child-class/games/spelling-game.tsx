"use client"

import { useMemo, useState } from "react"
import { LESSONS } from "@/lib/child-class/lessons-data"
import type { ChildLesson } from "@/types/child-class"

interface SpellingGameProps {
  onComplete: (score: number) => void
  onBack: () => void
}

export function SpellingGame({ onComplete, onBack }: SpellingGameProps) {
  const [score, setScore] = useState<number>(0)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [userInput, setUserInput] = useState<string>("")
  const [feedback, setFeedback] = useState<string>("")
  const [answered, setAnswered] = useState<boolean>(false)

  const gameLessons = useMemo<ChildLesson[]>(() => LESSONS.slice(10, 15), [])
  const currentLesson = gameLessons[currentIndex]

  const handleSubmit = () => {
    if (!userInput.trim()) return

    const isCorrect = userInput.toLowerCase() === currentLesson.translit.toLowerCase()

    if (isCorrect) {
      setScore((prev) => prev + 25)
      setFeedback("Correct!")
    } else {
      setFeedback(`Incorrect. The answer is: ${currentLesson.translit}`)
    }

    setAnswered(true)

    if (typeof window === "undefined") {
      if (currentIndex < gameLessons.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setUserInput("")
        setFeedback("")
        setAnswered(false)
      } else {
        onComplete(score + (isCorrect ? 25 : 0))
      }
      return
    }

    window.setTimeout(() => {
      if (currentIndex < gameLessons.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setUserInput("")
        setFeedback("")
        setAnswered(false)
      } else {
        onComplete(score + (isCorrect ? 25 : 0))
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="self-start bg-gradient-to-r from-[#4169e1] via-[#2745c7] to-[#1d4ed8] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] font-bold py-2 px-4 rounded-lg transition-all duration-300"
        >
          ← Back
        </button>
        <h1 className="flex-1 text-center text-3xl font-bold text-maroon">Spelling Challenge</h1>
        <div className="text-2xl font-bold text-gold ml-auto">{score} pts</div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-maroon">
            Question {currentIndex + 1} of {gameLessons.length}
          </span>
          <span className="text-sm font-bold text-maroon">
            {Math.round(((currentIndex + 1) / gameLessons.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-maroon to-gold h-full transition-all duration-300 rounded-full"
            style={{
              width: `${((currentIndex + 1) / gameLessons.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Game */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <p className="text-lg text-gray-600 mb-6">Spell this word:</p>
          <div className="text-black text-[9rem] mb-8 font-bold">{currentLesson.arabic}</div>

          <div className="mb-6">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !answered && handleSubmit()}
              disabled={answered}
              placeholder="Type the transliteration..."
              className="w-full px-6 py-4 text-lg border-2 border-maroon/20 rounded-2xl focus:outline-none focus:border-maroon"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={answered || !userInput.trim()}
            className="w-full bg-gradient-to-r from-maroon to-maroon/80 hover:from-maroon/90 hover:to-maroon/70 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            Submit
          </button>

          {feedback && <div className="text-2xl font-bold text-maroon mt-6 animate-bounce">{feedback}</div>}
        </div>
      </div>
    </div>
  )
}
