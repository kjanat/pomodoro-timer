import { describe, it, beforeEach, expect, vi } from 'vitest'
import PomodoroTimer from '../src/js/timer.ts'

function setupDOM() {
  const ring = { style: {}, r: { baseVal: { value: 50 } } } as any
  document.body.innerHTML = `
    <div id="timer-display"></div>
    <div id="current-mode"></div>
    <div id="session-count"></div>
    <button id="start-button"><span class="btn-text"></span><span class="btn-icon"></span></button>
    <button id="pause-button"></button>
    <button id="reset-button"></button>
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

describe('PomodoroTimer additional methods', () => {
  beforeEach(() => {
    setupDOM()
    const today = new Date().toDateString()
    global.localStorage = {
      setItem: vi.fn(),
      getItem: vi.fn((key) => {
        if (key === 'pomodoro-settings')
          return JSON.stringify({ focusDuration: 20 })
        if (key === 'pomodoro-stats') return JSON.stringify({ date: today })
        return null
      })
    } as any
    ;(global as any).Notification = function () {} as any
    ;(global as any).Notification.permission = 'granted'
    ;(global as any).playTone = vi.fn()
  })

  it('executes miscellaneous methods without error', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.setupProgressRing()
    timer.updateDisplay()
    timer.updateModeText()
    timer.updateButtons()
    timer.updateProgressRingColor()
    timer.updateStats()
    timer.showNotification()
    timer.saveSettings()
    timer.loadSettings()
    timer.saveStats()
    timer.loadStats()
    expect(global.localStorage.setItem).toHaveBeenCalled()
  })
})
