import type { Page } from '@playwright/test'

/**
 * Sets the timer mode by directly manipulating the application state.
 * Useful for testing scenarios that require starting from a specific mode.
 *
 * @param page - Playwright page object
 * @param mode - Timer mode to set ('focus', 'shortBreak', or 'longBreak')
 */
export async function setTimerMode(
  page: Page,
  mode: 'focus' | 'shortBreak' | 'longBreak',
): Promise<void> {
  await page.evaluate((m) => {
    const timer = (
      window as Window & {
        pomodoroTimer: { setMode: (mode: string) => void }
      }
    ).pomodoroTimer
    timer.setMode(m)
  }, mode)
}
