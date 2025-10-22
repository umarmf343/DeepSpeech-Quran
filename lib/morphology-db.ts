import { promises as fs } from "fs"
import { createRequire } from "module"
import path from "path"
import type {
  MorphologyResponse,
  MorphologyWord,
  MorphologyWordScope,
  MorphologyWordSearchResult,
} from "@/types/morphology"

declare const __non_webpack_require__: NodeRequire | undefined

const nodeRequire: NodeRequire =
  typeof __non_webpack_require__ !== "undefined"
    ? __non_webpack_require__
    : createRequire(import.meta.url)

const baseDir = path.join(process.cwd(), "data", "morphology")

type InitSqlJs = typeof import("sql.js")
type SqlJs = Awaited<ReturnType<InitSqlJs>>

let initSqlJs: InitSqlJs | null = null
let sqlJsInstancePromise: Promise<SqlJs> | null = null

const databaseCache = new Map<string, Promise<SqlJs["Database"]>>()

type AyahDatabases = {
  lemmaDb: SqlJs["Database"]
  rootDb: SqlJs["Database"]
  stemDb: SqlJs["Database"]
}

type WordDatabaseConfig = {
  file: string
  table: string
  joinTable: string
  joinColumn: string
  select: {
    arabic: string
    normalized?: string | null
    transliteration?: string | null
  }
  searchColumns: string[]
}

const WORD_DATABASE_CONFIG: Record<MorphologyWordScope, WordDatabaseConfig> = {
  lemma: {
    file: "word-lemma.db",
    table: "lemmas",
    joinTable: "lemma_words",
    joinColumn: "lemma_id",
    select: {
      arabic: "text",
      normalized: "text_clean",
    },
    searchColumns: ["text", "text_clean"],
  },
  root: {
    file: "word-root.db",
    table: "roots",
    joinTable: "root_words",
    joinColumn: "root_id",
    select: {
      arabic: "arabic_trilateral",
      normalized: "english_trilateral",
      transliteration: "english_trilateral",
    },
    searchColumns: ["arabic_trilateral", "english_trilateral"],
  },
  stem: {
    file: "word-stem.db",
    table: "stems",
    joinTable: "stem_words",
    joinColumn: "stem_id",
    select: {
      arabic: "text",
      normalized: "text_clean",
    },
    searchColumns: ["text", "text_clean"],
  },
}

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

async function getSqlJsInstance(): Promise<SqlJs> {
  if (!sqlJsInstancePromise) {
    sqlJsInstancePromise = loadSqlJs().catch((error) => {
      sqlJsInstancePromise = null
      throw error
    })
  }

  return sqlJsInstancePromise
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

async function getDatabase(filename: string): Promise<SqlJs["Database"]> {
  if (!databaseCache.has(filename)) {
    const promise = (async () => {
      const SQL = await getSqlJsInstance()
      return loadDatabase(SQL, filename)
    })().catch((error) => {
      databaseCache.delete(filename)
      throw error
    })

    databaseCache.set(filename, promise)
  }

  return databaseCache.get(filename)!
}

async function getAyahDatabases(): Promise<AyahDatabases> {
  const [lemmaDb, rootDb, stemDb] = await Promise.all([
    getDatabase("ayah-lemma.db"),
    getDatabase("ayah-root.db"),
    getDatabase("ayah-stem.db"),
  ])

  return { lemmaDb, rootDb, stemDb }
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
  const { lemmaDb, rootDb, stemDb } = await getAyahDatabases()

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

export async function searchMorphologyWords(options: {
  scope: MorphologyWordScope
  query: string
  limit?: number
}): Promise<MorphologyWordSearchResult[]> {
  const scope = options.scope
  const query = options.query.trim()
  const limit = Number.isFinite(options.limit) ? Math.min(Math.max(Math.trunc(options.limit ?? 10), 1), 100) : 25

  if (!query) {
    return []
  }

  const config = WORD_DATABASE_CONFIG[scope]
  const db = await getDatabase(config.file)

  const normalizedQuery = query.replace(/\s+/g, " ").slice(0, 120)
  const pattern = `%${normalizedQuery.replace(/%/g, "")}%`

  const selectNormalized = config.select.normalized
    ? `main.${config.select.normalized} AS normalized`
    : "NULL AS normalized"
  const selectTransliteration = config.select.transliteration
    ? `main.${config.select.transliteration} AS transliteration`
    : "NULL AS transliteration"

  const whereClause = config.searchColumns
    .map((column) => `main.${column} LIKE $pattern`)
    .join(" OR ")

  const statement = db.prepare(`
    SELECT
      main.id AS id,
      main.${config.select.arabic} AS arabic,
      ${selectNormalized},
      ${selectTransliteration},
      main.words_count AS total_count,
      main.uniq_words_count AS unique_count,
      GROUP_CONCAT(words.word_location, ',') AS locations
    FROM ${config.table} AS main
    LEFT JOIN ${config.joinTable} AS words ON words.${config.joinColumn} = main.id
    WHERE ${whereClause}
    GROUP BY main.id
    ORDER BY total_count DESC
    LIMIT $limit
  `)

  try {
    statement.bind({ $pattern: pattern, $limit: limit })
    const results: MorphologyWordSearchResult[] = []

    while (statement.step()) {
      const row = statement.getAsObject() as Record<string, unknown>
      const rawLocations = (row.locations as string | null | undefined) ?? ""
      const locations = rawLocations
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)

      results.push({
        id: Number(row.id ?? 0),
        scope,
        arabic: String(row.arabic ?? ""),
        normalized: row.normalized != null ? String(row.normalized) : null,
        transliteration: row.transliteration != null ? String(row.transliteration) : null,
        totalOccurrences: row.total_count != null ? Number(row.total_count) : null,
        uniqueOccurrences: row.unique_count != null ? Number(row.unique_count) : null,
        locations,
      })
    }

    return results
  } finally {
    statement.free()
  }
}
