import { promises as fs } from "fs"
import { createRequire } from "module"
import path from "path"
import initSqlJs from "sql.js"
import type { MorphologyResponse, MorphologyWord } from "@/types/morphology"

const require = createRequire(import.meta.url)

const baseDir = path.join(process.cwd(), "Quranic Grammar and Morphology")

type SqlJs = Awaited<ReturnType<typeof initSqlJs>>

type LoadedDatabases = {
  lemmaDb: SqlJs["Database"]
  rootDb: SqlJs["Database"]
  stemDb: SqlJs["Database"]
}

let databasesPromise: Promise<LoadedDatabases> | null = null

async function loadSqlJs(): Promise<SqlJs> {
  const wasmPath = path.join(
    path.dirname(require.resolve("sql.js/package.json")),
    "dist",
    "sql-wasm.wasm",
  )
  const wasmBinary = await fs.readFile(wasmPath)

  return initSqlJs({ wasmBinary })
}

async function loadDatabase(SQL: SqlJs, filename: string) {
  const filePath = path.join(baseDir, filename)
  const buffer = await fs.readFile(filePath)
  return new SQL.Database(buffer)
}

async function getDatabases(): Promise<LoadedDatabases> {
  if (!databasesPromise) {
    databasesPromise = (async () => {
      const SQL = await loadSqlJs()

      const [lemmaDb, rootDb, stemDb] = await Promise.all([
        loadDatabase(SQL, "ayah-lemma.db"),
        loadDatabase(SQL, "ayah-root.db"),
        loadDatabase(SQL, "ayah-stem.db"),
      ])

      return { lemmaDb, rootDb, stemDb }
    })()
  }

  return databasesPromise
}

function splitWords(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
}

export async function getMorphologyForAyah(
  reference: string,
  fallbackAyahText?: string,
): Promise<MorphologyResponse | null> {
  const { lemmaDb, rootDb, stemDb } = await getDatabases()

  const lemmaRow = lemmaDb.exec("SELECT text FROM lemmas WHERE verse_key = $ref", { $ref: reference })
  const rootRow = rootDb.exec("SELECT text FROM roots WHERE verse_key = $ref", { $ref: reference })
  const stemRow = stemDb.exec("SELECT text FROM stems WHERE verse_key = $ref", { $ref: reference })

  const lemmaText = lemmaRow[0]?.values?.[0]?.[0] as string | undefined
  const rootText = rootRow[0]?.values?.[0]?.[0] as string | undefined
  const stemText = stemRow[0]?.values?.[0]?.[0] as string | undefined

  if (!lemmaText && !rootText && !stemText) {
    return null
  }

  const lemmaWords = splitWords(lemmaText)
  const rootWords = splitWords(rootText)
  const stemWords = splitWords(stemText)

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
      lemmas: lemmaText ?? null,
      roots: rootText ?? null,
      stems: stemText ?? null,
    },
  }
}
