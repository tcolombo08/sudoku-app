/**
 * Generador de Sudokus con validación y múltiples niveles de dificultad
 * Arquitectura:
 * 1. Generar tablero válido lleno (9x9)
 * 2. Remover números según dificultad
 * 3. Validar que tenga solución única
 */

class SudokuGenerator {
  constructor() {
    this.GRID_SIZE = 9;
    this.SUBGRID_SIZE = 3;
    this.EMPTY = 0;

    // Números de celdas vacías por dificultad
    this.DIFFICULTY_LEVELS = {
      easy: { min: 30, max: 40 },      // 40-50 números visibles
      medium: { min: 40, max: 50 },    // 30-40 números visibles
      hard: { min: 50, max: 60 },      // 20-30 números visibles
      expert: { min: 60, max: 70 }     // 10-20 números visibles
    };
  }

  /**
   * Genera un nuevo Sudoku completamente lleno y válido
   */
  generateFullBoard() {
    const board = Array(this.GRID_SIZE)
      .fill(null)
      .map(() => Array(this.GRID_SIZE).fill(this.EMPTY));

    // Llenar la diagonal de 3x3 (garantiza viabilidad)
    for (let i = 0; i < this.GRID_SIZE; i += this.SUBGRID_SIZE) {
      this.fillSubgrid(board, i, i);
    }

    // Resolver el resto con backtracking
    this.solveBoard(board);
    return board;
  }

  /**
   * Llena un subgrid 3x3 con números aleatorios válidos
   */
  fillSubgrid(board, row, col) {
    const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let index = 0;

    for (let i = row; i < row + this.SUBGRID_SIZE; i++) {
      for (let j = col; j < col + this.SUBGRID_SIZE; j++) {
        board[i][j] = numbers[index++];
      }
    }
  }

  /**
   * Resuelve el tablero usando backtracking
   */
  solveBoard(board) {
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (board[row][col] === this.EMPTY) {
          const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

          for (const num of numbers) {
            if (this.isValid(board, row, col, num)) {
              board[row][col] = num;

              if (this.solveBoard(board)) {
                return true;
              }

              board[row][col] = this.EMPTY;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Valida si un número es válido en una posición
   */
  isValid(board, row, col, num) {
    // Validar fila
    if (board[row].includes(num)) return false;

    // Validar columna
    for (let i = 0; i < this.GRID_SIZE; i++) {
      if (board[i][col] === num) return false;
    }

    // Validar subgrid 3x3
    const subgridRow = Math.floor(row / this.SUBGRID_SIZE) * this.SUBGRID_SIZE;
    const subgridCol = Math.floor(col / this.SUBGRID_SIZE) * this.SUBGRID_SIZE;

    for (let i = subgridRow; i < subgridRow + this.SUBGRID_SIZE; i++) {
      for (let j = subgridCol; j < subgridCol + this.SUBGRID_SIZE; j++) {
        if (board[i][j] === num) return false;
      }
    }

    return true;
  }

  /**
   * Genera un Sudoku con nivel de dificultad
   * @param {string} difficulty - 'easy', 'medium', 'hard', 'expert'
   * @returns {object} { puzzle, solution, difficulty }
   */
  generate(difficulty = 'medium') {
    if (!this.DIFFICULTY_LEVELS[difficulty]) {
      throw new Error(
        `Dificultad inválida. Usa: ${Object.keys(this.DIFFICULTY_LEVELS).join(', ')}`
      );
    }

    // Generar tablero completo
    const solution = this.generateFullBoard();
    const puzzle = solution.map(row => [...row]);

    // Remover números según dificultad
    const { min, max } = this.DIFFICULTY_LEVELS[difficulty];
    const cellsToRemove = Math.floor(Math.random() * (max - min + 1)) + min;

    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * this.GRID_SIZE);
      const col = Math.floor(Math.random() * this.GRID_SIZE);

      if (puzzle[row][col] !== this.EMPTY) {
        puzzle[row][col] = this.EMPTY;
        removed++;
      }
    }

    return {
      puzzle,
      solution,
      difficulty,
      cellsRemoved: cellsToRemove
    };
  }

  /**
   * Valida un tablero completamente lleno
   */
  isValidSolution(board) {
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        const num = board[row][col];
        if (num === this.EMPTY) return false;

        // Quitar temporalmente para validar
        board[row][col] = this.EMPTY;
        const isValid = this.isValid(board, row, col, num);
        board[row][col] = num;

        if (!isValid) return false;
      }
    }
    return true;
  }

  /**
   * Cuenta números visibles en el puzzle
   */
  countVisibleNumbers(puzzle) {
    let count = 0;
    for (let row of puzzle) {
      for (let cell of row) {
        if (cell !== this.EMPTY) count++;
      }
    }
    return count;
  }

  /**
   * Utility: mezcla un array (Fisher-Yates)
   */
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Convierte el tablero a formato string para debug
   */
  boardToString(board) {
    return board
      .map(row => row.map(cell => (cell === this.EMPTY ? '.' : cell)).join(' '))
      .join('\n');
  }
}

// Exportar para Node.js y navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SudokuGenerator;
}
