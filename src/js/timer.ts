import { playTone } from '@js/audio'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

interface TimerState {
  mode: TimerMode
  isRunning: boolean
  isPaused: boolean
  remainingTime: number
  totalTime: number
  sessionCount: number
  completedSessions: number
  totalFocusTime: number
}

interface TimerSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
}

interface TimerOptions {
  skipInit?: boolean
}

interface SavedStats {
  date: string
  completedSessions?: number
  totalFocusTime?: number
  sessionCount?: number
  mode?: TimerMode
  remainingTime?: number
  totalTime?: number
  isRunning?: boolean
  isPaused?: boolean
  lastUpdated?: number
}

export class PomodoroTimer {
  state: TimerState
  settings: TimerSettings
  intervalId: number | null = null
  progressRing: SVGCircleElement | null = null
  circumference: number = 0
  saveTimeout: number | null = null
  beforeUnloadHandler: (() => void) | null = null

  constructor(options: TimerOptions = {}) {
    this.state = {
      mode: 'focus',
      isRunning: false,
      isPaused: false,
      remainingTime: 25 * 60,
      totalTime: 25 * 60,
      sessionCount: 1,
      completedSessions: 0,
      totalFocusTime: 0
    }

    this.settings = {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: true,
      autoStartFocus: true,
      soundEnabled: true
    }

    if (!options.skipInit) {
      this.init()
    }
  }

  init(): void {
    this.setupProgressRing()
    this.loadSettings()
    const resume = this.loadStats()
    this.updateUI()
    this.bindEvents()
    if (resume) {
      this.start()
    }
  }

  setupProgressRing(): void {
    this.progressRing = document.querySelector('.progress-ring__progress')
    if (!this.progressRing) return
    const radius = this.progressRing.r.baseVal.value
    this.circumference = radius * 2 * Math.PI

    this.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`
    this.progressRing.style.strokeDashoffset = String(this.circumference)
  }

  updateProgress(): void {
    if (!this.progressRing) return
    const progress =
      (this.state.totalTime - this.state.remainingTime) / this.state.totalTime
    const offset = this.circumference - progress * this.circumference
    this.progressRing.style.strokeDashoffset = String(offset)
  }

  bindEvents(): void {
    document
      .getElementById('start-button')
      ?.addEventListener('click', () => this.start())
    document
      .getElementById('pause-button')
      ?.addEventListener('click', () => this.pause())
    document
      .getElementById('reset-button')
      ?.addEventListener('click', () => this.reset())

    // Settings toggle
    document
      .getElementById('settings-toggle-btn')
      ?.addEventListener('click', () => {
        const panel = document.getElementById('settings-panel')
        panel?.classList.toggle('active')
      })

    // Settings inputs
    document
      .getElementById('focus-duration')
      ?.addEventListener('change', (e) => {
        this.settings.focusDuration = parseInt(
          (e.target as HTMLInputElement).value
        )
        this.saveSettings()
        if (this.state.mode === 'focus' && !this.state.isRunning) {
          this.setMode('focus')
        }
      })

    document
      .getElementById('short-break-duration')
      ?.addEventListener('change', (e) => {
        this.settings.shortBreakDuration = parseInt(
          (e.target as HTMLInputElement).value
        )
        this.saveSettings()
      })

    document
      .getElementById('long-break-duration')
      ?.addEventListener('change', (e) => {
        this.settings.longBreakDuration = parseInt(
          (e.target as HTMLInputElement).value
        )
        this.saveSettings()
      })

    document
      .getElementById('long-break-interval')
      ?.addEventListener('change', (e) => {
        this.settings.longBreakInterval = parseInt(
          (e.target as HTMLInputElement).value
        )
        this.saveSettings()
      })

    document
      .getElementById('auto-start-breaks')
      ?.addEventListener('change', (e) => {
        this.settings.autoStartBreaks = (e.target as HTMLInputElement).checked
        this.saveSettings()
      })

    document
      .getElementById('auto-start-focus')
      ?.addEventListener('change', (e) => {
        this.settings.autoStartFocus = (e.target as HTMLInputElement).checked
        this.saveSettings()
      })

    document
      .getElementById('sound-enabled')
      ?.addEventListener('change', (e) => {
        this.settings.soundEnabled = (e.target as HTMLInputElement).checked
        this.saveSettings()
      })

    if (typeof window !== 'undefined') {
      if (this.beforeUnloadHandler) {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler)
      }
      this.beforeUnloadHandler = () => {
        this.saveStats()
      }
      window.addEventListener('beforeunload', this.beforeUnloadHandler)
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !(e.target as HTMLElement).matches('input')) {
        e.preventDefault()
        if (this.state.isRunning) {
          this.pause()
        } else {
          this.start()
        }
      }
    })
  }

  start(): void {
    if (this.state.isRunning) return

    this.state.isRunning = true
    this.state.isPaused = false
    this.clearScheduledSave()
    this.saveStats()

    if (this.settings.soundEnabled) {
      playTone(440)
    }

    this.intervalId = window.setInterval(() => {
      this.tick()
    }, 1000)

    this.updateUI()
  }

  pause(): void {
    if (!this.state.isRunning) return

    this.state.isRunning = false
    this.state.isPaused = true
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
    }
    this.clearScheduledSave()
    this.saveStats()
    this.updateUI()
  }

  reset(): void {
    this.state.isRunning = false
    this.state.isPaused = false
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
    }
    this.clearScheduledSave()

    // Reset to current mode's duration
    const duration = this.getModeDuration(this.state.mode)
    this.state.remainingTime = duration * 60
    this.state.totalTime = duration * 60

    this.saveStats()
    this.updateUI()
  }

  tick(): void {
    this.state.remainingTime--
    this.updateProgress()
    this.updateDisplay()
    this.scheduleSaveStats()

    if (this.state.remainingTime <= 0) {
      this.complete()
    }
  }

  complete(): void {
    this.state.isRunning = false
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
    }

    if (this.settings.soundEnabled) {
      playTone(880)
    }

    // Update stats
    if (this.state.mode === 'focus') {
      this.state.completedSessions++
      this.state.totalFocusTime += this.settings.focusDuration
      this.clearScheduledSave()
      this.saveStats()
    }

    // Show notification
    this.showNotification()

    // Auto-advance to next mode after short delay
    setTimeout(() => {
      this.advanceMode()
    }, 1000)
  }

  advanceMode(): void {
    if (this.state.mode === 'focus') {
      // Check if it's time for a long break
      if (
        this.state.completedSessions % this.settings.longBreakInterval ===
        0
      ) {
        this.setMode('longBreak')
      } else {
        this.setMode('shortBreak')
      }

      if (this.settings.autoStartBreaks) {
        this.start()
      }
    } else {
      // Coming back from any break
      this.state.sessionCount++
      this.setMode('focus')

      if (this.settings.autoStartFocus) {
        this.start()
      }
    }
  }

  setMode(mode: TimerMode): void {
    this.state.mode = mode
    const duration = this.getModeDuration(mode)
    this.state.remainingTime = duration * 60
    this.state.totalTime = duration * 60
    this.clearScheduledSave()
    this.saveStats()
    this.updateUI()
  }

  getModeDuration(mode: TimerMode): number {
    switch (mode) {
      case 'focus':
        return this.settings.focusDuration
      case 'shortBreak':
        return this.settings.shortBreakDuration
      case 'longBreak':
        return this.settings.longBreakDuration
      default:
        return this.settings.focusDuration
    }
  }

  updateUI(): void {
    this.updateDisplay()
    this.updateModeText()
    this.updateButtons()
    this.updateProgress()
    this.updateStats()
    this.updateProgressRingColor()
  }

  updateDisplay(): void {
    const minutes = Math.floor(this.state.remainingTime / 60)
    const seconds = this.state.remainingTime % 60
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    const displayElement = document.getElementById('timer-display')
    if (displayElement) {
      displayElement.textContent = display
    }

    // Update page title
    document.title = `${display} - ${this.getModeText()} | 🍅 Focus Timer`
  }

  updateModeText(): void {
    const modeElement = document.getElementById('current-mode')
    const sessionElement = document.getElementById('session-count')

    if (modeElement) {
      modeElement.textContent = this.getModeText()
    }
    if (sessionElement) {
      sessionElement.textContent = `Session ${this.state.sessionCount}`
    }
  }

  getModeText(): string {
    switch (this.state.mode) {
      case 'focus':
        return 'Focus Time'
      case 'shortBreak':
        return 'Short Break'
      case 'longBreak':
        return 'Long Break'
      default:
        return 'Focus Time'
    }
  }

  updateButtons(): void {
    const startBtn = document.getElementById(
      'start-button'
    ) as HTMLButtonElement | null
    const pauseBtn = document.getElementById(
      'pause-button'
    ) as HTMLButtonElement | null
    const resetBtn = document.getElementById(
      'reset-button'
    ) as HTMLButtonElement | null

    if (!startBtn || !pauseBtn || !resetBtn) return

    if (this.state.isRunning) {
      startBtn.style.display = 'none'
      pauseBtn.style.display = 'flex'
      resetBtn.disabled = false
    } else {
      startBtn.style.display = 'flex'
      pauseBtn.style.display = 'none'
      resetBtn.disabled = false

      const btnText = startBtn.querySelector('.btn-text')

      if (this.state.isPaused) {
        if (btnText) btnText.textContent = 'Resume'
      } else {
        if (btnText) btnText.textContent = 'Start'
      }
    }
  }

  updateProgressRingColor(): void {
    if (!this.progressRing) return
    switch (this.state.mode) {
      case 'focus':
        this.progressRing.style.stroke = '#e74c3c'
        break
      case 'shortBreak':
        this.progressRing.style.stroke = '#27ae60'
        break
      case 'longBreak':
        this.progressRing.style.stroke = '#3498db'
        break
    }
  }

  updateStats(): void {
    const completedSessionsElement =
      document.getElementById('completed-sessions')
    if (completedSessionsElement) {
      completedSessionsElement.textContent = String(
        this.state.completedSessions
      )
    }

    const hours = Math.floor(this.state.totalFocusTime / 60)
    const minutes = this.state.totalFocusTime % 60
    const totalFocusTimeElement = document.getElementById('total-focus-time')
    if (totalFocusTimeElement) {
      totalFocusTimeElement.textContent = `${hours}h ${minutes}m`
    }
  }

  scheduleSaveStats(): void {
    if (this.saveTimeout) {
      return
    }

    this.saveTimeout = window.setTimeout(() => {
      this.saveStats()
      this.saveTimeout = null
    }, 5000)
  }

  clearScheduledSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  }

  showNotification(): void {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const modeText = this.getModeText()
        const message =
          this.state.mode === 'focus'
            ? 'Great job! Time for a break.'
            : 'Break time is over. Ready to focus?'

        new Notification(`${modeText} Complete!`, {
          body: message,
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍅</text></svg>'
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }
  }

  loadSettings(): void {
    const saved = localStorage.getItem('pomodoro-settings')
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) }
    }

    // Update UI inputs
    const focusDurationInput = document.getElementById(
      'focus-duration'
    ) as HTMLInputElement
    const shortBreakInput = document.getElementById(
      'short-break-duration'
    ) as HTMLInputElement
    const longBreakInput = document.getElementById(
      'long-break-duration'
    ) as HTMLInputElement
    const longBreakIntervalInput = document.getElementById(
      'long-break-interval'
    ) as HTMLInputElement
    const autoStartBreaksInput = document.getElementById(
      'auto-start-breaks'
    ) as HTMLInputElement
    const autoStartFocusInput = document.getElementById(
      'auto-start-focus'
    ) as HTMLInputElement
    const soundEnabledInput = document.getElementById(
      'sound-enabled'
    ) as HTMLInputElement

    if (focusDurationInput)
      focusDurationInput.value = String(this.settings.focusDuration)
    if (shortBreakInput)
      shortBreakInput.value = String(this.settings.shortBreakDuration)
    if (longBreakInput)
      longBreakInput.value = String(this.settings.longBreakDuration)
    if (longBreakIntervalInput)
      longBreakIntervalInput.value = String(this.settings.longBreakInterval)
    if (autoStartBreaksInput)
      autoStartBreaksInput.checked = this.settings.autoStartBreaks
    if (autoStartFocusInput)
      autoStartFocusInput.checked = this.settings.autoStartFocus
    if (soundEnabledInput)
      soundEnabledInput.checked = this.settings.soundEnabled

    // Apply current settings
    const duration = this.getModeDuration(this.state.mode)
    this.state.remainingTime = duration * 60
    this.state.totalTime = duration * 60
  }

  saveSettings(): void {
    localStorage.setItem('pomodoro-settings', JSON.stringify(this.settings))
  }

  loadStats(): boolean {
    const today = new Date().toDateString()
    const saved = localStorage.getItem('pomodoro-stats')
    let resume = false

    if (saved) {
      const stats: SavedStats = JSON.parse(saved)
      if (stats.date === today) {
        this.state.completedSessions = stats.completedSessions || 0
        this.state.totalFocusTime = stats.totalFocusTime || 0
        this.state.sessionCount = stats.sessionCount || this.state.sessionCount
        this.state.mode = stats.mode || this.state.mode

        if (typeof stats.remainingTime === 'number') {
          this.state.remainingTime = stats.remainingTime
        }
        if (typeof stats.totalTime === 'number') {
          this.state.totalTime = stats.totalTime
        }

        this.state.isRunning = stats.isRunning || false
        this.state.isPaused = stats.isPaused || false

        if (this.state.isRunning && !this.state.isPaused) {
          if (stats.lastUpdated) {
            const elapsed = Math.floor((Date.now() - stats.lastUpdated) / 1000)
            this.state.remainingTime -= elapsed
            if (this.state.remainingTime <= 0) {
              this.state.remainingTime = 0
              this.complete()
            } else {
              resume = true
            }
          } else {
            resume = true
          }
        }
      }
    }

    return resume
  }

  saveStats(): void {
    const today = new Date().toDateString()
    const stats: SavedStats = {
      date: today,
      completedSessions: this.state.completedSessions,
      totalFocusTime: this.state.totalFocusTime,
      sessionCount: this.state.sessionCount,
      mode: this.state.mode,
      remainingTime: this.state.remainingTime,
      totalTime: this.state.totalTime,
      isRunning: this.state.isRunning,
      isPaused: this.state.isPaused,
      lastUpdated: Date.now()
    }

    localStorage.setItem('pomodoro-stats', JSON.stringify(stats))
  }
}

// Initialize timer when DOM is loaded (browser only)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ;(window as any).pomodoroTimer = new PomodoroTimer()

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  })
}

export default PomodoroTimer
