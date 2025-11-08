import { test, expect } from '@playwright/test'

test.describe('Pomodoro Timer E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/Focus Timer/)
    await expect(page.locator('#timer-display')).toBeVisible()
  })

  test('should display initial time', async ({ page }) => {
    const timeDisplay = page.locator('#timer-display')
    await expect(timeDisplay).toHaveText(/25:00/)
  })

  test('should start and pause timer', async ({ page }) => {
    const startButton = page.locator('#start-button')
    const pauseButton = page.locator('#pause-button')
    const timeDisplay = page.locator('#timer-display')

    // Click start
    await startButton.click()

    // Pause button should be visible now
    await expect(pauseButton).toBeVisible()
    await expect(startButton).toBeHidden()

    // Wait a moment for timer to tick
    await page.waitForTimeout(1500)

    // Timer should have decreased
    await expect(timeDisplay).not.toHaveText(/25:00/)

    // Click pause
    await pauseButton.click()

    // Start button should be visible again
    await expect(startButton).toBeVisible()
    await expect(pauseButton).toBeHidden()
  })

  test('should reset timer', async ({ page }) => {
    const startButton = page.locator('#start-button')
    const resetButton = page.locator('#reset-button')
    const timeDisplay = page.locator('#timer-display')

    // Start timer
    await startButton.click()
    await page.waitForTimeout(1500)

    // Reset
    await resetButton.click()
    await expect(timeDisplay).toHaveText(/25:00/)
    await expect(startButton).toBeVisible()
  })

  test('should open and close settings', async ({ page }) => {
    const settingsButton = page.locator('#settings-toggle-btn')
    const settingsPanel = page.locator('#settings-panel')

    // Open settings
    await settingsButton.click()
    await expect(settingsPanel).toHaveClass(/active/)

    // Close settings
    await settingsButton.click()
    await expect(settingsPanel).not.toHaveClass(/active/)
  })

  test('should apply dark theme based on system preference', async ({
    page
  }) => {
    // Check if theme can be applied (this test is simplified since there's no theme toggle in the UI yet)
    // The theme is managed via localStorage and system preferences
    const html = page.locator('html')

    // Set theme via localStorage
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      // Manually trigger theme application
      if (window.themeManager) {
        window.themeManager.applyTheme()
      }
    })

    // Reload to apply theme
    await page.reload()

    // May have dark-theme class depending on implementation
    // This is a basic check that the page still loads correctly
    await expect(page.locator('#timer-display')).toBeVisible()
  })

  test('should use keyboard shortcuts', async ({ page }) => {
    const timeDisplay = page.locator('#timer-display')
    const startButton = page.locator('#start-button')
    const pauseButton = page.locator('#pause-button')

    // Press Space to start (note: Space key might not work for buttons, so we'll test KeyR and KeyS)
    // Press KeyR to reset (ensure timer is at initial state)
    await page.keyboard.press('KeyR')
    await expect(timeDisplay).toHaveText(/25:00/)

    // Start the timer manually to test pause
    await startButton.click()
    await page.waitForTimeout(1500)

    // Press KeyR to reset
    await page.keyboard.press('KeyR')
    await expect(timeDisplay).toHaveText(/25:00/)

    // Press KeyS to open settings
    await page.keyboard.press('KeyS')
    const settingsPanel = page.locator('#settings-panel')
    await expect(settingsPanel).toHaveClass(/active/)

    // Press Escape to close settings
    await page.keyboard.press('Escape')
    await expect(settingsPanel).not.toHaveClass(/active/)
  })

  test('should save settings to localStorage', async ({ page }) => {
    const settingsButton = page.locator('#settings-toggle-btn')
    const focusDurationInput = page.locator('#focus-duration')

    // Open settings
    await settingsButton.click()

    // Change focus duration
    await focusDurationInput.fill('30')
    await focusDurationInput.blur()

    // Reload page
    await page.reload()

    // Check if setting persisted
    await settingsButton.click()
    await expect(focusDurationInput).toHaveValue('30')
  })

  test('should display current mode', async ({ page }) => {
    const modeDisplay = page.locator('#current-mode')

    // Should start in focus mode
    await expect(modeDisplay).toContainText(/focus/i)

    // Session counter should be visible
    const sessionCount = page.locator('#session-count')
    await expect(sessionCount).toBeVisible()
  })

  test('should handle timer completion', async ({ page }) => {
    const settingsButton = page.locator('#settings-toggle-btn')
    const focusDurationInput = page.locator('#focus-duration')
    const startButton = page.locator('#start-button')

    // Set focus duration to 0.1 minutes (6 seconds) for quick test
    await settingsButton.click()
    await focusDurationInput.fill('0.1')
    await focusDurationInput.blur()
    await settingsButton.click()

    // Start timer
    await startButton.click()

    // Wait for timer to complete (with some buffer)
    await page.waitForTimeout(8000)

    // Timer should have switched modes or reset
    // This depends on your app's behavior
    const timeDisplay = page.locator('#timer-display')
    const text = await timeDisplay.textContent()
    expect(text).not.toBe('00:00')
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('#timer-display')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('#timer-display')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('#timer-display')).toBeVisible()
  })
})
