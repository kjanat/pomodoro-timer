# CI/CD Workflow Documentation

## Overview

Optimized GitHub Actions workflow for the Pomodoro Timer application with parallel job execution, intelligent caching, and conditional deployment.

## Workflow Structure

### Jobs Pipeline

```text
┌─────────────────────────────────────────────┐
│     Pull Request or Push to main/master     │
└─────────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        │   Parallel Execution   │
        └───────────┬───────────┘
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
┌─────────┐   ┌──────────┐   ┌──────────┐
│ Quality │   │  Unit    │   │   E2E    │
│  Checks │   │  Tests   │   │  Tests   │
└────┬────┘   └────┬─────┘   └────┬─────┘
     └─────────────┼──────────────┘
                   ↓
              ┌────────┐
              │ Build  │
              └────┬───┘
                   ↓
         ┌──────────────────┐
         │ Deploy (if main) │
         └──────────────────┘
```

## Job Details

### 1. Quality (Parallel)

- **Duration**: ~2-3 minutes
- **Purpose**: Code quality validation
- **Steps**:
  - Biome formatting check
  - Biome linting
  - TypeScript type checking
- **Optimizations**:
  - Runs in parallel with other test jobs
  - Uses cached dependencies
  - 10-minute timeout for fast failure

### 2. Unit Tests (Parallel)

- **Duration**: ~2-4 minutes
- **Purpose**: Run all Vitest unit tests with coverage
- **Steps**:
  - Execute 15 test files in tests/ directory
  - Generate coverage reports
  - Upload coverage artifacts
- **Optimizations**:
  - Parallel execution with quality/e2e jobs
  - Coverage reports retained for 30 days
  - Always uploads artifacts (even on failure)

### 3. E2E Tests (Parallel)

- **Duration**: ~3-5 minutes
- **Purpose**: Playwright browser testing
- **Steps**:
  - Install Playwright browsers (cached)
  - Run 2 E2E test files
  - Upload reports and traces on failure
- **Optimizations**:
  - Separate browser cache for faster installs
  - Chromium only (configured in playwright.config.ts)
  - Traces uploaded only on failure (saves space)
  - 15-minute timeout for longer E2E scenarios

### 4. Build (Sequential)

- **Duration**: ~1-2 minutes
- **Purpose**: Build production artifacts
- **Dependencies**: Waits for quality, unit-tests, e2e-tests
- **Steps**:
  - Build project with Bun
  - Upload build output
  - Configure GitHub Pages (main/master only)
- **Optimizations**:
  - Only runs if all tests pass
  - Conditional Pages setup (deployment branches only)

### 5. Deploy (Conditional)

- **Duration**: ~30-60 seconds
- **Purpose**: Deploy to GitHub Pages
- **Conditions**:
  - Only on push events (not PRs)
  - Only on main or master branch
- **Dependencies**: Waits for build job

## Key Optimizations

### 1. Parallel Execution

```yaml
# Three jobs run simultaneously:
quality →
unit-tests → build → deploy
e2e-tests →
```

**Benefit**: 60-70% faster than sequential execution (8-10 min → 3-5 min total)

### 2. Intelligent Caching

#### Bun Dependencies Cache

```yaml
key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
```

- Invalidates only when bun.lock changes
- Shared across all jobs
- **Saves**: ~30-45 seconds per job

#### Playwright Browser Cache

```yaml
key: ${{ runner.os }}-playwright-${{ hashFiles('**/bun.lock') }}
```

- Caches ~200MB of browser binaries
- Installs system deps only when cache hits
- **Saves**: ~60-90 seconds on cached runs

### 3. Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

- **PRs**: Cancels outdated runs when new commits pushed
- **main/master**: Never cancels (allows deployments to complete)
- **Benefit**: Saves CI minutes, faster PR feedback

### 4. Smart Artifact Retention

- **Coverage reports**: 30 days (long-term tracking)
- **Build output**: 7 days (short-term verification)
- **Playwright traces**: 7 days, failure only (debugging)

### 5. Frozen Lockfile

```yaml
run: bun install --frozen-lockfile
```

- Ensures reproducible builds
- Fails fast if lockfile out of sync
- Prevents accidental dependency updates in CI

### 6. Timeouts

- **Quality/Unit**: 10 minutes (fast failure)
- **E2E**: 15 minutes (browser tests take longer)
- **Build/Deploy**: 10 minutes

## Performance Comparison

### Before (Sequential)

```text
Quality (3m) → Unit Tests (3m) → E2E (4m) → Build (2m) → Deploy (1m)
Total: ~13 minutes
```

### After (Optimized Parallel)

```text
┌─ Quality (3m)    ─┐
├─ Unit Tests (3m) ─┤ → Build (2m) → Deploy (1m)
└─ E2E (4m)        ─┘
Total: ~7 minutes (46% faster)
```

With caching on subsequent runs:

```text
Total: ~4-5 minutes (65% faster)
```

## Branch Strategy

### Pull Requests

- ✅ All quality checks run
- ✅ All tests run
- ✅ Build validated
- ❌ No deployment
- ✅ Outdated runs canceled

### Main/Master Branch

- ✅ All quality checks run
- ✅ All tests run
- ✅ Build created
- ✅ Deploy to GitHub Pages
- ❌ Runs never canceled (deployment safety)

## Artifact Downloads

### View Coverage Report

```bash
gh run download [run-id] -n coverage-report
```

### View Playwright Report

```bash
gh run download [run-id] -n playwright-report
bunx playwright show-report ./playwright-report
```

### View Test Traces (failures only)

```bash
gh run download [run-id] -n playwright-traces
bunx playwright show-trace ./test-results/[test-name]/trace.zip
```

## Permissions

### Minimal Required Permissions

```yaml
permissions:
  contents: read      # Checkout code
  pages: write        # Deploy to Pages
  id-token: write     # OIDC for Pages deployment
```

**Security**: Uses OIDC (OpenID Connect) instead of personal access tokens for enhanced security.

## Best Practices Applied

### ✅ Version Pinning

- Actions use major version tags (v4, v5) for stability with security updates
- Bun uses 'latest' (recommended by Bun team for CI)
- Playwright pinned via bun.lock

### ✅ Fail Fast

- 10-15 minute timeouts prevent hung jobs
- `--frozen-lockfile` catches dependency issues early
- Type checking runs before tests

### ✅ Resource Efficiency

- Conditional artifact uploads
- Chromium-only E2E tests (faster than multi-browser)
- Trace capture only on first retry

### ✅ Developer Experience

- Clear job names
- Always upload reports (even on failure)
- Helpful artifact organization
- Smart concurrency for faster PR feedback

## Troubleshooting

### Slow E2E Tests

- Check Playwright browser cache hit rate
- Consider reducing retries (currently 2 in CI)
- Review test parallelization settings

### Cache Misses

- Verify bun.lock is committed
- Check if cache key pattern matches
- Review cache size limits (10GB per repo)

### Failed Deployments

- Verify Pages is enabled in repo settings
- Check branch protection rules
- Ensure OIDC permissions are set

## Future Enhancements

### Recommended Additions

1. **Code Coverage Badge**: Upload to Codecov/Coveralls
2. **Performance Testing**: Lighthouse CI for performance metrics
3. **Matrix Testing**: Test on multiple Bun versions
4. **Dependency Security**: Dependabot or similar
5. **Release Automation**: Semantic release on tags

### Optional Optimizations

1. **Build Cache**: Cache dist/ between jobs
2. **Test Sharding**: Split E2E tests across runners
3. **Preview Deployments**: Deploy PRs to preview URLs
4. **Bundle Analysis**: Track bundle size over time
