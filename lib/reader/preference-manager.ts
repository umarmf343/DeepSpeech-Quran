export type ReaderThemePreference = "auto" | "light" | "dark"

export interface ReaderProfile {
  showTranslation: boolean
  showTransliteration: boolean
  fullSurahView: boolean
  showTajweed: boolean
  translationEdition: string
  translationLanguage: string
  transliterationEdition: string
  reciterEdition: string
  playbackSpeed: number
  volume: number
  fontSizeClass: "text-2xl" | "text-3xl" | "text-4xl"
  lineHeightClass: "leading-relaxed" | "leading-loose"
  theme: ReaderThemePreference
  telemetryOptIn: boolean
}

const STORAGE_KEY = "quranReaderProfile"

export const DEFAULT_PROFILE: ReaderProfile = {
  showTranslation: true,
  showTransliteration: false,
  fullSurahView: false,
  showTajweed: false,
  translationEdition: "en.sahih",
  translationLanguage: "en",
  transliterationEdition: "en.transliteration",
  reciterEdition: "ar.alafasy",
  playbackSpeed: 1,
  volume: 0.8,
  fontSizeClass: "text-3xl",
  lineHeightClass: "leading-loose",
  theme: "auto",
  telemetryOptIn: false,
}

export function loadReaderProfile(): ReaderProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_PROFILE
    const parsed = JSON.parse(stored) as Partial<ReaderProfile>
    return { ...DEFAULT_PROFILE, ...parsed }
  } catch (error) {
    console.error("Failed to parse reader profile", error)
    return DEFAULT_PROFILE
  }
}

export function saveReaderProfile(profile: ReaderProfile) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.error("Failed to persist reader profile", error)
  }
}

export function updateProfile(
  profile: ReaderProfile,
  update: Partial<ReaderProfile>,
): ReaderProfile {
  const merged = { ...profile, ...update }
  if (typeof window !== "undefined") {
    saveReaderProfile(merged)
  }
  return merged
}
