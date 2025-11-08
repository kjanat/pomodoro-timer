import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { PropertySymbol } from 'happy-dom'

GlobalRegistrator.register()

// Use Happy DOM's timer methods instead of Node.js timers for proper fake timer support
// This fixes issues with vi.useFakeTimers() and vi.advanceTimersByTime()
const browserWindow = (
  global.document as unknown as Record<symbol, Window & typeof globalThis>
)[PropertySymbol.window]

if (browserWindow) {
  global.setTimeout = browserWindow.setTimeout.bind(browserWindow)
  global.clearTimeout = browserWindow.clearTimeout.bind(browserWindow)
  global.setInterval = browserWindow.setInterval.bind(browserWindow)
  global.clearInterval = browserWindow.clearInterval.bind(browserWindow)
  global.requestAnimationFrame =
    browserWindow.requestAnimationFrame.bind(browserWindow)
  global.cancelAnimationFrame =
    browserWindow.cancelAnimationFrame.bind(browserWindow)
  global.queueMicrotask = browserWindow.queueMicrotask.bind(browserWindow)
}
