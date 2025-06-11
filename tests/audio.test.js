import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { playTone } from '../src/js/audio.js'

describe('playTone helper', () => {
  let originalWindow

  beforeEach(() => {
    originalWindow = global.window
  })

  afterEach(() => {
    global.window = originalWindow
    // ensure a fresh AudioContext for each test
    delete playTone.ctx
  })

  it('does nothing when window is undefined', () => {
    delete global.window
    expect(() => playTone(440)).not.toThrow()
  })

  it('uses AudioContext if available', () => {
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
    expect(() => playTone(330, 0.1)).not.toThrow()
    expect(createOscillator).toHaveBeenCalled()
    expect(oscStart).toHaveBeenCalled()
    expect(oscStop).toHaveBeenCalled()
  })
})
