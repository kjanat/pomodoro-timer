import { describe, it, beforeEach, afterEach, expect, jest } from 'bun:test'
import PomodoroTimer from '#js/timer'

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

describe('PomodoroTimer auto start', () => {
  beforeEach(() => {
    setupDOM()
    globalThis.localStorage = { setItem: jest.fn(), getItem: jest.fn() } as any
    jest.useFakeTimers()
    ;(globalThis as any).playTone = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('automatically starts break after focus session', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.updateProgress = () => {}
    timer.settings.autoStartBreaks = true
    timer.settings.autoStartFocus = true
    timer.state.remainingTime = 1
    timer.start()
    jest.advanceTimersByTime(1000)
    expect(timer.state.mode).toBe('focus')
    expect(timer.state.isRunning).toBe(false)
    jest.advanceTimersByTime(1000)
    expect(timer.state.isRunning).toBe(true)
    expect(timer.state.mode).toBe('shortBreak')
  })

  it('automatically starts focus after break session', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.updateProgress = () => {}
    timer.settings.autoStartBreaks = true
    timer.settings.autoStartFocus = true
    timer.state.mode = 'shortBreak'
    timer.state.remainingTime = 1
    timer.start()
    jest.advanceTimersByTime(1000)
    expect(timer.state.mode).toBe('shortBreak')
    expect(timer.state.isRunning).toBe(false)
    jest.advanceTimersByTime(1000)
    expect(timer.state.isRunning).toBe(true)
    expect(timer.state.mode as string).toBe('focus')
  })
})
