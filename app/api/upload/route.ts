import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || ""
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart upload" }, { status: 400 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File missing" }, { status: 400 })
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "dat"
  const safeName = `assign_${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`

  // In production this would upload to object storage.
  const url = `/uploads/${safeName}`

  return NextResponse.json({ url })
}
