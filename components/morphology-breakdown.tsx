"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sparkles } from "lucide-react"
import type { MorphologyResponse } from "@/types/morphology"

interface MorphologyBreakdownProps {
  ayahReference: string
  highlightWord?: string
  ayahText?: string
  initialData?: MorphologyResponse | null
}

export function MorphologyBreakdown({ ayahReference, highlightWord, ayahText, initialData }: MorphologyBreakdownProps) {
  const [data, setData] = useState<MorphologyResponse | null>(initialData ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadMorphology() {
      if (initialData && initialData.ayah === ayahReference) {
        setData(initialData)
        return
      }

      if (!ayahReference) {
        setData(null)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ ayah: ayahReference })
        if (ayahText) {
          params.set("text", ayahText)
        }
        const response = await fetch(`/api/morphology?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Unable to load morphology data (${response.status})`)
        }
        const payload: MorphologyResponse = await response.json()
        if (!ignore) {
          setData(payload)
        }
      } catch (fetchError) {
        console.error("Failed to load morphology data", fetchError)
        if (!ignore) {
          setError("Morphology data unavailable")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadMorphology()

    return () => {
      ignore = true
    }
  }, [ayahReference, ayahText, initialData])

  const entry = useMemo(() => data, [data])

  if (isLoading) {
    return (
      <Card className="border-maroon-200/60 shadow-sm animate-pulse">
        <CardContent className="p-6 text-sm text-gray-500">Loading morphology insights…</CardContent>
      </Card>
    )
  }

  if (error || !entry) {
    return (
      <Card className="border-dashed border-maroon-200/40">
        <CardContent className="p-6 text-sm text-gray-500">{error ?? "Morphology insights will appear after analysis."}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-maroon-200/60 shadow-sm">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-maroon-800 flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-amber-500" /> Morphology Insights
        </CardTitle>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
          Ayah {entry.ayah}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">Arabic</TableHead>
              <TableHead>Lemma</TableHead>
              <TableHead>Root</TableHead>
              <TableHead>Stem / Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.words.map((word, index) => {
              const isHighlighted = highlightWord ? word.arabic.includes(highlightWord) : false
              return (
                <TableRow
                  key={`${entry.ayah}-${index}-${word.arabic}`}
                  className={`transition-colors ${isHighlighted ? "bg-amber-50/80" : "hover:bg-cream-100"}`}
                >
                  <TableCell className="font-arabic text-xl text-right text-maroon-900">{word.arabic}</TableCell>
                  <TableCell className="font-medium text-maroon-700">{word.lemma ?? "—"}</TableCell>
                  <TableCell className="text-sm text-gray-600">{word.root ?? "—"}</TableCell>
                  <TableCell className="text-sm text-gray-600">{word.stem ?? "—"}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900 animate-in fade-in-50">
          <p className="font-semibold mb-1">Summary</p>
          <p className="mb-1"><span className="font-medium">Lemmas:</span> {entry.summary.lemmas ?? "—"}</p>
          <p className="mb-1"><span className="font-medium">Roots:</span> {entry.summary.roots ?? "—"}</p>
          <p><span className="font-medium">Stems:</span> {entry.summary.stems ?? "—"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
