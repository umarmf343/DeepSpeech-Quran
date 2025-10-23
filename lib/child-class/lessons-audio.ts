const ARABIC_KEY_REGEX = /\p{Script=Arabic}/u

export const normalizeArabicKey = (text: string) =>
  text
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()

export const LETTER_AUDIO_MAP: Record<string, string> = {}

export const registerLessonAudio = (text: string, audioSrc: string) => {
  const normalized = normalizeArabicKey(text)
  if (!normalized) return
  if (!ARABIC_KEY_REGEX.test(normalized)) return

  if (!LETTER_AUDIO_MAP[normalized]) {
    LETTER_AUDIO_MAP[normalized] = audioSrc
  }
}
