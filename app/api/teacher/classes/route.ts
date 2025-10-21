import { NextResponse } from "next/server"

const classes = [
  {
    id: "foundation",
    name: "Foundation Qa'idah",
    schedule: "Mon · Wed · 5:00 PM",
    studentCount: 18,
  },
  {
    id: "tajweed-intensive",
    name: "Tajweed Intensive",
    schedule: "Tue · Thu · 7:30 PM",
    studentCount: 12,
  },
  {
    id: "youth-circle",
    name: "Youth Hifdh Circle",
    schedule: "Sat · 10:00 AM",
    studentCount: 9,
  },
]

export async function GET() {
  return NextResponse.json(classes)
}
