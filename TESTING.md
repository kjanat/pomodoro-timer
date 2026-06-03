# Testing Documentation

This document describes the testing setup and coverage for the Pomodoro Timer application.

## Test Overview

The project now includes comprehensive testing with both unit tests and end-to-end (E2E) tests.

### Test Statistics

- **Total Unit Tests**: 70 tests across 16 test files
- **Test runner**: `bun test` (Bun's built-in Jest-compatible runner) with
  [happy-dom](https://github.com/capricorn86/happy-dom) for DOM APIs
- **Overall Code Coverage**: ~94% line coverage (`bun test --coverage`)

### Coverage by File

| File     | Statements | Branches | Functions | Lines  | Uncovered Lines          |
| -------- | ---------- | -------- | --------- | ------ | ------------------------ |
| app.ts   | 95.55%     | 96.96%   | 88.46%    | 95.4%  | 248-255 (Service Worker) |
| audio.ts | 88.88%     | 86.66%   | 50%       | 88%    | 28, 41-42                |
| timer.ts | 84.15%     | 63.57%   | 75%       | 85.01% | Various edge cases       |

## Running Tests

### Unit Tests (`bun test`)

```bash
# Run all unit tests
bun test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage report
bun run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui

# Run E2E tests in headed mode (see browser)
bun run test:e2e:headed

# Install Playwright browsers (first time only)
bunx playwright install
```

### Run All Tests

```bash
bun run test:all
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

7. **timer\*.test.ts** - Timer functionality tests
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

### Bun test configuration (`bunfig.toml` + `happydom.ts`)

- Runner: `bun test` (configured via `[test]` in `bunfig.toml`)
- DOM environment: happy-dom, registered in the `happydom.ts` preload (replaces
  vitest's jsdom). The preload also resets shared globals (`localStorage`,
  `Notification`) between tests, since `bun test` runs all files in one process.
- Test root: `tests/` (so the Playwright `e2e/` specs are not picked up)
- Coverage: built into `bun test --coverage`
- Path aliases (`#js/*`, `#tests/*`): defined as package.json `imports` subpath
  imports and resolved by Bun, tsc (bundler resolution), and the bundler alike

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

4. **Migrated test runner to `bun test`**:
   - Replaced vitest/jsdom with `bun test` + happy-dom (`@happy-dom/global-registrator`)
   - `vi.*` → `jest.*`; `vi.mock` → `mock.module` (restored in `afterAll` so it
     doesn't leak across files); fake timers via `jest.useFakeTimers()`
   - Removed `vitest`, `@vitest/coverage-v8`, and `jsdom` dependencies

## Coverage Goals

The only significant uncovered code is:

- **Lines 248-255 in app.ts**: Service Worker registration (environment-specific)
- **Lines 28, 41-42 in audio.ts**: Specific audio edge cases
- **Various edge cases in timer.ts**: Complex timer state transitions

These represent legitimate edge cases that would require additional mocking complexity or are environment-specific (Service Worker).

## Best Practices

1. **Run tests before committing**: `bun test`
2. **Check coverage regularly**: `bun run test:coverage`
3. **Test new features**: Add unit tests for new functionality
4. **E2E for user flows**: Use Playwright for critical user journeys
5. **Keep tests fast**: Unit tests complete in ~5 seconds

## Continuous Integration

Tests are designed to run in CI environments:

- `bun test` runs headlessly in CI (see `.github/workflows/deploy.yml`)
- Playwright includes retry logic for E2E tests
- Coverage reports can be uploaded to coverage services

## Troubleshooting

### Tests fail with "document is not defined"

- Make sure `bunfig.toml` has `[test] preload = ["./happydom.ts"]` so happy-dom
  registers the DOM globals before the suite runs

### Playwright can't find browsers

- Run: `bunx playwright install`

### Coverage not showing

- Run: `bun run test:coverage` (or `bun test --coverage`)

### E2E tests timeout

- Increase timeout in playwright.config.ts
- Check if http-server starts properly on port 3000
