"use client"

import type React from "react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MUSHAF_VARIANTS, type MushafVariantId } from "@/data/mushaf-variants"
import { cn } from "@/lib/utils"
import { BookOpenCheck, Palette } from "lucide-react"

export interface MushafVariantSelectorProps {
  value: MushafVariantId
  onChange?: (variant: MushafVariantId) => void
}

const iconMap: Record<MushafVariantId, React.ComponentType<{ className?: string }>> = {
  hafs: BookOpenCheck,
  tajweed: Palette,
}

export function MushafVariantSelector({ value, onChange }: MushafVariantSelectorProps) {
  const selectedVariant = useMemo(() => MUSHAF_VARIANTS.find((variant) => variant.id === value), [value])

  return (
    <Card className="border-maroon-100 bg-gradient-to-br from-white via-rose-50/70 to-maroon-50/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-maroon-900">Mushaf layouts</CardTitle>
        <CardDescription>
          Switch between classic Madīnah typography and tajwīd-coloured layouts sourced from the research bundle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {MUSHAF_VARIANTS.map((variant) => {
            const Icon = iconMap[variant.id]
            const isActive = selectedVariant?.id === variant.id
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onChange?.(variant.id)}
                className={cn(
                  "group rounded-2xl border p-4 text-start transition-all",
                  isActive
                    ? "border-maroon-300 bg-white/90 shadow-md ring-2 ring-maroon-200"
                    : "border-maroon-100 bg-white/60 hover:border-maroon-200 hover:bg-white/80",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon-100 text-maroon-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-maroon-900">{variant.title}</p>
                      <p className="text-xs text-maroon-600">{variant.layoutFile}</p>
                    </div>
                  </div>
                  {isActive ? (
                    <Badge className="bg-maroon-600 text-white shadow-sm">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="border-dashed border-maroon-200 text-maroon-700">
                      Tap to use
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-sm text-maroon-700">{variant.description}</p>
                <ul className="mt-3 space-y-2">
                  {variant.notes.map((note) => (
                    <li
                      key={note}
                      className="flex items-start gap-2 rounded-xl bg-maroon-50/70 p-2 text-xs text-maroon-700 transition-all group-hover:bg-maroon-50"
                    >
                      <span className="mt-0.5 inline-flex h-1.5 w-1.5 rounded-full bg-maroon-400" aria-hidden />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
        {selectedVariant ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
            <Badge className="bg-emerald-500 text-white shadow-sm">Synced</Badge>
            <p className="text-sm text-emerald-800">
              Layout metadata streamed from <span className="font-semibold">{selectedVariant.layoutFile}</span>.
              Use it to align recitation checkpoints and gamified overlays.
            </p>
          </div>
        ) : null}
        <div className="rounded-2xl border border-maroon-100 bg-white/70 p-4">
          <p className="text-sm font-semibold text-maroon-800">Need more scripts?</p>
          <p className="mt-1 text-sm text-maroon-700">
            Drop in any of the Madīnah, IndoPak, or Warsh packages from the research archive and they&apos;ll surface here
            automatically.
          </p>
          <Button
            variant="link"
            className="mt-2 h-auto p-0 text-maroon-700"
            onClick={() => window.open("https://github.com/mozilla/DeepSpeech/tree/master/doc", "_blank")}
          >
            Explore the DeepSpeech training notes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
