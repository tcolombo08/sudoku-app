import useGameStore from '../store/gameStore.js';

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StatsPanel() {
  const lives = useGameStore(s => s.lives);
  const maxLives = useGameStore(s => s.maxLives);
  const elapsedSeconds = useGameStore(s => s.elapsedSeconds);
  const stats = useGameStore(s => s.stats);
  const difficulty = useGameStore(s => s.difficulty);
  const showAdPrompt = useGameStore(s => s.showAdPrompt);

  const difficultyConfig = {
    easy: { label: 'Easy', gradient: 'from-emerald-400 to-teal-500' },
    medium: { label: 'Medium', gradient: 'from-sky-400 to-blue-500' },
    hard: { label: 'Hard', gradient: 'from-orange-400 to-red-500' },
    expert: { label: 'Expert', gradient: 'from-purple-500 to-pink-600' },
  };

  const cfg = difficultyConfig[difficulty];

  return (
    <div className="w-full max-w-[min(90vw,420px)] mx-auto flex items-center justify-between gap-2 py-3 px-1">
      {/* Difficulty badge */}
      <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-white bg-gradient-to-r ${cfg.gradient} shadow-sm`}>
        {cfg.label}
      </span>

      {/* Timer */}
      <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100">
        <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
        <span className="font-mono text-sm font-bold text-gray-700 tabular-nums">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      {/* Lives */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxLives }, (_, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
              i < lives
                ? 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-sm shadow-rose-200 scale-100'
                : 'bg-gray-200 scale-90'
            }`}
          >
            <svg className={`w-3.5 h-3.5 ${i < lives ? 'text-white' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        ))}
        {lives < maxLives && (
          <button
            onClick={() => useGameStore.setState({ showAdPrompt: 'life' })}
            className="ml-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm shadow-amber-200 hover:scale-110 transition-transform cursor-pointer"
            title="Watch ad for extra life"
          >
            +1
          </button>
        )}
      </div>

      {/* Errors counter */}
      {stats.mistakesMade > 0 && (
        <div className="flex items-center gap-1 bg-rose-50 rounded-full px-2.5 py-1">
          <span className="text-[11px] font-bold text-rose-500">{stats.mistakesMade}</span>
          <svg className="w-3 h-3 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
    </div>
  );
}
