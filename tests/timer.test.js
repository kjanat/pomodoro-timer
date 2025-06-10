import { describe, it, expect } from 'vitest'
import PomodoroTimer from '../src/js/timer.js'

describe('PomodoroTimer core logic', () => {
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
})
