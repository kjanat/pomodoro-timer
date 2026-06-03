import { describe, it, beforeEach, afterEach, expect, jest } from 'bun:test'
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
  `
  const origQuerySelector = document.querySelector.bind(document)
  jest.spyOn(document, 'querySelector').mockImplementation(((sel: string) => {
    if (sel === '.progress-ring__progress') return ring
    return origQuerySelector(sel)
  }) as any)
  return ring
}

describe('PomodoroTimer UI updates', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    globalThis.localStorage = { setItem: jest.fn(), getItem: jest.fn() } as any
    ;(globalThis as any).Notification = { permission: 'granted' } as any
    setupDOM()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('updateUI updates DOM', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.setupProgressRing()
    timer.updateUI()
    expect(document.getElementById('current-mode')!.textContent).toBe(
      'Focus Time'
    )
  })
})
