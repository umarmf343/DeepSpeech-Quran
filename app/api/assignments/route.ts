import { NextResponse } from "next/server"

interface Hotspot {
  id: string
  order: number
  x: number
  y: number
  width: number
  height: number
  instruction: string
  transliteration?: string
  icon?: string
  objective: string
  audioUrl?: string
  textFallback?: string
  linearDescription?: string
}

interface Assignment {
  id: string
  title: string
  description: string
  mode: "hotspot" | "linear" | "audio"
  imageUrl?: string
  recipients: { type: "class" | "student"; ids: string[] }
  hotspots: Hotspot[]
  status: "draft" | "sent" | "archived"
  createdAt: string
  createdBy: string
  teacherName?: string
  expiresAt?: string
  consentVersion?: string
}

const assignments: Assignment[] = [
  {
    id: "demo-assignment",
    title: "Surah Al-Fatiha Listening",
    description:
      "Focus on the tajweed articulation of each ayah. Listen carefully to the audio prompts and repeat each line.",
    mode: "hotspot",
    imageUrl: "/mushaf-page-with-highlighted-verses.jpg",
    recipients: { type: "class", ids: ["foundation"] },
    hotspots: [
      {
        id: "intro-ayah",
        order: 1,
        x: 0.18,
        y: 0.28,
        width: 0.16,
        height: 0.16,
        instruction: "Listen to the pronunciation of Bismillah and repeat after the audio.",
        transliteration: "Bismi Allahi",
        icon: "🌱",
        objective: "makharij",
        textFallback: "Focus on the softness of the baa sound.",
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2023/04/03/audio_c0a64ef5bd.mp3?filename=peaceful-ambient-142082.mp3",
      },
      {
        id: "middle-ayah",
        order: 2,
        x: 0.52,
        y: 0.48,
        width: 0.14,
        height: 0.14,
        instruction: "Pay attention to the elongation rules for this ayah.",
        transliteration: "Ihdina",
        icon: "🌬️",
        objective: "tajweed-rule",
        textFallback: "Sustain the madd for two counts without rushing.",
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2023/03/31/audio_6ac5da9b83.mp3?filename=calm-lofi-141756.mp3",
      },
      {
        id: "closing-ayah",
        order: 3,
        x: 0.7,
        y: 0.68,
        width: 0.13,
        height: 0.13,
        instruction: "Focus on the articulation of the final consonants.",
        transliteration: "Ameen",
        icon: "✨",
        objective: "common-mistake",
        textFallback: "Release the noon gently without extra vowel.",
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2023/02/27/audio_ae4d934044.mp3?filename=serene-relaxing-ambient-138936.mp3",
      },
    ],
    status: "sent",
    createdAt: new Date().toISOString(),
    createdBy: "Ustadha Maryam",
    teacherName: "Ustadha Maryam",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    consentVersion: "v1",
  },
]

export async function GET() {
  return NextResponse.json(assignments)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<Assignment>

    if (!payload.title || !payload.description || !payload.imageUrl || !payload.mode) {
      return NextResponse.json(
        { error: "Title, description, image, and mode are required." },
        { status: 400 },
      )
    }

    if (!payload.recipients || payload.recipients.ids.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one class or student for the assignment." },
        { status: 400 },
      )
    }

    const newAssignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      mode: payload.mode,
      imageUrl: payload.imageUrl,
      recipients: payload.recipients,
      hotspots: (payload.hotspots ?? []).map((hotspot, index) => ({
        id: hotspot.id ?? `hotspot-${Date.now()}-${index}`,
        order: hotspot.order ?? index + 1,
        x: hotspot.x ?? 0,
        y: hotspot.y ?? 0,
        width: hotspot.width ?? 0.12,
        height: hotspot.height ?? 0.12,
        instruction: hotspot.instruction ?? "",
        transliteration: hotspot.transliteration,
        icon: hotspot.icon,
        objective: hotspot.objective ?? "makharij",
        audioUrl: hotspot.audioUrl,
        textFallback: hotspot.textFallback,
        linearDescription: hotspot.linearDescription,
      })),
      status: payload.status ?? "sent",
      createdAt: new Date().toISOString(),
      createdBy: payload.createdBy ?? "Teacher",
      teacherName: payload.teacherName ?? payload.createdBy ?? "Teacher",
      expiresAt: payload.expiresAt,
      consentVersion: payload.consentVersion ?? "v1",
    }

    assignments.unshift(newAssignment)

    return NextResponse.json(newAssignment, { status: 201 })
  } catch (error) {
    console.error("Failed to create assignment", error)
    return NextResponse.json({ error: "Unable to create assignment." }, { status: 500 })
  }
}
