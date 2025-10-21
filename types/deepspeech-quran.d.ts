declare module "deepspeech-quran/tajweed" {
  export interface TajweedVerseFragment {
    ayah: number
    html: string
  }

  export interface TajweedResponse {
    surah: number
    fragments: TajweedVerseFragment[]
    legend?: Record<string, string>
  }

  export function generateTajweedMushaf(
    surahNumber: number,
    verseRange: { start: number; end: number },
  ): Promise<TajweedResponse>
}
