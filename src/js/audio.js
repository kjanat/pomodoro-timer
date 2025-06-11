function playTone (frequency, duration = 0.3) {
  if (typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return
  if (!playTone.ctx) {
    playTone.ctx = new AudioContextClass()
  }
  const ctx = playTone.ctx
  if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
    try {
      ctx.resume()
    } catch (error) {
      console.error('Error resuming AudioContext:', error)
    }
  }
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.value = 0.2
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + duration)
  oscillator.onended = () => {
    oscillator.disconnect()
    gain.disconnect()
  }
}

if (typeof window !== 'undefined') {
  window.playTone = playTone
}

if (typeof module !== 'undefined') {
  module.exports = { playTone }
}
