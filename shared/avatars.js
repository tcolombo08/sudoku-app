/**
 * Avatar manifest for Sudoku App
 * Avatars are PNGs stored in Firebase Storage under avatars/{id}.png
 * Zero dependencies (shared/ rules)
 */

export const AVATARS = [
  { id: 'star', label: 'Star' },
  { id: 'fire', label: 'Fire' },
  { id: 'lightning', label: 'Lightning' },
  { id: 'heart', label: 'Heart' },
  { id: 'crown', label: 'Crown' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'rocket', label: 'Rocket' },
  { id: 'moon', label: 'Moon' },
  { id: 'sun', label: 'Sun' },
  { id: 'cat', label: 'Cat' },
  { id: 'fox', label: 'Fox' },
  { id: 'panda', label: 'Panda' },
];

export const DEFAULT_AVATAR_ID = 'star';

/**
 * Build the public Firebase Storage URL for an avatar
 * @param {string} avatarId - One of the AVATARS ids
 * @param {string} storageBucket - Firebase Storage bucket (e.g. 'my-app.appspot.com')
 * @returns {string} Public URL
 */
export function getAvatarUrl(avatarId, storageBucket) {
  const id = avatarId || DEFAULT_AVATAR_ID;
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/avatars%2F${id}.png?alt=media`;
}
