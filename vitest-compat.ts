// Bun provides 'vi' global for Vitest compatibility
// This module provides a compatibility layer for Vitest tests

import { vi as bunVi, mock } from 'bun:test'

// Mock the 'vitest' module to redirect imports to bun:test
// This allows existing tests that import from 'vitest' to work with Bun
mock.module('vitest', () => {
  return {
    describe,
    it,
    test,
    expect,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
    vi: bunVi,
  }
})

// Re-export commonly used test utilities for convenience
export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
  vi,
} from 'bun:test'
