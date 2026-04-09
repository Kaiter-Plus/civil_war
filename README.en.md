# National War Epidemic

A pandemic-themed shoot 'em up game built with Canvas rendering and TypeScript.

## Tech Stack

- **Runtime**: TypeScript 5.x
- **Build Tool**: Vite 6.x
- **Package Manager**: Bun
- **Rendering**: Canvas 2D
- **UI**: Native DOM + CSS

## Features

- Three difficulty modes (Easy/Normal/Hard)
- Dynamic difficulty system (auto-levels up when killing viruses)
- Combo kill rewards
- Canvas particle effects (exhaust trails, kill explosions)
- Floating score text
- Local leaderboard (separated by difficulty)
- Pandemic knowledge/rumor cards
- Responsive layout (9:16 fixed aspect ratio)
- Full sound effects system

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
├── game/
│   ├── index.ts      # Entry
│   ├── game.ts       # Game loop
│   ├── renderer.ts   # Canvas renderer
│   ├── audio.ts      # Audio manager
│   ├── config.ts     # Config & resource imports
│   ├── types.ts      # Type definitions
│   └── utils.ts      # Utility functions
├── css/index.css     # Styles
├── img/              # Game entity images
├── assets/
│   ├── img/          # UI images
│   └── json/         # Pandemic data
├── music/            # Sound effects (mp3)
└── index.html        # Entry HTML
```

## Build Output

- JS: ~49KB (gzip ~24KB)
- CSS: ~7KB (gzip ~2KB)

## Development History

### v2.0.0 (2026-04-09)

- Refactor: Webpack + jQuery → Vite + TypeScript
- Rendering: DOM → Canvas
- New: Dynamic difficulty, combo system, particle effects
- New: Floating score text, local leaderboard
- Optimize: Removed jQuery/Bootstrap dependencies
- Optimize: Audio files trimmed (removed ogg/wav)
- Optimize: Responsive 9:16 fixed aspect ratio layout
- Quality: Enabled TypeScript strict mode (noImplicitAny)

### v1.x (2020-04)

- Initial release
- DOM rendering with jQuery + Bootstrap
- Basic game functionality

## License

MIT
