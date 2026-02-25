/**
 * Generator test script
 * Run with: node test-sudoku.js
 */

import SudokuGenerator from './sudokuGenerator.js';

const generator = new SudokuGenerator();

console.log('='.repeat(50));
console.log('SUDOKU GENERATOR - TEST');
console.log('='.repeat(50));

// Generate a Sudoku for each difficulty
const difficulties = ['easy', 'medium', 'hard', 'expert'];

difficulties.forEach(difficulty => {
  console.log(`\nGENERATING SUDOKU: ${difficulty.toUpperCase()}`);
  console.log('-'.repeat(50));

  const game = generator.generate(difficulty);

  console.log(`\nPUZZLE (visible numbers: ${generator.countVisibleNumbers(game.puzzle)})`);
  console.log(generator.boardToString(game.puzzle));

  console.log(`\nSOLUTION`);
  console.log(generator.boardToString(game.solution));

  console.log(`\nStats:`);
  console.log(`   - Difficulty: ${game.difficulty}`);
  console.log(`   - Cells removed: ${game.cellsRemoved}`);
  console.log(`   - Visible numbers: ${generator.countVisibleNumbers(game.puzzle)}`);
  console.log(`   - Valid: ${generator.isValidSolution(game.solution) ? 'yes' : 'no'}`);
});

console.log('\n' + '='.repeat(50));
console.log('TEST COMPLETED');
console.log('='.repeat(50));
