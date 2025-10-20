import fs from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"
import type { Database as DatabaseInstance } from "better-sqlite3"

const DEFAULT_MORPHOLOGY_ROOT = path.resolve(process.cwd(), "Quranic Grammar and Morphology")

function resolveMorphologyPath(fileName: string): string {
  const root = process.env.MORPHOLOGY_DATA_ROOT?.trim()?.length
    ? path.resolve(process.env.MORPHOLOGY_DATA_ROOT as string)
    : DEFAULT_MORPHOLOGY_ROOT

  const resolved = path.resolve(root, fileName)
  if (!fs.existsSync(resolved)) {
    throw new Error(`Morphology asset missing: ${resolved}`)
  }
  return resolved
}

const databaseCache = new Map<string, DatabaseInstance>()

function openDatabase(fileName: string): DatabaseInstance {
  if (databaseCache.has(fileName)) {
    return databaseCache.get(fileName) as DatabaseInstance
  }

  const dbPath = resolveMorphologyPath(fileName)
  const db = new Database(dbPath, { readonly: true })
  databaseCache.set(fileName, db)
  return db
}

export interface AyahMorphologyRecord {
  verseKey: string
  lemma?: string | null
  root?: string | null
  stem?: string | null
}

export function getAyahMorphology(verseKey: string): AyahMorphologyRecord {
  const lemmaDb = openDatabase("ayah-lemma.db")
  const rootDb = openDatabase("ayah-root.db")
  const stemDb = openDatabase("ayah-stem.db")

  const lemmaRow = lemmaDb.prepare("SELECT text FROM lemmas WHERE verse_key = ?").get(verseKey) as
    | { text: string }
    | undefined
  const rootRow = rootDb.prepare("SELECT text FROM roots WHERE verse_key = ?").get(verseKey) as
    | { text: string }
    | undefined
  const stemRow = stemDb.prepare("SELECT text FROM stems WHERE verse_key = ?").get(verseKey) as
    | { text: string }
    | undefined

  return {
    verseKey,
    lemma: lemmaRow?.text ?? null,
    root: rootRow?.text ?? null,
    stem: stemRow?.text ?? null,
  }
}

export interface WordMorphologyRecord {
  wordLocation: string
  lemma?: { text: string; textClean?: string | null } | null
  root?: {
    arabicTrilateral: string | null
    englishTrilateral: string | null
  } | null
  stem?: { text: string; textClean?: string | null } | null
}

export function getWordMorphology(wordLocation: string): WordMorphologyRecord {
  const lemmaDb = openDatabase("word-lemma.db")
  const rootDb = openDatabase("word-root.db")
  const stemDb = openDatabase("word-stem.db")

  const lemmaRow = lemmaDb
    .prepare(
      `SELECT l.text as text, l.text_clean as textClean FROM lemmas l\n         JOIN lemma_words lw ON lw.lemma_id = l.id\n        WHERE lw.word_location = ?\n        LIMIT 1`,
    )
    .get(wordLocation) as { text: string; textClean?: string | null } | undefined

  const rootRow = rootDb
    .prepare(
      `SELECT r.arabic_trilateral as arabicTrilateral, r.english_trilateral as englishTrilateral\n         FROM roots r\n         JOIN root_words rw ON rw.root_id = r.id\n        WHERE rw.word_location = ?\n        LIMIT 1`,
    )
    .get(wordLocation) as
      | { arabicTrilateral: string | null; englishTrilateral: string | null }
      | undefined

  const stemRow = stemDb
    .prepare(
      `SELECT s.text as text, s.text_clean as textClean\n         FROM stems s\n         JOIN stem_words sw ON sw.stem_id = s.id\n        WHERE sw.word_location = ?\n        LIMIT 1`,
    )
    .get(wordLocation) as { text: string; textClean?: string | null } | undefined

  return {
    wordLocation,
    lemma: lemmaRow ?? null,
    root: rootRow ?? null,
    stem: stemRow ?? null,
  }
}

export function closeMorphologyDatabases() {
  for (const db of databaseCache.values()) {
    try {
      db.close()
    } catch (error) {
      console.warn("Failed to close morphology database", error)
    }
  }
  databaseCache.clear()
}
