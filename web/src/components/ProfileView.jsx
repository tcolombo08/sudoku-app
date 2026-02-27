import { useState, useEffect } from 'react';
import useFirebase from '../hooks/useFirebase.js';

function formatTime(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ProfileView() {
  const { profile, isInitialized, updateNickname, getUserGames } = useFirebase();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [games, setGames] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.profile?.nickname) {
      setNickname(profile.profile.nickname);
    }
  }, [profile]);

  useEffect(() => {
    if (isInitialized) {
      getUserGames(10).then(setGames);
    }
  }, [isInitialized, getUserGames]);

  const handleSaveNickname = async () => {
    setSaving(true);
    await updateNickname(nickname);
    setSaving(false);
    setEditing(false);
  };

  if (!isInitialized) {
    return (
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
        <p className="text-center text-gray-400 text-sm py-8">
          Firebase not configured. Profile unavailable.
        </p>
      </div>
    );
  }

  const stats = profile?.stats || {};

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>

      {/* Nickname */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          {editing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                autoFocus
              />
              <button
                onClick={handleSaveNickname}
                disabled={saving || nickname.length < 2}
                className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-light disabled:opacity-50 cursor-pointer"
              >
                {saving ? '...' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div>
                <div className="text-sm text-gray-500">Nickname</div>
                <div className="font-semibold text-gray-900">
                  {profile?.profile?.nickname || 'Anonymous'}
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-primary hover:text-primary-light cursor-pointer"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.gamesWon || 0}</div>
          <div className="text-xs text-gray-500">Games Won</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalGames || 0}</div>
          <div className="text-xs text-gray-500">Total Games</div>
        </div>
      </div>

      {/* Best times */}
      {stats.bestTimes && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Best Times</h3>
          <div className="grid grid-cols-2 gap-2">
            {['easy', 'medium', 'hard', 'expert'].map(d => (
              <div key={d} className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500 capitalize">{d}</span>
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {formatTime(stats.bestTimes[d])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game history */}
      {games.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Games</h3>
          <div className="space-y-2">
            {games.map((g, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${g.won ? 'bg-success' : 'bg-danger'}`} />
                  <span className="text-sm text-gray-700 capitalize">{g.difficulty}</span>
                </div>
                <span className="font-mono text-xs text-gray-500">{formatTime(g.time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
