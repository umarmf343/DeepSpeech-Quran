import { NextResponse } from "next/server"

interface Hotspot {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  description: string
  audioUrl?: string
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  dueTime?: string
  notes?: string
  image?: string
  classes: string[]
  students: string[]
  hotspots: Hotspot[]
  status: "assigned" | "completed"
  createdAt: string
  createdBy: string
}

const assignments: Assignment[] = [
  {
    id: "demo-assignment",
    title: "Surah Al-Fatiha Listening",
    description:
      "Focus on the tajweed articulation of each ayah. Listen carefully to the audio prompts and repeat each line.",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    dueTime: "17:00",
    notes: "Students should submit a voice recording after completing all hotspots.",
    image: "/mushaf-page-with-highlighted-verses.jpg",
    classes: ["foundation"],
    students: ["amina", "hassan"],
    hotspots: [
      {
        id: "intro-ayah",
        x: 18,
        y: 28,
        width: 16,
        height: 16,
        label: "Opening Ayah",
        description: "Listen to the pronunciation of Bismillah and repeat after the audio.",
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2023/04/03/audio_c0a64ef5bd.mp3?filename=peaceful-ambient-142082.mp3",
      },
      {
        id: "middle-ayah",
        x: 52,
        y: 48,
        width: 14,
        height: 14,
        label: "Guidance Ayah",
        description: "Pay attention to the elongation rules for this ayah.",
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2023/03/31/audio_6ac5da9b83.mp3?filename=calm-lofi-141756.mp3",
      },
      {
        id: "closing-ayah",
        x: 70,
        y: 68,
        width: 13,
        height: 13,
        label: "Closing Supplication",
        description: "Focus on the articulation of the final consonants.",
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2023/02/27/audio_ae4d934044.mp3?filename=serene-relaxing-ambient-138936.mp3",
      },
    ],
    status: "assigned",
    createdAt: new Date().toISOString(),
    createdBy: "Ustadha Maryam",
  },
]

export async function GET() {
  return NextResponse.json(assignments)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<Assignment>

    if (!payload.title || !payload.description || !payload.dueDate) {
      return NextResponse.json(
        { error: "Title, description, and due date are required." },
        { status: 400 },
      )
    }

    if ((!payload.classes || payload.classes.length === 0) && (!payload.students || payload.students.length === 0)) {
      return NextResponse.json(
        { error: "Please select at least one class or student for the assignment." },
        { status: 400 },
      )
    }

    const newAssignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate,
      dueTime: payload.dueTime,
      notes: payload.notes,
      image: payload.image,
      classes: payload.classes ?? [],
      students: payload.students ?? [],
      hotspots: (payload.hotspots ?? []).map((hotspot) => ({
        id: hotspot.id ?? `hotspot-${Date.now()}`,
        x: hotspot.x ?? 0,
        y: hotspot.y ?? 0,
        width: hotspot.width ?? 12,
        height: hotspot.height ?? 12,
        label: hotspot.label ?? "Hotspot",
        description: hotspot.description ?? "",
        audioUrl: hotspot.audioUrl,
      })),
      status: "assigned",
      createdAt: new Date().toISOString(),
      createdBy: payload.createdBy ?? "Teacher",
    }

    assignments.unshift(newAssignment)

    return NextResponse.json(newAssignment, { status: 201 })
  } catch (error) {
    console.error("Failed to create assignment", error)
    return NextResponse.json({ error: "Unable to create assignment." }, { status: 500 })
  }
}
