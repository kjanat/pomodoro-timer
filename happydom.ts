import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { beforeEach } from 'bun:test'

// Register happy-dom globals (document, window, etc.) before the test run so
// the timer/UI code that touches the DOM works under `bun test`. This replaces
// vitest's jsdom environment.
GlobalRegistrator.register()

// Keep happy-dom's real Storage instance so we can restore/clear it between
// tests. bun runs every test file in one process (vitest isolated per file), so
// a mock that one file assigns to `globalThis.localStorage` would otherwise leak
// into the next file.
const realLocalStorage = globalThis.localStorage

function installLocalStorage(): void {
  // happy-dom exposes `localStorage` as a read-only global; redefine it as a
  // writable/configurable data property so tests can swap in their own mock via
  // `globalThis.localStorage = {...}` (as they did under jsdom).
  Object.defineProperty(globalThis, 'localStorage', {
    value: realLocalStorage,
    writable: true,
    configurable: true
  })
}

// happy-dom does not provide a constructable Notification, so `new Notification`
// in timer.ts throws. Provide a no-op mock with permission granted so the
// notification path executes without error.
class MockNotification {
  static permission: NotificationPermission = 'granted'
  static requestPermission = async (): Promise<NotificationPermission> =>
    'granted'
  constructor(
    public title: string,
    public options?: NotificationOptions
  ) {}
}

function installGlobals(): void {
  installLocalStorage()
  realLocalStorage.clear()
  ;(globalThis as any).Notification = MockNotification
}

installGlobals()

// Reset shared global state before each test so mocks installed by one file do
// not leak into the next. Runs before file-level beforeEach hooks, so tests that
// install their own localStorage/Notification mocks still win.
beforeEach(() => {
  installGlobals()
})
