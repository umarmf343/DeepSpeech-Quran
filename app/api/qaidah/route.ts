import { NextResponse } from "next/server";

interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  audioUrl: string;
}

interface Assignment {
  id: string;
  title: string;
  className: string;
  scope: "all" | "selected";
  notes: string;
  description?: string;
  resource: {
    fileName: string;
    preview?: string | null;
  };
  hotspots: Hotspot[];
  createdAt: string;
}

const memoryStore: Assignment[] = [
  {
    id: "assignment-1",
    title: "Lesson 6 • Stretching alif",
    className: "Level 1 Qa'idah",
    scope: "all",
    notes: "Listen for gentle stretching on the long vowels.",
    description: "Tap each glowing marker to hear how your teacher recites the word.",
    resource: {
      fileName: "qaidah-page.jpg",
      preview: "/mushaf-page-with-highlighted-verses.jpg",
    },
    hotspots: [
      {
        id: "assignment-1-hotspot-1",
        label: "Madd",
        x: 34,
        y: 42,
        size: 64,
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2021/10/19/audio_9c05184e39.mp3?filename=short-melodic-phrase-9701.mp3",
      },
      {
        id: "assignment-1-hotspot-2",
        label: "Flow",
        x: 68,
        y: 62,
        size: 56,
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2022/03/15/audio_7f72e26cf3.mp3?filename=soft-chime-logo-20350.mp3",
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "assignment-2",
    title: "Connect letters with sukoon",
    className: "Advanced Recitation",
    scope: "selected",
    notes: "Focus on crisp consonant endings. Pause, breathe, and listen again.",
    description: "The top row is for pair practice, bottom row for solo playback.",
    resource: {
      fileName: "teacher-demo.jpg",
      preview: "/arabic-calligraphy-with-quranic-verses.jpg",
    },
    hotspots: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ assignments: memoryStore });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      className,
      scope = "all",
      notes = "",
      description = "",
      resource,
    } = body ?? {};

    if (!title || !className || !resource?.preview) {
      return NextResponse.json(
        {
          message:
            "Missing fields: title, className, and a preview resource are required.",
        },
        { status: 400 },
      );
    }

    const assignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title,
      className,
      scope: scope === "selected" ? "selected" : "all",
      notes,
      description,
      resource: {
        fileName: resource.fileName ?? "lesson-resource",
        preview: resource.preview,
      },
      hotspots: [],
      createdAt: new Date().toISOString(),
    };

    memoryStore.unshift(assignment);

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error("Failed to save Qa'idah assignment", error);
    return NextResponse.json(
      { message: "Unexpected error while saving assignment" },
      { status: 500 },
    );
  }
}
