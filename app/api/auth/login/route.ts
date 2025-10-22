import { NextResponse } from "next/server"
import { signJwt } from "@/lib/auth/jwt"
import { getNavigationForRole, getUserByEmail, getUserById } from "@/lib/data/mock-db"

type LoginRequest = {
  email?: string
  role?: "visitor" | "student" | "teacher" | "admin"
}

const roleFallbackEmail: Record<string, string> = {
  visitor: "student@alfawz.io",
  student: "student@alfawz.io",
  teacher: "teacher@alfawz.io",
  admin: "admin@alfawz.io",
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginRequest
  const email = body.email ?? roleFallbackEmail[body.role ?? "student"]

  const user = getUserByEmail(email)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const token = signJwt({ sub: user.id, role: user.role })
  const response = NextResponse.json({
    token,
    user,
    navigation: getNavigationForRole(user.role, user.preferences),
  })
  response.cookies.set("alfawz_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
  return response
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }
  const user = getUserById(id)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  const token = signJwt({ sub: user.id, role: user.role })
  return NextResponse.json({
    token,
    user,
    navigation: getNavigationForRole(user.role, user.preferences),
  })
}
