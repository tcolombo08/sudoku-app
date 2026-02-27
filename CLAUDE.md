# CLAUDE.md - Sudoku App

## Project
Cross-platform Sudoku app (web + mobile) with Firebase backend.

## Tech Stack
- **Core logic**: Pure JavaScript (ES modules, `"type": "module"`)
- **Web UI**: React 19 + Vite + Tailwind CSS v4 + Zustand
- **Mobile**: React Native 0.76 + Expo SDK 52 + Zustand
- **Backend**: Firebase 10.7 (Anonymous Auth, Firestore, Realtime DB)

## Structure
```
shared/          -> Pure game logic (0 external dependencies)
  sudokuGenerator.js  -> Puzzle generation (backtracking)
  gameLogic.js        -> Game state, lives, undo/redo, timer
  firebase.js         -> Firebase service (auth, persistence, leaderboard)
  test-*.js           -> Tests
web/             -> React web app (to be created)
mobile/          -> React Native app (to be created)
scripts/setup.js -> Firebase configuration wizard
```

## Development Rules

### Architecture
- Logic in `shared/` is PURE and reusable. Do NOT add React, DOM, or React Native imports there.
- Web and Mobile consume `shared/` as a module. Do not duplicate game logic.
- Firebase config goes in `firebase.config.js` (excluded from git). Template in `firebase.config.template.js`.

### Code
- ES modules (`import`/`export`), NOT CommonJS (`require`).
- No TypeScript for now. JavaScript with JSDoc if type documentation is needed.
- Variable/function names in English. Comments in English.
- Do not add unnecessary dependencies. Core logic has 0 dependencies on purpose.

### Game Mechanics (do not break)
- 4 difficulties: easy, medium, hard, expert
- 3-life system (lose 1 per mistake, game over at 0)
- Annotation mode (no validation) and complete mode (validates against solution)
- Undo/redo with full history
- Hints reveal the correct number without penalty
- Conflict detection (duplicate numbers in row/col/subgrid)

### Firebase
- Auth: anonymous (no email/password)
- Realtime DB: in-progress game state (fast sync)
- Firestore: final results, profiles, leaderboards
- Never commit credentials. Use `firebase.config.js` (in .gitignore).

### Testing
- `npm test` runs all tests (must pass 100%)
- `npm run test:sudoku` and `npm run test:gamelogic` separately
- Before making changes to `shared/`, run tests to verify nothing is broken.

### Git
- Main branch: `main`
- Do not commit: node_modules, .env, firebase.config.js, builds

## Current Status
- Phase 1 (Core Logic): COMPLETE
- Phase 2 (Firebase): COMPLETE
- Phase 3 (Web UI): COMPLETE
- Phase 4 (Mobile): COMPLETE
