import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import PomodoroTimer from '../src/js/timer.ts'

function setupDOM () {
  const ring = { style: {}, r: { baseVal: { value: 50 } } } as any
  document.body.innerHTML = `
    <div id="timer-display"></div>
    <div id="current-mode"></div>
    <div id="session-count"></div>
    <button id="start-button"><span class="btn-text"></span><span class="btn-icon"></span></button>
    <button id="pause-button"></button>
    <button id="reset-button"></button>
    <button id="settings-toggle-btn"></button>
    <div id="settings-panel"></div>
    <div id="completed-sessions"></div>
    <div id="total-focus-time"></div>
    <input id="focus-duration" />
    <input id="short-break-duration" />
    <input id="long-break-duration" />
    <input id="long-break-interval" />
    <input id="auto-start-breaks" type="checkbox" />
    <input id="auto-start-focus" type="checkbox" />
    <input id="sound-enabled" type="checkbox" />
  `
  vi.spyOn(document, 'querySelector').mockImplementation(((sel: string) => {
    if (sel === '.progress-ring__progress') return ring
    return document.body.querySelector(sel)
  }) as any)
}

describe('PomodoroTimer resume on reload', () => {
  let origQuerySelector: typeof document.querySelector
  beforeEach(() => {
    origQuerySelector = document.querySelector.bind(document)
    setupDOM()
    global.localStorage = { setItem: vi.fn(), getItem: vi.fn() } as any
    ;(global as any).playTone = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
    document.querySelector = origQuerySelector
  })

  it('returns true to resume when lastUpdated is missing', () => {
    const today = new Date().toDateString()
    ;(global.localStorage.getItem as any).mockReturnValueOnce(
      JSON.stringify({
        date: today,
        remainingTime: 1500,
        totalTime: 1500,
        isRunning: true,
        isPaused: false
      })
    )
    const timer = new PomodoroTimer({ skipInit: true })
    timer.setupProgressRing()
    const resume = timer.loadStats()
    expect(resume).toBe(true)
  })

  it('returns true when elapsed time is less than remainingTime', () => {
    const today = new Date().toDateString()
    ;(global.localStorage.getItem as any).mockReturnValueOnce(
      JSON.stringify({
        date: today,
        remainingTime: 1500,
        totalTime: 1500,
        isRunning: true,
        isPaused: false,
        lastUpdated: Date.now() - 1000
      })
    )
    const timer = new PomodoroTimer({ skipInit: true })
    timer.setupProgressRing()
    const resume = timer.loadStats()
    expect(resume).toBe(true)
    expect(timer.state.remainingTime).toBe(1499)
  })

  it('returns false when elapsed time exceeds remainingTime', () => {
    const today = new Date().toDateString()
    ;(global.localStorage.getItem as any).mockReturnValueOnce(
      JSON.stringify({
        date: today,
        remainingTime: 1500,
        totalTime: 1500,
        isRunning: true,
        isPaused: false,
        lastUpdated: Date.now() - 1600 * 1000
      })
    )
    const timer = new PomodoroTimer({ skipInit: true })
    timer.setupProgressRing()
    const resume = timer.loadStats()
    expect(resume).toBe(false)
    expect(timer.state.isRunning).toBe(false)
  })

  it('calls saveStats on beforeunload', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.bindEvents()
    vi.spyOn(timer, 'saveStats')
    window.dispatchEvent(new Event('beforeunload'))
    expect(timer.saveStats).toHaveBeenCalled()
  })
})
