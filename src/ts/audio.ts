let audioContext: AudioContext | null

export interface PlayToneFn {
  (frequency: number, duration?: number): void
  ctx?: AudioContext | null
}

export const playTone: PlayToneFn = function playTone(
  frequency: number,
  duration = 0.3
) {
  if (typeof window === 'undefined') return
  if ((playTone as PlayToneFn).ctx === undefined) {
    audioContext = null
  }
  interface WebKitWindow extends Window {
    webkitAudioContext?: typeof AudioContext
  }
  const AudioContextClass =
    window.AudioContext || (window as WebKitWindow).webkitAudioContext
  if (!AudioContextClass) return
  if (!audioContext) {
    audioContext = new AudioContextClass()
  }
  const ctx = audioContext
  ;(playTone as PlayToneFn).ctx = ctx
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
} as PlayToneFn

if (typeof window !== 'undefined') {
  interface ToneWindow extends Window {
    playTone?: PlayToneFn
  }
  ;(window as ToneWindow).playTone = playTone
}
