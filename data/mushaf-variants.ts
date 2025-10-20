export type MushafVariantId = "hafs" | "tajweed"

export interface MushafVariantMetadata {
  id: MushafVariantId
  title: string
  description: string
  layoutFile: string
  notes: string[]
}

export const MUSHAF_VARIANTS: MushafVariantMetadata[] = [
  {
    id: "hafs",
    title: "Madīnah 15-line (Ḥafṣ)",
    description:
      "The classic Madīnah muṣḥaf layout used in most hifẓ circles. Clean black text aligns with the 604-page canonical pagination.",
    layoutFile: "qpc-hafs-15-lines.db.zip",
    notes: [
      "Perfect for mapping student progress against print muṣḥaf page numbers.",
      "Matches Al-Madina press typesetting with baseline glyph metrics for overlay guidance.",
    ],
  },
  {
    id: "tajweed",
    title: "Color-coded Tajwīd edition",
    description:
      "A tajwīd-coloured variant following the same QPC pagination. Ideal for gamified spotting of assimilation, elongation, and nasalisation cues.",
    layoutFile: "qpc-v1-15-lines.db.zip",
    notes: [
      "Highlights ikhfa, idghām, qalqalah, and madd categories inline with hue-coded overlays.",
      "Pairs with tajwīd-aware DeepSpeech scoring to surface rule-specific prompts.",
    ],
  },
]

export function getMushafVariant(id: MushafVariantId): MushafVariantMetadata | undefined {
  return MUSHAF_VARIANTS.find((variant) => variant.id === id)
}
