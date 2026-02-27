import { create } from 'zustand';
import SudokuGenerator from '@shared/sudokuGenerator.js';
import GameLogic from '@shared/gameLogic.js';

const generator = new SudokuGenerator();

const useGameStore = create((set, get) => ({
  // Game instance
  game: null,
  gameId: null,
  difficulty: 'medium',

  // Board state (synced from GameLogic)
  board: [],
  puzzle: [],
  notes: [],
  lives: 3,
  maxLives: 3,
  mode: 'annotation',
  elapsedSeconds: 0,
  isGameOver: false,
  isWon: false,
  stats: { movementsTotal: 0, mistakesMade: 0, hintsUsed: 0 },

  // UI state
  selectedCell: null,
  moveCount: 0,
  timerInterval: null,
  message: null,

  // Hint gating
  freeHintUsed: false,
  showAdPrompt: null, // null | 'hint' | 'life'

  // Visual feedback state
  errorFlash: false,
  lastPlacedCell: null,
  shakeBoard: false,

  // Sync state from GameLogic instance to store
  syncState: () => {
    const { game } = get();
    if (!game) return;
    const state = game.getState();
    set({
      board: state.board.map(r => [...r]),
      notes: state.notes.map(r => r.map(c => [...c])),
      lives: state.lives,
      maxLives: state.maxLives,
      mode: state.mode,
      elapsedSeconds: state.elapsedSeconds,
      isGameOver: state.isGameOver,
      isWon: state.isWon,
      stats: { ...state.stats },
    });
  },

  // Start new game
  newGame: (difficulty = 'medium') => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);

    const { puzzle, solution } = generator.generate(difficulty);
    const game = new GameLogic(puzzle, solution);
    const gameId = `game_${Date.now()}`;

    const interval = setInterval(() => {
      const { game, isGameOver } = get();
      if (game && !isGameOver) {
        game.updateTimer();
        set({ elapsedSeconds: game.elapsedSeconds });
      }
    }, 1000);

    set({
      game,
      gameId,
      difficulty,
      puzzle: puzzle.map(r => [...r]),
      selectedCell: null,
      moveCount: 0,
      timerInterval: interval,
      message: null,
      errorFlash: false,
      lastPlacedCell: null,
      shakeBoard: false,
      freeHintUsed: false,
      showAdPrompt: null,
    });

    get().syncState();
  },

  // Select a cell
  selectCell: (row, col) => {
    set({ selectedCell: { row, col } });
  },

  // Place a number
  placeNumber: (num) => {
    const { game, selectedCell, moveCount } = get();
    if (!game || !selectedCell) return null;

    const { row, col } = selectedCell;
    const result = game.placeNumber(row, col, num);

    if (result.success) {
      const newMoveCount = moveCount + 1;

      // Trigger error flash for wrong answers
      if (result.isCorrect === false) {
        set({ errorFlash: true, shakeBoard: true });
        setTimeout(() => set({ errorFlash: false, shakeBoard: false }), 600);
      }

      // Track last placed cell for pop animation (only on correct/neutral)
      if (result.isCorrect !== false && num !== 0) {
        set({ lastPlacedCell: { row, col, ts: Date.now() } });
      }

      // No message for correct answers, only set for errors/game over
      const msg = result.isCorrect === false ? result.message : null;

      set({ moveCount: newMoveCount, message: msg });
      get().syncState();

      if (result.isGameOver || result.isWon) {
        const { timerInterval } = get();
        if (timerInterval) clearInterval(timerInterval);
      }

      return { ...result, moveCount: newMoveCount };
    }

    return result;
  },

  // Toggle mode
  toggleMode: () => {
    const { game, mode } = get();
    if (!game) return;
    const newMode = mode === 'annotation' ? 'complete' : 'annotation';
    game.setMode(newMode);
    set({ mode: newMode });
  },

  setMode: (mode) => {
    const { game } = get();
    if (!game) return;
    game.setMode(mode);
    set({ mode });
  },

  // Undo
  undo: () => {
    const { game } = get();
    if (!game) return;
    const result = game.undo();
    if (result.success) get().syncState();
  },

  // Redo
  redo: () => {
    const { game } = get();
    if (!game) return;
    const result = game.redo();
    if (result.success) get().syncState();
  },

  // Hint (1 free per game, then requires ad)
  getHint: () => {
    const { game, freeHintUsed } = get();
    if (!game) return;

    if (freeHintUsed) {
      set({ showAdPrompt: 'hint' });
      return;
    }

    return get()._executeHint();
  },

  // Called after ad watched or for the free hint
  _executeHint: () => {
    const { game } = get();
    if (!game) return;

    const result = game.getHint();

    if (result.success) {
      set({ freeHintUsed: true });
      if (result.type === 'solve') {
        set({ lastPlacedCell: { row: result.row, col: result.col, ts: Date.now() } });

        if (result.isWon) {
          const { timerInterval } = get();
          if (timerInterval) clearInterval(timerInterval);
        }
      }
      get().syncState();
    }

    return result;
  },

  // Ad prompt actions
  onAdWatched: (type) => {
    set({ showAdPrompt: null });
    if (type === 'hint') {
      get()._executeHint();
    } else if (type === 'life') {
      get().restoreLife();
    }
  },

  dismissAdPrompt: () => set({ showAdPrompt: null }),

  // Restore life
  restoreLife: () => {
    const { game } = get();
    if (!game) return;
    const result = game.restoreLife();
    if (result.success) get().syncState();
  },

  // Clear message
  clearMessage: () => set({ message: null }),

  // Get result for Firebase
  getResult: () => {
    const { game, difficulty } = get();
    if (!game) return null;
    return { ...game.getResult(), difficulty };
  },

  // Check if cell is given (original puzzle)
  isGivenCell: (row, col) => {
    const { puzzle } = get();
    return puzzle[row]?.[col] !== 0;
  },

  // Check conflict
  hasConflict: (row, col) => {
    const { game, board } = get();
    if (!game) return false;
    const num = board[row]?.[col];
    if (!num) return false;
    return game.hasConflict(row, col, num);
  },

  // Cleanup
  cleanup: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({ game: null, timerInterval: null });
  },
}));

export default useGameStore;
