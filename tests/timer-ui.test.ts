import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
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
  vi.spyOn(document, 'querySelector').mockImplementation(((sel: string) => {
    if (sel === '.progress-ring__progress') return ring
    return origQuerySelector(sel)
  }) as any)
  return ring
}

describe('PomodoroTimer UI updates', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.localStorage = { setItem: vi.fn(), getItem: vi.fn() } as any
    ;(global as any).Notification = { permission: 'granted' } as any
    setupDOM()
  })
  afterEach(() => {
    vi.restoreAllMocks()
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
