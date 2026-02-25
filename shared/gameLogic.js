/**
 * Sudoku game logic
 * Handles: validation, notes, lives, timer, win detection
 */

class GameLogic {
  constructor(puzzle, solution) {
    this.GRID_SIZE = 9;
    this.SUBGRID_SIZE = 3;
    this.EMPTY = 0;

    // Game state
    this.puzzle = puzzle.map(row => [...row]); // Original puzzle (immutable)
    this.solution = solution.map(row => [...row]); // Solution for validation
    this.board = puzzle.map(row => [...row]); // Current player board

    // Notes system (draft)
    // notes[row][col] = [1,2,3] = candidate numbers
    this.notes = Array(this.GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(this.GRID_SIZE).fill(null).map(() => [])
      );

    // Game state
    this.lives = 3;
    this.maxLives = 3;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.isGameOver = false;
    this.isWon = false;
    this.mode = 'annotation'; // 'annotation' or 'complete'

    // Move history (for undo/redo)
    this.history = [];
    this.historyIndex = -1;

    // Statistics
    this.stats = {
      movementsTotal: 0,
      mistakesMade: 0,
      hintsUsed: 0
    };
  }

  /**
   * MODE: Switch between annotation and complete mode
   */
  setMode(mode) {
    if (!['annotation', 'complete'].includes(mode)) {
      throw new Error("Mode must be 'annotation' or 'complete'");
    }
    this.mode = mode;
  }

  /**
   * NUMBER INPUT
   * @param {number} row - Row (0-8)
   * @param {number} col - Column (0-8)
   * @param {number} num - Number (1-9) or 0 to clear
   * @returns {object} { success, message, isCorrect, isWon }
   */
  placeNumber(row, col, num) {
    // Basic validations
    if (!this.isValidCoordinate(row, col)) {
      return { success: false, message: 'Invalid coordinates' };
    }

    if (num < 0 || num > 9 || !Number.isInteger(num)) {
      return { success: false, message: 'Number must be between 0-9' };
    }

    // Cannot modify original puzzle numbers
    if (this.puzzle[row][col] !== this.EMPTY) {
      return { success: false, message: 'Cannot modify original numbers' };
    }

    // Save previous state to history
    this.saveToHistory();

    // ANNOTATION MODE: only add/remove from draft
    if (this.mode === 'annotation') {
      return this.toggleAnnotation(row, col, num);
    }

    // COMPLETE MODE: validate against solution
    if (this.mode === 'complete') {
      return this.placeAndValidate(row, col, num);
    }
  }

  /**
   * ANNOTATION MODE: toggle numbers in draft
   */
  toggleAnnotation(row, col, num) {
    if (num === 0) {
      // Clear all annotations
      this.notes[row][col] = [];
      this.stats.movementsTotal++;
      return { success: true, message: 'Annotations cleared', isCorrect: null };
    }

    const currentNotes = this.notes[row][col];
    const index = currentNotes.indexOf(num);

    if (index > -1) {
      // Already exists, remove it
      currentNotes.splice(index, 1);
    } else {
      // Add it
      currentNotes.push(num);
      currentNotes.sort((a, b) => a - b);
    }

    this.stats.movementsTotal++;
    return {
      success: true,
      message: 'Annotation updated',
      isCorrect: null,
      notes: currentNotes
    };
  }

  /**
   * COMPLETE MODE: validate number against solution
   */
  placeAndValidate(row, col, num) {
    if (num === 0) {
      // Clear number (always valid)
      this.board[row][col] = this.EMPTY;
      this.notes[row][col] = [];
      this.stats.movementsTotal++;
      return { success: true, message: 'Number cleared', isCorrect: null };
    }

    const correctNumber = this.solution[row][col];
    const isCorrect = num === correctNumber;

    if (isCorrect) {
      this.board[row][col] = num;
      this.notes[row][col] = [];
      this.stats.movementsTotal++;

      // Check if won
      if (this.isSolved()) {
        this.endGame(true);
        return {
          success: true,
          message: 'Sudoku completed!',
          isCorrect: true,
          isWon: true
        };
      }

      return {
        success: true,
        message: 'Correct!',
        isCorrect: true
      };
    } else {
      this.lives--;
      this.stats.mistakesMade++;
      this.stats.movementsTotal++;

      if (this.lives <= 0) {
        this.endGame(false);
        return {
          success: true,
          message: 'Game Over! No lives remaining.',
          isCorrect: false,
          isGameOver: true,
          livesRemaining: 0
        };
      }

      return {
        success: true,
        message: `Incorrect! ${this.lives} lives remaining.`,
        isCorrect: false,
        livesRemaining: this.lives
      };
    }
  }

  /**
   * LIVES: Restore a life by watching an ad
   * (ad logic is handled in the UI)
   */
  restoreLife() {
    if (this.lives < this.maxLives) {
      this.lives++;
      return { success: true, message: 'Life restored', livesRemaining: this.lives };
    }
    return { success: false, message: 'Already at max lives' };
  }

  /**
   * TIMER: update elapsed time
   */
  updateTimer() {
    this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    return this.formatTime(this.elapsedSeconds);
  }

  /**
   * FORMAT: convert seconds to "HH:MM:SS"
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
   * WIN: check if the Sudoku is solved
   */
  isSolved() {
    // All cells must be filled
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (this.board[row][col] === this.EMPTY) {
          return false;
        }
      }
    }

    // Validate that it matches the solution
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
   * HINT: get a number from the solution (no life penalty)
   */
  getHint(row, col) {
    if (!this.isValidCoordinate(row, col)) {
      return { success: false, message: 'Invalid coordinate' };
    }

    if (this.puzzle[row][col] !== this.EMPTY) {
      return { success: false, message: 'This cell is fixed' };
    }

    if (this.board[row][col] !== this.EMPTY) {
      return { success: false, message: 'This cell is already filled' };
    }

    const hint = this.solution[row][col];
    this.stats.hintsUsed++;

    return {
      success: true,
      hint,
      message: `Hint: ${hint}`
    };
  }

  /**
   * VALIDATION: check if a number violates Sudoku rules
   * (useful for UI: show duplicate numbers before confirming)
   */
  hasConflict(row, col, num) {
    if (num === this.EMPTY) return false;

    // Validate row
    for (let c = 0; c < this.GRID_SIZE; c++) {
      if (c !== col && this.board[row][c] === num) return true;
    }

    // Validate column
    for (let r = 0; r < this.GRID_SIZE; r++) {
      if (r !== row && this.board[r][col] === num) return true;
    }

    // Validate 3x3 subgrid
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
   * HISTORY: save state for undo
   */
  saveToHistory() {
    // Remove redo entries if any
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
   * UNDO: undo last move
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

      return { success: true, message: 'Move undone' };
    }
    return { success: false, message: 'No moves to undo' };
  }

  /**
   * REDO: redo move
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

      return { success: true, message: 'Move redone' };
    }
    return { success: false, message: 'No moves to redo' };
  }

  /**
   * CURRENT STATE: get board snapshot
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
   * END GAME
   */
  endGame(won) {
    this.isGameOver = true;
    this.isWon = won;
    this.updateTimer();
  }

  /**
   * FINAL RESULT: for saving to statistics
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
   * UTILITIES
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
   * DEBUG: print current board
   */
  boardToString() {
    return this.board
      .map(row => row.map(cell => (cell === this.EMPTY ? '.' : cell)).join(' '))
      .join('\n');
  }

  /**
   * DEBUG: print notes
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

export default GameLogic;
