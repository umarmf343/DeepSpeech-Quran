const DB_NAME = "assignment-drafts"
const STORE_NAME = "drafts"
const DB_VERSION = 1

interface DraftRecord<T> {
  id: string
  updatedAt: number
  payload: T
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment"))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }
  })
}

export async function saveAssignmentDraft<T>(id: string, payload: T) {
  try {
    const db = await openDatabase()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const record: DraftRecord<T> = { id, updatedAt: Date.now(), payload }
    store.put(record)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error("Failed to write draft"))
      tx.onabort = () => reject(tx.error ?? new Error("Draft write aborted"))
    })
    db.close()
  } catch (error) {
    console.warn("Failed to persist assignment draft", error)
  }
}

export async function loadAssignmentDraft<T>(id: string): Promise<T | null> {
  try {
    const db = await openDatabase()
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)

    const record: DraftRecord<T> | undefined = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as DraftRecord<T>)
      request.onerror = () => reject(request.error)
    })

    db.close()

    if (!record) return null
    return record.payload
  } catch (error) {
    console.warn("Failed to restore assignment draft", error)
    return null
  }
}

export async function clearAssignmentDraft(id: string) {
  try {
    const db = await openDatabase()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error("Failed to clear draft"))
      tx.onabort = () => reject(tx.error ?? new Error("Draft clear aborted"))
    })
    db.close()
  } catch (error) {
    console.warn("Failed to clear assignment draft", error)
  }
}
