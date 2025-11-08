import PomodoroTimer from '@js/timer.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  `
  const origQuerySelector = document.querySelector.bind(document)
  vi.spyOn(document, 'querySelector').mockImplementation(((sel: string) => {
    if (sel === '.progress-ring__progress') return ring
    return origQuerySelector(sel)
  }) as typeof document.querySelector)
  return ring
}

describe('PomodoroTimer UI updates', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    globalThis.localStorage = createMockLocalStorage() as unknown as Storage
    ;(
      globalThis as unknown as typeof globalThis & {
        Notification: typeof Notification
      }
    ).Notification = { permission: 'granted' } as unknown as typeof Notification
    setupDOM()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updateUI updates DOM', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.setupProgressRing()
    timer.updateUI()
    expect(document.getElementById('current-mode')?.textContent).toBe(
      'Focus Time',
    )
  })
})
