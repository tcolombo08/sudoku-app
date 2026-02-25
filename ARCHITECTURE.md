# TECHNICAL ARCHITECTURE

---

## Flow Diagram

```
+-------------------------------------------------------------+
|                     USER (React Web / RN Mobile)             |
+--------+----------------------------------------------------+
         |
         | Event: "Tap cell [0,0]"
         | Payload: {row: 0, col: 0, num: 5}
         v
+-------------------------------------------------------------+
|                      GameLogic (JavaScript)                  |
|                                                              |
|  placeNumber(0, 0, 5)                                       |
|    +- Validate coordinates                                  |
|    +- Check not an original cell                            |
|    +- If mode='annotation':                                 |
|    |   +- toggleAnnotation() -> notes[0][0] = [5]          |
|    +- If mode='complete':                                   |
|    |   +- placeAndValidate() -> 5 == solution[0][0]?       |
|    |       +- Yes? board[0][0] = 5                          |
|    |       +- No?  lives--                                  |
|    |       +- isSolved()? -> endGame()                      |
|    +- Save to history                                       |
|                                                              |
|  Returns: {                                                  |
|    success: true,                                            |
|    isCorrect: true,                                          |
|    isWon: false,                                             |
|    livesRemaining: 3                                         |
|  }                                                           |
+--------+----------------------------------------------------+
         |
         | Response
         v
+-------------------------------------------------------------+
|              Firebase (Firestore + Realtime DB)              |
|                                                              |
|  gameLogic.getState() -> serializes state                   |
|  {                                                           |
|    board, notes, lives, time, stats                         |
|  }                                                           |
|                                                              |
|  firebase.saveGameState(gameId, state)                      |
|    +- db.collection('games').doc(gameId).update(state)      |
|                                                              |
|  On win:                                                     |
|  firebase.saveResult(userId, result)                        |
|    +- Updates leaderboard in real time                      |
+-------------------------------------------------------------+
```

---

## Components

### 1. SudokuGenerator (Generation)

```javascript
class SudokuGenerator
  +- generateFullBoard()        -> valid filled 9x9 board
  |  +- fillSubgrid()           -> fills diagonals
  |  +- solveBoard()            -> recursive backtracking
  +- generate(difficulty)       -> puzzle + solution
  |  +- remove numbers based on difficulty
  +- isValid(row, col, num)    -> validate number at position
  |  +- validate row
  |  +- validate column
  |  +- validate 3x3 subgrid
  +- shuffle()                 -> Fisher-Yates random
```

**Input:** `'easy'` | `'medium'` | `'hard'` | `'expert'`
**Output:** `{puzzle: 2D[], solution: 2D[], difficulty: string}`

---

### 2. GameLogic (Live Game)

```javascript
class GameLogic
  +- Constructor(puzzle, solution)
  |  +- Initializes board, notes, lives=3, timer
  |
  +- placeNumber(row, col, num)
  |  +- [Validation]
  |  +- [History save]
  |  +- If mode='annotation' -> toggleAnnotation()
  |  +- If mode='complete' -> placeAndValidate()
  |
  +- placeAndValidate()        -> validates against solution
  |  +- If correct: board[r][c] = num
  |  +- If incorrect: lives--
  |  +- isSolved()? -> endGame()
  |
  +- isSolved()                -> is the sudoku complete?
  |  +- All cells filled?
  |  +- Matches solution?
  |
  +- updateTimer()             -> HH:MM:SS
  +- getHint(row, col)        -> solution[r][c]
  +- undo() / redo()          -> history navigation
  +- hasConflict()            -> duplicate numbers?
  +- getState() / getResult() -> serialize for persistence
```

**States:**
- `mode: 'annotation'` (draft, no validation)
- `mode: 'complete'` (validation on each number)

**Outputs:**
```javascript
{
  success: true,
  isCorrect: true,     // null if mode=annotation
  isWon: false,        // true if puzzle completed
  isGameOver: false,   // true if 0 lives
  livesRemaining: 3,
  message: "string"
}
```

---

### 3. Firebase (Backend)

```javascript
class FirebaseService
  +- initAuth()
  |  +- signInAnonymously() -> userId
  |
  +- createUser(nickname)
  |  +- users/{userId}/profile = {nickname, createdAt}
  |
  +- saveGameState(gameId, state)
  |  +- games/{gameId} = {userId, difficulty, board, notes, ...}
  |
  +- saveGameResult(result)
  |  +- games/{gameId} = {won, time, mistakes, hints}
  |  +- updateLeaderboard(userId, difficulty, time)
  |
  +- getLeaderboard(difficulty, limit=10)
  |  +- Returns top 10 + user if outside top
  |
  +- getUserProfile()
  |  +- nickname, stats, bestTimes per difficulty
  |
  +- updateNickname(newNickname)
     +- users/{userId}/profile/nickname
```

**Firestore Schema:**
```
users/
  {userId}/
    profile/
      nickname: string
      createdAt: Timestamp
      updatedAt: Timestamp
    stats/
      gamesWon: number
      totalGames: number
      bestTimes: {
        easy: number,
        medium: number,
        hard: number,
        expert: number
      }

games/
  {gameId}/
    userId: string
    difficulty: string
    createdAt: Timestamp
    result: {
      won: boolean,
      time: number,
      mistakes: number,
      hints: number
    }
    state?: {  // In-progress game
      board: number[][],
      notes: number[][][],
      lives: number,
      elapsedSeconds: number
    }

leaderboards/
  {difficulty}/
    {userId}/
      nickname: string
      bestTime: number
      gamesWon: number
      lastUpdated: Timestamp
```

---

## Main Flows

### Flow 1: Start new game

```
1. UI: User taps "New Game" + selects difficulty
   v
2. SudokuGenerator.generate(difficulty)
   +- Returns: {puzzle, solution}
   v
3. GameLogic(puzzle, solution)
   +- Initializes game
   v
4. Firebase.saveGameState(gameId, initialState)
   +- Saves initial state
   v
5. UI: Renders board + numberPad
```

### Flow 2: Playing (Complete mode)

```
1. User: Taps cell [0,0], taps "5"
   v
2. GameLogic.setMode('complete')
   GameLogic.placeNumber(0, 0, 5)
   v
3. Validation:
   a) 5 == solution[0][0]?
   b) If YES:
      - board[0][0] = 5
      - Returns {isCorrect: true}
   c) If NO:
      - lives--
      - Returns {isCorrect: false, livesRemaining: 2}
   v
4. UI: Displays number (green/red)
   v
5. isSolved()?
   a) No -> back to step 1
   b) Yes -> Flow 3 (Victory)
```

### Flow 3: Victory

```
1. GameLogic.isSolved() = true
   v
2. GameLogic.endGame(true)
   +- elapsedSeconds = final
   v
3. GameLogic.getResult()
   {won: true, time: 245, mistakes: 2, hints: 0}
   v
4. Firebase.saveGameResult(result)
   +- Creates document in games/
   +- Updates leaderboard
   v
5. UI: Shows victory panel
   +- Time: 4:05
   +- Mistakes: 2
   +- Short ad (5s)
   +- "Next game" button
```

### Flow 4: Game Over (0 lives)

```
1. lives = 1, user makes a mistake
   v
2. GameLogic.placeNumber() -> lives--
   v
3. lives = 0 -> GameLogic.endGame(false)
   v
4. GameLogic.getResult()
   {won: false, ...}
   v
5. Firebase.saveGameResult(result)
   +- Marks as loss
   +- Does NOT update leaderboard
   v
6. UI: Shows defeat panel
   +- "Game Over"
   +- "View solution" button
   +- Long ad (30s) -> +1 life?
   +- "Retry" button
```

---

## Persistence

### In-progress state
Saved **every move** in Firebase Realtime DB to resume:

```javascript
gameState = {
  gameId: "game_123",
  userId: "user_456",
  board: [...],      // placed numbers
  notes: [...],      // annotations
  lives: 2,
  elapsedSeconds: 342,
  difficulty: "medium",
  createdAt: timestamp
}

firebase.saveGameState(gameId, gameState)
// Overwrites in Realtime DB (fast, eventually consistent)
```

### Final result
Saved **once** when the game ends:

```javascript
gameResult = {
  gameId: "game_123",
  userId: "user_456",
  difficulty: "medium",
  won: true,
  time: 382,
  mistakes: 1,
  hints: 0,
  createdAt: timestamp
}

firebase.saveGameResult(gameResult)
// Writes to Firestore (persistence, for analytics)
```

---

## Platform Adaptation

### Web (React)
```javascript
import GameLogic from '../shared/gameLogic.js'
import SudokuGenerator from '../shared/sudokuGenerator.js'

// Direct use in React
const [gameState, setGameState] = useState(...)
const game = useRef(new GameLogic(puzzle, solution))

const handleCellClick = (row, col, num) => {
  const result = game.current.placeNumber(row, col, num)
  setGameState(game.current.getState())
}
```

### Mobile (React Native)
```javascript
import { GameLogic } from '../shared/gameLogic.js'
import Sound from 'react-native-sound'
import { Vibration } from 'react-native'

const handleCellClick = (row, col, num) => {
  const result = game.current.placeNumber(row, col, num)

  if (result.isCorrect === true) {
    Sound.play('click.mp3')
  } else if (result.isCorrect === false) {
    Sound.play('buzz.mp3')
    Vibration.vibrate([0, 100]) // 100ms vibration
  }
}
```

---

## Design Decisions

| Decision | Reason |
|----------|--------|
| **GameLogic = pure JS** | Reusable across web + mobile without changes |
| **Separate logic from UI** | Easier testing and debugging |
| **State history** | Enables undo/redo without complexity |
| **Incremental validation** | Doesn't recalculate the entire solution |
| **Firebase Realtime** | Better for games (fast sync) |
| **Firestore for results** | Better for analytics (queries) |
| **Anonymous auth** | Frictionless UX (no email required) |

---

## Performance

| Operation | Time |
|-----------|------|
| Generate Sudoku | ~100-200ms |
| placeNumber() | < 1ms |
| isSolved() | < 5ms |
| hasConflict() | < 1ms |
| Save to Firebase | ~100ms |
| Leaderboard query | ~50-200ms |

**Memory:**
- GameLogic instance: ~50KB
- Board storage: ~1KB
- History (100 states): ~100KB

---

## Security

**Firestore Rules:**
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

match /games/{gameId} {
  allow create, update: if request.auth.uid == resource.data.userId;
  allow read: if request.auth.uid == resource.data.userId;
}

match /leaderboards/{difficulty}/{userId} {
  allow read: if true;  // public
  allow write: if false; // server-side updates only
}
```

---

**Last Updated:** 2026-02-25
