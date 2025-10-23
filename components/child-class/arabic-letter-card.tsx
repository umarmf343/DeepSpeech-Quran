"use client"

import type { ReactNode } from "react"
import { AudioPlayButton } from "./audio-play-button"
import { LETTER_AUDIO_MAP, normalizeArabicKey } from "@/lib/child-class/lessons-audio"

const BASE_CARD_CLASSES =
  "relative inline-flex items-center justify-center rounded-2xl bg-white/90 px-4 py-2 text-black text-[1.2em] font-black shadow-[0_6px_16px_rgba(15,23,42,0.12)] border border-white/70"

interface ArabicLetterCardProps {
  children: ReactNode
  className?: string
}

export function ArabicLetterCard({ children, className }: ArabicLetterCardProps) {
  const text = typeof children === "string" ? children : ""
  const normalizedText = normalizeArabicKey(text)
  const audioSrc = normalizedText ? LETTER_AUDIO_MAP[normalizedText] : undefined

  return (
    <span className={`${BASE_CARD_CLASSES} ${className ?? ""}`.trim()}>
      <span>{children}</span>
      {normalizedText && (
        <AudioPlayButton
          audioSrc={audioSrc}
          fallbackText={text}
          label={`Play pronunciation for ${text}`}
          className="absolute -right-3 -top-3 h-10 w-10 border border-maroon/10 bg-white/95 text-maroon shadow-lg"
        />
      )}
    </span>
  )
}

const ARABIC_SEGMENT_REGEX = /(\p{Script=Arabic}+)/gu
const ARABIC_CHARACTER_REGEX = /\p{Script=Arabic}/u

export function renderTextWithArabicCard(text: string): ReactNode[] {
  return text
    .split(ARABIC_SEGMENT_REGEX)
    .filter(Boolean)
    .map((part, index) =>
      ARABIC_CHARACTER_REGEX.test(part) ? (
        <ArabicLetterCard key={`arabic-${index}`}>{part}</ArabicLetterCard>
      ) : (
        <span key={`text-${index}`}>{part}</span>
      ),
    )
}
