import { describe, it, expect, vi, beforeEach } from 'vitest'
import PomodoroTimer from '../src/js/timer.ts'

describe('PomodoroTimer advanced', () => {
  beforeEach(() => {
    global.localStorage = { setItem: vi.fn(), getItem: vi.fn() } as any
    ;(global as any).playTone = vi.fn()
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
      (global.localStorage.setItem as any).mock.calls[0][1]
    )
    global.localStorage.getItem = vi.fn(() => JSON.stringify(saved)) as any

    const timer2 = new PomodoroTimer({ skipInit: true })
    timer2.loadStats()
    expect(timer2.state.completedSessions).toBe(2)
  })
})
