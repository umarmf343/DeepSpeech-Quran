"use client"

import { useCallback, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Languages, Search } from "lucide-react"

type MorphologyResponse =
  | {
      verseKey: string
      morphology: { lemma?: string | null; root?: string | null; stem?: string | null }
    }
  | {
      wordLocation: string
      morphology: {
        lemma?: { text: string; textClean?: string | null } | null
        root?: { arabicTrilateral: string | null; englishTrilateral: string | null } | null
        stem?: { text: string; textClean?: string | null } | null
      }
    }

export function MorphologyExplorer() {
  const [query, setQuery] = useState("1:1")
  const [mode, setMode] = useState<"verse" | "word">("verse")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MorphologyResponse | null>(null)

  const runLookup = useCallback(async () => {
    if (!query.trim()) {
      toast.error("Enter a verse key or word location to query the corpus")
      return
    }

    try {
      setIsLoading(true)
      setResult(null)
      const params = new URLSearchParams(mode === "verse" ? { verse: query.trim() } : { word: query.trim() })
      const response = await fetch(`/api/morphology?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Lookup failed with status ${response.status}`)
      }
      const payload = (await response.json()) as MorphologyResponse
      setResult(payload)
    } catch (error) {
      console.error("Morphology lookup failed", error)
      toast.error("Unable to load morphology records. Double-check the reference.")
    } finally {
      setIsLoading(false)
    }
  }, [mode, query])

  const showAyah = mode === "verse" && result && "verseKey" in result
  const showWord = mode === "word" && result && "wordLocation" in result

  return (
    <Card className="border-maroon-100 bg-gradient-to-br from-white via-rose-50/70 to-maroon-50/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-maroon-900">
          <Languages className="h-5 w-5 text-maroon-600" /> Quranic grammar companion
        </CardTitle>
        <CardDescription>
          Surface lemmas, roots, and stems on demand for tajwīd coaching, vocabulary drills, and adaptive flashcards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
          <TabsList className="bg-maroon-100/70">
            <TabsTrigger value="verse">Verse morphology</TabsTrigger>
            <TabsTrigger value="word">Word lookup</TabsTrigger>
          </TabsList>
          <TabsContent value="verse">
            <div className="mt-4 space-y-3">
              <Label htmlFor="morphology-verse">Verse key (e.g. 2:255)</Label>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  id="morphology-verse"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="2:255"
                  className="flex-1 border-maroon-100 focus-visible:ring-maroon-400"
                />
                <Button onClick={runLookup} className="bg-maroon-600 hover:bg-maroon-700">
                  <Search className="mr-2 h-4 w-4" /> Analyze
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="word">
            <div className="mt-4 space-y-3">
              <Label htmlFor="morphology-word">Word location (surah:ayah:word)</Label>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  id="morphology-word"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="36:58:2"
                  className="flex-1 border-maroon-100 focus-visible:ring-maroon-400"
                />
                <Button onClick={runLookup} className="bg-maroon-600 hover:bg-maroon-700">
                  <Search className="mr-2 h-4 w-4" /> Inspect
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4 bg-maroon-100/70" />
            <Skeleton className="h-6 w-2/3 bg-maroon-100/70" />
            <Skeleton className="h-6 w-1/2 bg-maroon-100/70" />
          </div>
        ) : null}

        {showAyah && result ? (
          <div className="rounded-2xl border border-maroon-100 bg-white/80 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-maroon-600 text-white shadow-sm">{result.verseKey}</Badge>
              <p className="text-sm text-maroon-700">Verse-level morphology aligned with the Mushaf layout.</p>
            </div>
            <dl className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-maroon-50/70 p-3">
                <dt className="text-xs uppercase tracking-wide text-maroon-600">Lemma bundle</dt>
                <dd className="mt-2 text-sm font-medium text-maroon-900">{result.morphology.lemma ?? "—"}</dd>
              </div>
              <div className="rounded-xl bg-maroon-50/70 p-3">
                <dt className="text-xs uppercase tracking-wide text-maroon-600">Root stack</dt>
                <dd className="mt-2 text-sm font-medium text-maroon-900">{result.morphology.root ?? "—"}</dd>
              </div>
              <div className="rounded-xl bg-maroon-50/70 p-3">
                <dt className="text-xs uppercase tracking-wide text-maroon-600">Stem forms</dt>
                <dd className="mt-2 text-sm font-medium text-maroon-900">{result.morphology.stem ?? "—"}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {showWord && result ? (
          <div className="rounded-2xl border border-maroon-100 bg-white/80 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-maroon-600 text-white shadow-sm">{result.wordLocation}</Badge>
              <p className="text-sm text-maroon-700">Cross-reference to the lemma, root, and stem catalogue.</p>
            </div>
            <dl className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-maroon-50/70 p-3">
                <dt className="text-xs uppercase tracking-wide text-maroon-600">Lemma</dt>
                <dd className="mt-2 text-sm font-medium text-maroon-900">
                  {result.morphology.lemma?.text ?? "—"}
                  {result.morphology.lemma?.textClean ? (
                    <span className="block text-xs text-maroon-600">{result.morphology.lemma.textClean}</span>
                  ) : null}
                </dd>
              </div>
              <div className="rounded-xl bg-maroon-50/70 p-3">
                <dt className="text-xs uppercase tracking-wide text-maroon-600">Root</dt>
                <dd className="mt-2 text-sm font-medium text-maroon-900">
                  {result.morphology.root?.arabicTrilateral ?? "—"}
                  {result.morphology.root?.englishTrilateral ? (
                    <span className="block text-xs text-maroon-600">{result.morphology.root.englishTrilateral}</span>
                  ) : null}
                </dd>
              </div>
              <div className="rounded-xl bg-maroon-50/70 p-3">
                <dt className="text-xs uppercase tracking-wide text-maroon-600">Stem</dt>
                <dd className="mt-2 text-sm font-medium text-maroon-900">
                  {result.morphology.stem?.text ?? "—"}
                  {result.morphology.stem?.textClean ? (
                    <span className="block text-xs text-maroon-600">{result.morphology.stem.textClean}</span>
                  ) : null}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
