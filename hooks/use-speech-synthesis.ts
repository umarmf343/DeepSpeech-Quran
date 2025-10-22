"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface SpeakOptions {
  id?: string
  text: string
  lang?: string
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (event: SpeechSynthesisErrorEvent) => void
}

interface SpeechSynthesisState {
  supported: boolean
  voices: SpeechSynthesisVoice[]
  speak: (options: SpeakOptions) => boolean
  cancel: () => void
  speakingId: string | null
  isSpeaking: boolean
}

const safeSpeechSynthesis: () => SpeechSynthesis | null = () => {
  if (typeof window === "undefined") return null
  if (!("speechSynthesis" in window)) return null
  return window.speechSynthesis
}

export function useSpeechSynthesis(): SpeechSynthesisState {
  const synthesisRef = useRef<SpeechSynthesis | null>(safeSpeechSynthesis())
  const [supported, setSupported] = useState<boolean>(() => synthesisRef.current !== null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    synthesisRef.current?.getVoices() ?? [],
  )
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const synthesis = safeSpeechSynthesis()
    synthesisRef.current = synthesis
    setSupported(synthesis !== null)
    if (!synthesis) {
      setVoices([])
      return
    }

    const updateVoices = () => {
      setVoices(synthesis.getVoices())
    }

    updateVoices()

    const boundUpdate = () => updateVoices()
    synthesis.addEventListener?.("voiceschanged", boundUpdate)
    if ("onvoiceschanged" in synthesis) {
      synthesis.onvoiceschanged = boundUpdate
    }

    return () => {
      synthesis.removeEventListener?.("voiceschanged", boundUpdate)
      if ("onvoiceschanged" in synthesis) {
        synthesis.onvoiceschanged = null
      }
    }
  }, [])

  const cancel = useCallback(() => {
    const synthesis = synthesisRef.current
    if (!synthesis) return
    synthesis.cancel()
    utteranceRef.current = null
    setIsSpeaking(false)
    setSpeakingId(null)
  }, [])

  const speak = useCallback(
    ({ id, text, lang, voice, rate, pitch, volume, onStart, onEnd, onError }: SpeakOptions) => {
      const synthesis = synthesisRef.current
      if (!synthesis || !text.trim()) {
        return false
      }

      synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      if (lang) {
        utterance.lang = lang
      }
      if (voice) {
        utterance.voice = voice
      }
      if (typeof rate === "number") {
        utterance.rate = rate
      }
      if (typeof pitch === "number") {
        utterance.pitch = pitch
      }
      if (typeof volume === "number") {
        utterance.volume = volume
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setSpeakingId(id ?? null)
        onStart?.()
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        setSpeakingId((current) => (current === id ? null : current))
        utteranceRef.current = null
        onEnd?.()
      }
      utterance.onerror = (event) => {
        setIsSpeaking(false)
        setSpeakingId((current) => (current === id ? null : current))
        utteranceRef.current = null
        onError?.(event)
      }

      utteranceRef.current = utterance
      synthesis.speak(utterance)
      return true
    },
    [],
  )

  return useMemo(
    () => ({ supported, voices, speak, cancel, speakingId, isSpeaking }),
    [supported, voices, speak, cancel, speakingId, isSpeaking],
  )
}
