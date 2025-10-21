"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { MouseEvent } from "react"

import Link from "next/link"

import { Slider } from "@/components/ui/slider"
import { type Surah } from "@/lib/quran-api"
import { cn } from "@/lib/utils"

import { ExternalLink, Loader2, Pause, Play, Volume2 } from "lucide-react"

const ARCHIVE_BASE_URL = "https://archive.org/download/MoshafGwaniDahir"

interface GwaniSurahPlayerProps {
  surahs: Surah[]
  nightMode?: boolean
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00"
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function GwaniSurahPlayer({ surahs, nightMode }: GwaniSurahPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (surahs.length === 0) return
    setSelectedSurahNumber((prev) => prev ?? surahs[0]?.number ?? null)
  }, [surahs])

  const selectedSurah = useMemo(() => {
    if (!selectedSurahNumber) return undefined
    return surahs.find((surah) => surah.number === selectedSurahNumber)
  }, [selectedSurahNumber, surahs])

  const audioSource = useMemo(() => {
    if (!selectedSurahNumber) return ""
    return `${ARCHIVE_BASE_URL}/${selectedSurahNumber.toString().padStart(3, "0")}.mp3`
  }, [selectedSurahNumber])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setIsLoadingAudio(false)
      setError(null)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    const handleError = () => {
      setIsPlaying(false)
      setIsLoadingAudio(false)
      setError("Unable to load this surah audio. Try another selection.")
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!audioSource) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    if (audio.src !== audioSource) {
      setIsLoadingAudio(true)
      setProgress(0)
      setCurrentTime(0)
      audio.src = audioSource
      audio.load()
    }
  }, [audioSource])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      void audio.play().catch(() => {
        setIsPlaying(false)
        setError("Playback failed. Please try again.")
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  const handleProgressSeek = (event: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return

    const rect = event.currentTarget.getBoundingClientRect()
    const clickPosition = event.clientX - rect.left
    const newProgress = Math.min(Math.max(clickPosition / rect.width, 0), 1)
    audio.currentTime = newProgress * audio.duration
    setProgress(newProgress * 100)
  }

  const containerClassName = cn(
    "group relative overflow-hidden rounded-3xl border border-white/30 p-8 shadow-2xl transition-transform duration-500 ease-out lg:-translate-y-6",
    nightMode
      ? "bg-gradient-to-br from-slate-900 via-emerald-900/80 to-slate-950 text-emerald-50"
      : "bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-500 text-white",
  )

  const cardOverlayClassName = cn(
    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
    nightMode
      ? "bg-gradient-to-r from-emerald-500/10 via-teal-400/10 to-sky-500/10"
      : "bg-gradient-to-r from-white/10 via-amber-300/10 to-white/20",
  )

  return (
    <section
      aria-labelledby="gwani-player-heading"
      className="mx-auto mt-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8"
    >
      <div className={containerClassName}>
        <div className={cardOverlayClassName} />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <span className="h-2 w-2 animate-ping rounded-full bg-yellow-300" />
              Featured Collection
            </p>
            <h2
              id="gwani-player-heading"
              className="text-3xl font-semibold drop-shadow-md md:text-4xl"
            >
              Gwani Dahiru Surah Player
            </h2>
            <p className="max-w-2xl text-base md:text-lg">
              Stream the soulful recitations of Shaykh Gwani Dahiru while you continue reading. Select any surah to hear the full rendition without leaving your current page.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <label htmlFor="gwani-surah-select" className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Select Surah
              </label>
              <select
                id="gwani-surah-select"
                className="w-full rounded-2xl border border-white/40 bg-white/90 px-4 py-3 text-base font-medium text-slate-800 shadow-xl transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-300/40"
                value={selectedSurahNumber?.toString() ?? ""}
                onChange={(event) => {
                  const nextNumber = Number.parseInt(event.target.value, 10)
                  if (Number.isNaN(nextNumber)) {
                    setSelectedSurahNumber(null)
                    return
                  }
                  setSelectedSurahNumber(nextNumber)
                  setIsPlaying(false)
                }}
                disabled={surahs.length === 0}
              >
                {surahs.length === 0 ? (
                  <option value="">Loading surahs…</option>
                ) : (
                  surahs.map((surah) => (
                    <option key={surah.number} value={surah.number}>
                      {surah.number}. {surah.englishName}
                    </option>
                  ))
                )}
              </select>

              {selectedSurah && (
                <p className="text-sm text-white/90">
                  {selectedSurah.englishNameTranslation || selectedSurah.englishName} • {selectedSurah.numberOfAyahs} ayahs
                </p>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedSurahNumber) return
                    setIsPlaying((prev) => !prev)
                  }}
                  className="group/button inline-flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 text-lg font-semibold text-emerald-700 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white"
                  disabled={!selectedSurahNumber || isLoadingAudio}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-inner transition-transform duration-300 group-hover/button:scale-110">
                    {isLoadingAudio ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="ml-1 h-5 w-5" />
                    )}
                  </span>
                  <span>{isPlaying ? "Pause Surah" : "Play Full Surah"}</span>
                </button>

                <div className="flex items-center gap-3 rounded-full bg-white/20 px-4 py-2 text-sm text-white/90">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <Slider
                    value={[volume]}
                    max={1}
                    min={0}
                    step={0.05}
                    onValueChange={(value) => setVolume(value[0] ?? volume)}
                    className="w-32"
                  />
                </div>
              </div>

              <div>
                <div
                  className="relative h-3 w-full cursor-pointer overflow-hidden rounded-full bg-white/30"
                  onClick={handleProgressSeek}
                  aria-label="Audio progress"
                  role="presentation"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-300 via-lime-200 to-white transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-medium text-white/80">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration ? formatTime(duration) : "--:--"}</span>
                </div>
                {error ? (
                  <p className="mt-2 text-sm text-amber-200">{error}</p>
                ) : (
                  <p className="mt-2 text-sm text-white/90">
                    {isLoadingAudio
                      ? "Loading surah audio…"
                      : isPlaying
                        ? "Now playing Gwani Dahiru's recitation."
                        : "Select a surah to begin listening."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/10 px-5 py-4 text-sm backdrop-blur-sm">
            <div>
              <p className="font-semibold text-white">Explore the full archive</p>
              <p className="text-white/80">
                Dive deeper into the complete Moshaf Gwani Dahiru recitation set hosted on the Internet Archive.
              </p>
            </div>
            <Link
              href="https://archive.org/details/MoshafGwaniDahir"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 font-semibold text-emerald-700 shadow-lg transition hover:-translate-y-1 hover:bg-white"
            >
              Access the archive
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <audio ref={audioRef} preload="none" className="hidden" />
      </div>
    </section>
  )
}

