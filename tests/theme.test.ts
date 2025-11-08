import { describe, it, beforeEach, expect, vi } from 'vitest'
import { ThemeManager } from '../src/js/app.ts'

describe('ThemeManager', () => {
  let themeManager: ThemeManager
  let mockMatchMedia: any

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()

    // Clear theme classes
    document.documentElement.className = ''

    // Setup matchMedia mock
    const listeners: Array<(e: any) => void> = []
    mockMatchMedia = {
      matches: false,
      addEventListener: vi.fn((event: string, callback: any) => {
        listeners.push(callback)
      }),
      removeEventListener: vi.fn(),
      trigger: (matches: boolean) => {
        mockMatchMedia.matches = matches
        listeners.forEach((cb) => cb({ matches }))
      }
    }

    window.matchMedia = vi.fn(() => mockMatchMedia) as any
  })

  it('initializes with auto theme by default', () => {
    themeManager = new ThemeManager()
    expect(themeManager.currentTheme).toBe('auto')
  })

  it('loads saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    themeManager = new ThemeManager()
    expect(themeManager.currentTheme).toBe('dark')
  })

  it('applies dark theme correctly', () => {
    themeManager = new ThemeManager()
    themeManager.setTheme('dark')

    expect(document.documentElement.classList.contains('dark-theme')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('applies light theme correctly', () => {
    // Start with dark theme
    document.documentElement.classList.add('dark-theme')

    themeManager = new ThemeManager()
    themeManager.setTheme('light')

    expect(document.documentElement.classList.contains('dark-theme')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('applies auto theme with dark system preference', () => {
    mockMatchMedia.matches = true
    themeManager = new ThemeManager()
    themeManager.setTheme('auto')

    expect(document.documentElement.classList.contains('dark-theme')).toBe(true)
  })

  it('applies auto theme with light system preference', () => {
    mockMatchMedia.matches = false
    themeManager = new ThemeManager()
    themeManager.setTheme('auto')

    expect(document.documentElement.classList.contains('dark-theme')).toBe(false)
  })

  it('listens for system theme changes when in auto mode', () => {
    mockMatchMedia.matches = false
    themeManager = new ThemeManager()
    themeManager.setTheme('auto')

    expect(document.documentElement.classList.contains('dark-theme')).toBe(false)

    // Simulate system theme change to dark
    mockMatchMedia.trigger(true)

    expect(document.documentElement.classList.contains('dark-theme')).toBe(true)
  })

  it('does not react to system theme changes when not in auto mode', () => {
    themeManager = new ThemeManager()
    themeManager.setTheme('light')

    expect(document.documentElement.classList.contains('dark-theme')).toBe(false)

    // Simulate system theme change to dark
    mockMatchMedia.trigger(true)

    // Should still be light
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false)
  })

  it('switches between themes correctly', () => {
    themeManager = new ThemeManager()

    themeManager.setTheme('dark')
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true)

    themeManager.setTheme('light')
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false)

    themeManager.setTheme('auto')
    // mockMatchMedia.matches is false by default
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false)
  })

  it('persists theme changes to localStorage', () => {
    themeManager = new ThemeManager()

    themeManager.setTheme('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    themeManager.setTheme('light')
    expect(localStorage.getItem('theme')).toBe('light')

    themeManager.setTheme('auto')
    expect(localStorage.getItem('theme')).toBe('auto')
  })
})
