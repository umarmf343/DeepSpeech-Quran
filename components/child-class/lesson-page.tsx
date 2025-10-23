"use client"

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react"
import { renderTextWithArabicCard } from "./arabic-letter-card"
import { AudioPlayButton } from "./audio-play-button"
import TraceSelectionArea from "./trace-selection-area"
import { AutoFitText } from "@/components/common/AutoFitText"
import { playSound } from "@/lib/child-class/sound-effects"
import { loadSettings, type UserSettings } from "@/lib/child-class/settings-utils"
import { LESSONS } from "@/lib/child-class/lessons-data"
import type { ChildLesson } from "@/types/child-class"
import { shuffleArray } from "@/lib/utils"

const normalizeForComparison = (text: string) => text.normalize("NFC").replace(/\s+/g, " ").trim()
const countGraphemes = (text: string) => Array.from(text.normalize("NFC").replace(/\s+/g, "")).length
const isArabicText = (text: string) => /[\u0600-\u06FF]/.test(text)
const isLatinText = (text: string) => /[A-Za-z]/.test(text)

const createPracticeOptions = (
  correctValue: string,
  pool: string[],
  {
    locale,
    filter,
    fallback,
  }: {
    locale: string
    filter: (value: string) => boolean
    fallback: string[]
  },
) => {
  const normalizedCorrect = normalizeForComparison(correctValue)
  if (!normalizedCorrect) {
    return [correctValue]
  }

  const uniquePool = new Map<string, string>()
  for (const rawValue of pool) {
    if (!rawValue) continue
    if (!filter(rawValue)) continue

    const normalizedCandidate = normalizeForComparison(rawValue)
    if (!normalizedCandidate || normalizedCandidate === normalizedCorrect) continue

    if (!uniquePool.has(normalizedCandidate)) {
      uniquePool.set(normalizedCandidate, rawValue)
    }
  }

  const targetLength = countGraphemes(correctValue)
  const scoredCandidates = Array.from(uniquePool.entries())
    .map(([normalized, original]) => ({
      normalized,
      original,
      score: Math.abs(countGraphemes(original) - targetLength),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score
      }
      return a.normalized.localeCompare(b.normalized, locale, { sensitivity: "base" })
    })

  const selected: string[] = []
  for (const candidate of scoredCandidates) {
    if (!selected.includes(candidate.original)) {
      selected.push(candidate.original)
    }
    if (selected.length === 3) {
      break
    }
  }

  if (selected.length < 3) {
    for (const fallbackOption of uniquePool.values()) {
      if (selected.length === 3) break
      if (fallbackOption === correctValue) continue
      if (!selected.includes(fallbackOption)) {
        selected.push(fallbackOption)
      }
    }
  }

  if (selected.length < 3) {
    for (const fallbackOption of fallback) {
      if (selected.length === 3) break
      if (!selected.includes(fallbackOption) && fallbackOption !== correctValue) {
        selected.push(fallbackOption)
      }
    }
  }

  const combined = [correctValue, ...selected.slice(0, 3)]
  return shuffleArray(combined)
}
import TracingCanvas from "@/components/child-class/tracing-canvas"

interface LessonPageProps {
  lesson: ChildLesson
  onComplete: (score: number) => void
  onBack: () => void
}

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
  const [tracingResetKey, setTracingResetKey] = useState<number>(0)
  const [showTracingFailure, setShowTracingFailure] = useState<boolean>(false)
  const [showTracingCelebration, setShowTracingCelebration] = useState<boolean>(false)
  const [celebrationWave, setCelebrationWave] = useState<number>(0)
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<string | null>(null)
  const [selectedPracticeCorrect, setSelectedPracticeCorrect] = useState<boolean | null>(null)
  const [practiceHighlights, setPracticeHighlights] = useState<Record<string, "success" | "error">>({})
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current)
        celebrationTimeoutRef.current = null
      }
    }
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

  const arabicPracticeOptions = useMemo(() => {
    return createPracticeOptions(
      lesson.arabic,
      LESSONS.map((item) => item.arabic),
      {
        locale: "ar",
        filter: isArabicText,
        fallback: ["ب", "ت", "ث", "ن", "م"],
      },
    )
  }, [lesson.arabic])

  const transliterationPracticeOptions = useMemo(() => {
    return createPracticeOptions(
      lesson.translit,
      LESSONS.map((item) => item.translit),
      {
        locale: "en",
        filter: isLatinText,
        fallback: ["Ba", "Ta", "Tha", "Na", "Ma"],
      },
    )
  }, [lesson.translit])

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
      content: "Trace a line to the correct letter",
    },
    {
      type: "writing",
      title: "Writing Practice",
      content: "Trace the letter",
    },
    {
      type: "quiz",
      title: "Quiz",
      content: "Trace a line to match the correct answer",
    },
  ]

  const handleLessonAudioPlay = () => {
    if (settings?.soundEnabled) {
      playSound("correct")
    }
  }

  const showAudioButton = Boolean(lesson.audioSrc || isArabicText(lesson.arabic))

  const lessonCharacterDisplay = (
    <div className="mx-auto mb-6 flex h-48 w-full max-w-[18rem] items-center justify-center">
      <div className="relative flex h-full w-full items-center justify-center">
        <AutoFitText
          maxFontSize={192}
          minFontSize={72}
          className="animate-float text-black font-black leading-none text-center"
        >
          {lesson.arabic}
        </AutoFitText>
        {showAudioButton && (
          <div className="absolute bottom-4 right-4">
            <AudioPlayButton
              audioSrc={lesson.audioSrc}
              fallbackText={lesson.arabic}
              label={`Play pronunciation for ${lesson.title}`}
              onPlay={handleLessonAudioPlay}
            />
          </div>
        )}
      </div>
    </div>
  )

  const handlePracticeAnswer = (
    optionKey: string,
    isCorrect: boolean,
    correctOptionKey: string,
    relatedOptionKeys: string[],
  ) => {
    setSelectedPracticeOption(optionKey)
    setSelectedPracticeCorrect(isCorrect)
    setPracticeHighlights(() => {
      const highlights: Record<string, "success" | "error"> = {}
      for (const key of relatedOptionKeys) {
        highlights[key] = key === correctOptionKey ? "success" : "error"
      }
      return highlights
    })

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
    if (tracingComplete || showTracingCelebration) return

    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current)
    }

    setShowTracingCelebration(true)
    setCelebrationWave((prev) => prev + 1)
    setScore((prev) => prev + 25)
    setFeedbackMessage("Perfect tracing! 🎉")
    setFeedbackType("success")
    setShowFeedback(true)
    setShowTracingFailure(false)
    if (settings?.soundEnabled) {
      playSound("correct")
    }
    window.setTimeout(() => setShowFeedback(false), 1500)

    celebrationTimeoutRef.current = setTimeout(() => {
      setShowTracingCelebration(false)
      setTracingComplete(true)
      celebrationTimeoutRef.current = null
    }, 2000)
  }

  const handleTracingFailure = () => {
    setFeedbackMessage("Let's try again! 💪")
    setFeedbackType("error")
    setShowFeedback(true)
    window.setTimeout(() => setShowFeedback(false), 1500)
    setShowTracingFailure(true)
  }

  const handleResetTracing = () => {
    setTracingProgress(0)
    setTracingMistakes(0)
    setTracingComplete(false)
    setTracingResetKey((prev) => prev + 1)
    setShowTracingFailure(false)
    setShowTracingCelebration(false)
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current)
      celebrationTimeoutRef.current = null
    }
  }

  useEffect(() => {
    setTracingProgress(0)
    setTracingMistakes(0)
    setTracingComplete(false)
    setTracingResetKey((prev) => prev + 1)
    setShowTracingFailure(false)
    setShowTracingCelebration(false)
    setPracticeHighlights({})
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current)
      celebrationTimeoutRef.current = null
    }
  }, [lesson.id])

  useEffect(() => {
    setPracticeHighlights({})
    setSelectedPracticeOption(null)
    setSelectedPracticeCorrect(null)
  }, [currentStep])

  const tracingCelebrationPieces = useMemo(() => {
    if (!showTracingCelebration) return []
    return Array.from({ length: 24 }, (_, index) => ({
      id: `${celebrationWave}-confetti-${index}`,
      left: Math.random() * 100,
      delay: (index % 6) * 90,
      duration: 1400 + Math.random() * 700,
      colorVariant: index % 4,
    }))
  }, [showTracingCelebration, celebrationWave])

  const tracingSparkles = useMemo(() => {
    if (!showTracingCelebration) return []
    return Array.from({ length: 8 }, (_, index) => ({
      id: `${celebrationWave}-sparkle-${index}`,
      top: 10 + Math.random() * 70,
      left: 10 + Math.random() * 80,
      size: 12 + Math.random() * 10,
      delay: index * 120,
    }))
  }, [showTracingCelebration, celebrationWave])

  const isNextDisabled = currentStep === 3 && (!tracingComplete || showTracingCelebration)

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

      {showTracingCelebration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-200/40 via-transparent to-pink-200/40 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {tracingCelebrationPieces.map((piece) => (
              <span
                key={piece.id}
                aria-hidden="true"
                className={`confetti-piece ${
                  piece.colorVariant === 0
                    ? "bg-emerald-400"
                    : piece.colorVariant === 1
                      ? "bg-amber-400"
                      : piece.colorVariant === 2
                        ? "bg-pink-400"
                        : "bg-maroon-400"
                }`}
                style={{
                  left: `${piece.left}%`,
                  animationDelay: `${piece.delay}ms`,
                  animationDuration: `${piece.duration}ms`,
                }}
              />
            ))}
            {tracingSparkles.map((sparkle) => (
              <span
                key={sparkle.id}
                aria-hidden="true"
                className="absolute rounded-full bg-white/80 shadow-lg animate-ping"
                style={{
                  top: `${sparkle.top}%`,
                  left: `${sparkle.left}%`,
                  width: `${sparkle.size}px`,
                  height: `${sparkle.size}px`,
                  animationDelay: `${sparkle.delay}ms`,
                }}
              />
            ))}
          </div>
          <div className="pointer-events-none relative z-10 flex flex-col items-center gap-3 rounded-3xl bg-white/80 px-10 py-8 text-center shadow-xl animate-scale-in">
            <div className="flex items-center gap-3 text-5xl">
              <span role="img" aria-hidden="true">
                ✨
              </span>
              <span role="img" aria-hidden="true">
                🌟
              </span>
              <span role="img" aria-hidden="true">
                ✨
              </span>
            </div>
            <p className="text-3xl font-extrabold text-maroon drop-shadow-sm">Amazing tracing!</p>
            <p className="text-sm font-semibold text-maroon/70">Sprinkles of success are celebrating your win!</p>
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
              {lessonCharacterDisplay}
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
              {lessonCharacterDisplay}
              <AudioPlayButton
                audioSrc={lesson.audioSrc}
                fallbackText={lesson.arabic}
                label={`Listen to pronunciation for ${lesson.title}`}
                variant="primary"
                onPlay={handleLessonAudioPlay}
              >
                Listen to Pronunciation
              </AudioPlayButton>
              <p className="text-lg text-maroon/70">Click the button to hear the correct pronunciation</p>
            </div>
          )}

          {currentStep === 2 && (() => {
            const optionKeys = arabicPracticeOptions.map((_, idx) => `practice-arabic-${idx}`)
            const correctIndex = arabicPracticeOptions.indexOf(lesson.arabic)
            const correctOptionKey = correctIndex >= 0 ? optionKeys[correctIndex] : null

            const handleTraceSelect = (optionKey: string | null) => {
              if (!optionKey || !correctOptionKey) {
                setPracticeHighlights({})
                setSelectedPracticeOption(null)
                setSelectedPracticeCorrect(null)
                return
              }

              const optionIndex = optionKeys.indexOf(optionKey)
              if (optionIndex === -1) return
              const isCorrect = arabicPracticeOptions[optionIndex] === lesson.arabic
              handlePracticeAnswer(optionKey, isCorrect, correctOptionKey, optionKeys)
            }

            return (
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[2].title}</h2>
                <p className="text-lg text-maroon/70 mb-10">
                  Which one is {renderLessonTitle(lesson.title)}?
                </p>
                <TraceSelectionArea onSelectOption={handleTraceSelect} className="mb-8">
                  <div className="grid grid-cols-2 gap-6">
                    {arabicPracticeOptions.map((letter, idx) => {
                      const optionKey = optionKeys[idx]
                      const isSelected = selectedPracticeOption === optionKey
                      const highlightState = practiceHighlights[optionKey]
                      const stateClass = highlightState
                        ? highlightState === "success"
                          ? "kid-card-blink-success"
                          : "kid-card-blink-error"
                        : isSelected
                          ? selectedPracticeCorrect
                            ? "kid-card-blink-success"
                            : "kid-card-blink-error"
                          : ""

                      return (
                        <button
                          key={optionKey}
                          data-option-key={optionKey}
                          onClick={() =>
                            handlePracticeAnswer(optionKey, letter === lesson.arabic, correctOptionKey ?? optionKey, optionKeys)
                          }
                          className={`kid-card ${practiceCardGradients[idx % practiceCardGradients.length]} flex min-h-[11rem] items-center justify-center p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] ${stateClass}`.trim()}
                        >
                          <AutoFitText
                            maxFontSize={120}
                            minFontSize={48}
                            className="font-black text-black leading-none"
                          >
                            {letter}
                          </AutoFitText>
                        </button>
                      )
                    })}
                  </div>
                </TraceSelectionArea>
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
            )
          })()}

          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[3].title}</h2>
              <p className="text-lg text-maroon/70 mb-8">Trace the letter below and stay inside the guide.</p>
              <div className="kid-card kid-gradient-tropical p-6 md:p-10 mb-8 text-center">
                <TracingCanvas
                  key={`${lesson.id}-${tracingResetKey}`}
                  letter={lesson.arabic}
                  onProgress={setTracingProgress}
                  onMistake={setTracingMistakes}
                  onSuccess={handleTracingSuccess}
                  onFail={handleTracingFailure}
                  resetSignal={tracingResetKey}
                />
                <div className="mt-6 flex flex-col items-center gap-4 text-maroon/80">
                  <div className="grid w-full grid-cols-3 items-center gap-3 text-center text-xs sm:text-sm">
                    {!tracingComplete && (
                      <button
                        onClick={handleResetTracing}
                        className="justify-self-start rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 px-3 py-1 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg sm:px-4"
                      >
                        Start Over
                      </button>
                    )}
                    <p className="text-base font-semibold sm:text-lg">Progress: {Math.round(tracingProgress * 100)}%</p>
                    <p className={`text-sm font-bold sm:text-base ${tracingMistakes > 0 ? "text-red-500" : "text-maroon/60"}`}>
                      Mistakes: {Math.min(tracingMistakes, 3)} / 3
                    </p>
                  </div>
                  {!tracingComplete && (
                    <p className="text-sm font-semibold text-emerald-600">Keep tracing inside the guide to finish!</p>
                  )}
                  {tracingComplete && (
                    <p className="text-base font-semibold text-green-600">Great tracing! You can continue.</p>
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

          {currentStep === 4 && (() => {
            const optionKeys = transliterationPracticeOptions.map((_, idx) => `practice-translit-${idx}`)
            const correctIndex = transliterationPracticeOptions.indexOf(lesson.translit)
            const correctOptionKey = correctIndex >= 0 ? optionKeys[correctIndex] : null

            const handleTraceSelect = (optionKey: string | null) => {
              if (!optionKey || !correctOptionKey) {
                setPracticeHighlights({})
                setSelectedPracticeOption(null)
                setSelectedPracticeCorrect(null)
                return
              }

              const optionIndex = optionKeys.indexOf(optionKey)
              if (optionIndex === -1) return
              const isCorrect = transliterationPracticeOptions[optionIndex] === lesson.translit
              handlePracticeAnswer(optionKey, isCorrect, correctOptionKey, optionKeys)
            }

            return (
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[4].title}</h2>
                <div className="kid-card kid-gradient-sunset p-8 mb-8">
                  <p className="text-lg text-maroon mb-6 flex flex-wrap items-center justify-center gap-2 text-center">
                    {renderTextWithArabicCard(`What is the transliteration of ${lesson.arabic}?`)}
                  </p>
                  <TraceSelectionArea onSelectOption={handleTraceSelect}>
                    <div className="grid grid-cols-2 gap-4">
                      {transliterationPracticeOptions.map((option, idx) => {
                        const optionKey = optionKeys[idx]
                        const isSelected = selectedPracticeOption === optionKey
                        const highlightState = practiceHighlights[optionKey]
                        const stateClass = highlightState
                          ? highlightState === "success"
                            ? "kid-card-blink-success"
                            : "kid-card-blink-error"
                          : isSelected
                            ? selectedPracticeCorrect
                              ? "kid-card-blink-success"
                              : "kid-card-blink-error"
                            : ""

                        return (
                          <button
                            key={optionKey}
                            data-option-key={optionKey}
                            onClick={() =>
                              handlePracticeAnswer(
                                optionKey,
                                option === lesson.translit,
                                correctOptionKey ?? optionKey,
                                optionKeys,
                              )
                            }
                            className={`kid-card ${practiceCardGradients[idx % practiceCardGradients.length]} flex min-h-[7.5rem] items-center justify-center p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] ${stateClass}`.trim()}
                          >
                            <AutoFitText
                              maxFontSize={48}
                              minFontSize={20}
                              className="font-extrabold leading-snug text-black"
                            >
                              {option}
                            </AutoFitText>
                          </button>
                        )
                      })}
                    </div>
                  </TraceSelectionArea>
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
            )
          })()}

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
