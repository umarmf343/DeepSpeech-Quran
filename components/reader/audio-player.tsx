"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

export interface AudioPlayerProps {
  source?: string
  isPlaying: boolean
  onTogglePlay: () => void
  onNext?: () => void
  onPrevious?: () => void
  playbackSpeed: number
  onPlaybackSpeedChange: (speed: number) => void
  volume: number
  onVolumeChange: (volume: number) => void
  disabled?: boolean
  className?: string
  onEnded?: () => void
}

export function AudioPlayer({
  source,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  volume,
  disabled,
  className,
  onEnded,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const element = audioRef.current
    if (!element) return
    element.volume = volume
  }, [volume])

  useEffect(() => {
    const element = audioRef.current
    if (!element) return
    element.playbackRate = playbackSpeed
  }, [playbackSpeed])

  useEffect(() => {
    const element = audioRef.current
    if (!element) return
    if (source) {
      if (element.src !== source) {
        element.src = source
      }
      if (isPlaying) {
        void element.play().catch(() => {
          onTogglePlay()
        })
      } else {
        element.pause()
      }
    } else {
      element.pause()
    }
  }, [isPlaying, onTogglePlay, source])

  return (
    <div
      className={cn("rounded-xl border border-blue-200 bg-blue-50/80 p-4", className)}
      aria-disabled={disabled ?? false}
      data-disabled={disabled ? "true" : "false"}
    >
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => {
          if (onEnded) {
            onEnded()
          }
        }}
      />
    </div>
  )
}

