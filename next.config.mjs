import fs from "node:fs"
import path from "node:path"

const STANDARD_NODE_ENVS = new Set(["development", "production", "test"])

const originalNodeEnv = process.env.NODE_ENV

if (originalNodeEnv && !STANDARD_NODE_ENVS.has(originalNodeEnv)) {
  const fallbackEnv = originalNodeEnv === "staging" || process.env.VERCEL_ENV === "production" ? "production" : "development"

  console.warn(
    `Detected non-standard NODE_ENV value "${originalNodeEnv}". Falling back to "${fallbackEnv}" to keep Next.js behaviour predictable.\n` +
      "Set VERCEL_ENV=production if you need production optimisations while using a custom NODE_ENV label."
  )

  if (!process.env.NEXT_PUBLIC_RUNTIME_ENV) {
    process.env.NEXT_PUBLIC_RUNTIME_ENV = originalNodeEnv
  }
  process.env.NODE_ENV = fallbackEnv
}

const requiredMushafFonts = ["mushaf-madinah.woff2", "mushaf-madinah.woff"]
const mushafFontDirectory = path.join(process.cwd(), "public", "fonts", "mushaf")

const mushafFontsReady = requiredMushafFonts.every((file) => {
  try {
    const candidate = path.join(mushafFontDirectory, file)
    return fs.existsSync(candidate) && fs.statSync(candidate).isFile()
  } catch {
    return false
  }
})

const transcriptionEnabled = typeof process.env.TARTEEL_API_KEY === "string" && process.env.TARTEEL_API_KEY.length > 0

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  webpack: (config, { dev }) => {
    if (dev && process.platform === "win32") {
      config.cache = false
    }

    return config
  },
  env: {
    NEXT_PUBLIC_MUSHAF_FONTS_READY: mushafFontsReady ? "true" : "false",
    NEXT_PUBLIC_TRANSCRIPTION_ENABLED: transcriptionEnabled ? "true" : "false",
  },
}

export default nextConfig
