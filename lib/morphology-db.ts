import { promises as fs } from "fs"
import { createRequire } from "module"
import path from "path"
import type { MorphologyResponse, MorphologyWord } from "@/types/morphology"

declare const __non_webpack_require__: NodeRequire | undefined

const nodeRequire: NodeRequire =
  typeof __non_webpack_require__ !== "undefined"
    ? __non_webpack_require__
    : createRequire(import.meta.url)

const baseDir = path.join(process.cwd(), "Quranic Grammar and Morphology")

type InitSqlJs = typeof import("sql.js")
type SqlJs = Awaited<ReturnType<InitSqlJs>>

let initSqlJs: InitSqlJs | null = null

type LoadedDatabases = {
  lemmaDb: SqlJs["Database"]
  rootDb: SqlJs["Database"]
  stemDb: SqlJs["Database"]
}

let databasesPromise: Promise<LoadedDatabases> | null = null

async function loadSqlJs(): Promise<SqlJs> {
  if (!initSqlJs) {
    initSqlJs = nodeRequire("sql.js") as InitSqlJs
  }

  try {
    const sqlJsDir = path.dirname(nodeRequire.resolve("sql.js/package.json"))
    const wasmPath = path.join(sqlJsDir, "dist", "sql-wasm.wasm")
    const wasmBinary = await fs.readFile(wasmPath)

    return initSqlJs({ wasmBinary })
  } catch (error) {
    console.error("Unable to initialize sql.js runtime", error)
    const message =
      error instanceof Error
        ? `Failed to initialize morphology database runtime: ${error.message}`
        : "Failed to initialize morphology database runtime"
    throw new Error(message)
  }
}

async function loadDatabase(SQL: SqlJs, filename: string) {
  const filePath = path.join(baseDir, filename)
  try {
    const buffer = await fs.readFile(filePath)
    return new SQL.Database(buffer)
  } catch (error) {
    console.error(`Unable to load morphology database file: ${filePath}`, error)
    const detail = error instanceof Error ? `: ${error.message}` : ""
    throw new Error(`Failed to load morphology data file: ${filename}${detail}`)
  }
}

async function getDatabases(): Promise<LoadedDatabases> {
  if (!databasesPromise) {
    const loadPromise = (async () => {
      const SQL = await loadSqlJs()

      const [lemmaDb, rootDb, stemDb] = await Promise.all([
        loadDatabase(SQL, "ayah-lemma.db"),
        loadDatabase(SQL, "ayah-root.db"),
        loadDatabase(SQL, "ayah-stem.db"),
      ])

      return { lemmaDb, rootDb, stemDb }
    })()

    databasesPromise = loadPromise.catch((error) => {
      databasesPromise = null
      throw error
    })
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
