# Firebase Service API

## Initialization

```javascript
import FirebaseService from './firebase.js';
import firebaseConfig from './firebase.config.js';

const firebase = new FirebaseService(firebaseConfig);
await firebase.initialize();
```

---

## API Reference

### Authentication

#### `initialize()`
Initializes Firebase (call only once).

```javascript
const success = await firebase.initialize();
// Returns: boolean
```

#### `getAuthState()`
Gets the current authentication state.

```javascript
const state = firebase.getAuthState();
// Returns: {
//   isAuthenticated: boolean,
//   userId: string,
//   nickname: string
// }
```

---

### User Profile

#### `createUserProfile(nickname)`
Creates a profile with a random nickname.

```javascript
const success = await firebase.createUserProfile('MyPlayer');
// Returns: boolean
```

#### `getUserProfile()`
Gets the current user profile.

```javascript
const profile = await firebase.getUserProfile();
// Returns: {
//   profile: {
//     nickname: string,
//     createdAt: Timestamp,
//     updatedAt: Timestamp
//   },
//   stats: {
//     gamesWon: number,
//     totalGames: number,
//     bestTimes: {
//       easy: number | null,
//       medium: number | null,
//       hard: number | null,
//       expert: number | null
//     },
//     totalErrors: number,
//     totalHints: number
//   }
// }
```

#### `updateNickname(newNickname)`
Changes the user's nickname.

```javascript
const result = await firebase.updateNickname('NewName');
// Returns: {
//   success: boolean,
//   message: string
// }
```

---

### In-Progress Games

#### `saveGameState(gameId, gameState)`
Saves the current game state (can be resumed).

```javascript
const gameState = {
  mode: 'medium',           // difficulty
  board: [...],             // current board
  notes: [...],             // annotations
  lives: 2,                 // remaining lives
  elapsedSeconds: 342       // seconds played
};

const success = await firebase.saveGameState('game_123', gameState);
// Returns: boolean
```

**Note:** Saved in Realtime Database for fast sync.

#### `getGameState(gameId)`
Gets an in-progress game to resume.

```javascript
const state = await firebase.getGameState('game_123');
// Returns: {
//   userId: string,
//   difficulty: string,
//   board: number[][],
//   notes: number[][][],
//   lives: number,
//   elapsedSeconds: number,
//   createdAt: number,
//   updatedAt: number
// } | null
```

#### `deleteGameState(gameId)`
Deletes an in-progress game.

```javascript
const success = await firebase.deleteGameState('game_123');
// Returns: boolean
```

---

### Game Results

#### `saveGameResult(result)`
Saves the final result of a completed game.

```javascript
const result = {
  gameId: 'game_123',       // Unique game ID
  difficulty: 'medium',     // easy, medium, hard, expert
  won: true,                // Did the player win?
  time: 245,                // seconds
  mistakes: 1,              // mistakes made
  hints: 0,                 // hints used
  totalMoves: 81            // total moves
};

const response = await firebase.saveGameResult(result);
// Returns: {
//   success: boolean,
//   gameId: string,
//   error?: string
// }
```

**Side effects:**
- Updates user statistics
- Updates leaderboard if won
- Deletes in-progress game

#### `getUserGames(limit = 10)`
Gets the user's game history.

```javascript
const games = await firebase.getUserGames(20);
// Returns: [
//   {
//     id: string,
//     userId: string,
//     difficulty: string,
//     won: boolean,
//     time: number,
//     mistakes: number,
//     hints: number,
//     totalMoves: number,
//     createdAt: Timestamp
//   },
//   ...
// ]
```

---

### Leaderboard

#### `getLeaderboard(difficulty)`
Gets top 10 + user's position.

```javascript
const leaderboard = await firebase.getLeaderboard('medium');
// Returns: {
//   top10: [
//     {
//       rank: 1,
//       nickname: string,
//       userId: string,
//       bestTime: number,
//       gamesWon: number,
//       lastUpdated: Timestamp
//     },
//     ...
//   ],
//   userRank: number | null,
//   userEntry: {
//     nickname: string,
//     userId: string,
//     bestTime: number,
//     gamesWon: number,
//     lastUpdated: Timestamp
//   } | null,
//   difficulty: string
// }
```

#### `getLeaderboardEntry(difficulty)`
Gets only the user's entry in a leaderboard.

```javascript
const entry = await firebase.getLeaderboardEntry('hard');
// Returns: {
//   nickname: string,
//   userId: string,
//   bestTime: number,
//   gamesWon: number,
//   lastUpdated: Timestamp
// } | null
```

---

### Utilities

#### `generateGameId()`
Generates a unique game ID.

```javascript
const gameId = firebase.generateGameId();
// Returns: string (e.g.: "game_1708876543_abc123def")
```

#### `initializeMock()`
For testing without real credentials.

```javascript
firebase.initializeMock();
// Simulates authentication, does not use real Firebase
```

#### `mockSaveResult(difficulty, won, time)`
For testing, simulates saving a result.

```javascript
const result = await firebase.mockSaveResult('easy', true, 245);
// Returns: {
//   success: true,
//   message: string,
//   gameId: string,
//   data: { difficulty, won, time }
// }
```

---

## Typical Usage Flow

### 1. Start app

```javascript
const firebase = new FirebaseService(firebaseConfig);
await firebase.initialize();

// User is already anonymously authenticated
const state = firebase.getAuthState();
// { isAuthenticated: true, userId: "...", nickname: "Player_ABC" }
```

### 2. Generate new game

```javascript
import SudokuGenerator from './sudokuGenerator.js';
import GameLogic from './gameLogic.js';

const generator = new SudokuGenerator();
const gameData = generator.generate('medium');
const game = new GameLogic(gameData.puzzle, gameData.solution);

const gameId = firebase.generateGameId();
// Save initial state
await firebase.saveGameState(gameId, game.getState());
```

### 3. Play

```javascript
// While playing, save each move
const result = game.placeNumber(0, 0, 5);

// Save to Firebase every 10 seconds (to allow resuming)
if (moveCount % 10 === 0) {
  await firebase.saveGameState(gameId, game.getState());
}
```

### 4. Win or lose

```javascript
if (game.isWon) {
  // Save final result
  const result = await firebase.saveGameResult({
    gameId,
    difficulty: 'medium',
    won: true,
    time: game.elapsedSeconds,
    mistakes: game.stats.mistakesMade,
    hints: game.stats.hintsUsed,
    totalMoves: game.stats.movementsTotal
  });

  // Show leaderboard
  const leaderboard = await firebase.getLeaderboard('medium');
}

if (game.lives === 0) {
  // Save as loss (does not update leaderboard)
  await firebase.saveGameResult({
    gameId,
    difficulty: 'medium',
    won: false,
    time: game.elapsedSeconds,
    mistakes: game.stats.mistakesMade,
    hints: game.stats.hintsUsed,
    totalMoves: game.stats.movementsTotal
  });
}
```

### 5. Resume game

```javascript
const savedState = await firebase.getGameState(gameId);

if (savedState) {
  // Rebuild game from saved state
  const game = new GameLogic(puzzle, solution);
  game.board = savedState.board;
  game.notes = savedState.notes;
  game.lives = savedState.lives;
  game.elapsedSeconds = savedState.elapsedSeconds;
  // ... continue playing
}
```

### 6. View statistics

```javascript
const profile = await firebase.getUserProfile();
console.log('Games won:', profile.stats.gamesWon);
console.log('Best time (medium):', profile.stats.bestTimes.medium);

const games = await firebase.getUserGames(10);
console.log('Last 10 games:', games);
```

---

## Error Handling

All methods can fail. Safe example:

```javascript
try {
  const result = await firebase.saveGameResult(gameResult);

  if (result.success) {
    console.log('Saved successfully');
  } else {
    console.error('Error:', result.error);
  }
} catch (error) {
  console.error('Firebase error:', error.message);
  // Show message to user
}
```

---

## Limits and Considerations

| Resource | Free Limit |
|----------|------------|
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Firestore deletes | 20,000/day |
| Realtime DB | 10GB total |
| Auth (anonymous users) | No limit |

**Tips for optimization:**
- Save state every 10 seconds, not every move
- Use Realtime DB for state (fast sync)
- Use Firestore for results (queries)
- Cache leaderboard on the client

---

## Debugging

### View Firebase logs

```javascript
// In browser console:
firebase.getAuthState()
// See current state

// Firestore queries
// Firebase Console -> Firestore -> Run queries
```

### Simulate offline mode (web)

```javascript
// In DevTools -> Network -> Offline
// The app should save locally and sync when back online
```

---

**Last Updated:** 2026-02-25
