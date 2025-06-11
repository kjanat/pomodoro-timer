import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import PomodoroTimer from '../src/js/timer.js'

describe('PomodoroTimer advanced', () => {
  let originalLocalStorage

  beforeEach(() => {
    originalLocalStorage = global.localStorage
    global.localStorage = { setItem: vi.fn(), getItem: vi.fn() }
  })

  afterEach(() => {
    global.localStorage = originalLocalStorage
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('advanceMode cycles correctly', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.settings.autoStartBreaks = false
    timer.settings.autoStartFocus = false
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
    const saved = JSON.parse(global.localStorage.setItem.mock.calls[0][1])
    global.localStorage.getItem = vi.fn(() => JSON.stringify(saved))

    const timer2 = new PomodoroTimer({ skipInit: true })
    timer2.loadStats()
    expect(timer2.state.completedSessions).toBe(2)
  })

  it('auto-starts break synchronously when enabled', () => {
    vi.useFakeTimers()
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    const startSpy = vi.spyOn(timer, 'start').mockImplementation(() => {})
    timer.state.mode = 'focus'
    timer.settings.autoStartBreaks = true
    timer.advanceMode()
    expect(startSpy).toHaveBeenCalled()
  })

  it('auto-starts focus synchronously when enabled', () => {
    vi.useFakeTimers()
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    const startSpy = vi.spyOn(timer, 'start').mockImplementation(() => {})
    timer.state.mode = 'shortBreak'
    timer.settings.autoStartFocus = true
    timer.advanceMode()
    expect(startSpy).toHaveBeenCalled()
  })

  it('delays advancing after completion', () => {
    vi.useFakeTimers()
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.saveStats = vi.fn()
    timer.showNotification = vi.fn()
    timer.clearScheduledSave = vi.fn()
    global.playTone = vi.fn()
    vi.spyOn(timer, 'advanceMode')
    timer.complete()
    expect(timer.advanceMode).not.toHaveBeenCalled()
    vi.advanceTimersByTime(999)
    expect(timer.advanceMode).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(timer.advanceMode).toHaveBeenCalled()
  })
})
