import { expect, test } from '@playwright/test'

test.describe('Auto-start feature E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should auto-start break after focus session completes', async ({
    page,
  }) => {
    const settingsButton = page.locator('#settings-toggle-btn')
    const focusDurationInput = page.locator('#focus-duration')
    const autoStartBreaksCheckbox = page.locator('#auto-start-breaks')
    const startButton = page.locator('#start-button')
    const timeDisplay = page.locator('#timer-display')
    const currentMode = page.locator('#current-mode')

    // Open settings
    await settingsButton.click()

    // Set focus duration to 0.1 minutes (6 seconds) for quick test
    await focusDurationInput.fill('0.1')
    await focusDurationInput.blur()

    // Ensure auto-start breaks is enabled
    const isChecked = await autoStartBreaksCheckbox.isChecked()
    if (!isChecked) {
      await autoStartBreaksCheckbox.check()
    }

    // Close settings
    await settingsButton.click()

    // Verify we're in focus mode
    await expect(currentMode).toContainText(/focus/i)

    // Start timer
    await startButton.click()

    // Wait for timer to complete and switch to break mode
    // Should take about 7-8 seconds (6s timer + 1s delay)
    await expect(currentMode).toContainText(/break/i, { timeout: 15000 })

    // Verify timer auto-started (should be running, not at 00:00)
    const displayText = await timeDisplay.textContent()
    // Timer should show short break duration (5 min = 05:00 or less if already started)
    expect(displayText).toMatch(/0[45]:[0-5][0-9]/)

    // Verify pause button is visible (indicating timer is running)
    const pauseButton = page.locator('#pause-button')
    await expect(pauseButton).toBeVisible()
  })

  test('should NOT auto-start break when feature is disabled', async ({
    page,
  }) => {
    const settingsButton = page.locator('#settings-toggle-btn')
    const focusDurationInput = page.locator('#focus-duration')
    const autoStartBreaksCheckbox = page.locator('#auto-start-breaks')
    const startButton = page.locator('#start-button')
    const currentMode = page.locator('#current-mode')

    // Open settings
    await settingsButton.click()

    // Set focus duration to 0.1 minutes (6 seconds) for quick test
    await focusDurationInput.fill('0.1')
    await focusDurationInput.blur()

    // Disable auto-start breaks
    const isChecked = await autoStartBreaksCheckbox.isChecked()
    if (isChecked) {
      await autoStartBreaksCheckbox.uncheck()
    }

    // Close settings
    await settingsButton.click()

    // Start timer
    await startButton.click()

    // Wait for timer to complete and switch to break mode
    await expect(currentMode).toContainText(/break/i, { timeout: 15000 })

    // Verify timer did NOT auto-start (start button should be visible)
    await expect(startButton).toBeVisible()
    const pauseButton = page.locator('#pause-button')
    await expect(pauseButton).toBeHidden()
  })

  test('should auto-start focus after break session completes', async ({
    page,
  }) => {
    const settingsButton = page.locator('#settings-toggle-btn')
    const shortBreakInput = page.locator('#short-break-duration')
    const autoStartFocusCheckbox = page.locator('#auto-start-focus')
    const currentMode = page.locator('#current-mode')
    const _timeDisplay = page.locator('#timer-display')

    // Open settings
    await settingsButton.click()

    // Set short break duration to 0.1 minutes (6 seconds) for quick test
    await shortBreakInput.fill('0.1')
    await shortBreakInput.blur()

    // Ensure auto-start focus is enabled
    const isChecked = await autoStartFocusCheckbox.isChecked()
    if (!isChecked) {
      await autoStartFocusCheckbox.check()
    }

    // Close settings
    await settingsButton.click()

    // Manually switch to short break mode by evaluating JavaScript
    await page.evaluate(() => {
      const timer = (
        window as Window & {
          pomodoroTimer: { setMode: (mode: string) => void }
        }
      ).pomodoroTimer
      timer.setMode('shortBreak')
    })

    // Verify we're in break mode
    await expect(currentMode).toContainText(/break/i)

    // Start timer
    const startButton = page.locator('#start-button')
    await startButton.click()

    // Wait for timer to complete and switch to focus mode
    await expect(currentMode).toContainText(/focus/i, { timeout: 15000 })

    // Verify timer auto-started (pause button should be visible)
    const pauseButton = page.locator('#pause-button')
    await expect(pauseButton).toBeVisible()
  })
})
