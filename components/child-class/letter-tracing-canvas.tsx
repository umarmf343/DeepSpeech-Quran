"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

interface LetterTracingCanvasProps {
  letter: string
  onSuccess?: () => void
  onFailure?: () => void
  onReset?: () => void
}

const CANVAS_SIZE = 360
const CELL_SIZE = 8
const STROKE_RADIUS = 10
const MISTAKE_LIMIT = 3
const SUCCESS_THRESHOLD = 0.75

export default function LetterTracingCanvas({
  letter,
  onSuccess,
  onFailure,
  onReset,
}: LetterTracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const maskDataRef = useRef<ImageData | null>(null)
  const tracedCellsRef = useRef<Set<string>>(new Set())
  const targetCellsRef = useRef<Set<string>>(new Set())
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const tracingCompleteRef = useRef(false)

  const [progress, setProgress] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showFailure, setShowFailure] = useState(false)

  const isPointInsideLetter = useCallback((x: number, y: number) => {
    const maskData = maskDataRef.current
    if (!maskData) return false

    const clampedX = Math.max(0, Math.min(maskData.width - 1, Math.round(x)))
    const clampedY = Math.max(0, Math.min(maskData.height - 1, Math.round(y)))
    const index = (clampedY * maskData.width + clampedX) * 4 + 3

    return maskData.data[index] > 40
  }, [])

  const updateProgress = useCallback(
    (x: number, y: number) => {
      const targetCells = targetCellsRef.current
      if (targetCells.size === 0) return

      const tracedCells = tracedCellsRef.current
      const key = `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`

      if (!targetCells.has(key) || tracedCells.has(key)) return

      tracedCells.add(key)
      const nextProgress = tracedCells.size / targetCells.size
      setProgress(nextProgress)

      if (nextProgress >= SUCCESS_THRESHOLD && !tracingCompleteRef.current) {
        tracingCompleteRef.current = true
        onSuccess?.()
      }
    },
    [onSuccess],
  )

  const drawCircle = useCallback((x: number, y: number, color: string) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, STROKE_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }, [])

  const applyStroke = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      if (showFailure || tracingCompleteRef.current) return

      const distance = Math.hypot(to.x - from.x, to.y - from.y)
      const steps = Math.max(1, Math.ceil(distance / 4))
      let hasMistake = false

      for (let step = 0; step <= steps; step++) {
        const t = steps === 0 ? 0 : step / steps
        const x = from.x + (to.x - from.x) * t
        const y = from.y + (to.y - from.y) * t

        if (isPointInsideLetter(x, y)) {
          drawCircle(x, y, "#111827")
          updateProgress(x, y)
        } else {
          drawCircle(x, y, "rgba(220,38,38,0.45)")
          hasMistake = true
        }
      }

      if (hasMistake) {
        setMistakes((prev) => {
          const next = prev + 1
          if (next >= MISTAKE_LIMIT) {
            setShowFailure(true)
            onFailure?.()
          }
          return next
        })
      }
    },
    [drawCircle, isPointInsideLetter, onFailure, showFailure, updateProgress],
  )

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.fillStyle = "#fff8f4"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const fontSize = CANVAS_SIZE * 0.7
    ctx.fillStyle = "rgba(123, 51, 96, 0.2)"
    ctx.font = `700 ${fontSize}px 'Scheherazade New', 'Amiri', serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2)

    const maskCanvas = document.createElement("canvas")
    maskCanvas.width = CANVAS_SIZE
    maskCanvas.height = CANVAS_SIZE
    const maskCtx = maskCanvas.getContext("2d")
    if (!maskCtx) return

    maskCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    maskCtx.fillStyle = "#000"
    maskCtx.font = `700 ${fontSize}px 'Scheherazade New', 'Amiri', serif`
    maskCtx.textAlign = "center"
    maskCtx.textBaseline = "middle"
    maskCtx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2)

    const maskData = maskCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    maskDataRef.current = maskData

    const targetCells = new Set<string>()
    const data = maskData.data
    for (let y = 0; y < CANVAS_SIZE; y += CELL_SIZE) {
      for (let x = 0; x < CANVAS_SIZE; x += CELL_SIZE) {
        const index = (y * CANVAS_SIZE + x) * 4 + 3
        if (data[index] > 40) {
          targetCells.add(`${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`)
        }
      }
    }

    targetCellsRef.current = targetCells
    tracedCellsRef.current = new Set()
    tracingCompleteRef.current = false
    isDrawingRef.current = false
    lastPointRef.current = null

    setProgress(0)
    setMistakes(0)
    setShowFailure(false)
  }, [letter])

  useEffect(() => {
    initializeCanvas()
  }, [initializeCanvas])

  const getPointerPosition = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX ?? 0) - rect.left) * (canvas.width / rect.width)
    const y = ((event.clientY ?? 0) - rect.top) * (canvas.height / rect.height)
    return { x, y }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (showFailure || tracingCompleteRef.current) return
    event.preventDefault()
    const point = getPointerPosition(event)
    isDrawingRef.current = true
    lastPointRef.current = point
    applyStroke(point, point)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || showFailure || tracingCompleteRef.current) return
    event.preventDefault()
    const currentPoint = getPointerPosition(event)
    const lastPoint = lastPointRef.current ?? currentPoint
    applyStroke(lastPoint, currentPoint)
    lastPointRef.current = currentPoint
  }

  const stopDrawing = () => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }

  const handleReset = () => {
    initializeCanvas()
    onReset?.()
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="h-[280px] w-[280px] touch-none select-none rounded-3xl border-4 border-maroon/10 bg-white shadow-inner sm:h-[320px] sm:w-[320px]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
        />

        {showFailure && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/85 backdrop-blur-sm">
            <p className="mb-4 text-center text-lg font-semibold text-red-600">Oops! Let's try again.</p>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full bg-red-500 px-6 py-2 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 text-sm font-semibold text-maroon/80 sm:flex-row sm:gap-6">
        <span>Progress: {Math.round(progress * 100)}%</span>
        <span>Mistakes: {mistakes} / {MISTAKE_LIMIT}</span>
      </div>

      <button
        type="button"
        onClick={handleReset}
        className="rounded-full border-2 border-maroon/30 px-6 py-2 text-sm font-semibold text-maroon transition-transform duration-300 hover:scale-105"
      >
        Reset Tracing
      </button>
    </div>
  )
}
