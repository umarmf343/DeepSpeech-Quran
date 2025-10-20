import { createHmac } from "crypto"

const DEFAULT_SECRET = "alfawz-secret-key"

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

export interface JwtPayload {
  sub: string
  role: string
  exp: number
  [key: string]: unknown
}

export function signJwt(payload: Omit<JwtPayload, "exp">, expiresInSeconds = 60 * 60) {
  const secret = process.env.JWT_SECRET ?? DEFAULT_SECRET
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  const body = { ...payload, exp }
  const payloadEncoded = base64Url(JSON.stringify(body))
  const token = `${header}.${payloadEncoded}`
  const signature = createHmac("sha256", secret).update(token).digest("base64url")
  return `${token}.${signature}`
}

export function verifyJwt(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET ?? DEFAULT_SECRET
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const [header, payload, signature] = parts
  const expectedSignature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url")
  if (expectedSignature !== signature) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString()) as JwtPayload
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return decoded
  } catch (error) {
    console.error("Failed to decode JWT payload", error)
    return null
  }
}
