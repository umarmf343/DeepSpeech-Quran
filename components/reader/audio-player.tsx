"use client"

import { useEffect, useMemo, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react"

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2]

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
  onNext,
  onPrevious,
  playbackSpeed,
  onPlaybackSpeedChange,
  volume,
  onVolumeChange,
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

  const speedValue = useMemo(() => {
    const normalized = Number.parseFloat(playbackSpeed.toFixed(2))
    if (PLAYBACK_SPEEDS.includes(normalized)) {
      return normalized
    }
    return 1
  }, [playbackSpeed])

  return (
    <div className={cn("rounded-xl border border-blue-200 bg-blue-50/80 p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button onClick={onPrevious} variant="outline" size="sm" disabled={disabled || !onPrevious}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            onClick={onTogglePlay}
            className={cn(
              "group relative overflow-hidden rounded-md px-5 text-white shadow-lg shadow-emerald-500/30",
              "bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 transition-all duration-300",
              "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/60"
            )}
            size="sm"
            disabled={disabled || !source}
          >
            <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {isPlaying ? (
              <Pause className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <Play className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            )}
            <span className="relative z-10 ml-2 font-semibold tracking-wide transition-all duration-300 group-hover:tracking-widest">
              {isPlaying ? "Pause" : "Play"}
            </span>
          </Button>
          <Button onClick={onNext} variant="outline" size="sm" disabled={disabled || !onNext}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={[volume]}
              onValueChange={(value) => onVolumeChange(value[0] ?? volume)}
              max={1}
              min={0}
              step={0.05}
              className="w-32"
              disabled={disabled}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium text-blue-800">Speed</Label>
            <Select
              value={speedValue.toString()}
              onValueChange={(value) => onPlaybackSpeedChange(Number.parseFloat(value))}
              disabled={disabled}
            >
              <SelectTrigger className="w-24 bg-white/90">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAYBACK_SPEEDS.map((speed) => (
                  <SelectItem key={speed} value={speed.toString()}>
                    {speed}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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

