/// <reference lib="webworker" />

import { getStaticCacheUrls } from './config/cache-paths'

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'pomodoro-timer-v1'
const urlsToCache = getStaticCacheUrls()

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      // Cache dynamic assets (hashed chunks) on first fetch
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

        // Clone the response since it can only be consumed once
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
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
        }),
      )
    }),
  )
})
