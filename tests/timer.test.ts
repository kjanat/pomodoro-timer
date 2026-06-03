import { describe, it, expect, beforeEach, afterEach, jest } from 'bun:test'
import PomodoroTimer from '#js/timer'
import { playTone } from '#js/audio'

describe('PomodoroTimer core logic', () => {
  let originalWindow: typeof globalThis.window
  beforeEach(() => {
    originalWindow = globalThis.window
    globalThis.localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn()
    } as any
    // Clear cached AudioContext up front. bun shares module state across files
    // (vitest isolated per file), so a real ctx created by another test would
    // otherwise leak in and the mock below would never be instantiated.
    playTone.ctx = undefined
  })

  afterEach(() => {
    globalThis.window = originalWindow
    playTone.ctx = undefined
  })

  it('returns correct duration for each mode', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.settings.focusDuration = 30
    timer.settings.shortBreakDuration = 7
    timer.settings.longBreakDuration = 20

    expect(timer.getModeDuration('focus')).toBe(30)
    expect(timer.getModeDuration('shortBreak')).toBe(7)
    expect(timer.getModeDuration('longBreak')).toBe(20)
  })

  it('setMode updates state correctly', () => {
    const timer = new PomodoroTimer({ skipInit: true })
    timer.updateUI = () => {}
    timer.settings.shortBreakDuration = 10

    timer.setMode('shortBreak')
    expect(timer.state.mode).toBe('shortBreak')
    expect(timer.state.remainingTime).toBe(10 * 60)
    expect(timer.state.totalTime).toBe(10 * 60)
  })

  it('playTone creates and runs oscillator', () => {
    const oscStart = jest.fn()
    const oscStop = jest.fn()
    const oscillator = {
      connect: jest.fn(),
      start: oscStart,
      stop: oscStop,
      frequency: { value: 0 },
      type: ''
    }
    const gain = { connect: jest.fn(), gain: { value: 0 } }
    const createOscillator = jest.fn(() => oscillator)
    const createGain = jest.fn(() => gain)

    // Use a proper function constructor instead of arrow function with jest.fn
    class AudioContextMock {
      createOscillator = createOscillator
      createGain = createGain
      destination = {}
      currentTime = 0
    }
    ;(globalThis.window as any).AudioContext = AudioContextMock
    expect(() => playTone(440, 0.1)).not.toThrow()
    expect(createOscillator).toHaveBeenCalled()
    expect(oscStart).toHaveBeenCalled()
    expect(oscStop).toHaveBeenCalled()
  })
})
