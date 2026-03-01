import { useState } from 'react';
import { AVATARS, getAvatarUrl } from '@shared/avatars.js';

const AVATAR_COLORS = [
  '#38bdf8', '#34d399', '#a78bfa', '#f472b6',
  '#fbbf24', '#60a5fa', '#a3e635', '#e879f9',
  '#fb923c', '#f87171', '#14b8a6', '#6366f1',
];

function AvatarImage({ avatarId, label, storageBucket, size = 48 }) {
  const [error, setError] = useState(false);
  const colorIndex = AVATARS.findIndex(a => a.id === avatarId);
  const bgColor = AVATAR_COLORS[colorIndex >= 0 ? colorIndex : 0];

  if (error || !storageBucket) {
    return (
      <div
        className="rounded-full flex items-center justify-center text-white font-bold"
        style={{ width: size, height: size, backgroundColor: bgColor, fontSize: size * 0.4 }}
      >
        {label.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={getAvatarUrl(avatarId, storageBucket)}
      alt={label}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}

export { AvatarImage };

export default function AvatarSelector({ isOpen, onClose, currentAvatarId, onSelect, storageBucket }) {
  const [selected, setSelected] = useState(currentAvatarId);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (selected === currentAvatarId) {
      onClose();
      return;
    }
    setSaving(true);
    await onSelect(selected);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 text-center mb-4">Choose Avatar</h2>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {AVATARS.map(avatar => (
            <button
              key={avatar.id}
              onClick={() => setSelected(avatar.id)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-all
                ${selected === avatar.id
                  ? 'bg-sky-50 ring-2 ring-primary'
                  : 'bg-gray-50 hover:bg-gray-100'}
              `}
            >
              <AvatarImage avatarId={avatar.id} label={avatar.label} storageBucket={storageBucket} />
              <span className="text-[10px] text-gray-500 font-medium">{avatar.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-400 to-blue-600 hover:shadow-lg cursor-pointer transition-all disabled:opacity-50"
          >
            {saving ? '...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
