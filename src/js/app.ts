// Main application initialization and utility functions

type Theme = 'dark' | 'light' | 'auto';
type ShortcutKey = 'Space' | 'KeyR' | 'KeyS' | 'Escape';
type ToastType = 'info' | 'success' | 'error';

// Theme management
export class ThemeManager {
  currentTheme: Theme;

  constructor() {
    this.currentTheme = (localStorage.getItem('theme') as Theme) || 'auto';
    this.init();
  }

  init(): void {
    this.applyTheme();
    this.setupThemeToggle();
  }

  applyTheme(): void {
    const root = document.documentElement;

    if (this.currentTheme === 'dark') {
      root.classList.add('dark-theme');
    } else if (this.currentTheme === 'light') {
      root.classList.remove('dark-theme');
    } else {
      // Auto theme - follow system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      if (prefersDark) {
        root.classList.add('dark-theme');
      } else {
        root.classList.remove('dark-theme');
      }
    }
  }

  setupThemeToggle(): void {
    // Listen for system theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }
      });
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }
}

// Keyboard shortcuts helper
export class KeyboardShortcuts {
  shortcuts: Record<ShortcutKey, string>;

  constructor() {
    this.shortcuts = {
      Space: 'Toggle timer (Start/Pause)',
      KeyR: 'Reset timer',
      KeyS: 'Toggle settings',
      Escape: 'Close settings'
    };

    this.init();
  }

  init(): void {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      if ((e.target as HTMLElement).matches('input, textarea, select')) {
        return;
      }

      switch (e.code) {
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser refresh
          e.preventDefault();
          if ((window as any).pomodoroTimer) {
            (window as any).pomodoroTimer.reset();
          }
          break;

        case 'KeyS':
          e.preventDefault();
          this.toggleSettings();
          break;

        case 'Escape':
          e.preventDefault();
          this.closeSettings();
          break;
      }
    });
  }

  toggleSettings(): void {
    const settingsPanel = document.getElementById('settings-panel');
    settingsPanel?.classList.toggle('active');
  }

  closeSettings(): void {
    const settingsPanel = document.getElementById('settings-panel');
    settingsPanel?.classList.remove('active');
  }
}

interface AnalyticsEvent {
  event: string;
  data: Record<string, any>;
  timestamp: number;
}

// Analytics helper (privacy-focused)
export class Analytics {
  sessionStart: number;
  events: AnalyticsEvent[];

  constructor() {
    this.sessionStart = Date.now();
    this.events = [];
  }

  track(event: string, data: Record<string, any> = {}): void {
    this.events.push({
      event,
      data,
      timestamp: Date.now()
    });

    // Keep only last 100 events to avoid memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  getSessionSummary(): {
    sessionDuration: number;
    totalEvents: number;
    timerEvents: number;
  } {
    const sessionDuration = Date.now() - this.sessionStart;
    const timerEvents = this.events.filter((e) => e.event.includes('timer'));

    return {
      sessionDuration: Math.round(sessionDuration / 1000 / 60), // minutes
      totalEvents: this.events.length,
      timerEvents: timerEvents.length
    };
  }
}

// Utility functions
export const utils = {
  // Format time in human readable format
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },

  // Show toast notification
  showToast(message: string, type: ToastType = 'info'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add styles if not already defined
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease;
                }
                .toast-info { background: #3498db; }
                .toast-success { background: #27ae60; }
                .toast-error { background: #e74c3c; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Debounce function for performance
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | undefined;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = window.setTimeout(later, wait);
    };
  }
};

// Extend window interface for global application objects
declare global {
  interface Window {
    themeManager?: ThemeManager;
    keyboardShortcuts?: KeyboardShortcuts;
    analytics?: Analytics;
    utils?: typeof utils;
    pomodoroTimer?: any;
    playTone?: any;
  }
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme manager
  (window as any).themeManager = new ThemeManager();

  // Initialize keyboard shortcuts
  (window as any).keyboardShortcuts = new KeyboardShortcuts();

  // Initialize analytics
  (window as any).analytics = new Analytics();

  // Add global utilities
  (window as any).utils = utils;

  // Welcome message
  console.log('🍅 Pomodoro Timer initialized successfully!');
  console.log('Keyboard shortcuts:', (window as any).keyboardShortcuts.shortcuts);
});
