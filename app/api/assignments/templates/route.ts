import { NextResponse } from "next/server"

const templates = [
  {
    id: "makharij-mouth-diagram",
    name: "Makharij Mouth Diagram",
    imageUrl: "/templates/mouth-diagram.png",
    hotspots: [
      {
        id: "lips",
        order: 1,
        x: 0.68,
        y: 0.82,
        width: 0.12,
        height: 0.12,
        instruction: "Introduce the labial articulation letters ب، م، و",
        transliteration: "Ba · Mim · Waw",
        icon: "👄",
        objective: "makharij",
        textFallback: "Place both lips together gently before releasing the sound.",
      },
      {
        id: "throat",
        order: 2,
        x: 0.32,
        y: 0.22,
        width: 0.14,
        height: 0.14,
        instruction: "Review the three throat levels for Hamza and Ayn.",
        transliteration: "Hamzat · Ayn",
        icon: "🌬️",
        objective: "tajweed-rule",
        textFallback: "Practice opening the throat without tension.",
      },
    ],
  },
  {
    id: "tajweed-rules-card",
    name: "Tajweed Rules Quick Review",
    imageUrl: "/templates/tajweed-rules.png",
    hotspots: [
      {
        id: "ikhfa",
        order: 1,
        x: 0.45,
        y: 0.41,
        width: 0.1,
        height: 0.1,
        instruction: "Practice Ikhfa with Nun Sakinah before س",
        transliteration: "Nun sakinah + Seen",
        icon: "🌗",
        objective: "tajweed-rule",
        textFallback: "Keep the tongue relaxed and let the sound pass through the nose.",
      },
    ],
  },
]

export async function GET() {
  return NextResponse.json(templates)
}
