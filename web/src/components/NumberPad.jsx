import { useState } from 'react';
import useGameStore from '../store/gameStore.js';

const numColors = [
  '', // 0 unused
  'from-sky-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-blue-400 to-indigo-500',
  'from-lime-400 to-green-500',
  'from-fuchsia-400 to-pink-500',
  'from-red-400 to-orange-500',
];

export default function NumberPad() {
  const placeNumber = useGameStore(s => s.placeNumber);
  const selectedCell = useGameStore(s => s.selectedCell);
  const isGameOver = useGameStore(s => s.isGameOver);
  const isWon = useGameStore(s => s.isWon);
  const board = useGameStore(s => s.board);
  const [pressedNum, setPressedNum] = useState(null);

  const disabled = !selectedCell || isGameOver || isWon;

  const numberCounts = {};
  for (let n = 1; n <= 9; n++) numberCounts[n] = 0;
  if (board.length > 0) {
    for (const row of board) {
      for (const cell of row) {
        if (cell > 0) numberCounts[cell]++;
      }
    }
  }

  const handleClick = (num) => {
    setPressedNum(num);
    placeNumber(num);
    setTimeout(() => setPressedNum(null), 150);
  };

  return (
    <div className="w-full max-w-[min(90vw,420px)] mx-auto mt-4">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const isComplete = numberCounts[num] >= 9;
          const isPressed = pressedNum === num;
          return (
            <button
              key={num}
              onClick={() => handleClick(num)}
              disabled={disabled || isComplete}
              className={`
                relative flex items-center justify-center
                h-13 sm:h-14
                rounded-2xl text-xl sm:text-2xl font-black
                transition-all duration-150
                ${isComplete
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-br ${numColors[num]} text-white cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${isPressed ? 'btn-press' : ''}`
                }
              `}
              aria-label={`Place ${num}`}
            >
              {num}
              {!isComplete && numberCounts[num] > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                  {numberCounts[num]}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => handleClick(0)}
          disabled={disabled}
          className={`
            flex items-center justify-center gap-1
            h-13 sm:h-14
            rounded-2xl text-sm font-bold
            transition-all duration-150
            ${disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-400 hover:text-gray-800 active:scale-95 cursor-pointer'
            }
          `}
          aria-label="Clear cell"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 011.414-.586H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
