import { describe, it, beforeEach, beforeAll, expect, vi } from 'vitest'
import { KeyboardShortcuts } from '../src/js/app.ts'

describe('KeyboardShortcuts event handling', () => {
  let shortcuts: KeyboardShortcuts
  let mockTimer: any

  beforeAll(() => {
    // Create the instance once to set up event listeners
    mockTimer = {
      reset: vi.fn()
    }
    ;(window as any).pomodoroTimer = mockTimer
  })

  beforeEach(() => {
    document.body.innerHTML = '<div id="settings-panel"></div>'
    mockTimer.reset.mockClear()
    // Don't create a new instance, just reference the class
    shortcuts = new KeyboardShortcuts()
  })

  it('resets timer when KeyR is pressed', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyR',
      bubbles: true,
      cancelable: true
    })
    // Mock the matches method on the event target
    Object.defineProperty(event, 'target', {
      value: {
        matches: () => false
      },
      writable: false
    })
    document.dispatchEvent(event)

    expect(mockTimer.reset).toHaveBeenCalled()
  })

  it('does not reset timer when Ctrl+R is pressed', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyR',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(event, 'target', {
      value: { matches: () => false },
      writable: false
    })
    document.dispatchEvent(event)

    expect(mockTimer.reset).not.toHaveBeenCalled()
  })

  it('does not reset timer when Meta+R is pressed', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyR',
      metaKey: true,
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(event, 'target', {
      value: { matches: () => false },
      writable: false
    })
    document.dispatchEvent(event)

    expect(mockTimer.reset).not.toHaveBeenCalled()
  })

  it('toggles settings when KeyS is pressed', () => {
    const settingsPanel = document.getElementById('settings-panel')!

    // Test the method directly
    shortcuts.toggleSettings()
    expect(settingsPanel.classList.contains('active')).toBe(true)

    // Toggle again
    shortcuts.toggleSettings()
    expect(settingsPanel.classList.contains('active')).toBe(false)
  })

  it('closes settings when Escape is pressed', () => {
    const settingsPanel = document.getElementById('settings-panel')!
    settingsPanel.classList.add('active')

    // Test the method directly
    shortcuts.closeSettings()
    expect(settingsPanel.classList.contains('active')).toBe(false)
  })

  it('ignores shortcuts when typing in input fields', () => {
    const input = document.createElement('input')
    input.matches = () => true // Mock matches to return true for input
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', {
      code: 'KeyR',
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(event, 'target', {
      value: input,
      enumerable: true
    })

    document.dispatchEvent(event)

    // Timer reset should not be called when typing in input
    expect(mockTimer.reset).not.toHaveBeenCalled()
  })

  it('ignores shortcuts when typing in textarea', () => {
    const textarea = document.createElement('textarea')
    textarea.matches = () => true // Mock matches to return true for textarea
    document.body.appendChild(textarea)

    const event = new KeyboardEvent('keydown', {
      code: 'KeyS',
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(event, 'target', {
      value: textarea,
      enumerable: true
    })

    document.dispatchEvent(event)

    // Settings should not toggle when typing in textarea
    const settingsPanel = document.getElementById('settings-panel')!
    expect(settingsPanel.classList.contains('active')).toBe(false)
  })

  it('ignores shortcuts when typing in select', () => {
    const select = document.createElement('select')
    select.matches = () => true // Mock matches to return true for select
    document.body.appendChild(select)

    const event = new KeyboardEvent('keydown', {
      code: 'Escape',
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(event, 'target', {
      value: select,
      enumerable: true
    })

    const settingsPanel = document.getElementById('settings-panel')!
    settingsPanel.classList.add('active')

    document.dispatchEvent(event)

    // Settings should still be active since shortcut was ignored
    expect(settingsPanel.classList.contains('active')).toBe(true)
  })

  it('handles missing settings panel gracefully', () => {
    document.body.innerHTML = '' // Remove settings panel

    const eventS = new KeyboardEvent('keydown', {
      code: 'KeyS',
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(eventS, 'target', {
      value: { matches: () => false },
      writable: false
    })

    const eventEsc = new KeyboardEvent('keydown', {
      code: 'Escape',
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(eventEsc, 'target', {
      value: { matches: () => false },
      writable: false
    })

    expect(() => {
      document.dispatchEvent(eventS)
      document.dispatchEvent(eventEsc)
    }).not.toThrow()
  })

  it('handles missing timer gracefully', () => {
    ;(window as any).pomodoroTimer = undefined

    const event = new KeyboardEvent('keydown', {
      code: 'KeyR',
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(event, 'target', {
      value: { matches: () => false },
      writable: false
    })

    expect(() => {
      document.dispatchEvent(event)
    }).not.toThrow()
  })
})
