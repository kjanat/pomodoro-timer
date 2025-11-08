import { beforeEach, vi } from 'vitest'

// Create localStorage mock factory that tests can use
export function createLocalStorageMock() {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    get length() {
      return Object.keys(store).length
    },
  }
}

// Helper to create mock with vi.fn() for tracking calls
export function createMockLocalStorage(
  getItemImpl?: (key: string) => string | null,
) {
  const clear = vi.fn(() => {})
  return {
    setItem: vi.fn(),
    getItem: vi.fn(getItemImpl || (() => null)),
    removeItem: vi.fn(),
    clear,
    key: vi.fn(),
    length: 0,
  }
}

// Global localStorage mock
const globalLocalStorageMock = createLocalStorageMock()

Object.defineProperty(global, 'localStorage', {
  value: globalLocalStorageMock,
  writable: true,
  configurable: true,
})

// Mock Notification API
class NotificationMock {
  static permission: NotificationPermission = 'granted'
  static requestPermission = vi.fn(() =>
    Promise.resolve('granted' as NotificationPermission),
  )

  constructor(
    public title: string,
    public options?: NotificationOptions,
  ) {}
}

Object.defineProperty(global, 'Notification', {
  value: NotificationMock,
  writable: true,
  configurable: true,
})

// Reset localStorage before each test
beforeEach(() => {
  // Handle both global mock and test-specific overrides
  if (typeof localStorage?.clear === 'function') {
    localStorage.clear()
  }
  // If test overrode it without clear(), restore global mock
  if (!localStorage?.clear) {
    Object.defineProperty(global, 'localStorage', {
      value: globalLocalStorageMock,
      writable: false,
      configurable: true,
    })
    globalLocalStorageMock.clear()
  }
})
