import { cache } from "react"

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

export const generateTajweedForRange = cache(
  async (surahNumber: number, range: { start: number; end: number }): Promise<TajweedRenderResult> => {
    const key = cacheKey(surahNumber, range.start, range.end)
    if (tajweedCache.has(key)) {
      return tajweedCache.get(key) as TajweedRenderResult
    }

    try {
      const module = (await import(/* webpackIgnore: true */ "deepspeech-quran/tajweed").catch(() => null)) as
        | {
            generateTajweedMushaf?: (
              surahNumber: number,
              verseRange: { start: number; end: number },
            ) => Promise<{ fragments: TajweedFragment[]; legend?: Record<string, string> }>
          }
        | null

      if (!module?.generateTajweedMushaf) {
        throw new Error("DeepSpeech-Quran tajweed module is unavailable")
      }

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
      const fallback: TajweedRenderResult = {
        success: false,
        fragments: [],
        error: error instanceof Error ? error.message : "Unknown tajweed error",
      }
      tajweedCache.set(key, fallback)
      return fallback
    }
  },
)
