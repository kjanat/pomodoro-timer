import PomodoroTimer from '@js/timer.ts'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { createMockLocalStorage } from './setup'

function setupDOM() {
  const ring = {
    style: {},
    r: { baseVal: { value: 50 } },
  } as SVGCircleElement & {
    style: Record<string, unknown>
    r: { baseVal: { value: number } }
  }
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
  }) as typeof document.querySelector)
}

describe('PomodoroTimer additional methods', () => {
  beforeEach(() => {
    setupDOM()
    const today = new Date().toDateString()
    globalThis.localStorage = createMockLocalStorage((key) => {
      if (key === 'pomodoro-settings')
        return JSON.stringify({ focusDuration: 20 })
      if (key === 'pomodoro-stats') return JSON.stringify({ date: today })
      return null
    }) as unknown as Storage
    ;(globalThis as typeof globalThis & { playTone: Mock }).playTone = vi.fn()
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
    expect(globalThis.localStorage.setItem).toHaveBeenCalled()
  })
})
