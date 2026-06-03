/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'pomodoro-timer-v2'

// Only precache the stable app shell. The JS/CSS bundles get content-hashed
// filenames at build time, so they cannot be listed here by name — they are
// cached at runtime on first request instead (see the fetch handler).
const urlsToCache = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
]

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        // Runtime-cache successful GET responses (hashed bundles, manifest,
        // fonts) so the app works offline after the first visit.
        if (response && response.status === 200) {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => {
            void cache.put(event.request, copy)
          })
        }
        return response
      })
    })
  )
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
          return null
        })
      )
    })
  )
})

export {}
