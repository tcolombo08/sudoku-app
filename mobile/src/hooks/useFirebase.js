import { useState, useCallback, useEffect } from 'react';

// Module-level shared state
let firebaseService = null;
let firebaseAvailable = false;
let sharedAuthState = null;
let sharedProfile = null;
let sharedIsLoading = true;
let initPromise = null;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

function setSharedAuth(state, profile = undefined) {
  sharedAuthState = state;
  if (profile !== undefined) sharedProfile = profile;
  notifyListeners();
}

// Single initialization - returns a promise all callers can await
function doInitialize() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { firebaseConfig } = await import('../../firebase.config.js');
      if (!firebaseConfig) {
        console.warn('Firebase not configured.');
        return null;
      }

      const { default: FirebaseService } = await import('@shared/firebase.js');

      firebaseService = new FirebaseService(firebaseConfig);
      await firebaseService.initialize();
      firebaseAvailable = true;

      if (firebaseService.userId) {
        sharedAuthState = firebaseService.getAuthState();
        if (!firebaseService.isAnonymous) {
          sharedProfile = await firebaseService.getUserProfile();
        }
      }

      return firebaseService;
    } catch (err) {
      console.warn('Firebase initialization skipped:', err.message);
      firebaseAvailable = false;
      return null;
    } finally {
      sharedIsLoading = false;
      notifyListeners();
    }
  })();

  return initPromise;
}

async function getService() {
  if (firebaseService) return firebaseService;
  return await doInitialize();
}

export default function useFirebase() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  useEffect(() => {
    doInitialize();
  }, []);

  const signUp = useCallback(async (email, password, nickname) => {
    const svc = await getService();
    if (!svc) return { success: false, message: 'Firebase not configured' };
    try {
      const result = await svc.signUpWithEmail(email, password, nickname);
      if (result.success) {
        const prof = await svc.getUserProfile();
        setSharedAuth(svc.getAuthState(), prof);
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    const svc = await getService();
    if (!svc) return { success: false, message: 'Firebase not configured' };
    try {
      const result = await svc.signInWithEmail(email, password);
      if (result.success) {
        const prof = await svc.getUserProfile();
        setSharedAuth(svc.getAuthState(), prof);
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const signInAnonymous = useCallback(async () => {
    const svc = await getService();
    if (!svc) return { success: false, message: 'Firebase not configured' };
    try {
      const result = await svc.signInAsAnonymous();
      if (result.success) {
        setSharedAuth(svc.getAuthState(), null);
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const svc = await getService();
    if (!svc) return { success: false, message: 'Firebase not configured' };
    try {
      const result = await svc.signInWithGoogle();
      if (result.success) {
        const prof = await svc.getUserProfile();
        setSharedAuth(svc.getAuthState(), prof);
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const signOutUser = useCallback(async () => {
    const svc = await getService();
    if (!svc) return { success: false };
    try {
      const result = await svc.signOut();
      if (result.success) {
        setSharedAuth(null, null);
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const saveGameState = useCallback(async (gameId, gameState) => {
    if (!firebaseService || firebaseService.isAnonymous) return false;
    try {
      return await firebaseService.saveGameState(gameId, gameState);
    } catch (err) {
      console.error('Failed to save game state:', err);
      return false;
    }
  }, []);

  const saveGameResult = useCallback(async (result) => {
    if (!firebaseService || firebaseService.isAnonymous) return null;
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
      setSharedAuth(sharedAuthState, p);
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

  const updateAvatar = useCallback(async (avatarId) => {
    if (!firebaseService) return null;
    try {
      const result = await firebaseService.updateAvatar(avatarId);
      if (result.success) {
        await getUserProfile();
      }
      return result;
    } catch (err) {
      console.error('Failed to update avatar:', err);
      return null;
    }
  }, [getUserProfile]);

  const getStorageBucket = useCallback(() => {
    return firebaseService?.config?.storageBucket || null;
  }, []);

  return {
    isInitialized: !!firebaseService,
    isLoading: sharedIsLoading,
    firebaseAvailable,
    authState: sharedAuthState,
    isAnonymous: sharedAuthState?.isAnonymous || false,
    profile: sharedProfile,
    signUp,
    signIn,
    signInAnonymous,
    signInWithGoogle,
    signOut: signOutUser,
    saveGameState,
    saveGameResult,
    getLeaderboard,
    getUserProfile,
    updateNickname,
    updateAvatar,
    getStorageBucket,
    getUserGames,
  };
}
