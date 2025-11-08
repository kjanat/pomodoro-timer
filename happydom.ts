import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()

// Mock Notification API for bun:test (happy-dom doesn't fully support it)
// Override even if it exists to ensure it's constructable
;(globalThis as any).Notification = class Notification {
  static permission = 'granted'
  title: string
  options?: NotificationOptions
  constructor(title: string, options?: NotificationOptions) {
    this.title = title
    this.options = options
  }
}
