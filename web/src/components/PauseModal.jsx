import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore.js';
import useFirebase from '../hooks/useFirebase.js';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function StatItem({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

export default function PauseModal() {
  const isPaused = useGameStore(s => s.isPaused);
  const togglePause = useGameStore(s => s.togglePause);
  const elapsedSeconds = useGameStore(s => s.elapsedSeconds);
  const stats = useGameStore(s => s.stats);
  const lives = useGameStore(s => s.lives);
  const maxLives = useGameStore(s => s.maxLives);
  const difficulty = useGameStore(s => s.difficulty);
  const { getUserProfile } = useFirebase();
  const [historicalStats, setHistoricalStats] = useState(null);

  useEffect(() => {
    if (isPaused) {
      getUserProfile().then(p => {
        if (p) setHistoricalStats(p);
      });
    }
  }, [isPaused, getUserProfile]);

  if (!isPaused) return null;

  const diffLabels = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' };
  const diffColors = {
    easy: 'from-emerald-400 to-teal-500',
    medium: 'from-sky-400 to-blue-500',
    hard: 'from-orange-400 to-red-500',
    expert: 'from-purple-500 to-pink-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      {/* Backdrop — semi-transparent, not fully opaque */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Card — positioned near the top */}
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl p-6">
        {/* Pause icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-black text-gray-900 text-center mb-1">Game Paused</h2>
        <p className="text-xs text-gray-400 text-center mb-5">
          <span className={`inline-block px-2 py-0.5 rounded-full text-white text-[10px] font-bold bg-gradient-to-r ${diffColors[difficulty]}`}>
            {diffLabels[difficulty]}
          </span>
        </p>

        {/* Current game stats */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Current Game</div>
          <div className="flex items-center justify-around">
            <StatItem value={formatTime(elapsedSeconds)} label="Time" color="text-sky-500" />
            <div className="w-px h-8 bg-gray-200" />
            <StatItem value={stats.mistakesMade} label="Mistakes" color="text-rose-500" />
            <div className="w-px h-8 bg-gray-200" />
            <StatItem value={stats.hintsUsed} label="Hints" color="text-amber-500" />
            <div className="w-px h-8 bg-gray-200" />
            <StatItem value={`${lives}/${maxLives}`} label="Lives" color="text-pink-500" />
          </div>
        </div>

        {/* Historical stats */}
        {historicalStats && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Your Stats</div>
            <div className="grid grid-cols-2 gap-3">
              {historicalStats.gamesWon != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Games Won</span>
                  <span className="font-bold text-gray-700">{historicalStats.gamesWon}</span>
                </div>
              )}
              {historicalStats.gamesPlayed != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Games</span>
                  <span className="font-bold text-gray-700">{historicalStats.gamesPlayed}</span>
                </div>
              )}
              {historicalStats.totalErrors != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Errors</span>
                  <span className="font-bold text-gray-700">{historicalStats.totalErrors}</span>
                </div>
              )}
              {historicalStats.totalHints != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Hints</span>
                  <span className="font-bold text-gray-700">{historicalStats.totalHints}</span>
                </div>
              )}
              {historicalStats.bestTimes && Object.entries(historicalStats.bestTimes).map(([diff, time]) => (
                <div key={diff} className="flex justify-between text-xs">
                  <span className="text-gray-500">Best {diffLabels[diff] || diff}</span>
                  <span className="font-bold text-gray-700">{formatTime(time)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resume button */}
        <button
          onClick={togglePause}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-sky-400 to-blue-600 shadow-lg shadow-sky-200 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer active:scale-[0.98]"
        >
          Resume
        </button>

        <p className="text-[10px] text-gray-300 text-center mt-3">Press P or Esc to resume</p>
      </div>
    </div>
  );
}
