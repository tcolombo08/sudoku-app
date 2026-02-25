/**
 * Lógica del juego de Sudoku
 * Maneja: validación, notas, vidas, temporizador, detección de victoria
 */

class GameLogic {
  constructor(puzzle, solution) {
    this.GRID_SIZE = 9;
    this.SUBGRID_SIZE = 3;
    this.EMPTY = 0;

    // Estado del juego
    this.puzzle = puzzle.map(row => [...row]); // Puzzle original (no se modifica)
    this.solution = solution.map(row => [...row]); // Solución para validación
    this.board = puzzle.map(row => [...row]); // Tablero actual del jugador

    // Sistema de notas (borrador)
    // notes[row][col] = [1,2,3] = números candidatos
    this.notes = Array(this.GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(this.GRID_SIZE).fill(null).map(() => [])
      );

    // Estado del juego
    this.lives = 3;
    this.maxLives = 3;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.isGameOver = false;
    this.isWon = false;
    this.mode = 'annotation'; // 'annotation' o 'complete'

    // Historial de movimientos (para undo/redo)
    this.history = [];
    this.historyIndex = -1;

    // Estadísticas
    this.stats = {
      movementsTotal: 0,
      mistakesMade: 0,
      hintsUsed: 0
    };
  }

  /**
   * MODO: Cambiar entre anotación y completado
   */
  setMode(mode) {
    if (!['annotation', 'complete'].includes(mode)) {
      throw new Error("Modo debe ser 'annotation' o 'complete'");
    }
    this.mode = mode;
  }

  /**
   * ENTRADA DE NÚMERO
   * @param {number} row - Fila (0-8)
   * @param {number} col - Columna (0-8)
   * @param {number} num - Número (1-9) o 0 para borrar
   * @returns {object} { success, message, isCorrect, isWon }
   */
  placeNumber(row, col, num) {
    // Validaciones básicas
    if (!this.isValidCoordinate(row, col)) {
      return { success: false, message: 'Coordenadas inválidas' };
    }

    if (num < 0 || num > 9 || !Number.isInteger(num)) {
      return { success: false, message: 'Número debe estar entre 0-9' };
    }

    // No se puede modificar números originales del puzzle
    if (this.puzzle[row][col] !== this.EMPTY) {
      return { success: false, message: 'No puedes modificar números originales' };
    }

    // Guardar estado anterior en historial
    this.saveToHistory();

    // MODO ANOTACIÓN: solo agregar/quitar del borrador
    if (this.mode === 'annotation') {
      return this.toggleAnnotation(row, col, num);
    }

    // MODO COMPLETAR: validar contra solución
    if (this.mode === 'complete') {
      return this.placeAndValidate(row, col, num);
    }
  }

  /**
   * MODO ANOTACIÓN: agregar/quitar números del borrador
   */
  toggleAnnotation(row, col, num) {
    if (num === 0) {
      // Borrar todas las anotaciones
      this.notes[row][col] = [];
      this.stats.movementsTotal++;
      return { success: true, message: 'Anotaciones borradas', isCorrect: null };
    }

    const currentNotes = this.notes[row][col];
    const index = currentNotes.indexOf(num);

    if (index > -1) {
      // Ya existe, removarlo
      currentNotes.splice(index, 1);
    } else {
      // Agregar
      currentNotes.push(num);
      currentNotes.sort((a, b) => a - b);
    }

    this.stats.movementsTotal++;
    return {
      success: true,
      message: `Anotación actualizada`,
      isCorrect: null,
      notes: currentNotes
    };
  }

  /**
   * MODO COMPLETAR: validar número contra solución
   */
  placeAndValidate(row, col, num) {
    if (num === 0) {
      // Borrar número (siempre válido)
      this.board[row][col] = this.EMPTY;
      this.notes[row][col] = [];
      this.stats.movementsTotal++;
      return { success: true, message: 'Número borrado', isCorrect: null };
    }

    const correctNumber = this.solution[row][col];
    const isCorrect = num === correctNumber;

    if (isCorrect) {
      // ✅ Correcto
      this.board[row][col] = num;
      this.notes[row][col] = [];
      this.stats.movementsTotal++;

      // Verificar si ganó
      if (this.isSolved()) {
        this.endGame(true);
        return {
          success: true,
          message: '¡Sudoku completado!',
          isCorrect: true,
          isWon: true
        };
      }

      return {
        success: true,
        message: 'Correcto!',
        isCorrect: true
      };
    } else {
      // ❌ Incorrecto
      this.lives--;
      this.stats.mistakesMade++;
      this.stats.movementsTotal++;

      if (this.lives <= 0) {
        this.endGame(false);
        return {
          success: true,
          message: '¡Game Over! No te quedan vidas.',
          isCorrect: false,
          isGameOver: true,
          livesRemaining: 0
        };
      }

      return {
        success: true,
        message: `¡Incorrecto! Te quedan ${this.lives} vidas.`,
        isCorrect: false,
        livesRemaining: this.lives
      };
    }
  }

  /**
   * VIDAS: Recuperar una vida viendo un ad
   * (lógica del ad se maneja en la UI)
   */
  restoreLife() {
    if (this.lives < this.maxLives) {
      this.lives++;
      return { success: true, message: 'Vida restaurada', livesRemaining: this.lives };
    }
    return { success: false, message: 'Ya tienes el máximo de vidas' };
  }

  /**
   * TEMPORIZADOR: actualizar tiempo transcurrido
   */
  updateTimer() {
    this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    return this.formatTime(this.elapsedSeconds);
  }

  /**
   * FORMATO: convertir segundos a "HH:MM:SS"
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * VICTORIA: verificar si el Sudoku está resuelto
   */
  isSolved() {
    // Todos los números deben estar en el tablero
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (this.board[row][col] === this.EMPTY) {
          return false;
        }
      }
    }

    // Validar que coincida con la solución
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (this.board[row][col] !== this.solution[row][col]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * AYUDA: obtener un número de la solución (no pierde vidas)
   */
  getHint(row, col) {
    if (!this.isValidCoordinate(row, col)) {
      return { success: false, message: 'Coordenada inválida' };
    }

    if (this.puzzle[row][col] !== this.EMPTY) {
      return { success: false, message: 'Esta celda es fija' };
    }

    if (this.board[row][col] !== this.EMPTY) {
      return { success: false, message: 'Esta celda ya está completada' };
    }

    const hint = this.solution[row][col];
    this.stats.hintsUsed++;

    return {
      success: true,
      hint,
      message: `Pista: ${hint}`
    };
  }

  /**
   * VALIDACIÓN: verificar si un número viola reglas de Sudoku
   * (útil para UI: mostrar números duplicados antes de confirmar)
   */
  hasConflict(row, col, num) {
    if (num === this.EMPTY) return false;

    // Validar fila
    for (let c = 0; c < this.GRID_SIZE; c++) {
      if (c !== col && this.board[row][c] === num) return true;
    }

    // Validar columna
    for (let r = 0; r < this.GRID_SIZE; r++) {
      if (r !== row && this.board[r][col] === num) return true;
    }

    // Validar subgrid 3x3
    const subgridRow = Math.floor(row / this.SUBGRID_SIZE) * this.SUBGRID_SIZE;
    const subgridCol = Math.floor(col / this.SUBGRID_SIZE) * this.SUBGRID_SIZE;

    for (let r = subgridRow; r < subgridRow + this.SUBGRID_SIZE; r++) {
      for (let c = subgridCol; c < subgridCol + this.SUBGRID_SIZE; c++) {
        if ((r !== row || c !== col) && this.board[r][c] === num) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * HISTORIAL: guardar estado para undo
   */
  saveToHistory() {
    // Remover redo si hay
    this.history = this.history.slice(0, this.historyIndex + 1);

    this.history.push({
      board: this.board.map(row => [...row]),
      notes: this.notes.map(row =>
        row.map(cell => [...cell])
      ),
      lives: this.lives
    });

    this.historyIndex++;
  }

  /**
   * UNDO: deshacer último movimiento
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];

      this.board = state.board.map(row => [...row]);
      this.notes = state.notes.map(row =>
        row.map(cell => [...cell])
      );
      this.lives = state.lives;

      return { success: true, message: 'Movimiento deshecho' };
    }
    return { success: false, message: 'No hay movimientos para deshacer' };
  }

  /**
   * REDO: rehacer movimiento
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];

      this.board = state.board.map(row => [...row]);
      this.notes = state.notes.map(row =>
        row.map(cell => [...cell])
      );
      this.lives = state.lives;

      return { success: true, message: 'Movimiento rehecho' };
    }
    return { success: false, message: 'No hay movimientos para rehacer' };
  }

  /**
   * ESTADO ACTUAL: obtener snapshot del tablero
   */
  getState() {
    return {
      board: this.board,
      notes: this.notes,
      lives: this.lives,
      maxLives: this.maxLives,
      mode: this.mode,
      elapsedSeconds: this.elapsedSeconds,
      isGameOver: this.isGameOver,
      isWon: this.isWon,
      stats: this.stats
    };
  }

  /**
   * TERMINAR JUEGO
   */
  endGame(won) {
    this.isGameOver = true;
    this.isWon = won;
    this.updateTimer();
  }

  /**
   * RESULTADO FINAL: para guardar en estadísticas
   */
  getResult() {
    return {
      won: this.isWon,
      time: this.elapsedSeconds,
      mistakes: this.stats.mistakesMade,
      hints: this.stats.hintsUsed,
      totalMoves: this.stats.movementsTotal
    };
  }

  /**
   * UTILIDADES
   */
  isValidCoordinate(row, col) {
    return (
      Number.isInteger(row) &&
      Number.isInteger(col) &&
      row >= 0 &&
      row < this.GRID_SIZE &&
      col >= 0 &&
      col < this.GRID_SIZE
    );
  }

  /**
   * DEBUG: imprimir tablero actual
   */
  boardToString() {
    return this.board
      .map(row => row.map(cell => (cell === this.EMPTY ? '.' : cell)).join(' '))
      .join('\n');
  }

  /**
   * DEBUG: imprimir notas
   */
  notesToString() {
    return this.notes
      .map(row =>
        row
          .map(notes =>
            notes.length === 0 ? '.' : `[${notes.join(',')}]`
          )
          .join(' ')
      )
      .join('\n');
  }
}

// Exportar para Node.js y navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameLogic;
}
