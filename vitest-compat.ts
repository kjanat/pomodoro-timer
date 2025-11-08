// Bun provides 'vi' global for Vitest compatibility
// This module provides a compatibility layer for Vitest tests

import { vi as bunVi, mock } from 'bun:test'
import { IS_BUN_TEST, scaleTime } from '@js/time-config'

// Polyfill vi.advanceTimersByTime for Bun (it doesn't support it natively)
// In bun:test, this waits using real scaled timers
// In vitest, the original function is used
if (typeof (bunVi as any).advanceTimersByTime === 'undefined') {
  ;(bunVi as any).advanceTimersByTime = (ms: number) => {
    // Use Bun.sleepSync for synchronous wait in bun:test
    if (typeof Bun !== 'undefined' && typeof Bun.sleepSync === 'function') {
      Bun.sleepSync(scaleTime(ms))
    }
  }
}

// Polyfill vi.runAllTimers for Bun (it doesn't support it natively)
// This is a no-op in bun:test since timers run automatically with sleepSync
if (typeof (bunVi as any).runAllTimers === 'undefined') {
  ;(bunVi as any).runAllTimers = () => {
    // No-op for Bun - timers are executed during advanceTimersByTime
  }
}

// Mock the 'vitest' module to redirect imports to bun:test
// This allows existing tests that import from 'vitest' to work with Bun
mock.module('vitest', () => {
  return {
    describe,
    it,
    test,
    expect,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
    vi: bunVi,
  }
})

// Helper function for advancing time in tests
// Works with both vitest fake timers and bun:test real scaled timers
export const advanceTime = async (ms: number): Promise<void> => {
  // Check if we're using fake timers (vitest)
  if (typeof (vi as any).advanceTimersByTime === 'function') {
    // Vitest with fake timers
    ;(vi as any).advanceTimersByTime(ms)
  } else {
    // Bun:test with real scaled timers
    await new Promise((resolve) => setTimeout(resolve, scaleTime(ms)))
  }
}

// Re-export commonly used test utilities for convenience
export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
  vi,
} from 'bun:test'
