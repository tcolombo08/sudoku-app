import useGameStore from '../store/gameStore.js';

export default function ModeToggle() {
  const mode = useGameStore(s => s.mode);
  const toggleMode = useGameStore(s => s.toggleMode);
  const undo = useGameStore(s => s.undo);
  const redo = useGameStore(s => s.redo);
  const getHint = useGameStore(s => s.getHint);
  const freeHintUsed = useGameStore(s => s.freeHintUsed);
  const isGameOver = useGameStore(s => s.isGameOver);
  const isWon = useGameStore(s => s.isWon);

  const disabled = isGameOver || isWon;
  const isNotes = mode === 'annotation';

  return (
    <div className="w-full max-w-[min(90vw,420px)] mx-auto flex items-center justify-between gap-3 mt-4">
      {/* Notes switch */}
      <div className="flex items-center gap-2.5">
        <span className={`text-xs font-semibold transition-colors ${isNotes ? 'text-lavender-dark' : 'text-gray-400'}`}>
          Notes
        </span>
        <button
          onClick={toggleMode}
          disabled={disabled}
          className={`
            relative w-11 h-6 rounded-full transition-all duration-200 cursor-pointer
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            ${isNotes
              ? 'bg-gradient-to-r from-lavender to-lavender-dark'
              : 'bg-gray-300'
            }
          `}
          role="switch"
          aria-checked={isNotes}
          aria-label="Toggle notes mode"
        >
          <div
            className={`
              absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
              transition-transform duration-200
              ${isNotes ? 'translate-x-5.5' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={disabled}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-90"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
          </svg>
        </button>

        <button
          onClick={redo}
          disabled={disabled}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-90"
          aria-label="Redo"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
          </svg>
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          onClick={getHint}
          disabled={disabled}
          className={`
            h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95
            disabled:opacity-25 disabled:cursor-not-allowed
            ${freeHintUsed
              ? 'bg-gray-100 text-gray-500 shadow-none hover:bg-gray-200'
              : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-amber-200 hover:shadow-md hover:-translate-y-px'
            }
          `}
          aria-label="Hint"
          title="Hint (H)"
        >
          {freeHintUsed ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
          {freeHintUsed ? 'Ad Hint' : 'Hint'}
        </button>
      </div>
    </div>
  );
}
