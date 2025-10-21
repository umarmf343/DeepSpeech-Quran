"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from "react"
import Link from "next/link"
import { ExternalLink, Loader2, Music4, Pause, Play, Volume2 } from "lucide-react"

import { quranAPI, type Surah } from "@/lib/quran-api"

interface GwaniSurah {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  audioUrl: string
}

const ARCHIVE_ID = "MoshafGwaniDahir"
const ARCHIVE_METADATA_URL = `https://archive.org/metadata/${ARCHIVE_ID}`
const ARCHIVE_AUDIO_BASE_URL = `https://archive.org/download/${ARCHIVE_ID}/`

export function GwaniDahiruPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [surahOptions, setSurahOptions] = useState<GwaniSurah[]>([])
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [status, setStatus] = useState("Select a surah to hear the Gwani Dahiru recitation.")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [surahs, archiveResponse] = await Promise.all([
          quranAPI.getSurahs(),
          fetch(ARCHIVE_METADATA_URL).then((response) => {
            if (!response.ok) {
              throw new Error("Unable to load Gwani Dahiru archive metadata")
            }
            return response.json() as Promise<{ files?: Array<{ name?: string }> }>
          }),
        ])

        if (!isMounted) return

        const audioFiles = (archiveResponse.files || []).filter((file) =>
          typeof file.name === "string" && /\d+\.mp3$/.test(file.name),
        )

        const archiveSurahs = audioFiles
          .map((file) => {
            const match = file.name?.match(/(\d+)\.mp3$/)
            if (!match) return null
            const number = Number.parseInt(match[1], 10)
            if (Number.isNaN(number) || number < 1 || number > 114) return null
            const surahMeta = surahs.find((surah: Surah) => surah.number === number)
            if (!surahMeta) return null
            const paddedNumber = match[1].padStart(3, "0")

            return {
              number,
              name: surahMeta.name,
              englishName: surahMeta.englishName,
              englishNameTranslation: surahMeta.englishNameTranslation,
              audioUrl: `${ARCHIVE_AUDIO_BASE_URL}${paddedNumber}.mp3`,
            }
          })
          .filter((value): value is GwaniSurah => Boolean(value))
          .sort((a, b) => a.number - b.number)

        setSurahOptions(archiveSurahs)
        if (archiveSurahs.length > 0) {
          setSelectedSurahNumber(archiveSurahs[0].number)
          setStatus(`Ready to play Surah ${archiveSurahs[0].englishName}`)
        }
      } catch (err) {
        console.error(err)
        if (!isMounted) return
        setError("We couldn't load the Gwani Dahiru archive right now. Please try again later.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedSurah = useMemo(
    () => surahOptions.find((surah) => surah.number === selectedSurahNumber) ?? null,
    [surahOptions, selectedSurahNumber],
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (!audio.duration) return
      setCurrentTime(audio.currentTime)
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setStatus("Playback completed. Select another surah to continue listening.")
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  useEffect(() => {
    if (!selectedSurah || !audioRef.current) return

    const audio = audioRef.current
    audio.pause()
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    audio.src = selectedSurah.audioUrl
    void audio.load()
    setStatus(`Ready to play Surah ${selectedSurah.englishName}`)
  }, [selectedSurah])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (selectedSurah) {
      setStatus((prev) => {
        if (isPlaying) {
          return `Playing Surah ${selectedSurah.englishName}`
        }
        if (prev.includes("completed")) {
          return prev
        }
        return `Ready to play Surah ${selectedSurah.englishName}`
      })
    }
  }, [isPlaying, selectedSurah])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!selectedSurah && surahOptions.length > 0) {
      setSelectedSurahNumber(surahOptions[0].number)
      return
    }

    try {
      if (audio.paused) {
        await audio.play()
        setIsPlaying(true)
        if (selectedSurah) {
          setStatus(`Playing Surah ${selectedSurah.englishName}`)
        }
      } else {
        audio.pause()
        setIsPlaying(false)
        if (selectedSurah) {
          setStatus(`Paused Surah ${selectedSurah.englishName}`)
        }
      }
    } catch (err) {
      console.error("Audio playback failed", err)
      setError("We couldn't start playback. Please check your connection and try again.")
    }
  }

  const handleProgressClick = (event: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return

    const rect = event.currentTarget.getBoundingClientRect()
    const clickPosition = event.clientX - rect.left
    const percentage = Math.min(Math.max(clickPosition / rect.width, 0), 1)
    audio.currentTime = audio.duration * percentage
  }

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(event.target.value)
    if (Number.isNaN(value)) return
    setVolume(value)
  }

  const formatTime = (timeInSeconds: number) => {
    if (!Number.isFinite(timeInSeconds)) return "--:--"
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-blue-600 to-indigo-600 p-6 shadow-2xl transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(31,41,55,0.45)]">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-6">
        <header className="space-y-2 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium tracking-wide backdrop-blur transition-transform duration-500 hover:scale-[1.02]">
            <Music4 className="h-4 w-4 animate-pulse" />
            Gwani Dahiru Recitations
          </div>
          <h3 className="text-3xl font-semibold drop-shadow-sm sm:text-4xl">Gwani Dahiru Surah Player</h3>
          <p className="max-w-2xl text-base text-white/90 sm:text-lg">
            Immerse yourself in the vibrant recitations of Sheikh Gwani Dahiru without leaving the reader. Choose a surah,
            press play, and enjoy a seamless listening experience.
          </p>
          <p className="text-sm text-white/80">
            Audio sourced from the Moshaf Gwani Dahiru collection on the Internet Archive.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-4">
            <label className="flex flex-col text-sm font-medium text-white/90">
              Select Surah
              <select
                value={selectedSurahNumber ?? ""}
                onChange={(event) => {
                  const { value } = event.target
                  if (value === "") {
                    setSelectedSurahNumber(null)
                    return
                  }
                  setSelectedSurahNumber(Number.parseInt(value, 10))
                }}
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/20 px-4 py-3 text-base font-semibold text-white shadow-inner backdrop-blur transition-all duration-300 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                {isLoading && <option value="">Loading surahs…</option>}
                {!isLoading && surahOptions.length === 0 && <option value="">No surahs available</option>}
                {!isLoading &&
                  surahOptions.map((surah) => (
                    <option key={surah.number} value={surah.number} className="text-gray-900">
                      {surah.number.toString().padStart(3, "0")} — {surah.englishName} ({surah.englishNameTranslation})
                    </option>
                  ))}
              </select>
            </label>

            <div className="rounded-2xl bg-black/20 p-4 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={togglePlayback}
                  className="flex items-center justify-center gap-2 rounded-full bg-white/90 px-6 py-3 text-base font-semibold text-indigo-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {isPlaying ? "Pause" : "Play"}
                </button>

                <div className="flex items-center gap-3 text-white/90">
                  <Volume2 className="h-5 w-5" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-white/40 accent-white"
                    aria-label="Volume"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div
                  className="h-3 w-full cursor-pointer overflow-hidden rounded-full bg-white/20"
                  onClick={handleProgressClick}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Playback progress"
                >
                  <div
                    className="h-full w-full origin-left transform bg-gradient-to-r from-amber-300 via-lime-300 to-emerald-400 transition-transform duration-300 ease-out"
                    style={{
                      transform: `scaleX(${progress / 100})`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/70">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-white/15 p-5 text-white backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Now Highlighting</p>
            <p className="text-2xl font-bold drop-shadow-sm">
              {selectedSurah ? `${selectedSurah.englishName} — ${selectedSurah.name}` : "Awaiting selection"}
            </p>
            <p className="text-sm text-white/80">
              {selectedSurah
                ? selectedSurah.englishNameTranslation
                : "Choose a surah from the dropdown to load the corresponding Gwani Dahiru recitation."}
            </p>
            <p className="flex items-center gap-2 text-sm text-amber-100">
              <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-amber-300" aria-hidden="true" />
              {status}
            </p>
            <Link
              href="https://archive.org/details/MoshafGwaniDahir"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 transition-transform duration-300 hover:translate-x-1 hover:text-white"
            >
              Access the full Gwani Dahiru archive
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200/40 bg-red-50/40 px-4 py-3 text-sm font-medium text-white">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/90">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Gwani Dahiru surahs…
          </div>
        )}
      </div>

      <audio ref={audioRef} preload="none" className="hidden" />
    </section>
  )
}
