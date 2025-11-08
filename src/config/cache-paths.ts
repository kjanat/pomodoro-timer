/**
 * Type-safe cache paths configuration for service worker
 * Build output uses hashed chunks, so we cache strategically
 */

export const STATIC_CACHE_PATHS = {
  root: '/',
  html: '/index.html',
  manifest: '/manifest.json',
} as const

export const EXTERNAL_CACHE_PATHS = {
  fonts:
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
} as const

export type StaticCachePath =
  (typeof STATIC_CACHE_PATHS)[keyof typeof STATIC_CACHE_PATHS]
export type ExternalCachePath =
  (typeof EXTERNAL_CACHE_PATHS)[keyof typeof EXTERNAL_CACHE_PATHS]

/**
 * Returns static URLs that should be cached during service worker installation.
 * Note: Hashed JS/CSS chunks are discovered and cached dynamically via fetch events.
 */
export function getStaticCacheUrls(): readonly string[] {
  return [
    ...Object.values(STATIC_CACHE_PATHS),
    ...Object.values(EXTERNAL_CACHE_PATHS),
  ] as const
}
