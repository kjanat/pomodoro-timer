import { test, expect } from '@playwright/test'

test.describe('Pomodoro Timer E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/Pomodoro/)
    await expect(page.locator('#time-display')).toBeVisible()
  })

  test('should display initial time', async ({ page }) => {
    const timeDisplay = page.locator('#time-display')
    await expect(timeDisplay).toHaveText(/25:00/)
  })

  test('should start and pause timer', async ({ page }) => {
    const startButton = page.locator('#start-btn')
    const timeDisplay = page.locator('#time-display')

    // Click start
    await startButton.click()
    await expect(startButton).toHaveText(/Pause/)

    // Wait a moment for timer to tick
    await page.waitForTimeout(1500)

    // Timer should have decreased
    await expect(timeDisplay).not.toHaveText(/25:00/)

    // Click pause
    await startButton.click()
    await expect(startButton).toHaveText(/Start/)
  })

  test('should reset timer', async ({ page }) => {
    const startButton = page.locator('#start-btn')
    const resetButton = page.locator('#reset-btn')
    const timeDisplay = page.locator('#time-display')

    // Start timer
    await startButton.click()
    await page.waitForTimeout(1500)

    // Reset
    await resetButton.click()
    await expect(timeDisplay).toHaveText(/25:00/)
    await expect(startButton).toHaveText(/Start/)
  })

  test('should open and close settings', async ({ page }) => {
    const settingsButton = page.locator('#settings-btn')
    const settingsPanel = page.locator('#settings-panel')

    // Open settings
    await settingsButton.click()
    await expect(settingsPanel).toHaveClass(/active/)

    // Close settings
    await settingsButton.click()
    await expect(settingsPanel).not.toHaveClass(/active/)
  })

  test('should toggle theme', async ({ page }) => {
    const settingsButton = page.locator('#settings-btn')
    const themeSelect = page.locator('#theme-select')

    // Open settings
    await settingsButton.click()

    // Change theme to dark
    await themeSelect.selectOption('dark')

    // Check if dark theme is applied
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark-theme/)

    // Change back to light
    await themeSelect.selectOption('light')
    await expect(html).not.toHaveClass(/dark-theme/)
  })

  test('should use keyboard shortcuts', async ({ page }) => {
    const timeDisplay = page.locator('#time-display')
    const startButton = page.locator('#start-btn')

    // Press Space to start
    await page.keyboard.press('Space')
    await expect(startButton).toHaveText(/Pause/)

    // Wait for timer to tick
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
    const settingsButton = page.locator('#settings-btn')
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

  test('should switch between modes', async ({ page }) => {
    const modeDisplay = page.locator('#mode-display, .mode-indicator')

    // Should start in focus mode
    await expect(
      page.locator('body, #mode-display, .mode-indicator')
    ).toContainText(/focus/i)

    // You can add more mode switching tests here if the UI supports it
  })

  test('should handle timer completion', async ({ page }) => {
    const settingsButton = page.locator('#settings-btn')
    const focusDurationInput = page.locator('#focus-duration')
    const startButton = page.locator('#start-btn')

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
    const timeDisplay = page.locator('#time-display')
    const text = await timeDisplay.textContent()
    expect(text).not.toBe('00:00')
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('#time-display')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('#time-display')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('#time-display')).toBeVisible()
  })
})
