// Icon initialization using Lucide
import { createIcons, Pause, Play, RotateCcw, Settings, Timer, X } from 'lucide'

export function initializeIcons(): void {
  createIcons({
    icons: {
      Play,
      Pause,
      RotateCcw,
      Settings,
      Timer,
      X
    },
    // Icons are decorative; their buttons carry accessible names via
    // aria-label. Hide the SVGs from assistive tech and the tab order.
    attrs: {
      'aria-hidden': 'true',
      focusable: 'false'
    }
  })
}

// Initialize icons when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeIcons()
  })
}
