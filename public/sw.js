const CACHE_NAME = "quran-reader-cache-v1"
const API_ORIGIN = "https://api.alquran.cloud"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
            return Promise.resolve(true)
          }),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const isApiRequest = request.url.startsWith(API_ORIGIN)
  const isAudio = request.destination === "audio" || request.url.endsWith(".mp3")

  if (!isApiRequest && !isAudio) {
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone()).catch(() => {})
          }
          return response
        })
        .catch(() => cached)

      return cached ?? fetchPromise
    }),
  )
})

self.addEventListener("message", (event) => {
  const data = event.data
  if (!data) return
  if (data.type === "PRECACHE_AUDIO" && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) =>
        Promise.all(
          data.urls.map((url) =>
            cache.add(url).catch(() => {
              // Ignore failures so one missing file doesn't abort the whole preload
            }),
          ),
        ),
      ),
    )
  }
})
