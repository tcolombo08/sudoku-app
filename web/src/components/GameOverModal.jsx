import { useEffect, useState, useRef } from 'react';
import useGameStore from '../store/gameStore.js';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Confetti() {
  const colors = ['#38bdf8', '#f472b6', '#34d399', '#a78bfa', '#fb923c', '#f43f5e', '#facc15'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

function StatItem({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

export default function GameOverModal() {
  const isGameOver = useGameStore(s => s.isGameOver);
  const isWon = useGameStore(s => s.isWon);
  const stats = useGameStore(s => s.stats);
  const elapsedSeconds = useGameStore(s => s.elapsedSeconds);
  const difficulty = useGameStore(s => s.difficulty);
  const newGame = useGameStore(s => s.newGame);
  const [show, setShow] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  useEffect(() => {
    if (isGameOver || isWon) {
      const timer = setTimeout(() => setShow(true), 400);
      return () => clearTimeout(timer);
    }
    setShow(false);
    setSelectedDifficulty(null);
  }, [isGameOver, isWon]);

  if (!show) return null;

  const difficulties = ['easy', 'medium', 'hard', 'expert'];
  const diffColors = {
    easy: 'from-emerald-400 to-teal-500',
    medium: 'from-sky-400 to-blue-500',
    hard: 'from-orange-400 to-red-500',
    expert: 'from-purple-500 to-pink-600',
  };

  return (
    <>
      {isWon && <Confetti />}

      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />

        {/* Bottom sheet */}
        <div className="relative w-full max-w-md slide-up">
          <div className={`
            rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl
            ${isWon
              ? 'bg-gradient-to-b from-sky-50 to-white'
              : 'bg-gradient-to-b from-rose-50 to-white'
            }
          `}>
            {/* Decorative top bar */}
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-6" />

            {/* Header */}
            <div className="text-center mb-6">
              {isWon ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-200 mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Brilliant!</h2>
                  <p className="text-sm text-gray-400 mt-1">You crushed it!</p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200 mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">No more lives!</h2>
                  <p className="text-sm text-gray-400 mt-1">Better luck next time</p>
                </>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-around bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
              <StatItem value={formatTime(elapsedSeconds)} label="Time" color="text-sky-500" />
              <div className="w-px h-8 bg-gray-100" />
              <StatItem value={stats.mistakesMade} label="Mistakes" color="text-rose-500" />
              <div className="w-px h-8 bg-gray-100" />
              <StatItem value={stats.hintsUsed} label="Hints" color="text-amber-500" />
              <div className="w-px h-8 bg-gray-100" />
              <StatItem value={stats.movementsTotal} label="Moves" color="text-violet-500" />
            </div>

            {/* Difficulty picker for new game */}
            <div className="flex gap-2 mb-4">
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer
                    ${(selectedDifficulty || difficulty) === d
                      ? `bg-gradient-to-r ${diffColors[d]} text-white shadow-sm`
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }
                  `}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Play again button */}
            <button
              onClick={() => newGame(selectedDifficulty || difficulty)}
              className={`
                w-full py-4 rounded-2xl text-white font-bold text-base
                bg-gradient-to-r ${diffColors[selectedDifficulty || difficulty]}
                shadow-lg hover:shadow-xl hover:-translate-y-0.5
                transition-all cursor-pointer active:scale-[0.98]
              `}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
