/**
 * Test de GameLogic
 * Ejecutar con: node test-gamelogic.js
 */

const SudokuGenerator = require('./sudokuGenerator.js');
const GameLogic = require('./gameLogic.js');

console.log('='.repeat(60));
console.log('GAME LOGIC - TEST COMPLETO');
console.log('='.repeat(60));

// Generar un Sudoku fácil para test
const generator = new SudokuGenerator();
const game_data = generator.generate('easy');

// Crear instancia del juego
const game = new GameLogic(game_data.puzzle, game_data.solution);

console.log('\n📋 PUZZLE INICIAL');
console.log(game.boardToString());

console.log('\n\n🎮 TEST 1: MODO ANOTACIÓN');
console.log('-'.repeat(60));

game.setMode('annotation');

// Agregar anotaciones a una celda
let result = game.placeNumber(0, 0, 1);
console.log(`Anotación [0,0] = 1: ${result.success ? '✓' : '✗'}`);

result = game.placeNumber(0, 0, 2);
console.log(`Anotación [0,0] = 2: ${result.success ? '✓' : '✗'}`);

result = game.placeNumber(0, 0, 1); // toggle
console.log(`Anotación [0,0] remover 1: ${result.success ? '✓' : '✗'}`);

console.log(`\nNotas en [0,0]: ${game.notes[0][0].join(', ')}`);

console.log('\n\n🎮 TEST 2: DETECCIÓN DE CONFLICTOS');
console.log('-'.repeat(60));

// Obtener la primera celda vacía y la solución
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

  console.log(`Celda vacía encontrada en [${emptyCell.r},${emptyCell.c}]`);
  console.log(`Respuesta correcta: ${correctNum}`);

  // Poner el número correcto en modo annotation primero
  game.setMode('annotation');
  game.placeNumber(emptyCell.r, emptyCell.c, correctNum);

  // Cambiar a modo completar y poner el número incorrecto en otra celda
  game.setMode('complete');

  // Encontrar otra celda vacía
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (r !== emptyCell.r && c !== emptyCell.c && game_data.puzzle[r][c] === 0 && game.board[r][c] === 0) {
        console.log(`\nIntentando colocar número incorrecto en [${r},${c}]...`);
        result = game.placeNumber(r, c, wrongNum);
        console.log(`Resultado: ${result.message}`);
        console.log(`Vidas restantes: ${game.lives}`);
        break;
      }
    }
  }
}

console.log('\n\n🎮 TEST 3: VIDAS Y ERRORES');
console.log('-'.repeat(60));

console.log(`Vidas iniciales: ${game.maxLives}`);
console.log(`Vidas actuales: ${game.lives}`);
console.log(`Errores cometidos: ${game.stats.mistakesMade}`);

result = game.restoreLife();
console.log(`\nRestaurar vida: ${result.message}`);
console.log(`Vidas después: ${game.lives}`);

console.log('\n\n⏱️ TEST 4: TEMPORIZADOR');
console.log('-'.repeat(60));

const time1 = game.updateTimer();
console.log(`Tiempo actual: ${time1}`);
console.log(`Segundos totales: ${game.elapsedSeconds}s`);

// Simular que pasó tiempo
game.startTime = Date.now() - 125000; // 2:05 ago
const time2 = game.updateTimer();
console.log(`Después de simular 2:05: ${time2}`);

console.log('\n\n↩️ TEST 5: UNDO/REDO');
console.log('-'.repeat(60));

game.setMode('annotation');
game.placeNumber(1, 1, 5);
console.log(`Estado 1: Anotación [1,1] = 5`);

game.placeNumber(2, 2, 7);
console.log(`Estado 2: Anotación [2,2] = 7`);

console.log(`Notas [1,1]: ${game.notes[1][1].join(', ')}`);
console.log(`Notas [2,2]: ${game.notes[2][2].join(', ')}`);

result = game.undo();
console.log(`\nUNDO: ${result.message}`);
console.log(`Notas [1,1] después undo: ${game.notes[1][1].join(', ')}`);
console.log(`Notas [2,2] después undo: ${game.notes[2][2].join(', ')}`);

result = game.redo();
console.log(`\nREDO: ${result.message}`);
console.log(`Notas [2,2] después redo: ${game.notes[2][2].join(', ')}`);

console.log('\n\n📊 TEST 6: ESTADO DEL JUEGO');
console.log('-'.repeat(60));

const state = game.getState();
console.log(`Modo actual: ${state.mode}`);
console.log(`Vidas: ${state.lives}/${state.maxLives}`);
console.log(`Tiempo: ${game.formatTime(state.elapsedSeconds)}`);
console.log(`Game Over: ${state.isGameOver}`);
console.log(`Victoria: ${state.isWon}`);
console.log(`Movimientos totales: ${state.stats.movementsTotal}`);
console.log(`Errores: ${state.stats.mistakesMade}`);
console.log(`Hints usados: ${state.stats.hintsUsed}`);

console.log('\n\n💡 TEST 7: HINTS');
console.log('-'.repeat(60));

if (emptyCell) {
  result = game.getHint(emptyCell.r, emptyCell.c);
  if (result.success) {
    console.log(`Hint para [${emptyCell.r},${emptyCell.c}]: ${result.hint}`);
    console.log(`Hints usados: ${game.stats.hintsUsed}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ TODOS LOS TESTS COMPLETADOS');
console.log('='.repeat(60));
