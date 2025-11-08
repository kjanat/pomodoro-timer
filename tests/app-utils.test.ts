import type { utils } from '@js/app.ts'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

let formatTime: typeof utils.formatTime
let debounce: typeof utils.debounce
let showToast: typeof utils.showToast

beforeAll(async () => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  await import('@js/app.ts')
  document.dispatchEvent(new Event('DOMContentLoaded'))
  const utils = window.utils
  if (!utils) throw new Error('utils not initialized')
  ;({ formatTime, debounce, showToast } = utils)
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
  it('debounces multiple calls', async () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced()
    await new Promise((resolve) => setTimeout(resolve, 50))
    debounced()
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes arguments to debounced function', async () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('arg1', 'arg2', 123)
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('executes function after wait time', async () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 200)
    debounced()
    await new Promise((resolve) => setTimeout(resolve, 199))
    expect(fn).not.toHaveBeenCalled()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(fn).toHaveBeenCalledTimes(1)
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

  it('creates and removes a toast element', async () => {
    showToast('hi', 'success')
    const toast = document.querySelector('.toast-success')
    expect(toast).toBeTruthy()
    expect(toast?.textContent).toBe('hi')
    await new Promise((resolve) => setTimeout(resolve, 3400))
    expect(document.querySelector('.toast-success')).toBeNull()
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
