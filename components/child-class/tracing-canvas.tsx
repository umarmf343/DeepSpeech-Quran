"use client"

import { useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

interface TracingCanvasProps {
  letter: string
  onProgress?: (progress: number) => void
  onSuccess: () => void
  onFail: () => void
  onMistake?: (mistakes: number) => void
  resetSignal?: number
}

const CANVAS_SIZE = 420
const BRUSH_SIZE = 17
const MAX_MISTAKES = 3
export const COMPLETION_THRESHOLD = 0.72

export function TracingCanvas({
  letter,
  onProgress,
  onSuccess,
  onFail,
  onMistake,
  resetSignal = 0,
}: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const maskDataRef = useRef<Uint8ClampedArray | null>(null)
  const coverageMapRef = useRef<Uint8Array | null>(null)
  const coveredPixelsRef = useRef(0)
  const totalLetterPixelsRef = useRef(1)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const strokeMistakeRef = useRef(false)
  const lockedRef = useRef(false)
  const mistakesRef = useRef(0)
  const completedRef = useRef(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ratio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

    canvas.width = CANVAS_SIZE * ratio
    canvas.height = CANVAS_SIZE * ratio
    canvas.style.width = "100%"
    canvas.style.height = "100%"

    maskCanvas.width = CANVAS_SIZE * ratio
    maskCanvas.height = CANVAS_SIZE * ratio

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true })
    if (!ctx || !maskCtx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "transparent"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
    maskCtx.fillStyle = "#000"
    maskCtx.textAlign = "center"
    maskCtx.textBaseline = "middle"
    const fontSize = 560 * ratio
    maskCtx.font = `${fontSize}px 'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', serif`
    maskCtx.fillText(letter, maskCanvas.width / 2, maskCanvas.height / 2)

    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
    maskDataRef.current = maskData.data

    let total = 0
    for (let i = 3; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > 0) {
        total += 1
      }
    }
    totalLetterPixelsRef.current = Math.max(total, 1)

    coverageMapRef.current = new Uint8Array(maskCanvas.width * maskCanvas.height)
    coveredPixelsRef.current = 0
    isDrawingRef.current = false
    lastPointRef.current = null
    strokeMistakeRef.current = false
    lockedRef.current = false
    mistakesRef.current = 0
    completedRef.current = false

    onProgress?.(0)
    onMistake?.(0)
    setReady(true)
  }, [letter, onProgress, onMistake, resetSignal])

  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [ready])

  const drawPoint = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    const maskData = maskDataRef.current
    const coverageMap = coverageMapRef.current
    if (!ctx || !maskData || !coverageMap) return

    const ratio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    const ix = Math.round(x)
    const iy = Math.round(y)
    const inside = (() => {
      if (ix < 0 || iy < 0 || ix >= canvasWidth || iy >= canvasHeight) return false
      const index = (iy * canvasWidth + ix) * 4 + 3
      return maskData[index] > 0
    })()

    ctx.fillStyle = inside ? "#000" : "rgba(220,38,38,0.85)"
    ctx.beginPath()
    ctx.arc(x, y, (BRUSH_SIZE / 2) * ratio, 0, Math.PI * 2)
    ctx.fill()

    if (inside) {
      const radius = Math.ceil((BRUSH_SIZE / 2) * ratio)
      const minX = Math.max(0, ix - radius)
      const maxX = Math.min(canvasWidth - 1, ix + radius)
      const minY = Math.max(0, iy - radius)
      const maxY = Math.min(canvasHeight - 1, iy + radius)

      for (let yy = minY; yy <= maxY; yy++) {
        for (let xx = minX; xx <= maxX; xx++) {
          const dx = xx - x
          const dy = yy - y
          if (dx * dx + dy * dy > radius * radius) continue
          const pixelIndex = yy * canvasWidth + xx
          const alphaIndex = pixelIndex * 4 + 3
          if (maskData[alphaIndex] === 0) continue
          if (coverageMap[pixelIndex] === 0) {
            coverageMap[pixelIndex] = 1
            coveredPixelsRef.current += 1
          }
        }
      }

      const completionRatio = coveredPixelsRef.current / totalLetterPixelsRef.current
      onProgress?.(Math.min(1, completionRatio))
      if (completionRatio >= COMPLETION_THRESHOLD && !completedRef.current) {
        completedRef.current = true
        lockedRef.current = true
        onSuccess()
      }
    } else if (!strokeMistakeRef.current) {
      strokeMistakeRef.current = true
      mistakesRef.current += 1
      onMistake?.(mistakesRef.current)
      if (mistakesRef.current >= MAX_MISTAKES) {
        lockedRef.current = true
        onFail()
      }
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (lockedRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(event.pointerId)

    const rect = canvas.getBoundingClientRect()
    const ratio = canvas.width / rect.width
    const x = (event.clientX - rect.left) * ratio
    const y = (event.clientY - rect.top) * ratio

    isDrawingRef.current = true
    strokeMistakeRef.current = false
    lastPointRef.current = { x, y }
    drawPoint(x, y)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || lockedRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ratio = canvas.width / rect.width
    const x = (event.clientX - rect.left) * ratio
    const y = (event.clientY - rect.top) * ratio
    const last = lastPointRef.current
    if (!last) {
      lastPointRef.current = { x, y }
      drawPoint(x, y)
      return
    }

    const dx = x - last.x
    const dy = y - last.y
    const steps = Math.max(Math.abs(dx), Math.abs(dy))

    for (let i = 1; i <= steps; i++) {
      const sx = last.x + (dx * i) / steps
      const sy = last.y + (dy * i) / steps
      drawPoint(sx, sy)
    }

    lastPointRef.current = { x, y }
  }

  const stopDrawing = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    lastPointRef.current = null
    strokeMistakeRef.current = false
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    stopDrawing()
    const canvas = canvasRef.current
    if (canvas && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[420px]">
      <div className="pointer-events-none absolute inset-0 select-none rounded-[36px] border-4 border-dashed border-black/10 bg-white/70 backdrop-blur-sm"></div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[28rem] font-black text-black/15">
        {letter}
      </div>
      <canvas
        ref={canvasRef}
        className="relative z-10 h-full w-full rounded-[36px] touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <canvas ref={maskCanvasRef} className="hidden" />
    </div>
  )
}

export default TracingCanvas
