"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Loader2, Volume2 } from "lucide-react"

interface AudioPlayButtonProps {
  audioSrc?: string
  fallbackText?: string
  label: string
  className?: string
  children?: ReactNode
  variant?: "icon" | "primary"
  onPlay?: () => void
}

const normalizeText = (text?: string) => text?.normalize("NFC").trim() ?? ""

export function AudioPlayButton({
  audioSrc,
  fallbackText,
  label,
  className,
  children,
  variant = "icon",
  onPlay,
}: AudioPlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const normalizedFallback = useMemo(() => normalizeText(fallbackText), [fallbackText])

  useEffect(() => {
    setIsPlaying(false)
    setHasError(false)

    if (!audioSrc) {
      audioRef.current = null
      setIsLoading(false)
      return
    }

    const audio = new Audio(audioSrc)
    audio.preload = "auto"

    const handlePlay = () => {
      setIsPlaying(true)
      setHasError(false)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleError = () => {
      setHasError(true)
      setIsPlaying(false)
      setIsLoading(false)
    }

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("canplaythrough", handleCanPlay)
    audio.addEventListener("error", handleError)

    audioRef.current = audio
    setIsLoading(true)
    audio.load()

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("canplaythrough", handleCanPlay)
      audio.removeEventListener("error", handleError)
      audioRef.current = null
    }
  }, [audioSrc])

  const handleFallbackSpeech = () => {
    if (typeof window === "undefined") return
    if (!normalizedFallback) return
    if (!window.speechSynthesis) return

    const utterance = new SpeechSynthesisUtterance(normalizedFallback)
    utterance.lang = "ar-SA"
    utterance.rate = 0.8
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    onPlay?.()
  }

  const handlePlayClick = async () => {
    if (audioRef.current && !hasError) {
      try {
        audioRef.current.currentTime = 0
        const playPromise = audioRef.current.play()
        if (playPromise) {
          await playPromise
        }
        onPlay?.()
        return
      } catch (error) {
        console.error("Failed to play audio", error)
        setHasError(true)
      }
    }

    handleFallbackSpeech()
  }

  const baseClasses =
    variant === "primary"
      ? "kid-button kid-button-sunset inline-flex items-center gap-3 px-10 py-6 text-2xl font-extrabold"
      : "inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/90 text-maroon shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-maroon/40"

  const content = children ? (
    <span className="flex items-center gap-3">
      {!isLoading && <span aria-hidden="true">🔊</span>}
      {children}
    </span>
  ) : isLoading ? (
    <Loader2 className="h-5 w-5 animate-spin" />
  ) : (
    <Volume2 className={`h-5 w-5 ${isPlaying ? "animate-pulse" : ""}`} />
  )

  return (
    <button
      type="button"
      onClick={handlePlayClick}
      className={`${baseClasses} ${className ?? ""}`.trim()}
      aria-label={label}
      title={label}
    >
      {content}
    </button>
  )
}
