# 🍅 Focus Timer - Pomodoro Technique

An impressive, modern Pomodoro timer web application built with vanilla JavaScript. Boost your productivity with the proven Pomodoro Technique in a beautifully designed interface.

## ✨ Features

### ⏱️ Timer Functionality

- **Full Pomodoro Cycle**: Work sessions, short breaks, and long breaks
- **Customizable Durations**: Adjust work and break periods to your needs
- **Auto-progression**: Automatically advance between sessions (optional)
- **Visual Progress Ring**: Beautiful circular progress indicator
- **Session Tracking**: Keep track of completed Pomodoro sessions

### 🎨 Beautiful Interface

- **Modern Design**: Clean, minimalist interface with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Support**: Automatic theme switching based on system preference
- **Accessibility**: Keyboard navigation and screen reader friendly

### 🔧 Advanced Features

- **PWA Support**: Install as a native app on your device
- **Offline Capability**: Works without internet connection
- **Sound Notifications**: Audio alerts for session starts and ends
- **Browser Notifications**: Desktop notifications when timer completes
- **Keyboard Shortcuts**: Control timer with spacebar and other shortcuts
- **Settings Persistence**: Your preferences are saved locally
- **Daily Statistics**: Track your productivity progress
- **Session Persistence**: Running timers survive page refreshes

### ⌨️ Keyboard Shortcuts

- `Space` - Start/Pause timer
- `R` - Reset timer
- `S` - Toggle settings panel
- `Escape` - Close settings panel

## 🚀 Live Demo

Visit the live application: [https://pomodoro.kajkowalski.nl](https://pomodoro.kajkowalski.nl)

## 📱 Installation

### As a Web App (PWA)

1. Visit the live demo link
2. Click the "Install" button in your browser
3. The app will be installed on your device like a native app

### For Development

```bash
# Clone the repository
git clone https://github.com/kjanat/pomodoro-timer.git

# Navigate to the project directory
cd pomodoro-timer

# Install dependencies
pnpm install

# Install pre-commit hooks (recommended for contributors)
pip install pre-commit
pre-commit install

# Optional: Run pre-commit hooks on all files to verify setup
pre-commit run --all-files

# Start development server
pnpm start
```

## 🏗️ Project Structure

```sh
pomodoro-timer/
├── src/                           # Source files
│   ├── index.html                 # Main HTML document
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker for PWA
│   ├── css/
│   │   └── styles.css             # Modern CSS with variables and animations
│   ├── js/
│   │   ├── app.js                 # Application initialization and utilities
│   │   ├── audio.js               # Tone playback helper
│   │   └── timer.js               # Core timer logic and UI management
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions for automatic deployment
├── package.json                   # Project configuration
└── README.md                      # This file
```

## 🎯 The Pomodoro Technique

The Pomodoro Technique is a time management method developed by Francesco Cirillo:

1. **Work for 25 minutes** (one "Pomodoro")
2. **Take a 5-minute break**
3. **Repeat for 4 cycles**
4. **Take a longer 15-30 minute break**
5. **Start the cycle again**

This technique helps maintain focus and prevents burnout while maximizing productivity.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **PWA**: Service Worker, Web App Manifest
- **Build**: GitHub Actions for CI/CD
- **Deployment**: GitHub Pages
- **Package Manager**: pnpm

## 🔊 Sound Notifications

The timer uses a tiny Web Audio API helper to beep when sessions start and finish. `playTone(frequency, duration)` lives in `src/js/audio.js` and keeps a single `AudioContext` instance for efficient playback.

- **Start beep**: 440&nbsp;Hz
- **Finish beep**: 880&nbsp;Hz
- Toggle with the "Sound notifications" checkbox in settings.

## 🌟 Key Highlights

- **Zero Dependencies**: Built with pure web technologies
- **Lightweight**: Fast loading and minimal resource usage
- **Modern Standards**: Uses latest web APIs and best practices
- **Mobile-First**: Designed for all device sizes
- **Privacy-Focused**: All data stays on your device

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies and set up pre-commit hooks:

   ```bash
   # Install project dependencies
   pnpm install

   # Install pre-commit framework (choose one method)
   pip install pre-commit
   # or
   pipx install pre-commit

   # Install git hooks locally
   pre-commit install

   # Optional: Run hooks against all files to verify setup
   pre-commit run --all-files
   ```

- **About pre-commit hooks**: The hooks use remote Prettier and StandardJS integrations and rely on the system Node runtime provided by the CI environment:

- Code formatting with Prettier for supported file types (`.js`, `.json`, `.md`, `.html`, `.css`, `.yml`, `.yaml`)
- Uses the `prettier-config-standard` shareable config defined in `package.json`
- JavaScript linting and auto-fixing with StandardJS
- Automatic fixes for simple issues
- Works locally, on GitHub Actions, and on [pre-commit.ci](https://pre-commit.ci/)

4. Make your changes
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the Pomodoro Technique by Francesco Cirillo
- Icons and emojis from Unicode/Emoji standards
- Font families from Google Fonts

## 📞 Support

If you have any questions or run into issues, please [open an issue](https://github.com/kjanat/pomodoro-timer/issues) on GitHub.

---

Made with ❤️ for productivity enthusiasts
