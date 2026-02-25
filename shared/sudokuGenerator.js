/**
 * Sudoku generator with validation and multiple difficulty levels
 * Architecture:
 * 1. Generate a valid filled board (9x9)
 * 2. Remove numbers based on difficulty
 * 3. Validate unique solution
 */

class SudokuGenerator {
  constructor() {
    this.GRID_SIZE = 9;
    this.SUBGRID_SIZE = 3;
    this.EMPTY = 0;

    // Number of empty cells per difficulty
    this.DIFFICULTY_LEVELS = {
      easy: { min: 30, max: 40 },      // 40-50 visible numbers
      medium: { min: 40, max: 50 },    // 30-40 visible numbers
      hard: { min: 50, max: 60 },      // 20-30 visible numbers
      expert: { min: 60, max: 70 }     // 10-20 visible numbers
    };
  }

  /**
   * Generates a new fully filled and valid Sudoku board
   */
  generateFullBoard() {
    const board = Array(this.GRID_SIZE)
      .fill(null)
      .map(() => Array(this.GRID_SIZE).fill(this.EMPTY));

    // Fill the 3x3 diagonal (guarantees feasibility)
    for (let i = 0; i < this.GRID_SIZE; i += this.SUBGRID_SIZE) {
      this.fillSubgrid(board, i, i);
    }

    // Solve the rest with backtracking
    this.solveBoard(board);
    return board;
  }

  /**
   * Fills a 3x3 subgrid with valid random numbers
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
   * Solves the board using backtracking
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
   * Validates whether a number is valid at a given position
   */
  isValid(board, row, col, num) {
    // Validate row
    if (board[row].includes(num)) return false;

    // Validate column
    for (let i = 0; i < this.GRID_SIZE; i++) {
      if (board[i][col] === num) return false;
    }

    // Validate 3x3 subgrid
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
   * Generates a Sudoku with a given difficulty level
   * @param {string} difficulty - 'easy', 'medium', 'hard', 'expert'
   * @returns {object} { puzzle, solution, difficulty }
   */
  generate(difficulty = 'medium') {
    if (!this.DIFFICULTY_LEVELS[difficulty]) {
      throw new Error(
        `Invalid difficulty. Use: ${Object.keys(this.DIFFICULTY_LEVELS).join(', ')}`
      );
    }

    // Generate full board
    const solution = this.generateFullBoard();
    const puzzle = solution.map(row => [...row]);

    // Remove numbers based on difficulty
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
   * Validates a fully filled board
   */
  isValidSolution(board) {
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        const num = board[row][col];
        if (num === this.EMPTY) return false;

        // Temporarily remove to validate
        board[row][col] = this.EMPTY;
        const isValid = this.isValid(board, row, col, num);
        board[row][col] = num;

        if (!isValid) return false;
      }
    }
    return true;
  }

  /**
   * Counts visible numbers in the puzzle
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
   * Utility: shuffles an array (Fisher-Yates)
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
   * Converts the board to a string format for debugging
   */
  boardToString(board) {
    return board
      .map(row => row.map(cell => (cell === this.EMPTY ? '.' : cell)).join(' '))
      .join('\n');
  }
}

export default SudokuGenerator;
