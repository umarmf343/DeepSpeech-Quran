"use client"

import { cn } from "@/lib/utils"
import { type PointerEvent as ReactPointerEvent, type ReactNode, useCallback, useEffect, useRef } from "react"

interface TraceSelectionAreaProps {
  children: ReactNode
  className?: string
  disabled?: boolean
  onSelectOption: (optionKey: string | null) => void
}

export function TraceSelectionArea({
  children,
  className,
  disabled = false,
  onSelectOption,
}: TraceSelectionAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const hasPointerCaptureRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const getContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext("2d")
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const context = getContext()
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    lastPointRef.current = null
  }, [getContext])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const width = Math.max(1, Math.floor(rect.width))
    const height = Math.max(1, Math.floor(rect.height))

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const context = getContext()
    if (!context) return
    context.lineWidth = 3
    context.lineCap = "round"
    context.lineJoin = "round"
    context.strokeStyle = "rgba(0,0,0,0.85)"
  }, [getContext])

  useEffect(() => {
    if (disabled) {
      clearCanvas()
      return
    }

    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    const container = containerRef.current
    if (container) {
      observer.observe(container)
    }

    return () => {
      observer.disconnect()
    }
  }, [clearCanvas, disabled, resizeCanvas])

  const drawPoint = useCallback((clientX: number, clientY: number, isInitial = false) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = getContext()
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    if (isInitial || !lastPointRef.current) {
      context.beginPath()
      context.moveTo(x, y)
    }

    context.lineTo(x, y)
    context.stroke()
    lastPointRef.current = { x, y }
  }, [getContext])

  const finishDrawing = useCallback(
    (event: PointerEvent | ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false

      const canvas = canvasRef.current
      if (!canvas) return

      const pointerId =
        event instanceof PointerEvent ? event.pointerId : (event as ReactPointerEvent<HTMLCanvasElement>).pointerId
      if (hasPointerCaptureRef.current && typeof pointerId === "number") {
        try {
          canvas.releasePointerCapture(pointerId)
        } catch {
          // Ignore capture release errors
        }
        hasPointerCaptureRef.current = false
      }

      canvas.style.pointerEvents = "none"
      const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
      canvas.style.pointerEvents = disabled ? "none" : "auto"

      const optionElement = target?.closest<HTMLElement>("[data-option-key]")
      const optionKey = optionElement?.dataset.optionKey ?? null

      window.setTimeout(() => {
        clearCanvas()
      }, 200)

      lastPointRef.current = null
      onSelectOption(optionKey)
    },
    [clearCanvas, disabled, onSelectOption],
  )

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled) return
    event.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.setPointerCapture(event.pointerId)
      hasPointerCaptureRef.current = true
    } catch {
      hasPointerCaptureRef.current = false
    }

    clearCanvas()
    drawPoint(event.clientX, event.clientY, true)
    isDrawingRef.current = true
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled || !isDrawingRef.current) return
    event.preventDefault()
    drawPoint(event.clientX, event.clientY)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled) return
    event.preventDefault()
    finishDrawing(event)
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled) return
    finishDrawing(event)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {children}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 z-20 h-full w-full touch-none",
          disabled ? "pointer-events-none" : "pointer-events-auto",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />
    </div>
  )
}

export default TraceSelectionArea
