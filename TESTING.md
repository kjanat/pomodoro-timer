# Testing Documentation

This document describes the testing setup and coverage for the Pomodoro Timer application.

## Test Overview

The project now includes comprehensive testing with both unit tests and end-to-end (E2E) tests.

### Test Statistics

- **Total Unit Tests**: 66 tests across 15 test files
- **Overall Code Coverage**: 87.03%
  - Statement Coverage: 87.03%
  - Branch Coverage: 70.85%
  - Function Coverage: 79.16%
  - Line Coverage: 87.59%

### Coverage by File

| File | Statements | Branches | Functions | Lines | Uncovered Lines |
|------|------------|----------|-----------|-------|-----------------|
| app.ts | 95.55% | 96.96% | 88.46% | 95.4% | 248-255 (Service Worker) |
| audio.ts | 88.88% | 86.66% | 50% | 88% | 28, 41-42 |
| timer.ts | 84.15% | 63.57% | 75% | 85.01% | Various edge cases |

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Install Playwright browsers (first time only)
npx playwright install
```

### Run All Tests

```bash
npm run test:all
```

## Test Structure

### Unit Tests (`/tests`)

The unit tests are organized by functionality:

1. **analytics.test.ts** - Tests for Analytics class
   - Event tracking
   - Session summary
   - Event limits

2. **app-utils.test.ts** - Tests for utility functions
   - Time formatting
   - Debouncing
   - Toast notifications

3. **audio.test.ts** - Tests for audio functionality
   - AudioContext mocking
   - Tone generation
   - Suspended context handling

4. **keyboard-events.test.ts** - Tests for keyboard shortcuts
   - KeyR: Reset timer
   - KeyS: Toggle settings
   - Escape: Close settings
   - Input field handling

5. **theme.test.ts** - Tests for theme management
   - Dark/light/auto themes
   - System preference detection
   - Theme persistence

6. **theme-shortcuts.test.ts** - Integration tests for themes and shortcuts

7. **timer*.test.ts** - Timer functionality tests
   - Timer initialization
   - Start/pause/reset
   - Mode transitions
   - Auto-start behavior
   - Resume functionality
   - UI updates
   - Advanced features

8. **basic.test.ts** - Basic sanity tests

### E2E Tests (`/e2e`)

Playwright E2E tests verify the complete user experience:

1. **pomodoro.spec.ts**
   - Application loading
   - Timer start/pause/reset
   - Settings panel
   - Theme switching
   - Keyboard shortcuts
   - localStorage persistence
   - Mode transitions
   - Timer completion
   - Responsive design (mobile/tablet/desktop)

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

- Environment: jsdom
- Coverage provider: v8
- Excluded from tests: node_modules, dist, e2e
- Path aliases: @, @js, @tests

### Playwright Configuration (`playwright.config.ts`)

- Test directory: ./e2e
- Base URL: http://localhost:3000
- Projects: Chromium (Desktop Chrome)
- Web server: npm run dev (auto-starts)

## Improvements Made

### Before
- 28 tests
- 80.54% statement coverage
- 61.3% branch coverage
- app.ts: 66.66% coverage

### After
- 66 tests (+135% increase)
- 87.03% statement coverage (+6.49%)
- 70.85% branch coverage (+9.55%)
- app.ts: 95.55% coverage (+28.89%)

### Key Additions

1. **New Test Files**:
   - analytics.test.ts (8 tests)
   - keyboard-events.test.ts (10 tests)
   - theme.test.ts (10 tests)

2. **Enhanced Existing Tests**:
   - app-utils.test.ts: 5 → 15 tests
   - More edge cases and error scenarios

3. **E2E Testing Suite**:
   - 11 comprehensive end-to-end tests
   - Real browser testing with Playwright
   - Multi-viewport testing

4. **Fixed Issues**:
   - Updated AudioContext mocking for Vitest 4.x
   - Fixed package.json dependency conflicts
   - Corrected test command to use Vitest instead of Bun

## Coverage Goals

The only significant uncovered code is:
- **Lines 248-255 in app.ts**: Service Worker registration (hard to test in jsdom)
- **Lines 28, 41-42 in audio.ts**: Specific audio edge cases
- **Various edge cases in timer.ts**: Complex timer state transitions

These represent legitimate edge cases that would require additional mocking complexity or are environment-specific (Service Worker).

## Best Practices

1. **Run tests before committing**: `npm test`
2. **Check coverage regularly**: `npm run test:coverage`
3. **Test new features**: Add unit tests for new functionality
4. **E2E for user flows**: Use Playwright for critical user journeys
5. **Keep tests fast**: Unit tests complete in ~5 seconds

## Continuous Integration

Tests are designed to run in CI environments:
- Vitest runs in CI mode automatically
- Playwright includes retry logic for E2E tests
- Coverage reports can be uploaded to coverage services

## Troubleshooting

### Tests fail with "document is not defined"
- Make sure vitest.config.ts has `environment: 'jsdom'`

### Playwright can't find browsers
- Run: `npx playwright install`

### Coverage not showing
- Run: `npm run test:coverage` instead of `npm test`

### E2E tests timeout
- Increase timeout in playwright.config.ts
- Check if http-server starts properly on port 3000
