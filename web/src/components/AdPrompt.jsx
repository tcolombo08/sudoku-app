import { useState } from 'react';
import useGameStore from '../store/gameStore.js';

export default function AdPrompt() {
  const showAdPrompt = useGameStore(s => s.showAdPrompt);
  const onAdWatched = useGameStore(s => s.onAdWatched);
  const dismissAdPrompt = useGameStore(s => s.dismissAdPrompt);
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!showAdPrompt) return null;

  const label = showAdPrompt === 'hint' ? 'Hint' : 'Extra Life';

  const handleWatch = () => {
    setWatching(true);
    setProgress(0);

    // Simulate a 5-second ad
    const duration = 5000;
    const step = 50;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += step;
      setProgress(Math.min((elapsed / duration) * 100, 100));

      if (elapsed >= duration) {
        clearInterval(interval);
        setWatching(false);
        setProgress(0);
        onAdWatched(showAdPrompt);
      }
    }, step);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={watching ? undefined : dismissAdPrompt} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 text-center">
        {watching ? (
          <>
            {/* Ad simulation */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-4">Watching ad...</p>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">{Math.ceil((100 - progress) / 20)}s remaining</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
              {showAdPrompt === 'hint' ? (
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Need a {label}?</h3>
            <p className="text-xs text-gray-400 mb-5">Watch a short ad to unlock</p>

            <button
              onClick={handleWatch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-md shadow-amber-200 hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
            >
              Watch Ad (5s)
            </button>

            <button
              onClick={dismissAdPrompt}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              No thanks
            </button>
          </>
        )}
      </div>
    </div>
  );
}
