# CLAUDE.md - shared/

## Purpose
Pure game logic. This directory is the heart of the project and is shared between web and mobile.

## Files

| File | Responsibility |
|------|---------------|
| `sudokuGenerator.js` | Generates valid puzzles with unique solutions. Backtracking + constraint satisfaction. |
| `gameLogic.js` | Manages game state: board, lives (3), modes, undo/redo, timer, hints, conflicts. |
| `firebase.js` | Firebase service: anonymous auth, save/load games, leaderboards, profiles. |
| `test-sudoku.js` | Generator tests. |
| `test-gamelogic.js` | Game logic tests. |

## Strict Rules
1. **ZERO UI dependencies**. Do not import React, DOM APIs, React Native, or anything visual.
2. **ZERO npm dependencies** in sudokuGenerator.js and gameLogic.js. Only firebase.js uses Firebase SDK.
3. **ES modules** exclusively (`import`/`export`).
4. After any change, run `npm test` and verify all tests pass.
5. Do not change public interfaces (method signatures) without updating the tests.

## Key APIs

### SudokuGenerator
```js
const gen = new SudokuGenerator();
const { puzzle, solution } = gen.generate('medium'); // 9x9 arrays, 0 = empty
```

### GameLogic
```js
const game = new GameLogic(puzzle, solution);
game.setMode('complete');           // or 'annotation'
game.placeNumber(row, col, num);    // place number
game.undo(); game.redo();           // history
game.getHint(row, col);            // reveal solution
game.isSolved();                    // check win
game.getState();                    // serializable for Firebase
game.getResult();                   // final result
```

### FirebaseService
```js
const fb = new FirebaseService(firebaseConfig);
await fb.initialize();
await fb.createUser('nickname');
await fb.saveGameState(gameState);
await fb.saveGameResult(result);
const lb = await fb.getLeaderboard('easy', 10);
```
