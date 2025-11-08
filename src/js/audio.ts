type AudioContextType = AudioContext | typeof window.webkitAudioContext;

interface PlayToneFunction {
  (frequency: number, duration?: number): void;
  ctx?: AudioContext;
}

export const playTone: PlayToneFunction = function playTone(
  frequency: number,
  duration: number = 0.3
): void {
  if (typeof window === 'undefined') return;
  const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  if (!AudioContextClass) return;
  if (!playTone.ctx) {
    playTone.ctx = new AudioContextClass();
  }
  const ctx = playTone.ctx;
  if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
    try {
      ctx.resume();
    } catch (error) {
      console.error('Error resuming AudioContext:', error);
    }
  }
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.2;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
};

if (typeof window !== 'undefined') {
  (window as any).playTone = playTone;
}
