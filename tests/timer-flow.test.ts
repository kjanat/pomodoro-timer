import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import PomodoroTimer from '../src/js/timer.ts'

function setupDOM() {
  document.body.innerHTML = `
    <svg><circle class="progress-ring__progress" r="50"></circle></svg>
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

describe('PomodoroTimer flow', () => {
  beforeEach(() => {
    setupDOM()
    globalThis.localStorage = { setItem: vi.fn(), getItem: vi.fn() } as any
    vi.useFakeTimers()
    ;(globalThis as any).playTone = vi.fn()
  })

  it('start, tick and pause', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.updateProgress = () => {}
    timer.start()
    expect(timer.state.isRunning).toBe(true)
    vi.advanceTimersByTime(1000)
    expect(timer.state.remainingTime).toBe(timer.state.totalTime - 1)
    timer.pause()
    expect(timer.state.isPaused).toBe(true)
  })

  it('reset sets remaining time', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.updateProgress = () => {}
    timer.state.mode = 'shortBreak'
    timer.settings.shortBreakDuration = 1
    timer.reset()
    expect(timer.state.remainingTime).toBe(60)
  })

  it('completes a cycle', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.updateProgress = () => {}
    timer.state.remainingTime = 1
    timer.settings.autoStartBreaks = false
    timer.start()
    vi.advanceTimersByTime(1000)
    expect(timer.state.isRunning).toBe(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })
})
