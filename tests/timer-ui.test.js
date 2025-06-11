import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
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
  `
  vi.spyOn(document, 'querySelector').mockImplementation((sel) => {
    if (sel === '.progress-ring__progress') return ring
    return document.body.querySelector(sel)
  })
  return ring
}

describe('PomodoroTimer UI updates', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.localStorage = { setItem: vi.fn(), getItem: vi.fn() }
    global.Notification = { permission: 'granted' }
    setupDOM()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updateUI updates DOM', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.setupProgressRing()
    timer.updateUI()
    expect(document.getElementById('current-mode').textContent).toBe('Focus Time')
  })
})
