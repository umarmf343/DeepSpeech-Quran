"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
const FONT_SCALE = 560 / CANVAS_SIZE
const BRUSH_SIZE = 18.7
const MAX_MISTAKES = 3
export const COMPLETION_THRESHOLD = 0.72
const TARGET_LETTER_COVERAGE = 0.78
const MAX_SCALE_STEP_UP = 1.12
const MIN_SCALE_STEP_DOWN = 0.88

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
  const [letterFontSize, setLetterFontSize] = useState(() => CANVAS_SIZE * 0.8)
  const [letterPreview, setLetterPreview] = useState<string | null>(null)

  const updateLetterPreview = useCallback((width: number, height: number, data: Uint8ClampedArray) => {
    if (typeof window === "undefined") {
      return
    }

    const previewCanvas = document.createElement("canvas")
    previewCanvas.width = width
    previewCanvas.height = height
    const previewCtx = previewCanvas.getContext("2d")
    if (!previewCtx) {
      setLetterPreview(null)
      return
    }

    const previewData = previewCtx.createImageData(width, height)
    const { data: previewPixels } = previewData
    const PREVIEW_ALPHA_SCALE = 0.18
    let hasAlpha = false

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]
      if (alpha > 0) {
        hasAlpha = true
        previewPixels[i] = 0
        previewPixels[i + 1] = 0
        previewPixels[i + 2] = 0
        previewPixels[i + 3] = Math.min(255, Math.round(alpha * PREVIEW_ALPHA_SCALE))
      } else {
        previewPixels[i] = 0
        previewPixels[i + 1] = 0
        previewPixels[i + 2] = 0
        previewPixels[i + 3] = 0
      }
    }

    if (!hasAlpha) {
      setLetterPreview(null)
      return
    }

    previewCtx.putImageData(previewData, 0, 0)
    setLetterPreview(previewCanvas.toDataURL("image/png"))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    setReady(false)
    setLetterPreview(null)

    const initializeCanvas = () => {
      const ratio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
      const parent = canvas.parentElement
      const rect = parent?.getBoundingClientRect()
      const size = rect ? Math.min(rect.width, rect.height || rect.width) : CANVAS_SIZE
      const nextDisplaySize = Math.max(size, 1)
      const pixelSize = nextDisplaySize * ratio

      canvas.width = pixelSize
      canvas.height = pixelSize
      canvas.style.width = `${nextDisplaySize}px`
      canvas.style.height = `${nextDisplaySize}px`

      maskCanvas.width = pixelSize
      maskCanvas.height = pixelSize
      maskCanvas.style.width = `${nextDisplaySize}px`
      maskCanvas.style.height = `${nextDisplaySize}px`

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

      const edgeBuffer = Math.max(2, Math.round(ratio * 4))
      const desiredPadding = Math.max(edgeBuffer * 2, maskCanvas.width * ((1 - TARGET_LETTER_COVERAGE) / 2))
      const maxFontAdjustments = 10
      let fontSize = nextDisplaySize * FONT_SCALE * ratio
      let finalMaskData: ImageData | null = null
      let finalTotalPixels = 1

      for (let attempt = 0; attempt < maxFontAdjustments; attempt++) {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
        maskCtx.font = `900 ${fontSize}px 'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', serif`
        maskCtx.fillText(letter, maskCanvas.width / 2, maskCanvas.height / 2)

        const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
        const data = maskData.data

        let total = 0
        let minX = maskCanvas.width
        let maxX = 0
        let minY = maskCanvas.height
        let maxY = 0

        for (let y = 0; y < maskCanvas.height; y++) {
          for (let x = 0; x < maskCanvas.width; x++) {
            const alphaIndex = (y * maskCanvas.width + x) * 4 + 3
            if (data[alphaIndex] > 0) {
              total += 1
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
            }
          }
        }

        if (total === 0) {
          finalMaskData = maskData
          finalTotalPixels = 1
          break
        }

        const touchesEdge =
          minX <= edgeBuffer ||
          minY <= edgeBuffer ||
          maxX >= maskCanvas.width - 1 - edgeBuffer ||
          maxY >= maskCanvas.height - 1 - edgeBuffer

        const letterWidth = maxX - minX + 1
        const letterHeight = maxY - minY + 1
        const maxLetterWidth = Math.max(1, maskCanvas.width - desiredPadding * 2)
        const maxLetterHeight = Math.max(1, maskCanvas.height - desiredPadding * 2)
        const widthScale = maxLetterWidth / Math.max(letterWidth, 1)
        const heightScale = maxLetterHeight / Math.max(letterHeight, 1)
        const proposedScale = Math.min(widthScale, heightScale)
        const clampedScale = touchesEdge
          ? Math.min(proposedScale, 0.97)
          : Math.min(Math.max(proposedScale, MIN_SCALE_STEP_DOWN), MAX_SCALE_STEP_UP)

        if (!touchesEdge && Math.abs(proposedScale - 1) < 0.02) {
          finalMaskData = maskData
          finalTotalPixels = Math.max(total, 1)
          break
        }

        const nextFontSize = fontSize * clampedScale
        if (attempt === maxFontAdjustments - 1) {
          finalMaskData = maskData
          finalTotalPixels = Math.max(total, 1)
          break
        }

        fontSize = Math.max(1, nextFontSize)
      }

      if (finalMaskData) {
        maskDataRef.current = finalMaskData.data
        updateLetterPreview(maskCanvas.width, maskCanvas.height, finalMaskData.data)
      } else {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
        maskCtx.font = `900 ${fontSize}px 'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', serif`
        maskCtx.fillText(letter, maskCanvas.width / 2, maskCanvas.height / 2)
        const fallbackData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
        maskDataRef.current = fallbackData.data
        let fallbackTotal = 0
        for (let i = 3; i < fallbackData.data.length; i += 4) {
          if (fallbackData.data[i] > 0) {
            fallbackTotal += 1
          }
        }
        finalTotalPixels = Math.max(fallbackTotal, 1)
        updateLetterPreview(maskCanvas.width, maskCanvas.height, fallbackData.data)
      }

      totalLetterPixelsRef.current = finalTotalPixels
      setLetterFontSize(Math.max(fontSize / ratio, 1))

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
    }

    initializeCanvas()

    if (typeof window === "undefined") return

    const handleResize = () => {
      initializeCanvas()
    }

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && canvas.parentElement
        ? new ResizeObserver(handleResize)
        : null
    if (resizeObserver && canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener("resize", handleResize)
    }
  }, [letter, onProgress, onMistake, resetSignal, updateLetterPreview])

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

    const radius = Math.max(1, Math.ceil((BRUSH_SIZE / 2) * ratio))
    const radiusSq = radius * radius
    const minX = Math.max(0, Math.floor(x - radius))
    const maxX = Math.min(canvasWidth - 1, Math.ceil(x + radius))
    const minY = Math.max(0, Math.floor(y - radius))
    const maxY = Math.min(canvasHeight - 1, Math.ceil(y + radius))

    const width = maxX - minX + 1
    const height = maxY - minY + 1

    if (width <= 0 || height <= 0) {
      return
    }

    const imageData = ctx.getImageData(minX, minY, width, height)
    const pixelData = imageData.data
    let insidePixelCount = 0
    let paintedPixelCount = 0

    for (let yy = minY; yy <= maxY; yy++) {
      const offsetY = yy - minY
      for (let xx = minX; xx <= maxX; xx++) {
        const dx = xx - x
        const dy = yy - y
        if (dx * dx + dy * dy > radiusSq) continue

        paintedPixelCount += 1
        const pixelIndex = yy * canvasWidth + xx
        const alphaIndex = pixelIndex * 4 + 3
        const dataIndex = (offsetY * width + (xx - minX)) * 4

        if (maskData[alphaIndex] > 0) {
          insidePixelCount += 1
          pixelData[dataIndex] = 0
          pixelData[dataIndex + 1] = 0
          pixelData[dataIndex + 2] = 0
          pixelData[dataIndex + 3] = 255

          if (coverageMap[pixelIndex] === 0) {
            coverageMap[pixelIndex] = 1
            coveredPixelsRef.current += 1
          }
        } else {
          pixelData[dataIndex] = 220
          pixelData[dataIndex + 1] = 38
          pixelData[dataIndex + 2] = 38
          pixelData[dataIndex + 3] = 255
        }
      }
    }

    ctx.putImageData(imageData, minX, minY)

    const hasInside = insidePixelCount > 0
    const hasOutside = paintedPixelCount > insidePixelCount

    if (hasInside) {
      const completionRatio = coveredPixelsRef.current / totalLetterPixelsRef.current
      onProgress?.(Math.min(1, completionRatio))
      if (completionRatio >= COMPLETION_THRESHOLD && !completedRef.current) {
        completedRef.current = true
        lockedRef.current = true
        onSuccess()
      }
    }

    if (hasOutside && !hasInside && !strokeMistakeRef.current) {
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
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div className="pointer-events-none absolute inset-0 select-none rounded-[36px] border-4 border-dashed border-black/10 bg-white/70 backdrop-blur-sm"></div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-[36px]">
        {letterPreview ? (
          <div
            aria-hidden="true"
            className="h-full w-full select-none"
            style={{
              backgroundImage: `url(${letterPreview})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
              imageRendering: "high-quality",
            }}
          />
        ) : (
          <span
            aria-hidden="true"
            className="block select-none font-black leading-none text-black/15"
            style={{ fontSize: `${letterFontSize}px` }}
          >
            {letter}
          </span>
        )}
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
