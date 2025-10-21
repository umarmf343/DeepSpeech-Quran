import { NextResponse } from "next/server"

interface TemplateHotspot {
  id: string
  order: number
  x: number
  y: number
  width: number
  height: number
  instruction: string
  transliteration?: string
  icon?: string
  objective: "makharij" | "tajweed-rule" | "common-mistake" | "listening" | "memorization"
  textFallback?: string
  linearDescription?: string
  audioUrl?: string
}

interface AssignmentTemplate {
  id: string
  name: string
  imageUrl: string
  hotspots: TemplateHotspot[]
}

const templates: AssignmentTemplate[] = [
  {
    id: "template-fatiha-intro",
    name: "Al-Fatiha articulation map",
    imageUrl: "/mushaf-page-with-highlighted-verses.jpg",
    hotspots: [
      {
        id: "template-fatiha-1",
        order: 1,
        x: 0.2,
        y: 0.28,
        width: 0.18,
        height: 0.18,
        instruction: "Bismi – light baa and clear meem.",
        transliteration: "Bismi Allahi",
        icon: "🌱",
        objective: "makharij",
        textFallback: "Pronounce the baa softly before the meem.",
        linearDescription: "Trace the opening phrase slowly. Focus on light articulation.",
      },
      {
        id: "template-fatiha-2",
        order: 2,
        x: 0.52,
        y: 0.48,
        width: 0.16,
        height: 0.16,
        instruction: "Ihdina – sustain the haa and dhaal gently.",
        transliteration: "Ihdina",
        icon: "🌬️",
        objective: "tajweed-rule",
        textFallback: "Stretch the haa for two counts and soften the dhaal.",
        linearDescription: "Guide the student to glide across the haa without rushing.",
      },
      {
        id: "template-fatiha-3",
        order: 3,
        x: 0.74,
        y: 0.68,
        width: 0.14,
        height: 0.14,
        instruction: "Ameen – close with serene noon.",
        transliteration: "Ameen",
        icon: "✨",
        objective: "common-mistake",
        textFallback: "Release the noon gently with no extra vowel.",
        linearDescription: "Remind them to smile slightly and release the sound softly.",
      },
    ],
  },
  {
    id: "template-makharij-mouth",
    name: "Makharij mouth diagram",
    imageUrl: "/arabic-calligraphy-with-quranic-verses.jpg",
    hotspots: [
      {
        id: "template-mouth-1",
        order: 1,
        x: 0.32,
        y: 0.42,
        width: 0.16,
        height: 0.16,
        instruction: "Tongue tip – letters taa, daal, noon.",
        icon: "📝",
        objective: "makharij",
        textFallback: "Touch the roof lightly right behind the teeth.",
        linearDescription: "Encourage gentle pressure with the very tip of the tongue.",
      },
      {
        id: "template-mouth-2",
        order: 2,
        x: 0.55,
        y: 0.33,
        width: 0.18,
        height: 0.18,
        instruction: "Throat middle – letters ayn and haa.",
        icon: "🌿",
        objective: "listening",
        textFallback: "Breathe out softly while opening the throat.",
        linearDescription: "Guide them to relax shoulders before pronouncing.",
      },
      {
        id: "template-mouth-3",
        order: 3,
        x: 0.66,
        y: 0.62,
        width: 0.18,
        height: 0.18,
        instruction: "Lips – meem and baa articulation.",
        icon: "👂",
        objective: "memorization",
        textFallback: "Press the lips together gently before releasing the sound.",
        linearDescription: "Repeat three times slowly to build muscle memory.",
      },
    ],
  },
]

export async function GET() {
  return NextResponse.json(templates)
}
