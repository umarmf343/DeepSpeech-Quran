import path from "path"
import Database from "better-sqlite3"
import type { MorphologyResponse, MorphologyWord } from "@/types/morphology"

const baseDir = path.join(process.cwd(), "Quranic Grammar and Morphology")

let ayahLemmaDb: Database | null = null
let ayahRootDb: Database | null = null
let ayahStemDb: Database | null = null

let lemmaStatement: ReturnType<Database["prepare"]> | null = null
let rootStatement: ReturnType<Database["prepare"]> | null = null
let stemStatement: ReturnType<Database["prepare"]> | null = null

let initializationError: Error | null = null
let isInitialized = false

function initializeDatabases() {
  if (isInitialized || initializationError) {
    return
  }

  try {
    ayahLemmaDb = new Database(path.join(baseDir, "ayah-lemma.db"), { readonly: true })
    ayahRootDb = new Database(path.join(baseDir, "ayah-root.db"), { readonly: true })
    ayahStemDb = new Database(path.join(baseDir, "ayah-stem.db"), { readonly: true })

    lemmaStatement = ayahLemmaDb.prepare("SELECT text FROM lemmas WHERE verse_key = ?")
    rootStatement = ayahRootDb.prepare("SELECT text FROM roots WHERE verse_key = ?")
    stemStatement = ayahStemDb.prepare("SELECT text FROM stems WHERE verse_key = ?")

    isInitialized = true
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error))
    initializationError = normalizedError
    console.error("Failed to initialize morphology database", normalizedError)
  }
}

function splitWords(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
}

export function getMorphologyForAyah(reference: string, fallbackAyahText?: string): MorphologyResponse | null {
  initializeDatabases()

  if (!lemmaStatement || !rootStatement || !stemStatement) {
    if (initializationError) {
      console.warn("Morphology lookup unavailable, returning fallback response")
    }

    if (!fallbackAyahText) {
      return null
    }

    const fallbackWords = splitWords(fallbackAyahText).map((word) => ({
      arabic: word,
      lemma: null,
      root: null,
      stem: null,
    }))

    return {
      ayah: reference,
      words: fallbackWords,
      summary: {
        lemmas: null,
        roots: null,
        stems: null,
      },
    }
  }

  const lemmaRow = lemmaStatement.get(reference) as { text: string } | undefined
  const rootRow = rootStatement.get(reference) as { text: string } | undefined
  const stemRow = stemStatement.get(reference) as { text: string } | undefined

  if (!lemmaRow && !rootRow && !stemRow) {
    return null
  }

  const lemmaWords = splitWords(lemmaRow?.text)
  const rootWords = splitWords(rootRow?.text)
  const stemWords = splitWords(stemRow?.text)

  const arabicWords = fallbackAyahText ? splitWords(fallbackAyahText) : stemWords

  const wordCount = Math.max(arabicWords.length, lemmaWords.length, rootWords.length, stemWords.length)

  const words: MorphologyWord[] = []

  for (let index = 0; index < wordCount; index += 1) {
    words.push({
      arabic: arabicWords[index] ?? "",
      lemma: lemmaWords[index] ?? null,
      root: rootWords[index] ?? null,
      stem: stemWords[index] ?? null,
    })
  }

  return {
    ayah: reference,
    words,
    summary: {
      lemmas: lemmaRow?.text ?? null,
      roots: rootRow?.text ?? null,
      stems: stemRow?.text ?? null,
    },
  }
}
