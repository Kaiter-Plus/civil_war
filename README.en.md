# National War Epidemic

A pandemic-themed shoot 'em up game built with Vue 3.6 Vapor Mode + Canvas rendering + TypeScript.

## Tech Stack

- **Framework**: Vue 3.6 Vapor Mode
- **Runtime**: TypeScript 5.x
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v4
- **Package Manager**: Bun
- **Rendering**: Canvas 2D

## Features

- Three difficulty modes (Easy/Normal/Hard) with selection feedback
- 6 virus movement patterns (straight, sine wave, zigzag, chase, spiral, dive)
- Dynamic difficulty system (auto-levels up when killing viruses)
- Player upgrade system (fire rate +8%/projectile speed +10% every 3 levels, double fire at level 10)
- Combo kill rewards (multiplier shown from 3-combo onwards)
- Canvas particle effects (starry background, exhaust trails, kill explosions)
- Floating score text
- Local leaderboard (Top 10 per difficulty)
- Pandemic knowledge/rumor cards
- Responsive layout (9:16 fixed aspect ratio)
- Full sound effects system (fade in/out background music)

## Development Tools

- **Lint**: oxlint (Rust-based, ultra-fast)
- **Format**: oxfmt (Prettier style: no semicolons, single quotes, 2-space indent)
- **Hooks**: simple-git-hooks (pre-commit auto lint + format)

```bash
# Check code
bun run lint

# Format code
bun run fmt

# Pre-commit check (manual)
bun run precommit

# Direct commit (auto triggers pre-commit hook)
git commit
```

## Quick Start

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Build
bun run build

# Preview build
bun run preview
```

## Project Structure

```
src/
├── main.ts            # Vue Vapor entry
├── App.vue            # Root component (state management)
├── components/
│   ├── MenuScreen.vue     # Menu screen
│   ├── GameCanvas.vue     # Game canvas
│   ├── Modal.vue          # Modal component
│   └── ResultScreen.vue   # Result screen
├── composables/
│   └── useGame.ts         # Game logic encapsulation
├── game/
│   ├── renderer.ts        # Canvas renderer
│   ├── audio.ts           # Audio manager
│   ├── config.ts          # Config & resource imports
│   ├── types.ts           # Type definitions
│   └── utils.ts           # Utility functions
├── css/
│   ├── index.css          # Global styles
│   └── tailwind.css       # Tailwind entry
├── img/                   # Game entity images
├── assets/
│   ├── img/               # UI images
│   └── json/              # Pandemic data
├── music/                 # Sound effects (mp3)
└── index.html             # Entry HTML
```

## Build Output

- JS: ~97KB (gzip ~44KB)
- CSS: ~19KB (gzip ~4.6KB)

## Development History

### v3.1.0 (2026-04-09)

- New: 6 virus movement patterns (straight, sine wave, zigzag, chase, spiral, dive)
- New: oxlint + oxfmt toolchain + pre-commit hooks
- Config: Prettier-style formatting (no semicolons, single quotes, 2-space indent)
- Optimize: Unified code formatting

### v3.0.0 (2026-04-09)

- Refactor: Native TS → Vue 3.6 Vapor Mode
- Styling: Native CSS → Tailwind CSS v4
- New: Player upgrade system (fire rate/speed/double fire)
- New: Difficulty button selection feedback
- New: Display difficulty name in game UI
- Optimize: Component-based architecture, logic encapsulated as composable
- Fix: Audio fade in/out volume overflow bug

### v2.0.0 (2026-04-09)

- Refactor: Webpack + jQuery → Vite + TypeScript
- Rendering: DOM → Canvas
- New: Dynamic difficulty, combo system, particle effects
- New: Floating score text, local leaderboard
- Optimize: Removed jQuery/Bootstrap dependencies
- Optimize: Audio files trimmed (removed ogg/wav)
- Optimize: Responsive 9:16 fixed aspect ratio layout
- Quality: Enabled TypeScript strict mode

### v1.x (2020-04)

- Initial release
- DOM rendering with jQuery + Bootstrap
- Basic game functionality

## License

MIT
