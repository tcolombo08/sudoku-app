/**
 * Script de prueba del generador
 * Ejecutar con: node test-sudoku.js
 */

const SudokuGenerator = require('./sudokuGenerator.js');

const generator = new SudokuGenerator();

console.log('='.repeat(50));
console.log('GENERADOR DE SUDOKU - TEST');
console.log('='.repeat(50));

// Generar un Sudoku de cada dificultad
const difficulties = ['easy', 'medium', 'hard', 'expert'];

difficulties.forEach(difficulty => {
  console.log(`\n📊 GENERANDO SUDOKU: ${difficulty.toUpperCase()}`);
  console.log('-'.repeat(50));

  const game = generator.generate(difficulty);

  console.log(`\n🎮 PUZZLE (números visibles: ${generator.countVisibleNumbers(game.puzzle)})`);
  console.log(generator.boardToString(game.puzzle));

  console.log(`\n✅ SOLUCIÓN`);
  console.log(generator.boardToString(game.solution));

  console.log(`\n📈 Stats:`);
  console.log(`   - Dificultad: ${game.difficulty}`);
  console.log(`   - Celdas removidas: ${game.cellsRemoved}`);
  console.log(`   - Números visibles: ${generator.countVisibleNumbers(game.puzzle)}`);
  console.log(`   - Valido: ${generator.isValidSolution(game.solution) ? '✓' : '✗'}`);
});

console.log('\n' + '='.repeat(50));
console.log('✅ TEST COMPLETADO');
console.log('='.repeat(50));
