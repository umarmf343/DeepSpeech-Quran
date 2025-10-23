import type { ReactNode } from "react"

import { ArabicAudioButton } from "./arabic-audio-button"

const BASE_CARD_CLASSES =
  "inline-flex items-center justify-center rounded-2xl bg-white/90 px-4 py-2 text-black text-[1.2em] font-black shadow-[0_6px_16px_rgba(15,23,42,0.12)] border border-white/70"

interface ArabicLetterCardProps {
  children: ReactNode
  className?: string
}

export function ArabicLetterCard({ children, className }: ArabicLetterCardProps) {
  return (
    <span className={`${BASE_CARD_CLASSES} ${className ?? ""}`.trim()}>{children}</span>
  )
}

const ARABIC_SEGMENT_REGEX = /(\p{Script=Arabic}+)/gu
const ARABIC_CHARACTER_REGEX = /\p{Script=Arabic}/u

export function renderTextWithArabicCard(text: string): ReactNode[] {
  return text
    .split(ARABIC_SEGMENT_REGEX)
    .filter(Boolean)
    .map((part, index) => {
      if (!ARABIC_CHARACTER_REGEX.test(part)) {
        return <span key={`text-${index}`}>{part}</span>
      }

      const trimmedPart = part.trim()
      if (!trimmedPart) {
        return <span key={`arabic-${index}`}>{part}</span>
      }

      return (
        <span
          key={`arabic-${index}`}
          className="inline-flex items-center gap-2 align-middle"
        >
          <ArabicLetterCard>{part}</ArabicLetterCard>
          <ArabicAudioButton
            text={trimmedPart}
            variant="icon"
            ariaLabel={`Play pronunciation for ${trimmedPart}`}
          />
        </span>
      )
    })
}
