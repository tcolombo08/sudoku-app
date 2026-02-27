import useGameStore from '../store/gameStore.js';

function Cell({ row, col }) {
  const board = useGameStore(s => s.board);
  const puzzle = useGameStore(s => s.puzzle);
  const notes = useGameStore(s => s.notes);
  const selectedCell = useGameStore(s => s.selectedCell);
  const selectCell = useGameStore(s => s.selectCell);
  const hasConflict = useGameStore(s => s.hasConflict);
  const lastPlacedCell = useGameStore(s => s.lastPlacedCell);

  const value = board[row]?.[col] || 0;
  const isGiven = puzzle[row]?.[col] !== 0;
  const cellNotes = notes[row]?.[col] || [];
  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
  const isSameRow = selectedCell?.row === row;
  const isSameCol = selectedCell?.col === col;
  const isSameBox =
    selectedCell &&
    Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
    Math.floor(selectedCell.col / 3) === Math.floor(col / 3);
  const isHighlighted = (isSameRow || isSameCol || isSameBox) && !isSelected;
  const conflict = value !== 0 && hasConflict(row, col);

  const selectedValue = selectedCell ? board[selectedCell.row]?.[selectedCell.col] : 0;
  const isSameNumber = value !== 0 && selectedValue !== 0 && value === selectedValue && !isSelected;

  // Pop animation for recently placed cell
  const justPlaced = lastPlacedCell?.row === row && lastPlacedCell?.col === col;

  // Border classes for 3x3 subgrid
  const borderClasses = [
    col % 3 === 0 ? 'border-l-2 border-l-border-thick' : 'border-l border-l-border-thin',
    col === 8 ? 'border-r-2 border-r-border-thick' : '',
    row % 3 === 0 ? 'border-t-2 border-t-border-thick' : 'border-t border-t-border-thin',
    row === 8 ? 'border-b-2 border-b-border-thick' : '',
  ].join(' ');

  let bgClass = 'bg-white';
  if (isSelected) bgClass = 'bg-cell-selected';
  else if (conflict) bgClass = 'bg-cell-conflict';
  else if (isSameNumber) bgClass = 'bg-cell-same';
  else if (isHighlighted) bgClass = 'bg-cell-highlight';

  let textClass = 'text-cell-user font-semibold';
  if (isGiven) textClass = 'text-cell-given font-bold';
  if (conflict && !isGiven) textClass = 'text-cell-error font-bold';

  return (
    <button
      className={`
        relative flex items-center justify-center
        w-full aspect-square
        text-lg sm:text-xl md:text-2xl
        cursor-pointer select-none
        transition-colors duration-100
        focus:outline-none
        ${borderClasses}
        ${bgClass}
        ${isSelected ? 'pulse-glow z-10' : ''}
      `}
      onClick={() => selectCell(row, col)}
      aria-label={`Cell ${row + 1},${col + 1}${value ? `: ${value}` : ''}`}
    >
      {value !== 0 ? (
        <span className={`${textClass} ${justPlaced ? 'cell-pop' : ''}`}>
          {value}
        </span>
      ) : cellNotes.length > 0 ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <span
              key={n}
              className="flex items-center justify-center text-[7px] sm:text-[9px] md:text-[10px] text-annotation leading-none font-medium"
            >
              {cellNotes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

export default function GameBoard() {
  const board = useGameStore(s => s.board);
  const shakeBoard = useGameStore(s => s.shakeBoard);

  if (!board || board.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-9 w-full max-w-[min(90vw,420px)] mx-auto bg-board-bg border-2 border-border-thick rounded-xl overflow-hidden shadow-xl shadow-sky-100 ${shakeBoard ? 'shake' : ''}`}
      role="grid"
      aria-label="Sudoku board"
    >
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => (
          <Cell key={`${row}-${col}`} row={row} col={col} />
        ))
      )}
    </div>
  );
}
