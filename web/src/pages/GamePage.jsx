import { useEffect } from 'react';
import useGame from '../hooks/useGame.js';
import useGameStore from '../store/gameStore.js';
import useFirebase from '../hooks/useFirebase.js';
import GameBoard from '../components/GameBoard.jsx';
import NumberPad from '../components/NumberPad.jsx';
import StatsPanel from '../components/StatsPanel.jsx';
import ModeToggle from '../components/ModeToggle.jsx';
import GameOverModal from '../components/GameOverModal.jsx';
import DifficultySelector from '../components/DifficultySelector.jsx';
import AdPrompt from '../components/AdPrompt.jsx';
import PauseModal from '../components/PauseModal.jsx';

export default function GamePage() {
  const { game, gameId, moveCount, isGameOver, isWon, difficulty } = useGame();
  const errorFlash = useGameStore(s => s.errorFlash);
  const { saveGameState, saveGameResult, isInitialized } = useFirebase();

  // Auto-save to Firebase every 10 moves
  useEffect(() => {
    if (!isInitialized || !game || !gameId || moveCount === 0) return;
    if (moveCount % 10 !== 0) return;

    const state = game.getState();
    saveGameState(gameId, {
      ...state,
      difficulty,
    });
  }, [moveCount, isInitialized, game, gameId, saveGameState, difficulty]);

  // Save result on game end
  useEffect(() => {
    if (!isInitialized || !game) return;
    if (!isGameOver && !isWon) return;

    const result = game.getResult();
    saveGameResult({
      ...result,
      difficulty,
    });
  }, [isGameOver, isWon, isInitialized, game, saveGameResult, difficulty]);

  // Show difficulty selector if no game
  if (!game) {
    return <DifficultySelector />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 flex flex-col items-center px-4 py-5 relative">
      {/* Error flash overlay */}
      {errorFlash && (
        <div className="fixed inset-0 bg-gradient-to-b from-rose-500/30 to-transparent pointer-events-none z-40 error-flash" />
      )}

      {/* Header */}
      <div className="w-full max-w-[min(90vw,420px)] flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-xs font-black text-white">9</span>
          </div>
          <h1 className="text-lg font-black text-gray-900">Sudoku</h1>
        </div>
        <button
          onClick={() => {
            if (confirm('Start a new game? Current progress will be lost.')) {
              useGameStore.getState().cleanup();
              useGameStore.setState({ game: null });
            }
          }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New
        </button>
      </div>

      <StatsPanel />
      <GameBoard />
      <ModeToggle />
      <NumberPad />

      <GameOverModal />
      <PauseModal />
      <AdPrompt />

      {/* Keyboard shortcuts hint */}
      <div className="mt-5 text-[10px] text-gray-300 text-center font-medium">
        Arrows: navigate &middot; 1-9: place &middot; Space: notes &middot; H: hint &middot; P/Esc: pause &middot; Ctrl+Z/Y: undo/redo
      </div>
    </div>
  );
}
