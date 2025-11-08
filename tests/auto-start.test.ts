import PomodoroTimer from '@js/timer.ts'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { createMockLocalStorage } from './setup'

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
    globalThis.localStorage = createMockLocalStorage() as unknown as Storage
    ;(globalThis as typeof globalThis & { playTone: Mock }).playTone = vi.fn()
  })

  it('automatically starts break after focus session', async () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.updateProgress = () => {}
    timer.settings.autoStartBreaks = true
    timer.settings.autoStartFocus = true
    timer.state.remainingTime = 1
    timer.start()
    // Wait for tick (1100ms) + complete delay (1100ms)
    await new Promise((resolve) => setTimeout(resolve, 2200))
    expect(timer.state.mode).toBe('shortBreak')
    expect(timer.state.isRunning).toBe(true)
  })

  it('automatically starts focus after break session', async () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.updateProgress = () => {}
    timer.settings.autoStartBreaks = true
    timer.settings.autoStartFocus = true
    timer.state.mode = 'shortBreak'
    timer.state.remainingTime = 1
    timer.start()
    // Wait for tick (1100ms) + complete delay (1100ms)
    await new Promise((resolve) => setTimeout(resolve, 2200))
    expect(timer.state.mode).toBe('focus')
    expect(timer.state.isRunning).toBe(true)
  })
})
