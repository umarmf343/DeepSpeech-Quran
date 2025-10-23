import { cache } from "react"

import { DEFAULT_TAJWEED_LEGEND, TAJWEED_RULE_METADATA } from "./tajweed-metadata"

const cacheKey = (surah: number, start: number, end: number) => `${surah}:${start}-${end}`

interface TajweedFragment {
  ayah: number
  html: string
}

export interface TajweedRenderResult {
  success: boolean
  fragments: TajweedFragment[]
  legend?: Record<string, string>
  error?: string
}

const tajweedCache = new Map<string, TajweedRenderResult>()

let warnedMissingModule = false
let notifiedRemoteFallback = false

const DEFAULT_TAJWEED_API_BASE = "https://api.quran.com/api/v4"

const normaliseRange = (range: { start: number; end: number }) => {
  const start = Math.min(range.start, range.end)
  const end = Math.max(range.start, range.end)
  return { start, end }
}

const createFragmentHtml = (html: string) => {
  const transformed = html
    .replace(/<tajweed class=([^>]+)>/g, (_, rule: string) => {
      const metadata = TAJWEED_RULE_METADATA[rule] ?? {
        key: rule,
        label: rule,
        color: "var(--foreground)",
      }
      const color = metadata.color || "var(--foreground)"
      return `<span class="tajweed-fragment" data-tajweed="${metadata.key}" style="--tajweed-color: ${color};">`
    })
    .replace(/<\/tajweed>/g, "</span>")
    .replace(/<span class=end>(.*?)<\/span>/g, '<span class="tajweed-end" aria-hidden="true">$1</span>')

  return `<span class="tajweed-text" dir="rtl" lang="ar">${transformed}</span>`
}

const fetchTajweedFromApi = async (
  surahNumber: number,
  range: { start: number; end: number },
): Promise<TajweedRenderResult> => {
  const { start, end } = normaliseRange(range)
  const base = (process.env.TAJWEED_API_BASE || DEFAULT_TAJWEED_API_BASE).trim().replace(/\/$/, "")
  const url = new URL(`${base}/quran/verses/uthmani_tajweed`)
  url.searchParams.set("chapter_number", String(surahNumber))
  url.searchParams.set("from_verse_key", `${surahNumber}:${start}`)
  url.searchParams.set("to_verse_key", `${surahNumber}:${end}`)

  try {
    const response = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
      },
      cache: "default",
    })

    if (!response.ok) {
      console.error(
        "Tajweed API request failed",
        response.status,
        response.statusText,
      )
      return {
        success: false,
        fragments: [],
        error: "Unable to download tajweed annotations right now. Please try again soon.",
      }
    }

    const payload = (await response.json()) as {
      verses?: { verse_key: string; text_uthmani_tajweed: string }[]
    }

    const fragments = (payload.verses ?? []).map((verse) => {
      const [, ayahPart] = verse.verse_key.split(":")
      const ayah = Number.parseInt(ayahPart ?? "", 10)
      return {
        ayah: Number.isNaN(ayah) ? start : ayah,
        html: createFragmentHtml(verse.text_uthmani_tajweed),
      }
    })

    if (fragments.length === 0) {
      return {
        success: false,
        fragments: [],
        error: "No tajweed annotations were returned for the requested verses.",
      }
    }

    if (!notifiedRemoteFallback) {
      console.info(
        "Using live tajweed annotations from api.quran.com as the local DeepSpeech dataset is unavailable.",
      )
      notifiedRemoteFallback = true
    }

    return {
      success: true,
      fragments,
      legend: DEFAULT_TAJWEED_LEGEND,
    }
  } catch (error) {
    console.error("Failed to fetch tajweed annotations", error)
    return {
      success: false,
      fragments: [],
      error: "Unable to connect to the tajweed dataset service. Check your internet connection and try again.",
    }
  }
}

const loadTajweedModule = async () => {
  if (typeof window !== "undefined") {
    if (!warnedMissingModule) {
      warnedMissingModule = true
      console.warn(
        "DeepSpeech tajweed overlays are only available in the server environment. Skipping optional module load in the browser.",
      )
    }
    return null
  }

  try {
    return (await import(/* webpackIgnore: true */ "deepspeech-quran/tajweed")) as
      | {
          generateTajweedMushaf?: (
            surahNumber: number,
            verseRange: { start: number; end: number },
          ) => Promise<{ fragments: TajweedFragment[]; legend?: Record<string, string> }>
        }
      | null
  } catch (error) {
    if (!warnedMissingModule) {
      warnedMissingModule = true
      console.warn(
        "DeepSpeech tajweed overlays are disabled because the optional `deepspeech-quran/tajweed` module could not be loaded.",
        error,
      )
    }
    return null
  }
}

export const generateTajweedForRange = cache(
  async (surahNumber: number, range: { start: number; end: number }): Promise<TajweedRenderResult> => {
    const key = cacheKey(surahNumber, range.start, range.end)
    if (tajweedCache.has(key)) {
      return tajweedCache.get(key) as TajweedRenderResult
    }

    const module = await loadTajweedModule()

    if (module?.generateTajweedMushaf) {
      try {
        const response = await module.generateTajweedMushaf(surahNumber, range)
        const normalized: TajweedRenderResult = {
          success: true,
          fragments: response.fragments.map((fragment) => ({
            ayah: fragment.ayah,
            html: fragment.html,
          })),
          legend: response.legend,
        }
        tajweedCache.set(key, normalized)
        return normalized
      } catch (error) {
        console.error("generateTajweedForRange", error)
      }
    }

    const fallback = await fetchTajweedFromApi(surahNumber, range)
    tajweedCache.set(key, fallback)
    return fallback
  },
)
