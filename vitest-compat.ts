// Bun already provides 'vi' global for Vitest compatibility
// Add missing timer APIs for full Vitest compatibility

import { afterEach, vi as bunVi } from 'bun:test'

// Timer state management for fake timer implementation
const timerState: {
  fakeTimersEnabled: boolean
  currentTime: number
  timers: Array<{ callback: () => void; executeAt: number; id: number }>
  originalSetTimeout: typeof setTimeout
  originalSetInterval: typeof setInterval
  originalClearTimeout: typeof clearTimeout
  originalClearInterval: typeof clearInterval
  nextId: number
} = {
  fakeTimersEnabled: false,
  currentTime: 0,
  timers: [],
  originalSetTimeout: globalThis.setTimeout,
  originalSetInterval: globalThis.setInterval,
  originalClearTimeout: globalThis.clearTimeout,
  originalClearInterval: globalThis.clearInterval,
  nextId: 1,
}

// Extend vi with timer APIs
const extendedVi = {
  ...bunVi,

  useFakeTimers: () => {
    if (timerState.fakeTimersEnabled) return

    timerState.fakeTimersEnabled = true
    timerState.currentTime = 0
    timerState.timers = []

    // Override global timer functions
    globalThis.setTimeout = ((callback: () => void, ms: number) => {
      const id = timerState.nextId++
      timerState.timers.push({
        callback,
        executeAt: timerState.currentTime + (ms || 0),
        id,
      })
      return id as unknown as NodeJS.Timeout
    }) as typeof setTimeout

    globalThis.clearTimeout = ((id: number) => {
      timerState.timers = timerState.timers.filter((t) => t.id !== id)
    }) as typeof clearTimeout
  },

  advanceTimersByTime: (ms: number) => {
    if (!timerState.fakeTimersEnabled) {
      throw new Error(
        'useFakeTimers() must be called before advanceTimersByTime()',
      )
    }

    timerState.currentTime += ms

    // Execute all timers that should have run by now
    const timersToExecute = timerState.timers.filter(
      (t) => t.executeAt <= timerState.currentTime,
    )

    // Sort by execution time
    timersToExecute.sort((a, b) => a.executeAt - b.executeAt)

    // Execute and remove
    for (const timer of timersToExecute) {
      timerState.timers = timerState.timers.filter((t) => t.id !== timer.id)
      timer.callback()
    }
  },

  runAllTimers: () => {
    if (!timerState.fakeTimersEnabled) {
      throw new Error('useFakeTimers() must be called before runAllTimers()')
    }

    // Execute all pending timers
    while (timerState.timers.length > 0) {
      const nextTimer = timerState.timers.reduce((earliest, current) =>
        current.executeAt < earliest.executeAt ? current : earliest,
      )

      timerState.currentTime = nextTimer.executeAt
      timerState.timers = timerState.timers.filter((t) => t.id !== nextTimer.id)
      nextTimer.callback()
    }
  },

  useRealTimers: () => {
    if (!timerState.fakeTimersEnabled) return

    // Restore original timer functions
    globalThis.setTimeout = timerState.originalSetTimeout
    globalThis.setInterval = timerState.originalSetInterval
    globalThis.clearTimeout = timerState.originalClearTimeout
    globalThis.clearInterval = timerState.originalClearInterval

    timerState.fakeTimersEnabled = false
    timerState.timers = []
    timerState.currentTime = 0
  },
}

// Auto-restore timers after each test
afterEach(() => {
  if (timerState.fakeTimersEnabled) {
    extendedVi.useRealTimers()
  }
})

// Override global vi with extended version
;(globalThis as unknown as { vi: typeof extendedVi }).vi = extendedVi

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
} from 'bun:test'
export { extendedVi as vi }
