import { describe, it, beforeEach, expect, vi } from 'vitest'
import PomodoroTimer from '../src/js/timer.js'

function setupDOM () {
  const ring = { style: {}, r: { baseVal: { value: 50 } } }
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
  vi.spyOn(document, 'querySelector').mockImplementation((sel) => {
    if (sel === '.progress-ring__progress') return ring
    return document.body.querySelector(sel)
  })
}

describe('PomodoroTimer resume on reload', () => {
  beforeEach(() => {
    setupDOM()
    const today = new Date().toDateString()
    global.localStorage = {
      setItem: vi.fn(),
      getItem: vi.fn(() =>
        JSON.stringify({
          date: today,
          remainingTime: 1500,
          totalTime: 1500,
          isRunning: true,
          isPaused: false
        })
      )
    }
    global.playTone = vi.fn()
  })

  it('returns true to resume when lastUpdated is missing', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    const resume = timer.loadStats()
    expect(resume).toBe(true)
  })
})
