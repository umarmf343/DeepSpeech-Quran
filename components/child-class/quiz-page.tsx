"use client"

import { useState, useEffect } from "react"
import { QUIZ_QUESTIONS } from "@/lib/child-class/quiz-data"
import { playSound } from "@/lib/child-class/sound-effects"
import { loadSettings, type UserSettings } from "@/lib/child-class/settings-utils"
import type { QuizQuestion } from "@/types/child-class"

interface QuizPageProps {
  onComplete: (score: number) => void
  onBack: () => void
}

export default function QuizPage({ onComplete, onBack }: QuizPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success")
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answered, setAnswered] = useState<boolean>(false)
  const [bestScore, setBestScore] = useState<number>(0)
  const [settings, setSettings] = useState<UserSettings | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("qkidBestQuizScore")
      if (saved) setBestScore(Number.parseInt(saved))
    }
    setSettings(loadSettings())
  }, [])

  const question: QuizQuestion = QUIZ_QUESTIONS[currentQuestion]

  const handleAnswer = (option: string) => {
    if (answered) return

    setSelectedAnswer(option)
    setAnswered(true)

    const isCorrect = option === question.correct
    if (isCorrect) {
      setScore((prev) => prev + 10)
      setFeedbackMessage("Correct! 🎉")
      setFeedbackType("success")
      if (settings?.soundEnabled) {
        playSound("correct")
      }
    } else {
      setFeedbackMessage(`The answer is: ${question.correct}`)
      setFeedbackType("error")
      if (settings?.soundEnabled) {
        playSound("incorrect")
      }
    }
    setShowFeedback(true)

    const proceed = () => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setShowFeedback(false)
        setSelectedAnswer(null)
        setAnswered(false)
      } else {
        const finalScore = score + (isCorrect ? 10 : 0)
        if (typeof window !== "undefined" && finalScore > bestScore) {
          window.localStorage.setItem("qkidBestQuizScore", finalScore.toString())
        }
        if (settings?.soundEnabled) {
          playSound("complete")
        }
        onComplete(finalScore)
      }
    }

    if (typeof window === "undefined") {
      proceed()
      return
    }

    window.setTimeout(proceed, 2000)
  }

  const progressPercentage = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100

  return (
    <div className="relative min-h-screen px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-12 left-8 h-40 w-40 rounded-full bg-white/50 blur-3xl"></div>
        <div className="absolute bottom-0 right-12 h-48 w-48 rounded-full bg-gradient-to-br from-maroon/20 via-amber-200/50 to-transparent blur-3xl"></div>
      </div>

      {/* Premium Header */}
      <div className="relative z-10 mb-8 animate-slide-down">
        <div className="kid-card flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onBack}
            className="kid-pill flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-105"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-maroon">Daily Quiz</h1>
          <div className="flex gap-3">
            <div className="kid-pill rounded-3xl px-4 py-3 text-center">
              <div className="text-2xl font-black text-maroon">{score}</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-maroon/60">Current</div>
            </div>
            <div className="kid-pill rounded-3xl px-4 py-3 text-center">
              <div className="text-2xl font-black text-maroon">{bestScore}</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-maroon/60">Best</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="relative z-10 mx-auto mb-8 max-w-3xl">
        <div className="kid-card flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold uppercase tracking-widest text-maroon">
            Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span className="rounded-full bg-white/80 px-4 py-2 text-lg font-black text-maroon shadow-inner">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-maroon/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-maroon via-amber-300 to-pink-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="kid-card p-8 md:p-12 animate-slide-up">
          <h2 className="mb-10 text-center text-2xl md:text-3xl font-extrabold text-maroon">{question.question}</h2>

          {question.type === "multiple-choice" && (
            <div className="grid grid-cols-1 gap-4 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={`rounded-2xl border py-4 px-6 text-lg font-extrabold transition-all duration-300 ${
                    answered
                      ? option === question.correct
                        ? "bg-green-200 border-green-300 text-green-800 shadow-inner"
                        : option === selectedAnswer
                          ? "bg-red-200 border-red-300 text-red-800 shadow-inner"
                          : "bg-white/60 border-white text-maroon/50"
                      : "bg-white/90 border-white/80 text-maroon shadow-lg hover:-translate-y-1 hover:scale-105"
                  } disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.type === "matching" && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={`rounded-2xl border py-6 px-4 text-lg font-extrabold transition-all duration-300 ${
                    answered
                      ? option === question.correct
                        ? "bg-green-200 border-green-300 text-green-800 shadow-inner"
                        : option === selectedAnswer
                          ? "bg-red-200 border-red-300 text-red-800 shadow-inner"
                          : "bg-white/60 border-white text-maroon/50"
                      : "bg-white/90 border-white/80 text-maroon shadow-lg hover:-translate-y-1 hover:scale-105"
                  } disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {showFeedback && (
            <div
              className={`text-center p-6 rounded-lg animate-scale-in ${
                feedbackType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              <div className="text-2xl font-bold">{feedbackMessage}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
