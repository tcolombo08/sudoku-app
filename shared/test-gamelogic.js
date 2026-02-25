/**
 * GameLogic test
 * Run with: node test-gamelogic.js
 */

import SudokuGenerator from './sudokuGenerator.js';
import GameLogic from './gameLogic.js';

console.log('='.repeat(60));
console.log('GAME LOGIC - FULL TEST');
console.log('='.repeat(60));

// Generate an easy Sudoku for testing
const generator = new SudokuGenerator();
const game_data = generator.generate('easy');

// Create game instance
const game = new GameLogic(game_data.puzzle, game_data.solution);

console.log('\nINITIAL PUZZLE');
console.log(game.boardToString());

console.log('\n\nTEST 1: ANNOTATION MODE');
console.log('-'.repeat(60));

game.setMode('annotation');

// Add annotations to a cell
let result = game.placeNumber(0, 0, 1);
console.log(`Annotation [0,0] = 1: ${result.success ? 'ok' : 'fail'}`);

result = game.placeNumber(0, 0, 2);
console.log(`Annotation [0,0] = 2: ${result.success ? 'ok' : 'fail'}`);

result = game.placeNumber(0, 0, 1); // toggle
console.log(`Annotation [0,0] remove 1: ${result.success ? 'ok' : 'fail'}`);

console.log(`\nNotes at [0,0]: ${game.notes[0][0].join(', ')}`);

console.log('\n\nTEST 2: CONFLICT DETECTION');
console.log('-'.repeat(60));

// Get the first empty cell and the solution
let emptyCell = null;
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    if (game_data.puzzle[r][c] === 0) {
      emptyCell = { r, c };
      break;
    }
  }
  if (emptyCell) break;
}

if (emptyCell) {
  const correctNum = game_data.solution[emptyCell.r][emptyCell.c];
  const wrongNum = correctNum === 1 ? 2 : 1;

  console.log(`Empty cell found at [${emptyCell.r},${emptyCell.c}]`);
  console.log(`Correct answer: ${correctNum}`);

  // Place correct number in annotation mode first
  game.setMode('annotation');
  game.placeNumber(emptyCell.r, emptyCell.c, correctNum);

  // Switch to complete mode and place wrong number in another cell
  game.setMode('complete');

  // Find another empty cell
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (r !== emptyCell.r && c !== emptyCell.c && game_data.puzzle[r][c] === 0 && game.board[r][c] === 0) {
        console.log(`\nPlacing wrong number at [${r},${c}]...`);
        result = game.placeNumber(r, c, wrongNum);
        console.log(`Result: ${result.message}`);
        console.log(`Lives remaining: ${game.lives}`);
        break;
      }
    }
  }
}

console.log('\n\nTEST 3: LIVES AND ERRORS');
console.log('-'.repeat(60));

console.log(`Initial lives: ${game.maxLives}`);
console.log(`Current lives: ${game.lives}`);
console.log(`Mistakes made: ${game.stats.mistakesMade}`);

result = game.restoreLife();
console.log(`\nRestore life: ${result.message}`);
console.log(`Lives after: ${game.lives}`);

console.log('\n\nTEST 4: TIMER');
console.log('-'.repeat(60));

const time1 = game.updateTimer();
console.log(`Current time: ${time1}`);
console.log(`Total seconds: ${game.elapsedSeconds}s`);

// Simulate time passing
game.startTime = Date.now() - 125000; // 2:05 ago
const time2 = game.updateTimer();
console.log(`After simulating 2:05: ${time2}`);

console.log('\n\nTEST 5: UNDO/REDO');
console.log('-'.repeat(60));

game.setMode('annotation');
game.placeNumber(1, 1, 5);
console.log(`State 1: Annotation [1,1] = 5`);

game.placeNumber(2, 2, 7);
console.log(`State 2: Annotation [2,2] = 7`);

console.log(`Notes [1,1]: ${game.notes[1][1].join(', ')}`);
console.log(`Notes [2,2]: ${game.notes[2][2].join(', ')}`);

result = game.undo();
console.log(`\nUNDO: ${result.message}`);
console.log(`Notes [1,1] after undo: ${game.notes[1][1].join(', ')}`);
console.log(`Notes [2,2] after undo: ${game.notes[2][2].join(', ')}`);

result = game.redo();
console.log(`\nREDO: ${result.message}`);
console.log(`Notes [2,2] after redo: ${game.notes[2][2].join(', ')}`);

console.log('\n\nTEST 6: GAME STATE');
console.log('-'.repeat(60));

const state = game.getState();
console.log(`Current mode: ${state.mode}`);
console.log(`Lives: ${state.lives}/${state.maxLives}`);
console.log(`Time: ${game.formatTime(state.elapsedSeconds)}`);
console.log(`Game Over: ${state.isGameOver}`);
console.log(`Won: ${state.isWon}`);
console.log(`Total moves: ${state.stats.movementsTotal}`);
console.log(`Mistakes: ${state.stats.mistakesMade}`);
console.log(`Hints used: ${state.stats.hintsUsed}`);

console.log('\n\nTEST 7: HINTS');
console.log('-'.repeat(60));

if (emptyCell) {
  result = game.getHint(emptyCell.r, emptyCell.c);
  if (result.success) {
    console.log(`Hint for [${emptyCell.r},${emptyCell.c}]: ${result.hint}`);
    console.log(`Hints used: ${game.stats.hintsUsed}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('ALL TESTS COMPLETED');
console.log('='.repeat(60));
