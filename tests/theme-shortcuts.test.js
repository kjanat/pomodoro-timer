import { describe, it, beforeEach, beforeAll, expect } from 'vitest'

let ThemeManagerCls, KeyboardShortcutsCls

beforeAll(async () => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }))
  await import('../dist/js/app.js')
  document.dispatchEvent(new Event('DOMContentLoaded'))
  ThemeManagerCls = window.themeManager.constructor
  KeyboardShortcutsCls = window.keyboardShortcuts.constructor
})

describe('ThemeManager', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    localStorage.clear()
  })

  it('applies dark theme', () => {
    const tm = new ThemeManagerCls()
    tm.setTheme('dark')
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})

describe('KeyboardShortcuts panel helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="settings-panel" class=""></div>'
  })
  it('toggles and closes panel', () => {
    const ks = new KeyboardShortcutsCls()
    ks.toggleSettings()
    expect(document.getElementById('settings-panel').classList.contains('active')).toBe(true)
    ks.closeSettings()
    expect(document.getElementById('settings-panel').classList.contains('active')).toBe(false)
  })
})
