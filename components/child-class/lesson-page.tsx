"use client"

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { playSound } from "@/lib/child-class/sound-effects"
import { loadSettings, type UserSettings } from "@/lib/child-class/settings-utils"
import type { ChildLesson } from "@/types/child-class"

interface LessonPageProps {
  lesson: ChildLesson
  onComplete: (score: number) => void
  onBack: () => void
}

export default function LessonPage({ lesson, onComplete, onBack }: LessonPageProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success")
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [showCompletion, setShowCompletion] = useState<boolean>(false)
  const [mistakes, setMistakes] = useState<number>(0)
  const [tracingComplete, setTracingComplete] = useState<boolean>(false)
  const [coverage, setCoverage] = useState<number>(0)
  const [showFailure, setShowFailure] = useState<boolean>(false)

  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const letterMaskRef = useRef<Uint8Array | null>(null)
  const coverageMapRef = useRef<Uint8Array | null>(null)
  const totalLetterPixelsRef = useRef<number>(0)
  const coveredPixelsRef = useRef<number>(0)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const isDrawingRef = useRef<boolean>(false)
  const wasOutsideRef = useRef<boolean>(false)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const failureTriggeredRef = useRef<boolean>(false)
  const successTriggeredRef = useRef<boolean>(false)

  const CANVAS_SIZE = 420
  const BRUSH_RADIUS = 12

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [])

  const triggerFeedback = useCallback((message: string, type: "success" | "error") => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
    }
    setFeedbackMessage(message)
    setFeedbackType(type)
    setShowFeedback(true)
    feedbackTimeoutRef.current = setTimeout(() => {
      setShowFeedback(false)
    }, 1800)
  }, [])

  const resetTracingState = useCallback(() => {
    setMistakes(0)
    setCoverage(0)
    setTracingComplete(false)
    setShowFailure(false)
    failureTriggeredRef.current = false
    successTriggeredRef.current = false
    coveredPixelsRef.current = 0
    lastPointRef.current = null
    isDrawingRef.current = false
    wasOutsideRef.current = false
  }, [])

  const initialiseTracingCanvas = useCallback(() => {
    if (typeof window === "undefined") return

    const guideCanvas = guideCanvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!guideCanvas || !drawingCanvas) return

    guideCanvas.width = CANVAS_SIZE
    guideCanvas.height = CANVAS_SIZE
    drawingCanvas.width = CANVAS_SIZE
    drawingCanvas.height = CANVAS_SIZE

    const guideCtx = guideCanvas.getContext("2d")
    const drawingCtx = drawingCanvas.getContext("2d")
    if (!guideCtx || !drawingCtx) return

    guideCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    drawingCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const fontSize = CANVAS_SIZE * 0.6
    const fontFamily = `'Scheherazade New', 'Amiri', serif`

    guideCtx.fillStyle = "rgba(30, 20, 40, 0.15)"
    guideCtx.textAlign = "center"
    guideCtx.textBaseline = "middle"
    guideCtx.font = `${fontSize}px ${fontFamily}`
    guideCtx.fillText(lesson.arabic, CANVAS_SIZE / 2, CANVAS_SIZE / 2)

    const maskCanvas = document.createElement("canvas")
    maskCanvas.width = CANVAS_SIZE
    maskCanvas.height = CANVAS_SIZE
    const maskCtx = maskCanvas.getContext("2d")
    if (!maskCtx) return

    maskCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    maskCtx.fillStyle = "#000"
    maskCtx.textAlign = "center"
    maskCtx.textBaseline = "middle"
    maskCtx.font = `${fontSize}px ${fontFamily}`
    maskCtx.fillText(lesson.arabic, CANVAS_SIZE / 2, CANVAS_SIZE / 2)

    const imageData = maskCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    const mask = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE)
    let total = 0
    for (let i = 0; i < CANVAS_SIZE * CANVAS_SIZE; i++) {
      const alpha = imageData.data[i * 4 + 3]
      if (alpha > 80) {
        mask[i] = 1
        total += 1
      }
    }
    letterMaskRef.current = mask
    coverageMapRef.current = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE)
    totalLetterPixelsRef.current = total

    resetTracingState()
  }, [CANVAS_SIZE, lesson.arabic, resetTracingState])

  useEffect(() => {
    if (currentStep === 3) {
      initialiseTracingCanvas()
    }
  }, [currentStep, initialiseTracingCanvas])

  const handleTracingSuccess = useCallback(() => {
    if (successTriggeredRef.current) return
    successTriggeredRef.current = true
    setTracingComplete(true)
    setScore((prev) => prev + 25)
    triggerFeedback("Perfect tracing! 🎉", "success")
    if (settings?.soundEnabled) {
      playSound("correct")
    }
  }, [settings?.soundEnabled, triggerFeedback])

  const handleTracingFailure = useCallback(() => {
    if (failureTriggeredRef.current) return
    failureTriggeredRef.current = true
    setShowFailure(true)
    triggerFeedback("Oops! Let's try again.", "error")
    if (settings?.soundEnabled) {
      playSound("incorrect")
    }
  }, [settings?.soundEnabled, triggerFeedback])

  const getCanvasCoordinates = useCallback((
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY
    return { x, y }
  }, [])

  const drawStroke = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const drawingCanvas = drawingCanvasRef.current
      const mask = letterMaskRef.current
      const coverageMap = coverageMapRef.current
      if (!drawingCanvas || !mask || !coverageMap) return

      const ctx = drawingCanvas.getContext("2d")
      if (!ctx) return

      const dx = to.x - from.x
      const dy = to.y - from.y
      const steps = Math.max(Math.abs(dx), Math.abs(dy))
      let outsideSegment = false
      let insidePainted = false

      for (let i = 0; i <= steps; i++) {
        const progress = steps === 0 ? 0 : i / steps
        const x = Math.round(from.x + dx * progress)
        const y = Math.round(from.y + dy * progress)
        if (x < 0 || y < 0 || x >= CANVAS_SIZE || y >= CANVAS_SIZE) {
          outsideSegment = true
          continue
        }

        const index = y * CANVAS_SIZE + x
        const insideLetter = mask[index] === 1
        ctx.beginPath()
        ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = insideLetter ? "#111111" : "rgba(200, 40, 60, 0.85)"
        ctx.fill()

        if (insideLetter) {
          insidePainted = true
          if (coverageMap[index] === 0) {
            coverageMap[index] = 1
            coveredPixelsRef.current += 1
          }
        } else {
          outsideSegment = true
        }
      }

      if (insidePainted && totalLetterPixelsRef.current > 0) {
        const progress = Math.min(
          100,
          Math.round((coveredPixelsRef.current / totalLetterPixelsRef.current) * 100),
        )
        setCoverage((prev) => (progress > prev ? progress : prev))
        if (coveredPixelsRef.current / totalLetterPixelsRef.current >= 0.65) {
          handleTracingSuccess()
        }
      }

      if (outsideSegment) {
        if (!wasOutsideRef.current) {
          wasOutsideRef.current = true
          setMistakes((prev) => {
            const next = prev + 1
            if (next >= 3) {
              handleTracingFailure()
            }
            return next
          })
        }
      } else {
        wasOutsideRef.current = false
      }
    },
    [BRUSH_RADIUS, CANVAS_SIZE, handleTracingFailure, handleTracingSuccess],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (tracingComplete || showFailure) return
      if (!drawingCanvasRef.current) return

      event.preventDefault()
      const point = getCanvasCoordinates(event)
      isDrawingRef.current = true
      lastPointRef.current = point
      wasOutsideRef.current = false
      drawStroke(point, point)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [drawStroke, getCanvasCoordinates, showFailure, tracingComplete],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || tracingComplete || showFailure) return
      event.preventDefault()
      const point = getCanvasCoordinates(event)
      const lastPoint = lastPointRef.current ?? point
      drawStroke(lastPoint, point)
      lastPointRef.current = point
    },
    [drawStroke, getCanvasCoordinates, showFailure, tracingComplete],
  )

  const stopDrawing = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    isDrawingRef.current = false
    lastPointRef.current = null
    wasOutsideRef.current = false
  }, [])

  const handleResetTracing = useCallback(() => {
    initialiseTracingCanvas()
  }, [initialiseTracingCanvas])

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

  const handlePracticeAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 25)
      triggerFeedback("Excellent! 🎉", "success")
      if (settings?.soundEnabled) {
        playSound("correct")
      }
    } else {
      triggerFeedback("Try again! 💪", "error")
      if (settings?.soundEnabled) {
        playSound("incorrect")
      }
    }
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

  return (
    <div className="relative min-h-screen px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-8 h-40 w-40 rounded-full bg-white/50 blur-3xl"></div>
        <div className="absolute bottom-0 right-12 h-48 w-48 rounded-full bg-gradient-to-br from-maroon/20 via-pink-100/60 to-transparent blur-3xl"></div>
      </div>

      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="kid-card max-w-md p-12 text-center animate-scale-in">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-extrabold text-maroon mb-3">Lesson Complete!</h2>
            <p className="text-3xl font-black text-maroon mb-6">{score} Points</p>
            <p className="text-maroon/70 text-lg">Fantastic work! Keep learning!</p>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <div className="relative z-10 mb-8 animate-slide-down">
        <div className="kid-card flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onBack}
            className="kid-pill flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-105"
          >
            ← Back
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-maroon/60">Lesson Spotlight</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-maroon">{lesson.title}</h1>
          </div>
          <div className="rounded-full bg-white/80 px-5 py-2 text-2xl font-black text-maroon shadow-inner">
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
        <div className="kid-card p-8 md:p-12 animate-slide-up">
          {currentStep === 0 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[0].title}</h2>
              <div className="text-black text-[16rem] mb-8 animate-float">{lesson.arabic}</div>
              <p className="text-lg text-maroon/70 mb-8">{lesson.description}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="kid-pill rounded-3xl p-6 text-left shadow-lg">
                  <p className="text-xs uppercase tracking-widest text-maroon/60">Transliteration</p>
                  <p className="mt-2 text-2xl font-black text-maroon">{lesson.translit}</p>
                </div>
                <div className="kid-pill rounded-3xl p-6 text-left shadow-lg">
                  <p className="text-xs uppercase tracking-widest text-maroon/60">Rule</p>
                  <p className="mt-2 text-2xl font-black text-maroon">{lesson.rule}</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-8">{steps[1].title}</h2>
              <div className="text-black text-[16rem] mb-12 animate-float">{lesson.arabic}</div>
              <button
                onClick={handlePronounce}
                className="inline-block rounded-3xl bg-gradient-to-r from-maroon via-maroon/90 to-maroon/80 px-12 py-6 text-2xl font-extrabold text-[var(--color-milk)] shadow-[0_12px_30px_rgba(123,51,96,0.25)] transition-transform duration-300 hover:scale-[1.04]"
              >
                🔊 Listen to Pronunciation
              </button>
              <p className="text-lg text-maroon/70">Click the button to hear the correct pronunciation</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-maroon mb-6">{steps[2].title}</h2>
              <p className="text-lg text-maroon/70 mb-10">Which one is {lesson.title}?</p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[lesson.arabic, "ب", "ت", "ث"].map((letter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePracticeAnswer(letter === lesson.arabic)}
                    className="kid-card p-8 text-black text-[7.5rem] font-black transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
                  >
                    {letter}
                  </button>
                ))}
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
              <p className="text-lg text-maroon/70 mb-8">Trace the glowing letter without going outside the lines</p>
              <div className="relative">
                <div className="kid-card relative p-6 md:p-8 mb-8 flex flex-col items-center justify-center">
                  <div className="relative flex h-[420px] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-[2.5rem] bg-white">
                    <canvas
                      ref={guideCanvasRef}
                      className="absolute inset-0 h-full w-full select-none"
                    ></canvas>
                    <canvas
                      ref={drawingCanvasRef}
                      className="relative z-10 h-full w-full touch-none select-none"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={stopDrawing}
                      onPointerLeave={stopDrawing}
                      onPointerCancel={stopDrawing}
                    ></canvas>
                    {showFailure && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-white/90 text-maroon">
                        <p className="text-3xl font-extrabold text-red-500">Almost there!</p>
                        <p className="text-lg text-maroon/70">Let's try tracing again.</p>
                        <button
                          onClick={handleResetTracing}
                          className="kid-pill rounded-full px-6 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-[1.05]"
                        >
                          ↺ Try again
                        </button>
                      </div>
                    )}
                    {tracingComplete && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[2.5rem] bg-white/80 text-maroon">
                        <p className="text-3xl font-extrabold">Amazing tracing! ✨</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-maroon">
                    <span className="rounded-full bg-maroon/5 px-4 py-2">Progress: {coverage}%</span>
                    <span className={`rounded-full px-4 py-2 ${mistakes > 0 ? "bg-red-100 text-red-600" : "bg-maroon/5"}`}>
                      Mistakes: {mistakes} / 3
                    </span>
                    <button
                      onClick={handleResetTracing}
                      disabled={tracingComplete}
                      className={`kid-pill rounded-full px-6 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-[1.05] ${tracingComplete ? "pointer-events-none opacity-50" : ""}`}
                    >
                      Reset canvas
                    </button>
                  </div>
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
              <div className="kid-card p-8 mb-8">
                <p className="text-lg text-maroon mb-6">What is the transliteration of {lesson.arabic}?</p>
                <div className="grid grid-cols-2 gap-4">
                  {[lesson.translit, "Ba", "Ta", "Tha"].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePracticeAnswer(option === lesson.translit)}
                      className="kid-card p-6 text-lg font-extrabold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
                    >
                      {option}
                    </button>
                  ))}
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
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={onBack}
              className="flex-1 kid-pill rounded-full px-6 py-4 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-[1.02]"
            >
              Cancel
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 rounded-3xl bg-gradient-to-r from-maroon via-maroon/90 to-maroon/80 py-4 text-lg font-extrabold text-[var(--color-milk)] shadow-[0_15px_35px_rgba(123,51,96,0.25)] transition-transform duration-300 hover:scale-[1.03]"
            >
              {currentStep === steps.length - 1 ? "Complete Lesson" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
