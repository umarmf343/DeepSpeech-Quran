const ARABIC_LETTER_MIN = 0x0621
const ARABIC_LETTER_MAX = 0x064A
const EXCLUDED_CODEPOINTS = new Set([0x0640])

/**
 * Determines whether a character is an Arabic letter that should contribute to the hasanat tally.
 * Only letters in the Unicode range 0621–064A are counted, with tatweel and diacritics excluded.
 */
export function isCountableArabicLetter(character: string): boolean {
  if (!character) return false

  const codePoint = character.codePointAt(0)
  if (!codePoint) return false

  if (codePoint < ARABIC_LETTER_MIN || codePoint > ARABIC_LETTER_MAX) {
    return false
  }

  if (EXCLUDED_CODEPOINTS.has(codePoint)) {
    return false
  }

  return true
}

/**
 * Counts the number of Arabic letters present in a string.
 *
 * The function iterates through the string using Array.from to properly handle surrogate pairs
 * and excludes diacritics and punctuation. Only the primary Arabic letters are counted.
 */
export function countArabicLetters(text: string): number {
  if (!text) return 0

  let count = 0
  for (const character of Array.from(text)) {
    if (isCountableArabicLetter(character)) {
      count += 1
    }
  }

  return count
}

/**
 * Normalises a verse key based on its surah and ayah number.
 */
export function buildVerseKey(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`
}

/**
 * Converts a letter count into hasanat using the canonical 10 hasanat per letter rule.
 */
export function hasanatFromLetters(letterCount: number): number {
  if (!Number.isFinite(letterCount) || letterCount <= 0) {
    return 0
  }
  return letterCount * 10
}

