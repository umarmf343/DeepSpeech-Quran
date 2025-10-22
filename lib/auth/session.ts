import { NextRequest } from "next/server"
import { verifyJwt } from "./jwt"
import { getUserById } from "@/lib/data/mock-db"

export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization")
  const headerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (headerToken) {
    return headerToken
  }
  const cookieToken = request.cookies.get("alfawz_token")?.value
  return cookieToken ?? null
}

export function requireAuth(request: NextRequest) {
  const token = extractToken(request)
  if (!token) {
    return { user: null, error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }) }
  }

  const payload = verifyJwt(token)
  if (!payload) {
    return { user: null, error: new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 }) }
  }

  const user = getUserById(payload.sub)
  if (!user) {
    return { user: null, error: new Response(JSON.stringify({ error: "User not found" }), { status: 404 }) }
  }

  return { user, error: null as Response | null }
}
