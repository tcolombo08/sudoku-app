import useGameStore from '../store/gameStore.js';

const difficulties = [
  { key: 'easy', label: 'Easy', desc: '40-50 clues', emoji: '\u{1F33F}', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
  { key: 'medium', label: 'Medium', desc: '30-40 clues', emoji: '\u{1F525}', gradient: 'from-sky-400 to-blue-500', shadow: 'shadow-sky-200' },
  { key: 'hard', label: 'Hard', desc: '20-30 clues', emoji: '\u26A1', gradient: 'from-orange-400 to-red-500', shadow: 'shadow-orange-200' },
  { key: 'expert', label: 'Expert', desc: '10-20 clues', emoji: '\u{1F480}', gradient: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-200' },
];

export default function DifficultySelector() {
  const newGame = useGameStore(s => s.newGame);
  const game = useGameStore(s => s.game);

  if (game) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-sky-50 via-white to-pink-50">
      {/* Logo area */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200 rotate-3">
          <span className="text-4xl font-black text-white -rotate-3">9</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sudoku</h1>
        <p className="text-sm text-gray-400 mt-1">Train your brain</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {difficulties.map(d => (
          <button
            key={d.key}
            onClick={() => newGame(d.key)}
            className={`
              flex flex-col items-center
              px-4 py-5 rounded-2xl
              bg-gradient-to-br ${d.gradient}
              text-white text-center
              transition-all duration-200
              cursor-pointer active:scale-[0.95]
              shadow-lg ${d.shadow}
              hover:shadow-xl hover:-translate-y-0.5
            `}
          >
            <span className="text-2xl mb-1">{d.emoji}</span>
            <span className="font-bold text-sm">{d.label}</span>
            <span className="text-[10px] opacity-80 mt-0.5">{d.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
