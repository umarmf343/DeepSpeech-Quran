const DB_NAME = "quran-reader-audio"
const STORE_NAME = "audio"
const DB_VERSION = 1

export interface PlayRequest {
  verseKey: string
  url: string
  playbackRate: number
  volume: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

async function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") {
    return null
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"))
  })
}

async function readFromCache(db: IDBDatabase | null, key: string): Promise<Blob | null> {
  if (!db) return null
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(key)
    request.onsuccess = () => {
      resolve(request.result ?? null)
    }
    request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"))
  })
}

async function writeToCache(db: IDBDatabase | null, key: string, value: Blob): Promise<void> {
  if (!db) return
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(value, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error("IndexedDB write failed"))
  })
}

export class AudioPlayerService {
  private audio: HTMLAudioElement
  private dbPromise: Promise<IDBDatabase | null>
  private currentKey: string | null = null
  private loadingUrl: string | null = null

  constructor() {
    this.audio = new Audio()
    this.audio.preload = "auto"
    this.audio.controls = false
    this.audio.loop = false
    this.dbPromise = openDatabase().catch(() => null)
  }

  async play(request: PlayRequest): Promise<void> {
    const db = await this.dbPromise
    const cacheKey = `${request.verseKey}|${request.url}`

    if (this.currentKey === cacheKey && !this.audio.paused) {
      this.audio.pause()
      return
    }

    if (!this.audio.paused) {
      this.audio.pause()
    }

    request.onStart?.()
    this.currentKey = cacheKey
    this.audio.playbackRate = request.playbackRate
    this.audio.volume = request.volume

    try {
      let blob = await readFromCache(db, cacheKey)
      if (!blob) {
        this.loadingUrl = request.url
        const response = await fetch(request.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`)
        }
        const buffer = await response.arrayBuffer()
        blob = new Blob([buffer], { type: "audio/mpeg" })
        await writeToCache(db, cacheKey, blob)
      }

      if (this.loadingUrl) {
        this.loadingUrl = null
      }

      const objectUrl = URL.createObjectURL(blob)
      this.audio.src = objectUrl
      await this.audio.play()
      this.audio.onended = () => {
        request.onEnd?.()
        URL.revokeObjectURL(objectUrl)
      }
    } catch (error) {
      request.onError?.(error instanceof Error ? error : new Error("Audio playback failed"))
    }
  }

  pause() {
    if (!this.audio.paused) {
      this.audio.pause()
    }
  }

  isPlaying(verseKey: string, url: string): boolean {
    return this.currentKey === `${verseKey}|${url}` && !this.audio.paused
  }
}

export function createAudioPlayerService() {
  return new AudioPlayerService()
}
