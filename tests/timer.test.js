import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import PomodoroTimer from '../dist/js/timer.js'
import { playTone } from '../dist/js/audio.js'

describe('PomodoroTimer core logic', () => {
  let originalWindow
  beforeEach(() => {
    originalWindow = global.window
    global.localStorage = {
      setItem: vi.fn(),
      getItem: vi.fn()
    }
  })

  afterEach(() => {
    global.window = originalWindow
    // clear cached AudioContext so each test starts fresh
    delete playTone.ctx
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
    const oscStart = vi.fn()
    const oscStop = vi.fn()
    const oscillator = {
      connect: vi.fn(),
      start: oscStart,
      stop: oscStop,
      frequency: { value: 0 },
      type: ''
    }
    const gain = { connect: vi.fn(), gain: { value: 0 } }
    const createOscillator = vi.fn(() => oscillator)
    const createGain = vi.fn(() => gain)
    const AudioContextMock = vi.fn(() => ({
      createOscillator,
      createGain,
      destination: {},
      currentTime: 0
    }))
    global.window = { ...global.window, AudioContext: AudioContextMock }
    expect(() => playTone(440, 0.1)).not.toThrow()
    expect(createOscillator).toHaveBeenCalled()
    expect(oscStart).toHaveBeenCalled()
    expect(oscStop).toHaveBeenCalled()
  })
})
