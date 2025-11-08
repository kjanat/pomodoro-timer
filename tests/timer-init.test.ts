import PomodoroTimer from '@js/timer.ts'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { createMockLocalStorage } from './setup'

function setupFullDOM() {
  const ring = {
    style: {},
    r: { baseVal: { value: 50 } },
  } as SVGCircleElement & {
    style: Record<string, unknown>
    r: { baseVal: { value: number } }
  }
  document.body.innerHTML = `
    <svg><circle class="progress-ring__progress" r="50"></circle></svg>
    <div id="timer-display"></div>
    <div id="current-mode"></div>
    <div id="session-count"></div>
    <button id="start-button"><span class="btn-text"></span><span class="btn-icon"></span></button>
    <button id="pause-button"></button>
    <button id="reset-button"></button>
    <button id="settings-toggle-btn"></button>
    <div id="settings-panel"></div>
    <input id="focus-duration" />
    <input id="short-break-duration" />
    <input id="long-break-duration" />
    <input id="long-break-interval" />
    <input id="auto-start-breaks" type="checkbox" />
    <input id="auto-start-focus" type="checkbox" />
    <input id="sound-enabled" type="checkbox" />
    <div id="completed-sessions"></div>
    <div id="total-focus-time"></div>
  `
  vi.spyOn(document, 'querySelector').mockImplementation(((sel: string) => {
    if (sel === '.progress-ring__progress') return ring
    return document.body.querySelector(sel)
  }) as typeof document.querySelector)
}

describe('PomodoroTimer init', () => {
  beforeEach(() => {
    setupFullDOM()
    globalThis.localStorage = createMockLocalStorage() as unknown as Storage
    const MockNotification = (() => {}) as unknown as typeof Notification
    ;(MockNotification as { permission: string }).permission = 'granted'
    ;(
      globalThis as typeof globalThis & { Notification: typeof Notification }
    ).Notification = MockNotification
    ;(globalThis as typeof globalThis & { playTone: Mock }).playTone = vi.fn()
    vi.useFakeTimers()
  })

  it('initializes and handles clicks', () => {
    const timer = new PomodoroTimer()
    document.getElementById('start-button')?.dispatchEvent(new Event('click'))
    vi.advanceTimersByTime(1000)
    document.getElementById('pause-button')?.dispatchEvent(new Event('click'))
    document.getElementById('reset-button')?.dispatchEvent(new Event('click'))
    expect(timer.state.isRunning).toBe(false)
  })
})
