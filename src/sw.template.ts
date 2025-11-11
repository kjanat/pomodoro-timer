/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

// __CACHE_NAME__ and __PRECACHE_MANIFEST__ will be injected at build time
const CACHE_NAME = '__CACHE_NAME__'
// @ts-expect-error: __PRECACHE_MANIFEST__ is injected at build time
const PRECACHE_MANIFEST = __PRECACHE_MANIFEST__ as string[]

// Runtime cache for external resources
const RUNTIME_CACHE = 'runtime-cache-v1'
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
]

// Install: precache all build artifacts
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...PRECACHE_MANIFEST, ...EXTERNAL_RESOURCES])
    }),
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name)),
      )
    }),
  )
  // Take control of all clients immediately
  self.clients.claim()
})

// Fetch: cache-first strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      // Not in cache, fetch from network
      return fetch(event.request).then((response) => {
        // Only cache successful GET requests
        if (
          !response ||
          response.status !== 200 ||
          response.type === 'error' ||
          event.request.method !== 'GET'
        ) {
          return response
        }

        // Cache external resources in runtime cache
        const isExternal = event.request.url.startsWith('https://fonts.g')
        if (isExternal) {
          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return response
      })
    }),
  )
})
