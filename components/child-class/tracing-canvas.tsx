"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"

interface LetterTracingCanvasProps {
  letter: string
  onSuccess?: () => void
  onFail?: () => void
}

const CANVAS_SIZE = 320
const STROKE_WIDTH = 20
const SUCCESS_THRESHOLD = 0.65

type TracingStatus = "idle" | "completed" | "failed"

export function LetterTracingCanvas({ letter, onSuccess, onFail }: LetterTracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const maskDataRef = useRef<Uint8ClampedArray | null>(null)
  const tracedPixelsRef = useRef<Uint8Array | null>(null)
  const totalMaskPixelsRef = useRef<number>(1)
  const tracedCountRef = useRef<number>(0)
  const isDrawingRef = useRef<boolean>(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const lastInBoundsRef = useRef<boolean>(false)
  const [mistakes, setMistakes] = useState<number>(0)
  const [status, setStatus] = useState<TracingStatus>("idle")
  const statusRef = useRef<TracingStatus>("idle")

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    tracedPixelsRef.current?.fill(0)
    tracedCountRef.current = 0
    setMistakes(0)
    setStatus("idle")
    statusRef.current = "idle"
  }, [])

  const initializeMask = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    const context = canvas.getContext("2d")
    if (!context) return

    context.lineCap = "round"
    context.lineJoin = "round"
    context.lineWidth = STROKE_WIDTH
    contextRef.current = context

    const maskCanvas = document.createElement("canvas")
    maskCanvas.width = CANVAS_SIZE
    maskCanvas.height = CANVAS_SIZE
    const maskContext = maskCanvas.getContext("2d")
    if (!maskContext) return

    maskContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    maskContext.fillStyle = "#000"
    maskContext.textAlign = "center"
    maskContext.textBaseline = "middle"
    maskContext.font = `bold ${Math.floor(CANVAS_SIZE * 0.65)}px 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif`
    maskContext.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2)

    const maskImage = maskContext.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    maskDataRef.current = maskImage.data

    tracedPixelsRef.current = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE)
    tracedCountRef.current = 0

    let totalMaskPixels = 0
    const data = maskImage.data
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 30) {
        totalMaskPixels += 1
      }
    }

    totalMaskPixelsRef.current = Math.max(totalMaskPixels, 1)
  }, [letter])

  useEffect(() => {
    initializeMask()
    resetCanvas()
  }, [initializeMask, resetCanvas])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const markTracedPoint = useCallback((x: number, y: number) => {
    const maskData = maskDataRef.current
    const tracedPixels = tracedPixelsRef.current
    if (!maskData || !tracedPixels) return

    const px = Math.round(x)
    const py = Math.round(y)
    if (px < 0 || py < 0 || px >= CANVAS_SIZE || py >= CANVAS_SIZE) return

    const maskIndex = (py * CANVAS_SIZE + px) * 4 + 3
    if (maskData[maskIndex] <= 30) return

    const tracedIndex = py * CANVAS_SIZE + px
    if (tracedPixels[tracedIndex] === 1) return

    tracedPixels[tracedIndex] = 1
    tracedCountRef.current += 1

    const coverage = tracedCountRef.current / totalMaskPixelsRef.current
    if (coverage >= SUCCESS_THRESHOLD && statusRef.current !== "completed") {
      statusRef.current = "completed"
      setStatus("completed")
      onSuccess?.()
    }
  }, [onSuccess])

  const markTracedSegment = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y)))
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps
        const x = from.x + (to.x - from.x) * t
        const y = from.y + (to.y - from.y) * t
        markTracedPoint(x, y)
      }
    },
    [markTracedPoint],
  )

  const isPointInMask = useCallback((x: number, y: number) => {
    const maskData = maskDataRef.current
    if (!maskData) return false

    const px = Math.round(x)
    const py = Math.round(y)
    if (px < 0 || py < 0 || px >= CANVAS_SIZE || py >= CANVAS_SIZE) return false

    const maskIndex = (py * CANVAS_SIZE + px) * 4 + 3
    return maskData[maskIndex] > 30
  }, [])

  const registerMistake = useCallback(() => {
    setMistakes((prev) => {
      const next = prev + 1
      if (next >= 3 && statusRef.current !== "failed") {
        statusRef.current = "failed"
        setStatus("failed")
        onFail?.()
      }
      return next
    })
  }, [onFail])

  const getCanvasCoordinates = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }, [])

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }, [])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (statusRef.current !== "idle") return

      const canvas = canvasRef.current
      const context = contextRef.current
      if (!canvas || !context) return

      const { x, y } = getCanvasCoordinates(event)
      const inBounds = isPointInMask(x, y)

      isDrawingRef.current = true
      lastPointRef.current = { x, y }
      lastInBoundsRef.current = inBounds

      context.strokeStyle = inBounds ? "#111827" : "rgba(220,38,38,0.8)"
      context.lineWidth = STROKE_WIDTH
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x, y)
      context.stroke()

      if (inBounds) {
        markTracedPoint(x, y)
      } else {
        registerMistake()
      }

      try {
        canvas.setPointerCapture(event.pointerId)
      } catch {
        // Ignore capture errors (e.g., unsupported browsers)
      }

      event.preventDefault()
    },
    [getCanvasCoordinates, isPointInMask, markTracedPoint, registerMistake],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return
      if (statusRef.current !== "idle") {
        stopDrawing()
        return
      }

      const context = contextRef.current
      const lastPoint = lastPointRef.current
      if (!context || !lastPoint) return

      const { x, y } = getCanvasCoordinates(event)
      const inBounds = isPointInMask(x, y)

      context.strokeStyle = inBounds ? "#111827" : "rgba(220,38,38,0.8)"
      context.lineWidth = STROKE_WIDTH
      context.beginPath()
      context.moveTo(lastPoint.x, lastPoint.y)
      context.lineTo(x, y)
      context.stroke()

      if (inBounds) {
        markTracedSegment(lastPoint, { x, y })
      } else if (lastInBoundsRef.current) {
        registerMistake()
      }

      lastPointRef.current = { x, y }
      lastInBoundsRef.current = inBounds

      event.preventDefault()
    },
    [getCanvasCoordinates, isPointInMask, markTracedSegment, registerMistake, stopDrawing],
  )

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (canvas) {
        try {
          canvas.releasePointerCapture(event.pointerId)
        } catch {
          // Ignore capture errors
        }
      }
      stopDrawing()
      event.preventDefault()
    },
    [stopDrawing],
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-[32px] border-2 border-gold/40 bg-white/40 backdrop-blur-sm"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
          <span className="text-[180px] font-bold text-maroon/20">{letter}</span>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="relative z-10 rounded-[32px] touch-none"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
      <div className="flex items-center gap-2 text-maroon/80">
        <span className="font-semibold">Mistakes:</span>
        <span className={mistakes > 0 ? "font-bold text-red-600" : "font-bold"}>{mistakes}</span>
        <span className="text-sm text-maroon/60">/ 3</span>
      </div>

      {status === "failed" && (
        <div className="text-center space-y-3">
          <p className="text-red-600 font-semibold">Failed, try again!</p>
          <button onClick={resetCanvas} className="btn-secondary px-6 py-2">
            Start Over
          </button>
        </div>
      )}

      {status === "completed" && (
        <p className="text-green-600 font-semibold">Great job! You traced the letter perfectly.</p>
      )}
    </div>
  )
}
