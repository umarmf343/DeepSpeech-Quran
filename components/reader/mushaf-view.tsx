"use client"

import { useEffect, useRef } from "react"

import type { Ayah } from "@/lib/quran-api"
import { cn } from "@/lib/utils"

interface MushafViewProps {
  ayahs: Ayah[]
  selectedAyahNumber: number | null
  nightMode?: boolean
}

export function MushafView({ ayahs, selectedAyahNumber, nightMode = false }: MushafViewProps) {
  const selectedAyahRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (selectedAyahRef.current) {
      selectedAyahRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [selectedAyahNumber, ayahs.length])

  if (!ayahs.length) {
    return (
      <div
        className={cn(
          "flex min-h-[200px] items-center justify-center rounded-xl border border-dashed text-sm",
          nightMode ? "border-emerald-500/40 text-emerald-200" : "border-emerald-200 text-emerald-700",
        )}
      >
        Select a surah and ayah to preview the Mushaf layout.
      </div>
    )
  }

  return (
    <div
      className={cn(
        "max-h-[480px] overflow-y-auto rounded-xl border",
        nightMode
          ? "border-emerald-500/40 bg-slate-900/70 shadow-inner"
          : "border-emerald-200 bg-emerald-50/40",
      )}
    >
      <div className="space-y-6 px-6 py-8">
        {ayahs.map((ayah) => {
          const isSelected = selectedAyahNumber === ayah.numberInSurah

          return (
            <div
              key={ayah.number}
              ref={isSelected ? selectedAyahRef : undefined}
              className={cn(
                "rounded-lg border px-5 py-4 transition-colors",
                nightMode
                  ? "border-transparent bg-slate-900/40 text-amber-100"
                  : "border-transparent bg-white/80 text-maroon-900",
                isSelected &&
                  (nightMode
                    ? "border-emerald-400/60 bg-emerald-900/50 shadow-lg"
                    : "border-emerald-300 bg-emerald-100/70 shadow-md"),
              )}
            >
              <div className="flex flex-row-reverse items-start gap-4">
                <p className="flex-1 text-right font-arabic text-3xl leading-loose" dir="rtl">
                  {ayah.text}
                </p>
                <span
                  className={cn(
                    "mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                    nightMode
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-emerald-100 text-emerald-700",
                  )}
                  aria-label={`Ayah ${ayah.numberInSurah}`}
                >
                  {ayah.numberInSurah}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
