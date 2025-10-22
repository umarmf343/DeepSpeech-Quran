"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, Sparkles } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { MorphologyWordScope, MorphologyWordSearchResult } from "@/types/morphology"

const scopeOptions: { value: MorphologyWordScope; label: string; helper: string }[] = [
  {
    value: "lemma",
    label: "Lemma",
    helper: "Canonical dictionary form of a word",
  },
  {
    value: "root",
    label: "Root",
    helper: "Trilateral root families across the mushaf",
  },
  {
    value: "stem",
    label: "Stem / Form",
    helper: "Morphological pattern of the specific occurrence",
  },
]

const arabicFontClass = "font-arabic text-2xl text-maroon-900"

type RemoteState =
  | { status: "idle" | "empty"; results: MorphologyWordSearchResult[] }
  | { status: "loading"; results: MorphologyWordSearchResult[] }
  | { status: "error"; results: MorphologyWordSearchResult[]; message: string }
  | { status: "success"; results: MorphologyWordSearchResult[] }

export function MorphologyWordSearch() {
  const [scope, setScope] = useState<MorphologyWordScope>("lemma")
  const [query, setQuery] = useState("")
  const [remote, setRemote] = useState<RemoteState>({ status: "idle", results: [] })

  useEffect(() => {
    if (!query.trim()) {
      setRemote({ status: "idle", results: [] })
      return
    }

    const controller = new AbortController()
    const handle = setTimeout(async () => {
      setRemote((prev) => ({ status: "loading", results: prev.results }))
      try {
        const params = new URLSearchParams({ q: query.trim(), scope })
        const response = await fetch(`/api/morphology/search?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`)
        }

        const payload = (await response.json()) as { results?: MorphologyWordSearchResult[] }
        const results = payload.results ?? []
        setRemote(results.length ? { status: "success", results } : { status: "empty", results })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        console.error("Morphology search failed", error)
        let message = "Unable to search the morphology lexicon"
        if (error instanceof TypeError) {
          if (typeof navigator !== "undefined" && navigator.onLine === false) {
            message = "You appear to be offline. Reconnect to search the morphology lexicon."
          } else {
            message = "Could not reach the morphology search API."
          }
        }
        setRemote({ status: "error", results: [], message })
      }
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(handle)
    }
  }, [query, scope])

  const helperText = useMemo(() => scopeOptions.find((option) => option.value === scope)?.helper ?? "", [scope])

  return (
    <Card className="border-maroon-200/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Search className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="text-maroon-900 text-xl">Lexicon Explorer</CardTitle>
            <CardDescription className="text-sm text-maroon-700">
              Search the Quranic morphology databases for lemmas, roots, and stems. Click an ayah reference to jump into the reader.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
          <div className="space-y-2">
            <Label htmlFor="morphology-scope">Search scope</Label>
            <Select value={scope} onValueChange={(value: MorphologyWordScope) => setScope(value)}>
              <SelectTrigger id="morphology-scope" className="border-maroon-200">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                {scopeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{helperText}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="morphology-query">Keyword or pattern</Label>
            <div className="relative">
              <Input
                id="morphology-query"
                placeholder="Enter Arabic text, transliteration, or root pattern"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pr-10 border-maroon-200 focus-visible:ring-maroon-500"
                autoComplete="off"
              />
              <Sparkles className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              Use partial text to surface related morphology families instantly.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-maroon-100 bg-cream-50/70">
          <ScrollArea className="max-h-[24rem]">
            <div className="divide-y divide-maroon-100">
              {remote.status === "idle" && (
                <EmptyState message="Start typing to explore the morphology lexicon." />
              )}
              {remote.status === "loading" && (
                <LoadingState previousResults={remote.results} />
              )}
              {remote.status === "error" && <ErrorState message={remote.message} />}
              {remote.status === "empty" && <EmptyState message="No matching entries were found. Refine your query." />}
              {remote.status === "success" && remote.results.map((result) => <ResultEntry key={`${result.scope}-${result.id}`} result={result} />)}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-6 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="px-6 py-10 text-center text-sm text-red-600">
      {message}
    </div>
  )
}

function LoadingState({ previousResults }: { previousResults: MorphologyWordSearchResult[] }) {
  if (!previousResults.length) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted-foreground animate-pulse">
        Fetching morphology insights…
      </div>
    )
  }

  return (
    <>
      {previousResults.map((result) => (
        <ResultEntry key={`cached-${result.scope}-${result.id}`} result={result} pending />
      ))}
    </>
  )
}

function ResultEntry({ result, pending = false }: { result: MorphologyWordSearchResult; pending?: boolean }) {
  const shimmer = pending ? "animate-pulse" : ""
  const summary = [
    result.transliteration && `Transliteration: ${result.transliteration}`,
    result.normalized && `Normalized: ${result.normalized}`,
  ]
    .filter(Boolean)
    .join(" \u2022 ")

  return (
    <div className={`px-6 py-5 transition-colors ${pending ? "bg-amber-50/50" : "hover:bg-amber-50/80"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className={`flex items-center gap-2 ${shimmer}`}>
            <span className={`${arabicFontClass}`}>{result.arabic}</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
              {result.scope.toUpperCase()}
            </Badge>
          </div>
          {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
          <div className="flex flex-wrap gap-2">
            {result.totalOccurrences != null && (
              <StatPill label="Occurrences" value={result.totalOccurrences.toLocaleString()} />
            )}
            {result.uniqueOccurrences != null && (
              <StatPill label="Unique words" value={result.uniqueOccurrences.toLocaleString()} />
            )}
            <StatPill label="Locations" value={result.locations.length.toLocaleString()} />
          </div>
        </div>
        <div className="max-w-md text-left">
          <p className="text-xs uppercase tracking-wide text-maroon-600 font-semibold mb-2">Occurrences</p>
          <div className="flex flex-wrap gap-2">
            {result.locations.slice(0, 24).map((location) => (
              <LocationBadge key={location} location={location} />
            ))}
            {result.locations.length > 24 && (
              <Badge variant="outline" className="border-dashed border-amber-300 text-amber-700">
                +{result.locations.length - 24} more
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
      {label}: <span className="tabular-nums">{value}</span>
    </span>
  )
}

function LocationBadge({ location }: { location: string }) {
  const [surah, ayah] = location.split(":")
  const href = `/reader?ayah=${encodeURIComponent(`${surah}:${ayah}`)}`
  return (
    <Badge
      variant="outline"
      className="border-maroon-200 text-maroon-700 hover:bg-maroon-100 hover:text-maroon-800"
      asChild
    >
      <Link href={href}>
        {location}
      </Link>
    </Badge>
  )
}
