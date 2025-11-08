import { Analytics } from '@js/app.ts'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Analytics', () => {
  let analytics: Analytics

  beforeEach(() => {
    analytics = new Analytics()
  })

  it('initializes with session start time and empty events', () => {
    expect(analytics.sessionStart).toBeGreaterThan(0)
    expect(analytics.events).toEqual([])
  })

  it('tracks events with timestamp', () => {
    const event = 'test_event'
    const data = { key: 'value' }

    analytics.track(event, data)

    expect(analytics.events).toHaveLength(1)
    expect(analytics.events[0]).toMatchObject({
      event,
      data,
      timestamp: expect.any(Number),
    })
  })

  it('tracks events without data', () => {
    analytics.track('simple_event')

    expect(analytics.events).toHaveLength(1)
    expect(analytics.events[0]).toMatchObject({
      event: 'simple_event',
      data: {},
      timestamp: expect.any(Number),
    })
  })

  it('limits events to last 100 entries', () => {
    // Add 150 events
    for (let i = 0; i < 150; i++) {
      analytics.track(`event_${i}`)
    }

    expect(analytics.events).toHaveLength(100)
    // Should keep the last 100 events (50-149)
    expect(analytics.events[0].event).toBe('event_50')
    expect(analytics.events[99].event).toBe('event_149')
  })

  it('returns session summary with correct data', () => {
    // Track some events
    analytics.track('timer_start')
    analytics.track('timer_pause')
    analytics.track('settings_open')
    analytics.track('timer_reset')

    const summary = analytics.getSessionSummary()

    expect(summary.totalEvents).toBe(4)
    expect(summary.timerEvents).toBe(3) // timer_start, timer_pause, timer_reset
    expect(summary.sessionDuration).toBeGreaterThanOrEqual(0)
  })

  it('filters timer events correctly', () => {
    analytics.track('timer_start')
    analytics.track('settings_toggle')
    analytics.track('timer_complete')
    analytics.track('theme_change')
    analytics.track('timer_break')

    const summary = analytics.getSessionSummary()

    expect(summary.totalEvents).toBe(5)
    expect(summary.timerEvents).toBe(3) // events containing 'timer'
  })

  it('calculates session duration in minutes', () => {
    const now = Date.now()
    analytics.sessionStart = now - 120000 // 2 minutes ago

    const summary = analytics.getSessionSummary()

    expect(summary.sessionDuration).toBe(2)
  })

  it('rounds session duration correctly', () => {
    const now = Date.now()
    analytics.sessionStart = now - 90000 // 1.5 minutes ago

    const summary = analytics.getSessionSummary()

    expect(summary.sessionDuration).toBe(2) // Rounds to nearest minute
  })
})
