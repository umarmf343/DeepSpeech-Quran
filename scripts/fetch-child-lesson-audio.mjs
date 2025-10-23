#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import googleTTS from "google-tts-api"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, "..")
const outputDir = path.join(projectRoot, "public", "audio", "child-lessons")
const sourcePath = path.join(__dirname, "letter-lesson-text.json")

const ensureDirectory = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true })
}

const shouldForce = process.argv.includes("--force")

const readLessonText = async () => {
  const raw = await fs.readFile(sourcePath, "utf8")
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) {
    throw new Error("letter-lesson-text.json must contain an array of lessons")
  }
  return data
}

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const writeFileIfMissing = async (filePath, data) => {
  if (!shouldForce) {
    try {
      await fs.access(filePath)
      return false
    } catch {}
  }

  await fs.writeFile(filePath, data)
  return true
}

const fetchAudioForText = async (text) => {
  const trimmed = text?.toString().normalize("NFC").trim()
  if (!trimmed) {
    return null
  }

  const chunks = googleTTS.getAllAudioUrls(trimmed, {
    lang: "ar",
    slow: false,
    host: "https://translate.google.com",
  })

  if (!chunks.length) {
    return null
  }

  const response = await fetch(chunks[0].url)
  if (!response.ok) {
    throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

const main = async () => {
  await ensureDirectory(outputDir)
  const lessons = await readLessonText()
  const existingByText = new Map()
  let downloaded = 0
  let reused = 0

  for (const lesson of lessons) {
    const { id, text, title } = lesson
    if (!id) {
      console.warn("Skipping lesson with missing id", lesson)
      continue
    }

    const normalized = text?.toString().normalize("NFC").trim()
    const destination = path.join(outputDir, `${id}.mp3`)

    if (!normalized) {
      console.warn(`Skipping lesson ${id} (${title}) because it has no text`)
      continue
    }

    if (existingByText.has(normalized)) {
      const sourceBuffer = existingByText.get(normalized)
      const created = await writeFileIfMissing(destination, sourceBuffer)
      if (created) {
        reused++
        console.log(`Reused audio for lesson ${id} (${title})`)
      }
      continue
    }

    if (!shouldForce && (await fileExists(destination))) {
      const buffer = await fs.readFile(destination)
      existingByText.set(normalized, buffer)
      reused++
      console.log(`Audio already exists for lesson ${id} (${title})`)
      continue
    }

    const buffer = await fetchAudioForText(normalized)
    if (!buffer) {
      console.warn(`No audio generated for lesson ${id} (${title})`)
      continue
    }

    existingByText.set(normalized, buffer)
    const created = await writeFileIfMissing(destination, buffer)
    if (created) {
      downloaded++
      console.log(`Downloaded audio for lesson ${id} (${title})`)
    } else {
      if (!shouldForce) {
        reused++
        console.log(`Audio already exists for lesson ${id} (${title})`)
      } else {
        downloaded++
        console.log(`Refreshed audio for lesson ${id} (${title})`)
      }
    }
  }

  console.log(`\nAudio fetch complete. Downloaded: ${downloaded}, reused: ${reused}. Files saved to ${outputDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
