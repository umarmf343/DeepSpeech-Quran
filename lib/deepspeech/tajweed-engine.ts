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

let warnedMissingModule = false
let tajweedModulePromise:
  | Promise<
      | {
          generateTajweedMushaf?: (
            surahNumber: number,
            verseRange: { start: number; end: number },
          ) => Promise<{ fragments: TajweedFragment[]; legend?: Record<string, string> }>
        }
      | null
    >
  | null = null
let tajweedModuleAvailable: boolean | null = null

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

const ensureTajweedModule = async () => {
  if (!tajweedModulePromise) {
    tajweedModulePromise = loadTajweedModule()
  }
  const module = await tajweedModulePromise
  tajweedModuleAvailable = Boolean(module?.generateTajweedMushaf)
  return module
}

export const isTajweedModuleAvailable = cache(async (): Promise<boolean> => {
  if (tajweedModuleAvailable !== null) {
    return tajweedModuleAvailable
  }
  try {
    const module = await ensureTajweedModule()
    return Boolean(module?.generateTajweedMushaf)
  } catch (error) {
    console.error("isTajweedModuleAvailable", error)
    tajweedModuleAvailable = false
    return false
  }
})

export const generateTajweedForRange = cache(
  async (surahNumber: number, range: { start: number; end: number }): Promise<TajweedRenderResult> => {
    const key = cacheKey(surahNumber, range.start, range.end)
    if (tajweedCache.has(key)) {
      return tajweedCache.get(key) as TajweedRenderResult
    }

    try {
      const module = await ensureTajweedModule()

      if (!module?.generateTajweedMushaf) {
        const response: TajweedRenderResult = {
          success: false,
          fragments: [],
          error:
            "Tajweed overlays require the optional DeepSpeech dataset. Install `deepspeech-quran/tajweed` to enable them.",
        }
        tajweedCache.set(key, response)
        return response
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
      tajweedModuleAvailable = false
      const fallback: TajweedRenderResult = {
        success: false,
        fragments: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to load tajweed overlays. Showing standard verse rendering.",
      }
      tajweedCache.set(key, fallback)
      return fallback
    }
  },
)
