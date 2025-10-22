export type MorphologyWordScope = "lemma" | "root" | "stem"

export interface MorphologyWord {
  arabic: string
  lemma: string | null
  root: string | null
  stem: string | null
}

export interface MorphologyResponse {
  ayah: string
  words: MorphologyWord[]
  summary: {
    lemmas: string | null
    roots: string | null
    stems: string | null
  }
}

export interface MorphologyWordSearchResult {
  id: number
  scope: MorphologyWordScope
  arabic: string
  normalized: string | null
  transliteration: string | null
  totalOccurrences: number | null
  uniqueOccurrences: number | null
  locations: string[]
}
