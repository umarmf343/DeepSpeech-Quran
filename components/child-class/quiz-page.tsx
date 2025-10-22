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
    <div className="min-h-screen bg-gradient-to-br from-milk via-milk to-milk/95 px-4 py-8 md:px-8">
      {/* Premium Header */}
      <div className="flex justify-between items-center mb-8 animate-slide-down">
        <button
          onClick={onBack}
          className="bg-white hover:bg-maroon/10 text-maroon font-bold py-2 px-4 rounded-lg transition-all duration-300 border-2 border-maroon/20"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold text-maroon">Daily Quiz</h1>
        <div className="flex gap-4">
          <div className="text-center bg-white px-4 py-2 rounded-lg border-2 border-gold/30">
            <div className="text-2xl font-bold text-gold">{score}</div>
            <div className="text-xs text-maroon/60">Current</div>
          </div>
          <div className="text-center bg-white px-4 py-2 rounded-lg border-2 border-maroon/20">
            <div className="text-2xl font-bold text-maroon">{bestScore}</div>
            <div className="text-xs text-maroon/60">Best</div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-maroon">
            Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span className="text-sm font-bold text-gold">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-maroon/10 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-maroon via-gold to-maroon h-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercentage}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-3xl mx-auto">
        <div className="card-premium p-8 md:p-12 animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-bold text-maroon mb-10 text-center">{question.question}</h2>

          {question.type === "multiple-choice" && (
            <div className="grid grid-cols-1 gap-4 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={`text-lg font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 ${
                    answered
                      ? option === question.correct
                        ? "bg-green-100 border-green-400 text-green-700"
                        : option === selectedAnswer
                          ? "bg-red-100 border-red-400 text-red-700"
                          : "bg-maroon/5 border-maroon/10 text-maroon/50"
                      : "bg-white border-maroon/20 text-maroon hover:border-maroon hover:bg-maroon/5"
                  }`}
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
                  className={`text-lg font-bold py-6 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 ${
                    answered
                      ? option === question.correct
                        ? "bg-green-100 border-green-400 text-green-700"
                        : option === selectedAnswer
                          ? "bg-red-100 border-red-400 text-red-700"
                          : "bg-maroon/5 border-maroon/10 text-maroon/50"
                      : "bg-white border-maroon/20 text-maroon hover:border-maroon hover:bg-maroon/5"
                  }`}
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
