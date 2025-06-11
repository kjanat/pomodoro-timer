import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

let formatTime, debounce, showToast

beforeAll(async () => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }))
  await import('../src/js/app.js')
  document.dispatchEvent(new Event('DOMContentLoaded'))
  ;({ formatTime, debounce, showToast } = window.utils)
})

describe('utils.formatTime', () => {
  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2m 5s')
  })

  it('formats hours minutes seconds', () => {
    expect(formatTime(3661)).toBe('1h 1m 1s')
  })
})

describe('utils.debounce', () => {
  it('debounces multiple calls', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

describe('utils.showToast', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  it('creates and removes a toast element', () => {
    vi.useFakeTimers()
    showToast('hi', 'success')
    const toast = document.querySelector('.toast-success')
    expect(toast).toBeTruthy()
    vi.advanceTimersByTime(3300)
    expect(document.querySelector('.toast-success')).toBeNull()
    vi.useRealTimers()
  })
})
