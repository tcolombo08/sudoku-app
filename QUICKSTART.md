# Sudoku App - Quick Start Guide

## 1. Getting Started

### Clone the repo
```bash
git clone https://github.com/your-username/sudoku-app.git
cd sudoku-app
```

### Install dependencies
```bash
npm install
```

### Run tests (verify everything works)
```bash
npm test
```

You should see:
```
Sudoku generator test - PASS
Game logic test - PASS
Total tests: 12/12 PASS
```

---

## 2. Configure Firebase

### Option A: Automatic setup
```bash
npm run setup
# Follow the interactive instructions
```

### Option B: Manual
1. Rename `firebase.config.template.js` to `firebase.config.js`
2. Update the values with your Firebase credentials
3. See `docs/FIREBASE-SETUP.md` for detailed instructions

---

## 3. Understand the structure

**Logic code (no UI):**
```javascript
// shared/sudokuGenerator.js
const gen = new SudokuGenerator();
const game = gen.generate('medium'); // {puzzle, solution}
```

**Game logic:**
```javascript
// shared/gameLogic.js
const gameLogic = new GameLogic(puzzle, solution);
gameLogic.setMode('complete');
gameLogic.placeNumber(0, 0, 5); // validate number
```

**Backend:**
```javascript
// shared/firebase.js
const firebase = new FirebaseService(firebaseConfig);
await firebase.initialize();
await firebase.saveGameResult({...});
```

---

## 4. Project Structure

```
sudoku-app/
├── shared/             <- Shared code (pure Node.js)
│   ├── sudokuGenerator.js
│   ├── gameLogic.js
│   ├── firebase.js
│   └── test-*.js
├── web/                <- React (next)
├── mobile/             <- React Native (later)
├── docs/               <- Full documentation
├── README.md           <- Overview
└── PROGRESS.md         <- Detailed status
```

---

## 5. Next Steps

### For Web (React)
```bash
cd web
npm create vite@latest . -- --template react
npm install
npm run dev
```

### For Mobile (React Native)
```bash
cd mobile
npx create-expo-app .
npm install
npm start
```

---

## Documentation

**To understand:**
- `README.md` - Project overview
- `ARCHITECTURE.md` - Diagrams and flows
- `docs/FIREBASE-SETUP.md` - Configure Firebase
- `docs/FIREBASE-API.md` - Complete API reference

**To develop:**
- `shared/gameLogic.js` - Game logic (read)
- `shared/firebase.js` - Backend (read)
- `PROGRESS.md` - Current status

---

## Testing

```bash
# Generator tests
npm run test:sudoku

# Logic tests
npm run test:gamelogic

# All tests
npm test
```

---

## Firebase Testing

Without real credentials:
```javascript
const firebase = new FirebaseService({});
firebase.initializeMock();

// Now you can use all methods
const result = await firebase.mockSaveResult('easy', true, 245);
```

With credentials:
```javascript
const firebase = new FirebaseService(firebaseConfig);
await firebase.initialize();

// Now connects to real Firebase
```

---

## Local Development

### Web
```bash
cd web
npm run dev
# Open http://localhost:5173
```

### Mobile (with Expo)
```bash
cd mobile
npm start
# Scan QR with Expo Go app
```

---

## Important Configuration

### .gitignore (DO NOT push to GitHub)
```
firebase.config.js        <- Credentials (PRIVATE)
.env.local               <- Environment variables
node_modules/            <- Dependencies
```

### Suggested initial commit
```bash
git add .
git commit -m "Initial commit: game logic + firebase backend

- Sudoku generator (4 levels)
- Game logic (validation, lives, timer, undo/redo)
- Firebase service (auth, persistence, leaderboard)
- Full documentation
"
git push origin main
```

---

## If something doesn't work

1. **npm test fails**
   - Check Node.js: `node --version` (must be >=18)
   - Reinstall: `rm -rf node_modules && npm install`

2. **Firebase won't connect**
   - Check that `firebase.config.js` exists
   - Copy values correctly from Firebase Console
   - Check `docs/FIREBASE-SETUP.md`

3. **Old or cached code**
   - `npm cache clean --force`
   - `git status` to see changes

---

## Tips for developers

1. **All methods are async**
   ```javascript
   const result = await firebase.saveGameResult({...});
   ```

2. **GameLogic is stateful**
   ```javascript
   const game = new GameLogic(puzzle, solution);
   game.placeNumber(0, 0, 5); // modifies internal state
   ```

3. **Firebase initializes only once**
   ```javascript
   // DON'T do this:
   await firebase.initialize();
   await firebase.initialize(); // Error

   // Do this:
   if (!firebase.userId) {
     await firebase.initialize();
   }
   ```

4. **Save state every 10 seconds**
   ```javascript
   if (moveCount % 10 === 0) {
     await firebase.saveGameState(gameId, game.getState());
   }
   ```

---

## Roadmap

- Backend logic (generator + game + firebase) - DONE
- Web frontend (React) - NEXT
- Mobile app (React Native) - PLANNED
- Ads integration (AdMob) - PLANNED
- App Store / Play Store deployment - PLANNED

---

## Development

**Stack:**
- Backend: Pure Node.js (zero dependencies)
- Web: React 18 + Vite
- Mobile: React Native + Expo
- Database: Firebase (Firestore + Realtime)

**Architecture:**
- `shared/` - Pure logic (reusable)
- `web/` - React UI (browser)
- `mobile/` - React Native UI (iOS/Android)

---

**Ready to start?**

```bash
npm test
# If you see ALL TESTS PASSING, you're ready!
```

Then: `npm run dev:web` to start the frontend.

---

**Made with love | Sudoku App v1.0**
