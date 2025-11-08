/**
 * Time scaling configuration for testing environments
 *
 * In production: TIME_SCALE = 1.0 (normal speed)
 * In bun:test: TIME_SCALE = 0.001 (1000x faster - 1ms = 1 second)
 * In vitest: TIME_SCALE = 1.0 (normal speed, uses fake timers)
 *
 * This allows bun:test to run with real timers at accelerated speeds,
 * avoiding the need for fake timer APIs that aren't fully supported in Bun.
 * Vitest continues to use fake timers which work properly.
 */

// Detect if running in Bun test environment specifically (not vitest)
// Bun sets globalThis.Bun, vitest doesn't
export const IS_BUN_TEST =
  typeof globalThis.Bun !== 'undefined' &&
  (typeof (globalThis as any).jest !== 'undefined' ||
    typeof (globalThis as any).vi !== 'undefined')

// Time scaling factor: 0.001 for bun:test (1000x faster), 1.0 for production/vitest
export const TIME_SCALE = IS_BUN_TEST ? 0.001 : 1.0

/**
 * Scale a time duration based on the environment
 * @param ms - Time in milliseconds
 * @returns Scaled time (1ms in bun:test = 1 second in production)
 */
export function scaleTime(ms: number): number {
  return Math.floor(ms * TIME_SCALE)
}
