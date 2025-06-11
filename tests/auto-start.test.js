import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import PomodoroTimer from '../src/js/timer.js'

function setupDOM () {
  document.body.innerHTML = `
    <div id="timer-display"></div>
    <div id="current-mode"></div>
    <div id="session-count"></div>
    <button id="start-button"><span class="btn-text"></span><span class="btn-icon"></span></button>
    <button id="pause-button"></button>
    <button id="reset-button"></button>
    <div id="completed-sessions"></div>
    <div id="total-focus-time"></div>
  `
}

let originalLocalStorage

beforeEach(() => {
  setupDOM()
  originalLocalStorage = global.localStorage
  global.localStorage = { setItem: vi.fn(), getItem: vi.fn() }
  global.playTone = vi.fn()
  vi.useFakeTimers()
})

afterEach(() => {
  global.localStorage = originalLocalStorage
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('auto start behaviour on completion', () => {
  function createTimer () {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.updateProgress = () => {}
    return timer
  }

  it('starts break one second after focus completes', () => {
    const timer = createTimer()
    timer.settings.autoStartBreaks = true
    timer.state.remainingTime = 1
    timer.start()
    vi.advanceTimersByTime(1000)
    expect(timer.state.mode).toBe('focus')
    expect(timer.state.isRunning).toBe(false)

    // still not running before delay has passed
    vi.advanceTimersByTime(999)
    expect(timer.state.isRunning).toBe(false)

    vi.advanceTimersByTime(1)
    expect(timer.state.mode).toBe('shortBreak')
    expect(timer.state.isRunning).toBe(true)
    expect(timer.state.remainingTime).toBe(timer.settings.shortBreakDuration * 60)
  })

  it('starts focus one second after break completes', () => {
    const timer = createTimer()
    timer.settings.autoStartFocus = true
    timer.state.mode = 'shortBreak'
    timer.settings.shortBreakDuration = 1
    timer.state.remainingTime = 1
    timer.start()
    vi.advanceTimersByTime(1000)
    expect(timer.state.mode).toBe('shortBreak')
    expect(timer.state.isRunning).toBe(false)

    vi.advanceTimersByTime(999)
    expect(timer.state.isRunning).toBe(false)

    vi.advanceTimersByTime(1)
    expect(timer.state.mode).toBe('focus')
    expect(timer.state.isRunning).toBe(true)
    expect(timer.state.remainingTime).toBe(timer.settings.focusDuration * 60)
  })
})
