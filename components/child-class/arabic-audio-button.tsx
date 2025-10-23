"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

type ArabicAudioButtonVariant = "icon" | "primary"

type ArabicAudioButtonSize = "sm" | "md" | "lg"

interface ArabicAudioButtonProps {
  text: string
  className?: string
  variant?: ArabicAudioButtonVariant
  size?: ArabicAudioButtonSize
  ariaLabel?: string
  children?: ReactNode
  onPlayStart?: () => void
  onPlayEnd?: () => void
}

const VARIANT_CLASSES: Record<ArabicAudioButtonVariant, string> = {
  icon: "h-8 w-8 rounded-full bg-maroon text-white shadow-lg shadow-maroon/30 hover:bg-maroon/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-maroon",
  primary:
    "kid-button kid-button-sunset inline-flex items-center gap-3 rounded-full px-10 py-5 text-xl font-extrabold",
}

const SIZE_ADJUSTMENTS: Record<ArabicAudioButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
}

const PLAY_ICON = (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M6 4.6v10.8a.6.6 0 0 0 .9.52l8.4-5.4a.6.6 0 0 0 0-1.04L6.9 4.08A.6.6 0 0 0 6 4.6Z" />
  </svg>
)

const PAUSE_ICON = (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M6 4.5a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Zm8 0a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z" />
  </svg>
)

const SPINNER_ICON = (
  <svg
    aria-hidden="true"
    className="h-4 w-4 animate-spin"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 3a9 9 0 0 1 9 9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function ArabicAudioButton({
  text,
  className,
  variant = "icon",
  size = "md",
  ariaLabel,
  children,
  onPlayStart,
  onPlayEnd,
}: ArabicAudioButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const normalizedAriaLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel
    return `Play pronunciation for ${text}`
  }, [ariaLabel, text])

  const cleanupAudio = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.removeAttribute("src")
      audio.load()
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const stopPlayback = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }, [])

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
    onPlayEnd?.()
  }, [onPlayEnd])

  const playWithSpeechSynthesis = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Audio playback is not supported in this browser")
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ar-SA"
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.onstart = () => {
      setIsPlaying(true)
      setError(null)
      onPlayStart?.()
    }
    utterance.onend = () => {
      setIsPlaying(false)
      onPlayEnd?.()
    }
    window.speechSynthesis.speak(utterance)
  }, [onPlayEnd, onPlayStart, text])

  const handlePlay = useCallback(async () => {
    if (isLoading) return

    if (isPlaying) {
      stopPlayback()
      return
    }

    if (audioRef.current) {
      try {
        setError(null)
        await audioRef.current.play()
        setIsPlaying(true)
        onPlayStart?.()
        return
      } catch (playError) {
        console.error("Failed to play cached audio", playError)
        cleanupAudio()
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/kid-class/audio?text=${encodeURIComponent(text)}`)
      if (!response.ok) {
        throw new Error(`Failed to load audio (${response.status})`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      objectUrlRef.current = objectUrl
      const audio = new Audio(objectUrl)
      audioRef.current = audio
      audio.addEventListener("ended", handleAudioEnded)
      audio.addEventListener("pause", () => {
        if (audio.ended || audio.currentTime === 0) {
          setIsPlaying(false)
        }
      })

      await audio.play()
      setIsPlaying(true)
      onPlayStart?.()
    } catch (err) {
      console.error("Falling back to speech synthesis", err)
      cleanupAudio()
      playWithSpeechSynthesis()
    } finally {
      setIsLoading(false)
    }
  }, [
    cleanupAudio,
    handleAudioEnded,
    isLoading,
    isPlaying,
    onPlayStart,
    playWithSpeechSynthesis,
    stopPlayback,
    text,
  ])

  useEffect(() => {
    return () => {
      stopPlayback()
      cleanupAudio()
    }
  }, [cleanupAudio, stopPlayback])

  const variantClasses = VARIANT_CLASSES[variant]
  const sizeClasses = variant === "icon" ? "" : SIZE_ADJUSTMENTS[size]

  const content = () => {
    if (isLoading) return SPINNER_ICON
    if (isPlaying) return PAUSE_ICON
    return PLAY_ICON
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={`${variantClasses} ${sizeClasses ?? ""} ${className ?? ""}`.trim()}
      aria-label={normalizedAriaLabel}
      title={normalizedAriaLabel}
    >
      {content()}
      {variant === "primary" && (
        <span className="font-extrabold">
          {children ?? (isPlaying ? "Pause" : "Listen")}
        </span>
      )}
      {error && (
        <span className="sr-only" role="status">
          {error}
        </span>
      )}
    </button>
  )
}
