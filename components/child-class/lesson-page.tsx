"use client"

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react"
import { renderTextWithArabicCard } from "./arabic-letter-card"
import { playSound } from "@/lib/child-class/sound-effects"
import { loadSettings, type UserSettings } from "@/lib/child-class/settings-utils"
import type { ChildLesson } from "@/types/child-class"
import TracingCanvas from "@/components/child-class/tracing-canvas"

interface LessonPageProps {
  lesson: ChildLesson
  onComplete: (score: number) => void
  onBack: () => void
}

const TRACING_CELEBRATION_DURATION = 1600
const TRACING_SPRINKLE_COLORS = [
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-rose-400",
  "bg-purple-400",
  "bg-lime-400",
]

const renderLessonTitle = (title: string): ReactNode => {
  const practiceMatch = title.match(/^(.*?)(Practice)(\s+)(\d+)$/i)

  if (!practiceMatch) {
    return title
  }

  const [, prefix, practiceLabel, , practiceNumber] = practiceMatch
  const cleanedPrefix = prefix.trim()

  return (
    <>
      {cleanedPrefix}
      {cleanedPrefix && " "}
      {practiceLabel}
      {" "}
      <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white/80 px-3 py-1 text-[0.95em] font-black text-maroon shadow-inner ring-1 ring-maroon/10">
        {practiceNumber}
      </span>
    </>
  )
}

export default function LessonPage({ lesson, onComplete, onBack }: LessonPageProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success")
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [showCompletion, setShowCompletion] = useState<boolean>(false)
  const [tracingProgress, setTracingProgress] = useState<number>(0)
  const [tracingMistakes, setTracingMistakes] = useState<number>(0)
  const [tracingComplete, setTracingComplete] = useState<boolean>(false)
  const [tracingReady, setTracingReady] = useState<boolean>(false)
  const [tracingResetKey, setTracingResetKey] = useState<number>(0)
  const [showTracingFailure, setShowTracingFailure] = useState<boolean>(false)
  const [showTracingCelebration, setShowTracingCelebration] = useState<boolean>(false)
  const [tracingCelebrationDone, setTracingCelebrationDone] = useState<boolean>(false)
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<string | null>(null)
  const [selectedPracticeCorrect, setSelectedPracticeCorrect] = useState<boolean | null>(null)
  const tracingCelebrationTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    setSelectedPracticeOption(null)
    setSelectedPracticeCorrect(null)
  }, [currentStep, lesson.id])

  const practiceCardGradients = [
    "kid-gradient-bubblegum",
    "kid-gradient-sunny",
    "kid-gradient-mint",
    "kid-gradient-sunset",
  ]

  const steps = [
    {
      type: "intro",
      title: "Learn the Letter",
      content: `Let's learn about ${lesson.title}`,
    },
    {
      type: "pronunciation",
      title: "Pronunciation",
      content: `Listen to how ${lesson.title} is pronounced`,
    },
    {
      type: "practice",
      title: "Practice",
      content: "Click on the correct letter",
    },
    {
      type: "writing",
      title: "Writing Practice",
      content: "Trace the letter",
    },
    {
      type: "quiz",
      title: "Quiz",
      content: "Test your knowledge",
    },
  ]

  const handlePronounce = () => {
    if (typeof window === "undefined") return

    const utterance = new SpeechSynthesisUtterance(lesson.arabic)
    utterance.lang = "ar-SA"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
    if (settings?.soundEnabled) {
      playSound("correct")
    }
  }

  const handlePracticeAnswer = (isCorrect: boolean, optionKey: string) => {
    setSelectedPracticeOption(optionKey)
    setSelectedPracticeCorrect(isCorrect)
    if (isCorrect) {
      setScore((prev) => prev + 25)
      setFeedbackMessage("Excellent! 🎉")
      setFeedbackType("success")
      if (settings?.soundEnabled) {
        playSound("correct")
      }
    } else {
      setFeedbackMessage("Try again! 💪")
      setFeedbackType("error")
      if (settings?.soundEnabled) {
        playSound("incorrect")
      }
    }
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 1500)
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowCompletion(true)
      if (settings?.soundEnabled) {
        playSound("complete")
      }
      setTimeout(() => {
        onComplete(score)
      }, 2500)
    }
  }

  const handleTracingSuccess = () => {
    if (tracingReady) return
    setTracingReady(true)
  }

  const handleTracingFailure = () => {
    setFeedbackMessage("Let's try again! 💪")
    setFeedbackType("error")
    setShowFeedback(true)
    window.setTimeout(() => setShowFeedback(false), 1500)
    setTracingReady(false)
    setShowTracingFailure(true)
    setShowTracingCelebration(false)
    setTracingCelebrationDone(false)
  }

  const handleResetTracing = () => {
    if (tracingCelebrationTimeoutRef.current) {
      window.clearTimeout(tracingCelebrationTimeoutRef.current)
      tracingCelebrationTimeoutRef.current = null
    }
    setTracingProgress(0)
    setTracingMistakes(0)
    setTracingComplete(false)
    setTracingReady(false)
    setTracingResetKey((prev) => prev + 1)
    setShowTracingFailure(false)
    setShowTracingCelebration(false)
    setTracingCelebrationDone(false)
  }

  useEffect(() => {
    if (tracingCelebrationTimeoutRef.current) {
      window.clearTimeout(tracingCelebrationTimeoutRef.current)
      tracingCelebrationTimeoutRef.current = null
    }
    setTracingProgress(0)
    setTracingMistakes(0)
    setTracingComplete(false)
    setTracingReady(false)
    setTracingResetKey((prev) => prev + 1)
    setShowTracingFailure(false)
    setShowTracingCelebration(false)
    setTracingCelebrationDone(false)
  }, [lesson.id])

  useEffect(() => {
    return () => {
      if (tracingCelebrationTimeoutRef.current) {
        window.clearTimeout(tracingCelebrationTimeoutRef.current)
      }
    }
  }, [])

  const tracingCelebrationSprinkles = useMemo(() => {
    if (!showTracingCelebration) return []
    const count = 18
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2
      const radius = 110 + (index % 4) * 16
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius * -1
      const color = TRACING_SPRINKLE_COLORS[index % TRACING_SPRINKLE_COLORS.length]
      const delay = (index % 6) * 0.05
      return {
        key: `tracing-sprinkle-${index}`,
        color,
        style: {
          "--sprinkle-x": `${x}px`,
          "--sprinkle-y": `${y}px`,
          left: "50%",
          top: "50%",
          animationDelay: `${delay}s`,
        } as CSSProperties,
      }
    })
  }, [showTracingCelebration])

  const triggerTracingCelebration = () => {
    if (typeof window === "undefined") {
      setTracingCelebrationDone(true)
      return
    }
    if (tracingCelebrationTimeoutRef.current) {
      window.clearTimeout(tracingCelebrationTimeoutRef.current)
    }
    setShowTracingCelebration(true)
    setTracingCelebrationDone(false)
    tracingCelebrationTimeoutRef.current = window.setTimeout(() => {
      setShowTracingCelebration(false)
      setTracingCelebrationDone(true)
      tracingCelebrationTimeoutRef.current = null
    }, TRACING_CELEBRATION_DURATION)
  }

  const handleCheckTracing = () => {
    if (tracingComplete) return

    if (tracingReady) {
      setTracingComplete(true)
      setScore((prev) => prev + 25)
      setFeedbackMessage("Perfect tracing! 🎉")
      setFeedbackType("success")
      setShowFeedback(true)
      if (settings?.soundEnabled) {
        playSound("correct")
      }
      window.setTimeout(() => setShowFeedback(false), 1500)
      triggerTracingCelebration()
      return
    }

    setFeedbackMessage("Keep tracing inside the guide before pressing Go.")
    setFeedbackType("error")
    setShowFeedback(true)
    if (settings?.soundEnabled) {
      playSound("incorrect")
    }
    window.setTimeout(() => setShowFeedback(false), 1500)
  }

  const isNextDisabled =
    currentStep === 3 && (!tracingComplete || !tracingCelebrationDone)

  return (
    <div className="relative min-h-screen px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-8 h-40 w-40 rounded-full bg-white/50 blur-3xl"></div>
        <div className="absolute bottom-0 right-12 h-48 w-48 rounded-full bg-gradient-to-br from-maroon/20 via-pink-100/60 to-transparent blur-3xl"></div>
      </div>

      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="kid-card kid-gradient-bubblegum max-w-md p-12 text-center animate-scale-in">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-extrabold text-maroon mb-3">Lesson Complete!</h2>
            <p className="text-3xl font-black text-maroon mb-6">{score} Points</p>
            <p className="text-maroon/70 text-lg">Fantastic work! Keep learning!</p>
          </div>
        </div>
      )}

      {showTracingFailure && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="kid-card kid-gradient-sunny max-w-md p-10 text-center animate-scale-in">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-3xl font-extrabold text-maroon mb-2">Oops! Try Again</h2>
            <p className="text-maroon/70 mb-6">Stay inside the letter guide. Give it another go!</p>
            <button
              onClick={handleResetTracing}
              className="kid-button kid-button-bubblegum px-8 py-3 text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <div className="relative z-10 mb-8 animate-slide-down">
        <div className="kid-card kid-gradient-tropical grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-3xl p-6">
          <button
            onClick={onBack}
            className="kid-pill kid-pill-mint flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-105"
          >
            ← Back
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-maroon/60">Lesson Spotlight</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-maroon">{renderLessonTitle(lesson.title)}</h1>
          </div>
          <div className="justify-self-end rounded-full bg-white/80 px-5 py-2 text-2xl font-black text-maroon shadow-inner">
            {score} pts
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-8 h-4 w-full overflow-hidden rounded-full bg-maroon/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-maroon via-amber-300 to-pink-400 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      {/* Step Indicator */}
      <div className="relative z-10 mb-10 flex justify-center gap-2">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx <= currentStep ? "bg-gradient-to-r from-maroon via-pink-400 to-amber-300 w-10" : "bg-white/60 w-3"
            }`}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="kid-card kid-gradient-mint p-8 md:p-12 animate-slide-up">
          {currentStep === 0 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[0].title}</h2>
              <div className="text-black text-[11.43rem] animate-float">{lesson.arabic}</div>
              <p className="text-lg text-maroon/70 mb-8">{lesson.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="kid-pill kid-pill-bubblegum rounded-3xl p-6 text-left shadow-lg">
                  <p className="text-xs uppercase tracking-widest text-maroon/60">Transliteration</p>
                  <p className="mt-2 text-2xl font-black text-maroon">{lesson.translit}</p>
                </div>
                <div className="kid-pill kid-pill-sunny rounded-3xl p-6 text-left shadow-lg">
                  <p className="text-xs uppercase tracking-widest text-maroon/60">Rule</p>
                  <p className="mt-2 text-2xl font-black text-maroon">{lesson.rule}</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-8">{steps[1].title}</h2>
              <div className="text-black text-[11.43rem] animate-float">{lesson.arabic}</div>
              <button
                onClick={handlePronounce}
                className="kid-button kid-button-sunset inline-flex px-12 py-6 text-2xl font-extrabold"
              >
                🔊 Listen to Pronunciation
              </button>
              <p className="text-lg text-maroon/70">Click the button to hear the correct pronunciation</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[2].title}</h2>
              <p className="text-lg text-maroon/70 mb-10">
                Which one is {renderLessonTitle(lesson.title)}?
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[lesson.arabic, "ب", "ت", "ث"].map((letter, idx) => {
                  const optionKey = `practice-${currentStep}-${idx}`
                  const isSelected = selectedPracticeOption === optionKey
                  const selectionClass = isSelected
                    ? selectedPracticeCorrect
                      ? "kid-card-blink-success"
                      : "kid-card-blink-error"
                    : ""

                  return (
                    <button
                      key={idx}
                      onClick={() => handlePracticeAnswer(letter === lesson.arabic, optionKey)}
                      className={`kid-card ${practiceCardGradients[idx % practiceCardGradients.length]} p-8 text-black text-[7.5rem] font-black transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] ${selectionClass}`.trim()}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>
              {showFeedback && (
                <div
                  className={`text-2xl font-bold p-4 rounded-lg animate-scale-in ${
                    feedbackType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[3].title}</h2>
              <p className="text-lg text-maroon/70 mb-8">Trace the letter below and stay inside the guide.</p>
              <div className="kid-card kid-gradient-tropical relative overflow-hidden p-6 md:p-10 mb-8 text-center">
                {showTracingCelebration && (
                  <>
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                      <div className="relative flex h-28 w-28 items-center justify-center">
                        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200/80 via-white/60 to-pink-200/80 blur-2xl" />
                        <span className="absolute inset-0 rounded-full border-4 border-white/70 opacity-70 animate-ping" />
                        <span className="relative text-6xl drop-shadow-[0_12px_28px_rgba(244,114,182,0.45)]">✨</span>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
                      {tracingCelebrationSprinkles.map((sprinkle) => (
                        <span
                          key={sprinkle.key}
                          className={`sprinkle-piece ${sprinkle.color}`}
                          style={sprinkle.style}
                        />
                      ))}
                    </div>
                  </>
                )}
                <TracingCanvas
                  key={`${lesson.id}-${tracingResetKey}`}
                  letter={lesson.arabic}
                  onProgress={setTracingProgress}
                  onMistake={setTracingMistakes}
                  onSuccess={handleTracingSuccess}
                  onFail={handleTracingFailure}
                  resetSignal={tracingResetKey}
                />
                <div className="mt-6 flex flex-col items-center gap-3 text-maroon/80">
                  <p className="text-lg font-semibold">Progress: {Math.round(tracingProgress * 100)}%</p>
                  <p className={`text-sm font-bold ${tracingMistakes > 0 ? "text-red-500" : "text-maroon/60"}`}>
                    Mistakes: {Math.min(tracingMistakes, 3)} / 3
                  </p>
                  {tracingReady && !tracingComplete && (
                    <p className="text-sm font-semibold text-emerald-600">Looking good! Press Go to check your tracing.</p>
                  )}
                  <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={handleCheckTracing}
                      disabled={tracingComplete}
                      className={`inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 px-10 py-3 text-lg font-extrabold text-white shadow-lg transition-transform duration-300 sm:w-auto ${
                        tracingComplete ? "cursor-not-allowed opacity-60" : "hover:scale-105"
                      }`}
                    >
                      Go
                    </button>
                    {!tracingComplete && (
                      <button
                        onClick={handleResetTracing}
                        className="kid-button kid-button-bubblegum w-full px-6 py-2 text-sm font-semibold sm:w-auto"
                      >
                        Start Over
                      </button>
                    )}
                  </div>
                  {tracingComplete && (
                    <p className="text-base font-semibold text-green-600">
                      {showTracingCelebration
                        ? "Amazing tracing! Enjoy the sparkles..."
                        : "Great tracing! You can continue."}
                    </p>
                  )}
                </div>
              </div>
              {showFeedback && (
                <div
                  className={`text-2xl font-bold p-4 rounded-lg animate-scale-in ${
                    feedbackType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[4].title}</h2>
              <div className="kid-card kid-gradient-sunset p-8 mb-8">
                <p className="text-lg text-maroon mb-6 flex flex-wrap items-center justify-center gap-2 text-center">
                  {renderTextWithArabicCard(`What is the transliteration of ${lesson.arabic}?`)}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[lesson.translit, "Ba", "Ta", "Tha"].map((option, idx) => {
                    const optionKey = `practice-${currentStep}-${idx}`
                    const isSelected = selectedPracticeOption === optionKey
                    const selectionClass = isSelected
                      ? selectedPracticeCorrect
                        ? "kid-card-blink-success"
                        : "kid-card-blink-error"
                      : ""

                    return (
                      <button
                        key={idx}
                        onClick={() => handlePracticeAnswer(option === lesson.translit, optionKey)}
                        className={`kid-card ${practiceCardGradients[idx % practiceCardGradients.length]} p-6 text-lg font-extrabold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] ${selectionClass}`.trim()}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>
              {showFeedback && (
                <div
                  className={`text-2xl font-bold p-4 rounded-lg animate-scale-in ${
                    feedbackType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <button
              onClick={onBack}
              className="kid-button kid-button-sunny kid-button-contrast flex-1 px-6 py-4 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleNextStep}
              disabled={isNextDisabled}
              className={`kid-button kid-button-sunset flex-1 py-4 text-lg font-extrabold ${
                isNextDisabled ? "cursor-not-allowed opacity-50" : "hover:scale-[1.03]"
              }`}
            >
              {currentStep === steps.length - 1 ? "Complete Lesson" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
