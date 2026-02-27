import { useEffect, useCallback } from 'react';
import useGameStore from '../store/gameStore.js';

export default function useGame() {
  const store = useGameStore();

  // Keyboard input
  const handleKeyDown = useCallback((e) => {
    const { selectedCell, isGameOver, isWon } = useGameStore.getState();
    if (isGameOver || isWon) return;

    // Global shortcuts (no cell selection needed)

    // Ctrl+Z = undo, Ctrl+Y / Ctrl+Shift+Z = redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      useGameStore.getState().undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      useGameStore.getState().redo();
      return;
    }

    // H = hint
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      useGameStore.getState().getHint();
      return;
    }

    // Space = toggle mode
    if (e.key === ' ') {
      e.preventDefault();
      useGameStore.getState().toggleMode();
      return;
    }

    // Cell-dependent shortcuts
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    // Number keys 1-9
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      useGameStore.getState().placeNumber(parseInt(e.key));
      return;
    }

    // Delete / Backspace = clear
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      useGameStore.getState().placeNumber(0);
      return;
    }

    // Arrow keys for navigation
    const moves = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };

    if (moves[e.key]) {
      e.preventDefault();
      const [dr, dc] = moves[e.key];
      const newRow = Math.max(0, Math.min(8, row + dr));
      const newCol = Math.max(0, Math.min(8, col + dc));
      useGameStore.getState().selectCell(newRow, newCol);
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return store;
}
