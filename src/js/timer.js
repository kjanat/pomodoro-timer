/* global playTone */
class PomodoroTimer {
  constructor (options = {}) {
    this.state = {
      mode: 'focus', // 'focus', 'shortBreak', 'longBreak'
      isRunning: false,
      isPaused: false,
      remainingTime: 25 * 60, // 25 minutes in seconds
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

    this.intervalId = null
    this.progressRing = null
    this.circumference = 0

    if (!options.skipInit) {
      this.init()
    }
  }

  init () {
    this.setupProgressRing()
    this.loadSettings()
    const resume = this.loadStats()
    this.updateUI()
    this.bindEvents()
    if (resume) {
      this.start()
    }
  }

  setupProgressRing () {
    this.progressRing = document.querySelector('.progress-ring__progress')
    const radius = this.progressRing.r.baseVal.value
    this.circumference = radius * 2 * Math.PI

    this.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`
    this.progressRing.style.strokeDashoffset = this.circumference
  }

  updateProgress () {
    const progress =
      (this.state.totalTime - this.state.remainingTime) / this.state.totalTime
    const offset = this.circumference - progress * this.circumference
    this.progressRing.style.strokeDashoffset = offset
  }

  bindEvents () {
    document
      .getElementById('start-button')
      .addEventListener('click', () => this.start())
    document
      .getElementById('pause-button')
      .addEventListener('click', () => this.pause())
    document
      .getElementById('reset-button')
      .addEventListener('click', () => this.reset())

    // Settings toggle
    document
      .getElementById('settings-toggle-btn')
      .addEventListener('click', () => {
        const panel = document.getElementById('settings-panel')
        panel.classList.toggle('active')
      })

    // Settings inputs
    document
      .getElementById('focus-duration')
      .addEventListener('change', (e) => {
        this.settings.focusDuration = parseInt(e.target.value)
        this.saveSettings()
        if (this.state.mode === 'focus' && !this.state.isRunning) {
          this.setMode('focus')
        }
      })

    document
      .getElementById('short-break-duration')
      .addEventListener('change', (e) => {
        this.settings.shortBreakDuration = parseInt(e.target.value)
        this.saveSettings()
      })

    document
      .getElementById('long-break-duration')
      .addEventListener('change', (e) => {
        this.settings.longBreakDuration = parseInt(e.target.value)
        this.saveSettings()
      })

    document
      .getElementById('long-break-interval')
      .addEventListener('change', (e) => {
        this.settings.longBreakInterval = parseInt(e.target.value)
        this.saveSettings()
      })

    document
      .getElementById('auto-start-breaks')
      .addEventListener('change', (e) => {
        this.settings.autoStartBreaks = e.target.checked
        this.saveSettings()
      })

    document
      .getElementById('auto-start-focus')
      .addEventListener('change', (e) => {
        this.settings.autoStartFocus = e.target.checked
        this.saveSettings()
      })

    document.getElementById('sound-enabled').addEventListener('change', (e) => {
      this.settings.soundEnabled = e.target.checked
      this.saveSettings()
    })

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input')) {
        e.preventDefault()
        if (this.state.isRunning) {
          this.pause()
        } else {
          this.start()
        }
      }
    })
  }

  start () {
    if (this.state.isRunning) return

    this.state.isRunning = true
    this.state.isPaused = false
    this.saveStats()

    if (this.settings.soundEnabled) {
      playTone(440)
    }

    this.intervalId = setInterval(() => {
      this.tick()
    }, 1000)

    this.updateUI()
  }

  pause () {
    if (!this.state.isRunning) return

    this.state.isRunning = false
    this.state.isPaused = true
    clearInterval(this.intervalId)
    this.saveStats()
    this.updateUI()
  }

  reset () {
    this.state.isRunning = false
    this.state.isPaused = false
    clearInterval(this.intervalId)

    // Reset to current mode's duration
    const duration = this.getModeDuration(this.state.mode)
    this.state.remainingTime = duration * 60
    this.state.totalTime = duration * 60

    this.saveStats()
    this.updateUI()
  }

  tick () {
    this.state.remainingTime--
    this.updateProgress()
    this.updateDisplay()
    this.saveStats()

    if (this.state.remainingTime <= 0) {
      this.complete()
    }
  }

  complete () {
    this.state.isRunning = false
    clearInterval(this.intervalId)

    if (this.settings.soundEnabled) {
      playTone(880)
    }

    // Update stats
    if (this.state.mode === 'focus') {
      this.state.completedSessions++
      this.state.totalFocusTime += this.settings.focusDuration
      this.saveStats()
    }

    // Show notification
    this.showNotification()

    // Auto-advance to next mode
    this.advanceMode()
  }

  advanceMode () {
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
        setTimeout(() => this.start(), 1000)
      }
    } else {
      // Coming back from any break
      this.state.sessionCount++
      this.setMode('focus')

      if (this.settings.autoStartFocus) {
        setTimeout(() => this.start(), 1000)
      }
    }
  }

  setMode (mode) {
    this.state.mode = mode
    const duration = this.getModeDuration(mode)
    this.state.remainingTime = duration * 60
    this.state.totalTime = duration * 60
    this.saveStats()
    this.updateUI()
  }

  getModeDuration (mode) {
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

  updateUI () {
    this.updateDisplay()
    this.updateModeText()
    this.updateButtons()
    this.updateProgress()
    this.updateStats()
    this.updateProgressRingColor()
  }

  updateDisplay () {
    const minutes = Math.floor(this.state.remainingTime / 60)
    const seconds = this.state.remainingTime % 60
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    document.getElementById('timer-display').textContent = display

    // Update page title
    document.title = `${display} - ${this.getModeText()} | 🍅 Focus Timer`
  }

  updateModeText () {
    const modeElement = document.getElementById('current-mode')
    const sessionElement = document.getElementById('session-count')

    modeElement.textContent = this.getModeText()
    sessionElement.textContent = `Session ${this.state.sessionCount}`
  }

  getModeText () {
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

  updateButtons () {
    const startBtn = document.getElementById('start-button')
    const pauseBtn = document.getElementById('pause-button')
    const resetBtn = document.getElementById('reset-button')

    if (this.state.isRunning) {
      startBtn.style.display = 'none'
      pauseBtn.style.display = 'flex'
      resetBtn.disabled = false
    } else {
      startBtn.style.display = 'flex'
      pauseBtn.style.display = 'none'
      resetBtn.disabled = false

      if (this.state.isPaused) {
        startBtn.querySelector('.btn-text').textContent = 'Resume'
        startBtn.querySelector('.btn-icon').textContent = '▶'
      } else {
        startBtn.querySelector('.btn-text').textContent = 'Start'
        startBtn.querySelector('.btn-icon').textContent = '▶'
      }
    }
  }

  updateProgressRingColor () {
    const ring = this.progressRing
    switch (this.state.mode) {
      case 'focus':
        ring.style.stroke = '#e74c3c'
        break
      case 'shortBreak':
        ring.style.stroke = '#27ae60'
        break
      case 'longBreak':
        ring.style.stroke = '#3498db'
        break
    }
  }

  updateStats () {
    document.getElementById('completed-sessions').textContent =
      this.state.completedSessions

    const hours = Math.floor(this.state.totalFocusTime / 60)
    const minutes = this.state.totalFocusTime % 60
    document.getElementById('total-focus-time').textContent =
      `${hours}h ${minutes}m`
  }

  showNotification () {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const modeText = this.getModeText()
        const message =
          this.state.mode === 'focus'
            ? 'Great job! Time for a break.'
            : 'Break time is over. Ready to focus?'

        // eslint-disable-next-line no-new
        new Notification(`${modeText} Complete!`, {
          body: message,
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍅</text></svg>'
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }
  }

  loadSettings () {
    const saved = localStorage.getItem('pomodoro-settings')
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) }
    }

    // Update UI inputs
    document.getElementById('focus-duration').value =
      this.settings.focusDuration
    document.getElementById('short-break-duration').value =
      this.settings.shortBreakDuration
    document.getElementById('long-break-duration').value =
      this.settings.longBreakDuration
    document.getElementById('long-break-interval').value =
      this.settings.longBreakInterval
    document.getElementById('auto-start-breaks').checked =
      this.settings.autoStartBreaks
    document.getElementById('auto-start-focus').checked =
      this.settings.autoStartFocus
    document.getElementById('sound-enabled').checked =
      this.settings.soundEnabled

    // Apply current settings
    const duration = this.getModeDuration(this.state.mode)
    this.state.remainingTime = duration * 60
    this.state.totalTime = duration * 60
  }

  saveSettings () {
    localStorage.setItem('pomodoro-settings', JSON.stringify(this.settings))
  }

  loadStats () {
    const today = new Date().toDateString()
    const saved = localStorage.getItem('pomodoro-stats')
    let resume = false

    if (saved) {
      const stats = JSON.parse(saved)
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

        if (stats.lastUpdated && this.state.isRunning && !this.state.isPaused) {
          const elapsed = Math.floor((Date.now() - stats.lastUpdated) / 1000)
          this.state.remainingTime -= elapsed
          if (this.state.remainingTime <= 0) {
            this.state.remainingTime = 0
            this.complete()
          } else {
            resume = true
          }
        }
      }
    }

    return resume
  }

  saveStats () {
    const today = new Date().toDateString()
    const stats = {
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
    window.pomodoroTimer = new PomodoroTimer()

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  })
}

if (typeof module !== 'undefined') {
  module.exports = PomodoroTimer
}
