# AGENTS.md - Project Context for Autonomous Agents

## Project Overview

**Project Name**: Focus Timer - Pomodoro Technique  
**Repository**: `kjanat/pomodoro-timer`  
**Live URL**: <https://kjanat.github.io/pomodoro-timer/>  
**Type**: Progressive Web Application (PWA)  
**Technology Stack**: Vanilla JavaScript, HTML5, CSS3  
**Deployment**: GitHub Pages with GitHub Actions CI/CD

## Project Purpose

This is a modern, feature-rich Pomodoro timer web application designed to boost productivity using the proven Pomodoro Technique. The application provides a beautiful, responsive interface with advanced features like PWA support, offline functionality, and comprehensive customization options.

## Architecture Overview

### File Structure

```
pomodoro-timer/
├── src/                           # Source code directory
│   ├── index.html                 # Main HTML document with PWA meta tags
│   ├── manifest.json              # PWA manifest for installability
│   ├── sw.js                      # Service worker for offline functionality
│   ├── css/
│   │   └── styles.css             # Modern CSS with custom properties and animations
│   ├── js/
│   │   ├── timer.js               # Core PomodoroTimer class and logic
│   │   └── app.js                 # Application utilities, PWA, and initialization
│   └── assets/
│       └── sounds/                # Audio notification files
│           ├── start.mp3          # Timer start sound
│           └── finish.mp3         # Timer completion sound
├── .github/
│   ├── workflows/
│   │   └── deploy.yml             # GitHub Actions deployment workflow
│   └── dependabot.yml            # Dependabot configuration for automated dependency updates
├── package.json                   # Project configuration and dependencies
├── pnpm-lock.yaml                # pnpm lock file
└── README.md                      # Comprehensive project documentation
```

### Key Technologies

- **Frontend**: Pure vanilla JavaScript (ES6+), no external frameworks
- **Styling**: CSS3 with custom properties, flexbox, and grid
- **PWA**: Service Worker + Web App Manifest
- **Build Tool**: GitHub Actions for CI/CD
- **Development Server**: http-server (secure, no vulnerabilities)
- **Package Manager**: pnpm
- **Hosting**: GitHub Pages (static hosting)

## Security Notes

**Recent Security Fix (June 2025)**: Replaced `live-server` with `http-server` to resolve CVE-2024-4068 (High severity vulnerability in transitive dependency `braces`). The new setup provides the same functionality without security risks.

## Core Components

### 1. PomodoroTimer Class (`src/js/timer.js`)

**Purpose**: Main application logic and state management

**Key Properties**:

```javascript
this.state = {
  mode: "focus", // Current timer mode
  isRunning: false, // Timer running state
  isPaused: false, // Timer paused state
  remainingTime: 25 * 60, // Seconds remaining
  totalTime: 25 * 60, // Total session time
  sessionCount: 1, // Current session number
  completedSessions: 0, // Completed sessions today
  totalFocusTime: 0, // Total focus time today (minutes)
};

this.settings = {
  focusDuration: 25, // Focus session duration (minutes)
  shortBreakDuration: 5, // Short break duration (minutes)
  longBreakDuration: 15, // Long break duration (minutes)
  longBreakInterval: 4, // Sessions before long break
  autoStartBreaks: true, // Auto-start break sessions
  autoStartFocus: true, // Auto-start focus sessions
  soundEnabled: true, // Enable audio notifications
};
```

**Key Methods**:

- `start()`: Starts the timer
- `pause()`: Pauses the timer
- `reset()`: Resets timer to current mode's duration
- `complete()`: Handles timer completion and mode transitions
- `setMode(mode)`: Changes timer mode ('focus', 'shortBreak', 'longBreak')
- `updateUI()`: Updates all UI elements
- `saveSettings()`: Persists settings to localStorage
- `loadStats()`: Loads daily statistics from localStorage

### 2. Application Utilities (`src/js/app.js`)

**Purpose**: PWA functionality, themes, keyboard shortcuts, and utilities

**Key Components**:

- `ThemeManager`: Handles dark/light mode switching
- `KeyboardShortcuts`: Manages keyboard navigation
- `Analytics`: Privacy-focused event tracking
- `utils`: Utility functions for time formatting and notifications

### 3. Service Worker (`src/sw.js`)

**Purpose**: Enables offline functionality and caching

**Cached Resources**:

- HTML, CSS, JavaScript files
- Audio notification files
- Google Fonts (Inter font family)

**Caching Strategy**: Cache-first with network fallback

### 4. Styling System (`src/css/styles.css`)

**Purpose**: Modern, responsive design with CSS custom properties

**Key Features**:

- CSS custom properties for consistent theming
- Responsive design (mobile-first approach)
- Dark mode support via `prefers-color-scheme`
- Smooth animations and transitions
- Circular progress indicator using SVG

## User Interface Components

### Main Timer Interface

- **Circular Progress Ring**: SVG-based visual progress indicator
- **Digital Display**: MM:SS format timer display
- **Mode Indicator**: Shows current mode (Focus Time, Short Break, Long Break)
- **Session Counter**: Displays current session number
- **Control Buttons**: Start/Pause, Reset with icons and labels

### Settings Panel

- **Duration Controls**: Customizable timer durations
- **Behavior Options**: Auto-start toggles
- **Sound Settings**: Enable/disable audio notifications
- **Collapsible Interface**: Hidden by default, toggleable

### Statistics Section

- **Daily Progress**: Completed sessions and total focus time
- **Persistent Storage**: Data saved in localStorage
- **Daily Reset**: Statistics reset each day

## Data Management

### Local Storage Keys

- `pomodoro-settings`: User preferences and timer settings
- `pomodoro-stats`: Daily statistics (completed sessions, focus time)

### Data Persistence Strategy

- Settings persist across browser sessions
- Statistics reset daily (identified by date)
- No external data storage - fully client-side

## PWA Features

### Installation

- Web App Manifest enables "Add to Home Screen"
- Service Worker provides offline functionality
- Desktop and mobile installation support

### Offline Capability

- All core functionality works offline
- Resources cached on first visit
- Graceful degradation for network-dependent features

### Native-like Experience

- Full-screen mode when installed
- Custom theme colors
- Keyboard shortcuts support
- Push notifications (browser notifications)

## Development Workflow

### Local Development

```bash
# Clone repository
git clone https://github.com/kjanat/pomodoro-timer.git
cd pomodoro-timer

# Install dependencies
pnpm install

# Start development server
pnpm start  # Serves on http://localhost:3000
```

### Deployment Process

1. **Development**: Work on `development` branch
2. **Testing**: Test locally with `pnpm start`
3. **Merge**: Merge to `master` branch
4. **Auto-Deploy**: GitHub Actions automatically deploys to GitHub Pages
5. **Live**: Changes appear at <https://kjanat.github.io/pomodoro-timer/>

### GitHub Actions Workflow

- **Trigger**: Push to `master` branch
- **Build Process**: Copy `src/` to `dist/`
- **Deployment**: Deploy to GitHub Pages
- **Dependencies**: Node.js 18, pnpm 8

### Dependency Management

- **Package Manager**: pnpm for secure, fast dependency management
- **Automated Updates**: Dependabot configuration for weekly dependency updates
- **Security Scanning**: Automatic security vulnerability detection and patching
- **Development Workflow**: Updates applied to `development` branch first for review

## User Interactions

### Keyboard Shortcuts

- `Space`: Start/Pause timer
- `R`: Reset timer
- `S`: Toggle settings panel
- `Escape`: Close settings panel

### Mouse/Touch Interactions

- Click Start/Pause button to control timer
- Click Reset to reset current session
- Click Settings button to access configuration
- Adjust sliders/inputs to customize durations

### Notifications

- **Audio**: Start and completion sounds (optional)
- **Browser**: Desktop notifications when timer completes
- **Visual**: Progress ring and color changes

## Customization Points

### Timer Durations

- Focus sessions: 1-60 minutes (default: 25)
- Short breaks: 1-30 minutes (default: 5)
- Long breaks: 1-60 minutes (default: 15)
- Long break interval: 2-10 sessions (default: 4)

### Behavior Settings

- Auto-start breaks after focus sessions
- Auto-start focus sessions after breaks
- Enable/disable sound notifications

### Visual Customization

- Automatic dark/light mode based on system preference
- Color-coded progress rings for different modes
- Responsive design adapts to screen size

## Technical Implementation Details

### Timer Logic

- Uses `setInterval` with 1-second precision
- State management through class properties
- Automatic mode progression following Pomodoro Technique
- Precise time calculations avoiding drift

### Progress Animation

- SVG circle with `stroke-dasharray` and `stroke-dashoffset`
- Smooth transitions using CSS transitions
- Real-time updates synchronized with timer

### Responsive Design

- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly button sizes
- Optimized for various screen sizes

## Browser Compatibility

### Supported Features

- Modern browsers (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
- Service Workers for PWA functionality
- CSS Custom Properties
- ES6+ JavaScript features
- LocalStorage API

### Graceful Degradation

- Core timer functionality works in older browsers
- PWA features require modern browser support
- Audio notifications may not work in all contexts

## Security Considerations

### Automated Dependency Management

- **Dependabot Configuration**: Automated weekly updates for npm packages and GitHub Actions
- **Security Monitoring**: Immediate updates for security vulnerabilities regardless of schedule
- **Update Strategy**: All updates target `development` branch for review before merging
- **Grouping**: Production and development dependencies grouped separately
- **Review Process**: Automatic assignment to maintainer with proper labeling

### Recent Security Fixes

- **CVE-2024-4068**: Resolved by replacing `live-server` with `http-server`
- **Vulnerable Dependency**: `braces 2.3.2` (transitive dependency) removed
- **Current Status**: Zero known vulnerabilities (`pnpm audit` clean)

### Data Privacy

- No external data collection
- All data stored locally in browser
- No cookies or tracking
- No external API calls (except Google Fonts)

### Content Security

- No inline scripts or styles
- External resources only from trusted CDNs
- Service Worker follows secure patterns

## Performance Characteristics

### Load Time

- Minimal JavaScript bundle size
- Critical CSS inlined
- Lazy loading for non-essential features
- Efficient caching via Service Worker

### Runtime Performance

- Single timer interval for efficiency
- Minimal DOM manipulation
- CSS transitions for smooth animations
- Debounced settings updates

## Troubleshooting Common Issues

### Timer Not Starting

- Check browser JavaScript is enabled
- Verify no console errors in browser dev tools
- Ensure audio permissions granted for notifications

### PWA Installation Issues

- Confirm HTTPS or localhost environment
- Verify Service Worker registration
- Check browser PWA support

### Audio Not Playing

- Verify sound settings enabled
- Check browser audio permissions
- Confirm audio files are accessible

## Future Enhancement Opportunities

### Feature Additions

- Multiple timer presets
- Task/project tracking
- Export statistics
- Team/collaborative features
- Advanced analytics

### Technical Improvements

- Background sync for statistics
- Push notifications for scheduled sessions
- IndexedDB for more robust storage
- WebRTC for team features

### UI/UX Enhancements

- More themes and customization
- Advanced accessibility features
- Gamification elements
- Progress visualization improvements

## Contact and Support

**Repository**: <https://github.com/kjanat/pomodoro-timer>  
**Issues**: <https://github.com/kjanat/pomodoro-timer/issues>  
**Live Demo**: <https://kjanat.github.io/pomodoro-timer/>  
**Author**: Kaj Kowalski (@kjanat)

---

This document provides comprehensive context for autonomous agents to understand the project structure, functionality, and implementation details of the Focus Timer Pomodoro application.
