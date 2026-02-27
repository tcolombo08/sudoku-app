import { useState, useEffect } from 'react';
import useFirebase from '../hooks/useFirebase.js';

function formatTime(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LeaderboardView() {
  const { getLeaderboard, isInitialized } = useFirebase();
  const [difficulty, setDifficulty] = useState('medium');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    setLoading(true);
    getLeaderboard(difficulty).then(result => {
      setData(result);
      setLoading(false);
    });
  }, [difficulty, isInitialized, getLeaderboard]);

  const difficulties = ['easy', 'medium', 'hard', 'expert'];

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Leaderboard</h2>

      {/* Difficulty tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {difficulties.map(d => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`
              flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer capitalize
              ${d === difficulty ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {d}
          </button>
        ))}
      </div>

      {!isInitialized ? (
        <p className="text-center text-gray-400 text-sm py-8">
          Firebase not configured. Leaderboard unavailable.
        </p>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.top10?.length > 0 ? (
        <div className="space-y-2">
          {data.top10.map((entry, i) => (
            <div
              key={i}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                ${i === 0 ? 'bg-amber-50 border border-amber-200' :
                  i === 1 ? 'bg-gray-50 border border-gray-200' :
                  i === 2 ? 'bg-orange-50 border border-orange-200' :
                  'bg-white border border-gray-100'}
              `}
            >
              <span className="w-6 text-center font-bold text-gray-400 text-sm">
                {i + 1}
              </span>
              <span className="flex-1 font-medium text-gray-900 text-sm truncate">
                {entry.nickname || 'Anonymous'}
              </span>
              <span className="font-mono text-sm text-gray-600">
                {formatTime(entry.time)}
              </span>
            </div>
          ))}

          {data.userRank && data.userRank > 10 && (
            <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
                <span className="w-6 text-center font-bold text-primary text-sm">
                  {data.userRank}
                </span>
                <span className="flex-1 font-medium text-gray-900 text-sm">
                  You
                </span>
                <span className="font-mono text-sm text-gray-600">
                  {formatTime(data.userEntry?.time)}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm py-8">
          No entries yet. Be the first!
        </p>
      )}
    </div>
  );
}
