import PomodoroTimer from '@js/timer.ts'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { createMockLocalStorage } from './setup'

describe('PomodoroTimer advanced', () => {
  beforeEach(() => {
    globalThis.localStorage = createMockLocalStorage() as unknown as Storage
    ;(globalThis as typeof globalThis & { playTone: Mock }).playTone = vi.fn()
  })

  it('advanceMode cycles correctly', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.state.completedSessions = 3
    timer.settings.longBreakInterval = 4
    timer.advanceMode()
    expect(timer.state.mode).toBe('shortBreak')

    timer.state.mode = 'focus'
    timer.state.completedSessions = 4
    timer.advanceMode()
    expect(timer.state.mode).toBe('longBreak')

    timer.state.mode = 'shortBreak'
    timer.advanceMode()
    expect(timer.state.mode).toBe('focus')
  })

  it('saveStats and loadStats round trip', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.state.completedSessions = 2
    timer.saveStats()
    const saved = JSON.parse(
      (globalThis.localStorage.setItem as unknown as Mock).mock.calls[0][1],
    )
    globalThis.localStorage.getItem = vi.fn(() => JSON.stringify(saved))

    const timer2 = new PomodoroTimer({ skipInit: true })
    timer2.loadStats()
    expect(timer2.state.completedSessions).toBe(2)
  })
})
