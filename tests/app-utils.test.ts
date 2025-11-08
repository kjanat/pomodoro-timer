import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import type { utils } from '../src/js/app.ts'

let formatTime: typeof utils.formatTime
let debounce: typeof utils.debounce
let showToast: typeof utils.showToast

beforeAll(async () => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
  await import('../src/js/app.ts')
  document.dispatchEvent(new Event('DOMContentLoaded'))
  ;({ formatTime, debounce, showToast } = window.utils!)
})

describe('utils.formatTime', () => {
  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('45s')
  })

  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0s')
  })

  it('formats exactly 60 seconds', () => {
    expect(formatTime(60)).toBe('1m 0s')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2m 5s')
  })

  it('formats exactly 1 hour', () => {
    expect(formatTime(3600)).toBe('1h 0m 0s')
  })

  it('formats hours minutes seconds', () => {
    expect(formatTime(3661)).toBe('1h 1m 1s')
  })

  it('formats multiple hours', () => {
    expect(formatTime(7325)).toBe('2h 2m 5s')
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

  it('passes arguments to debounced function', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('arg1', 'arg2', 123)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123)
    vi.useRealTimers()
  })

  it('executes function after wait time', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 200)
    debounced()
    vi.advanceTimersByTime(199)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

describe('utils.showToast', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    // Remove any existing toast styles
    const existingStyles = document.querySelector('#toast-styles')
    if (existingStyles) {
      existingStyles.remove()
    }
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

  it('creates info toast by default', () => {
    showToast('test message')
    const toast = document.querySelector('.toast-info')
    expect(toast).toBeTruthy()
    expect(toast?.textContent).toBe('test message')
  })

  it('creates error toast', () => {
    showToast('error message', 'error')
    const toast = document.querySelector('.toast-error')
    expect(toast).toBeTruthy()
    expect(toast?.textContent).toBe('error message')
  })

  it('adds styles only once', () => {
    showToast('first', 'info')
    showToast('second', 'success')

    const styles = document.querySelectorAll('#toast-styles')
    expect(styles.length).toBe(1)
  })

  it('creates multiple toasts without conflict', () => {
    showToast('first', 'info')
    showToast('second', 'success')
    showToast('third', 'error')

    expect(document.querySelectorAll('.toast').length).toBe(3)
  })
})
