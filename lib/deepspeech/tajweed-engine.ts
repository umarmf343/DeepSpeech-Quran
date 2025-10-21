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

type TajweedModule =
  | {
      generateTajweedMushaf?: (
        surahNumber: number,
        verseRange: { start: number; end: number },
      ) => Promise<{ fragments: TajweedFragment[]; legend?: Record<string, string> }>
    }
  | null

const loadTajweedModule = async (): Promise<TajweedModule> => {
  try {
    const dynamicImport = new Function(
      "specifier",
      "return import(specifier)",
    ) as (specifier: string) => Promise<TajweedModule>
    return await dynamicImport("deepspeech-quran/tajweed")
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("Tajweed module unavailable", error)
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

    try {
      const module = await loadTajweedModule()

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
