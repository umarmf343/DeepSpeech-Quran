import path from "path"
import Database from "better-sqlite3"
import type { MorphologyResponse, MorphologyWord } from "@/types/morphology"

const baseDir = path.join(process.cwd(), "Quranic Grammar and Morphology")

function openDatabase(filename: string) {
  return new Database(path.join(baseDir, filename), { readonly: true })
}

const ayahLemmaDb = openDatabase("ayah-lemma.db")
const ayahRootDb = openDatabase("ayah-root.db")
const ayahStemDb = openDatabase("ayah-stem.db")

const lemmaStatement = ayahLemmaDb.prepare("SELECT text FROM lemmas WHERE verse_key = ?")
const rootStatement = ayahRootDb.prepare("SELECT text FROM roots WHERE verse_key = ?")
const stemStatement = ayahStemDb.prepare("SELECT text FROM stems WHERE verse_key = ?")

function splitWords(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
}

export function getMorphologyForAyah(reference: string, fallbackAyahText?: string): MorphologyResponse | null {
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
