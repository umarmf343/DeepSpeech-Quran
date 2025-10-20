"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { morphologyEntries } from "@/lib/integration-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sparkles } from "lucide-react"

interface MorphologyBreakdownProps {
  ayahReference: string
  highlightWord?: string
}

export function MorphologyBreakdown({ ayahReference, highlightWord }: MorphologyBreakdownProps) {
  const entry = useMemo(() => {
    return morphologyEntries.find((item) => item.ayah === ayahReference)
  }, [ayahReference])

  if (!entry) {
    return null
  }

  return (
    <Card className="border-maroon-200/60 shadow-sm">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-maroon-800 flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-amber-500" /> Morphology Insights
        </CardTitle>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
          Surah {entry.surahName} — Ayah {entry.ayah}
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
              <TableHead>Translation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.words.map((word) => {
              const isHighlighted = highlightWord ? word.arabic.includes(highlightWord) : false
              return (
                <TableRow
                  key={`${entry.ayah}-${word.arabic}`}
                  className={`transition-colors ${isHighlighted ? "bg-amber-50/80" : "hover:bg-cream-100"}`}
                >
                  <TableCell className="font-arabic text-xl text-right text-maroon-900">{word.arabic}</TableCell>
                  <TableCell className="font-medium text-maroon-700">{word.lemma}</TableCell>
                  <TableCell className="text-sm text-gray-600">{word.root}</TableCell>
                  <TableCell className="text-sm text-gray-600">{word.stem}</TableCell>
                  <TableCell className="text-sm text-gray-700">{word.translation}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {entry.words.some((word) => word.notes) && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900 animate-in fade-in-50">
            <p className="font-semibold mb-1">Teaching Notes</p>
            <ul className="list-disc ml-4 space-y-1">
              {entry.words
                .filter((word) => word.notes)
                .map((word) => (
                  <li key={`${entry.ayah}-${word.arabic}-note`}>
                    <span className="font-medium">{word.arabic}:</span> {word.notes}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
