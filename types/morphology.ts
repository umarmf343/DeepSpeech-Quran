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
