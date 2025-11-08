// Icon initialization using Lucide
import { createIcons, Play, Pause, RotateCcw, Settings, Timer } from 'lucide'

export function initializeIcons(): void {
  createIcons({
    icons: {
      Play,
      Pause,
      RotateCcw,
      Settings,
      Timer
    }
  })
}

// Initialize icons when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeIcons()
  })
}
