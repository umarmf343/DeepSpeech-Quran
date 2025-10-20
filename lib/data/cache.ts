type CacheRecord<T> = { value: T; expiresAt: number }

const cacheStore = new Map<string, CacheRecord<unknown>>()

export function getCached<T>(key: string): T | null {
  const record = cacheStore.get(key)
  if (!record) return null
  if (record.expiresAt < Date.now()) {
    cacheStore.delete(key)
    return null
  }
  return record.value as T
}

export function setCached<T>(key: string, value: T, ttlMs: number) {
  cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function invalidateCache(keyPrefix: string) {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(keyPrefix)) {
      cacheStore.delete(key)
    }
  }
}
