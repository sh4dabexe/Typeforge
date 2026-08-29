# TypeForge — Modern Typing Practice & Speed-Test Platform

TypeForge is a fast, minimal, keyboard-first typing practice and speed-test web application. It features real-time WPM calculation, character-by-character accuracy validation, a daily streak system with local timezone handling, Google Authentication, Cloud Firestore synchronization, custom sound effects via the Web Audio API, multiple original themes, analytics charts, and global leaderboards.

---

## Key Features

### 1. High-Performance Typing Engine
- **Test Modes**:
  - **Time Mode**: 15s, 30s, 60s, 120s, and custom duration (5s–600s).
  - **Words Mode**: 10, 25, 50, 100, 200 words, and custom word counts.
  - **Quote Mode**: Famous quotes from philosophers, scientists, and leaders.
  - **Code Mode**: Real programming syntax, JavaScript/TypeScript keywords, and symbols.
  - **Custom Mode**: Paste your own custom text, code snippets, or literature.
- **Modifiers**: Punctuation toggle, Numbers toggle, Difficulty (Easy, Normal, Hard), and Language support (English, Spanish, French, German, Hindi).
- **Keystroke Processing**:
  - Near-zero latency response.
  - Character-level status: correct, incorrect, extra characters, and auto-scrolling viewport.
  - Backspace & `Ctrl + Backspace` whole-word deletion.
  - Confidence Mode (disable backspace) and Stop-on-Error mode.

### 2. Precise Typing Metrics
- **Net WPM**: `(Correct Characters / 5) / Elapsed Minutes`
- **Raw WPM**: `(Total Typed Characters / 5) / Elapsed Minutes`
- **Accuracy**: `(Correct Characters / Total Typed Characters) * 100`
- **Consistency**: Keystroke interval standard deviation scoring (0%–100%).
- **Interactive SVG Graphs**: Real-time sample progression with net vs raw WPM tracking.

### 3. Daily Streak System
- Uses the user's local calendar date (`YYYY-MM-DD`) derived from their device timezone.
- **Rules**:
  - Multiple tests on the same day maintain the streak without artificial inflation.
  - Completing a test on the consecutive day increments the current streak.
  - Gaps greater than 1 calendar day reset current streak to 1 while preserving the longest streak record.
- **Celebration**: Subtle particle confetti and banner alert when increasing the daily streak.

### 4. Firebase Authentication & Cloud Firestore
- **Google Sign-in**: One-click Google authentication via Firebase Auth popup.
- **Firestore Synchronization**:
  - `/users/{userId}`: User statistics, aggregate averages, streaks, and preferences.
  - `/users/{userId}/tests/{testId}`: Complete individual test history logs.
  - `/users/{userId}/dailyStats/{date}`: Daily aggregated test counts and best speeds.
  - `/leaderboard/{recordId}`: Verified top scores with anti-cheat boundaries.
- **Offline & Anonymous Mode**: Anonymous users can practice immediately with local storage history and sync queueing on sign-in.

### 5. Web Audio Mechanical Keystroke Synthesizer
- Built-in audio profiles without heavy external audio files:
  - **Lubed Thock**: Deep mechanical switch sound.
  - **Tactile Click**: Crisp mechanical click.
  - **Typewriter**: Vintage mechanical clack.
  - **Bubble Pop**: Gentle marimba pop.
  - **Digital**: Cyber sci-fi tick.
  - **Mute**: Silent typing.

### 6. Original Design & Theme Engine
- **Charcoal** (Default): Dark slate with warm amber gold accents.
- **Cyber Neon**: Matrix green with deep black.
- **Serene Midnight**: Deep navy with sky azure accents.
- **Nord Frost**: Polar night with frost teal accents.
- **Sunset Rose**: Deep plum with coral rose accents.
- **Monochrome**: Pure contrast stark black and crisp white.
- **Porcelain**: Clean daylight off-white with indigo slate.

---

## Keyboard Shortcuts

- `Tab`: Restart test instantly with fresh text
- `Esc`: Open / close settings modal
- `Ctrl + Backspace`: Delete entire current word attempt
- `Enter`: Next test on result screen

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Custom CSS Variables
- **Backend & Database**: Firebase Authentication (Google Provider), Cloud Firestore
- **Audio Engine**: Web Audio API Synthesizer
- **Icons**: Lucide React
- **Animations**: Canvas Confetti
