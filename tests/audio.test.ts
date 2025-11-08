import { playTone } from '@js/audio.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('playTone helper', () => {
  let originalWindow: typeof globalThis.window

  beforeEach(() => {
    originalWindow = globalThis.window
  })

  afterEach(() => {
    globalThis.window = originalWindow
    // ensure a fresh AudioContext for each test
    playTone.ctx = undefined
  })

  it('does nothing when window is undefined', () => {
    // @ts-expect-error - Testing undefined window scenario
    delete globalThis.window
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
      type: '',
    }
    const gain = { connect: vi.fn(), gain: { value: 0 } }
    const createOscillator = vi.fn(() => oscillator)
    const createGain = vi.fn(() => gain)

    // Use a proper function constructor instead of arrow function with vi.fn
    class AudioContextMock {
      createOscillator = createOscillator
      createGain = createGain
      destination = {}
      currentTime = 0
      state = 'running'
      resume = vi.fn()
    }
    ;(
      globalThis.window as unknown as {
        AudioContext: typeof AudioContextMock
      }
    ).AudioContext = AudioContextMock
    expect(() => playTone(330, 0.1)).not.toThrow()
    expect(createOscillator).toHaveBeenCalled()
    expect(oscStart).toHaveBeenCalled()
    expect(oscStop).toHaveBeenCalled()
  })

  it('resumes a suspended AudioContext', () => {
    const resume = vi.fn()
    const oscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: '',
    }
    const gain = { connect: vi.fn(), gain: { value: 0 } }
    const createOscillator = vi.fn(() => oscillator)
    const createGain = vi.fn(() => gain)

    // Use a proper function constructor instead of arrow function with vi.fn
    class AudioContextMock {
      createOscillator = createOscillator
      createGain = createGain
      destination = {}
      currentTime = 0
      state = 'suspended'
      resume = resume
    }
    ;(
      globalThis.window as unknown as {
        AudioContext: typeof AudioContextMock
      }
    ).AudioContext = AudioContextMock
    playTone(440)
    expect(resume).toHaveBeenCalled()
  })
})
