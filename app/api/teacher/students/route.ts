import { NextResponse } from "next/server"

const students = [
  {
    id: "amina",
    name: "Amina Rahman",
    classes: ["foundation"],
    preferredLanguage: "en",
  },
  {
    id: "hassan",
    name: "Hassan Idrissi",
    classes: ["foundation", "tajweed-intensive"],
    preferredLanguage: "ar",
  },
  {
    id: "safiya",
    name: "Safiya Khan",
    classes: ["youth-circle"],
    preferredLanguage: "ur",
  },
  {
    id: "yusuf",
    name: "Yusuf Park",
    classes: ["tajweed-intensive"],
    preferredLanguage: "en",
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classFilter = searchParams.get("classId")

  const filtered = classFilter
    ? students.filter((student) => student.classes.includes(classFilter))
    : students

  return NextResponse.json(filtered)
}
