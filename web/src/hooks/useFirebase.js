import { useState, useCallback, useRef, useEffect } from 'react';

let firebaseService = null;

export default function useFirebase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const initAttempted = useRef(false);

  // Initialize Firebase lazily
  const initialize = useCallback(async () => {
    if (firebaseService || initAttempted.current) return firebaseService;
    initAttempted.current = true;

    try {
      setIsLoading(true);
      // Dynamic imports to avoid breaking if firebase.config.js doesn't exist
      const { firebaseConfig } = await import('../../firebase.config.js');
      if (!firebaseConfig) {
        console.warn('Firebase not configured. Firebase features disabled.');
        return null;
      }

      const { default: FirebaseService } = await import(/* @vite-ignore */ '@shared/firebase.js');

      firebaseService = new FirebaseService(firebaseConfig);
      await firebaseService.initialize();
      setIsInitialized(true);
      setAuthState(firebaseService.getAuthState());

      const userProfile = await firebaseService.getUserProfile();
      setProfile(userProfile);
    } catch (err) {
      console.warn('Firebase initialization skipped:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }

    return firebaseService;
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const saveGameState = useCallback(async (gameId, gameState) => {
    if (!firebaseService) return false;
    try {
      return await firebaseService.saveGameState(gameId, gameState);
    } catch (err) {
      console.error('Failed to save game state:', err);
      return false;
    }
  }, []);

  const saveGameResult = useCallback(async (result) => {
    if (!firebaseService) return null;
    try {
      return await firebaseService.saveGameResult(result);
    } catch (err) {
      console.error('Failed to save game result:', err);
      return null;
    }
  }, []);

  const getLeaderboard = useCallback(async (difficulty) => {
    if (!firebaseService) return null;
    try {
      return await firebaseService.getLeaderboard(difficulty);
    } catch (err) {
      console.error('Failed to get leaderboard:', err);
      return null;
    }
  }, []);

  const getUserProfile = useCallback(async () => {
    if (!firebaseService) return null;
    try {
      const p = await firebaseService.getUserProfile();
      setProfile(p);
      return p;
    } catch (err) {
      console.error('Failed to get profile:', err);
      return null;
    }
  }, []);

  const updateNickname = useCallback(async (nickname) => {
    if (!firebaseService) return null;
    try {
      const result = await firebaseService.updateNickname(nickname);
      if (result.success) {
        await getUserProfile();
      }
      return result;
    } catch (err) {
      console.error('Failed to update nickname:', err);
      return null;
    }
  }, [getUserProfile]);

  const getUserGames = useCallback(async (limit = 10) => {
    if (!firebaseService) return [];
    try {
      return await firebaseService.getUserGames(limit);
    } catch (err) {
      console.error('Failed to get user games:', err);
      return [];
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    authState,
    profile,
    error,
    saveGameState,
    saveGameResult,
    getLeaderboard,
    getUserProfile,
    updateNickname,
    getUserGames,
  };
}
