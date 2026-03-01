import { useState, useEffect } from 'react';
import useFirebase from '../hooks/useFirebase.js';
import AvatarSelector, { AvatarImage } from './AvatarSelector.jsx';
import { DEFAULT_AVATAR_ID } from '@shared/avatars.js';

function formatTime(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function GuestProfileView() {
  const { signOut } = useFirebase();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-5">
        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white text-2xl font-bold mb-3">
          G
        </div>
        <h2 className="text-xl font-bold text-gray-900">Guest</h2>
        <p className="text-sm text-gray-500 mt-1">Stats are not saved in guest mode</p>
      </div>

      <div className="space-y-3 mt-6">
        <p className="text-center text-sm text-gray-500">Create an account to save your progress and compete on leaderboards.</p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-50"
        >
          Sign Up / Login
        </button>
      </div>
    </div>
  );
}

export default function ProfileView() {
  const { profile, isInitialized, isAnonymous, firebaseAvailable, updateNickname, updateAvatar, getStorageBucket, getUserGames, signOut } = useFirebase();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [games, setGames] = useState([]);
  const [saving, setSaving] = useState(false);
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);

  const storageBucket = getStorageBucket();
  const currentAvatarId = profile?.profile?.avatarId || DEFAULT_AVATAR_ID;

  useEffect(() => {
    if (profile?.profile?.nickname) {
      setNickname(profile.profile.nickname);
    }
  }, [profile]);

  useEffect(() => {
    if (isInitialized && !isAnonymous) {
      getUserGames(10).then(setGames);
    }
  }, [isInitialized, isAnonymous, getUserGames]);

  if (!firebaseAvailable || !isInitialized || isAnonymous) {
    return <GuestProfileView />;
  }

  const handleSaveNickname = async () => {
    setSaving(true);
    await updateNickname(nickname);
    setSaving(false);
    setEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const stats = profile?.stats || {};

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Avatar + Nickname header */}
      <div className="flex flex-col items-center mb-5">
        <button
          onClick={() => setAvatarSelectorOpen(true)}
          className="relative group cursor-pointer mb-3"
        >
          <div className="ring-2 ring-gray-200 group-hover:ring-primary transition-all rounded-full">
            <AvatarImage
              avatarId={currentAvatarId}
              label={profile?.profile?.nickname || 'A'}
              storageBucket={storageBucket}
              size={64}
            />
          </div>
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] shadow">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </span>
        </button>

        {editing ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
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
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <h2 className="text-xl font-bold text-gray-900">
              {profile?.profile?.nickname || 'Anonymous'}
            </h2>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      <AvatarSelector
        isOpen={avatarSelectorOpen}
        onClose={() => setAvatarSelectorOpen(false)}
        currentAvatarId={currentAvatarId}
        onSelect={updateAvatar}
        storageBucket={storageBucket}
      />

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
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
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

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full py-2.5 text-gray-500 text-sm hover:text-danger transition-colors cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}
