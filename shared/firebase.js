/**
 * Firebase Service for Sudoku App
 * Handles: Auth, game persistence, leaderboards, user profile
 *
 * Required initialization in main app:
 * const firebaseService = new FirebaseService(firebaseConfig);
 * await firebaseService.initialize();
 */

class FirebaseService {
  constructor(firebaseConfig) {
    this.config = firebaseConfig;
    this.db = null;
    this.auth = null;
    this.userId = null;
    this.nickname = null;
  }

  /**
   * Initialize Firebase
   * Must be called once when the app loads
   */
  async initialize() {
    try {
      // Dynamic import for Node.js or browser
      if (typeof window !== 'undefined') {
        // Browser
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { getAuth, signInAnonymously, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const { getDatabase } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');

        const app = initializeApp(this.config);
        this.auth = getAuth(app);
        this.db = {
          firestore: getFirestore(app),
          realtime: getDatabase(app)
        };

        // Automatic authentication
        await this.setupAuth();
        return true;
      } else {
        // Node.js (for testing)
        console.warn('Firebase initialization in Node.js - using mock');
        return this.initializeMock();
      }
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return false;
    }
  }

  /**
   * Anonymous authentication setup
   */
  async setupAuth() {
    return new Promise((resolve) => {
      if (!this.auth) {
        resolve(false);
        return;
      }

      // Listen for auth state changes
      const { onAuthStateChanged, signInAnonymously } = await import('firebase/auth');
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          this.userId = user.uid;
          await this.ensureUserProfile();
          resolve(true);
        } else {
          // Start anonymous session
          try {
            const result = await signInAnonymously(this.auth);
            this.userId = result.user.uid;
            await this.ensureUserProfile();
            resolve(true);
          } catch (error) {
            console.error('Auth error:', error);
            resolve(false);
          }
        }
      });
    });
  }

  /**
   * Ensure user has a profile
   */
  async ensureUserProfile() {
    try {
      const profile = await this.getUserProfile();
      if (!profile) {
        const randomNickname = `Player_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        await this.createUserProfile(randomNickname);
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  }

  /**
   * AUTH: Create user profile
   */
  async createUserProfile(nickname) {
    if (!this.userId) return false;

    try {
      const { setDoc, doc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      await setDoc(doc(this.db.firestore, 'users', this.userId), {
        profile: {
          nickname: nickname,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        stats: {
          gamesWon: 0,
          totalGames: 0,
          bestTimes: {
            easy: null,
            medium: null,
            hard: null,
            expert: null
          },
          totalErrors: 0,
          totalHints: 0
        }
      });

      this.nickname = nickname;
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      return false;
    }
  }

  /**
   * USER: Get current profile
   */
  async getUserProfile() {
    if (!this.userId) return null;

    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      const docRef = doc(this.db.firestore, 'users', this.userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.nickname = data.profile.nickname;
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * USER: Change nickname
   */
  async updateNickname(newNickname) {
    if (!this.userId) return false;

    // Validate nickname
    if (!newNickname || newNickname.length < 2 || newNickname.length > 20) {
      return { success: false, message: 'Nickname must be 2-20 characters' };
    }

    try {
      const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      await updateDoc(doc(this.db.firestore, 'users', this.userId), {
        'profile.nickname': newNickname,
        'profile.updatedAt': serverTimestamp()
      });

      this.nickname = newNickname;
      return { success: true, message: 'Nickname updated' };
    } catch (error) {
      console.error('Error updating nickname:', error);
      return { success: false, message: 'Error updating nickname' };
    }
  }

  /**
   * GAME: Save in-progress state (Realtime DB for fast sync)
   */
  async saveGameState(gameId, gameState) {
    if (!this.userId) return false;

    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');

      const gameRef = ref(this.db.realtime, `games_progress/${this.userId}/${gameId}`);
      await set(gameRef, {
        userId: this.userId,
        difficulty: gameState.mode,
        board: gameState.board,
        notes: gameState.notes,
        lives: gameState.lives,
        elapsedSeconds: gameState.elapsedSeconds,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Error saving state:', error);
      return false;
    }
  }

  /**
   * GAME: Get in-progress game
   */
  async getGameState(gameId) {
    if (!this.userId) return null;

    try {
      const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');

      const gameRef = ref(this.db.realtime, `games_progress/${this.userId}/${gameId}`);
      const snapshot = await get(gameRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error getting state:', error);
      return null;
    }
  }

  /**
   * GAME: Save final result (Firestore for persistence + analytics)
   */
  async saveGameResult(result) {
    if (!this.userId) return false;

    try {
      const { collection, addDoc, serverTimestamp, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      // Save to games collection
      const gameRef = await addDoc(collection(this.db.firestore, 'games'), {
        userId: this.userId,
        difficulty: result.difficulty,
        won: result.won,
        time: result.time,
        mistakes: result.mistakes,
        hints: result.hints,
        totalMoves: result.totalMoves,
        createdAt: serverTimestamp()
      });

      // Update user stats
      await this.updateUserStats(result);

      // If won, update leaderboard
      if (result.won) {
        await this.updateLeaderboard(result.difficulty, result.time);
      }

      // Delete in-progress game
      await this.deleteGameState(result.gameId);

      return { success: true, gameId: gameRef.id };
    } catch (error) {
      console.error('Error saving result:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * USER: Update stats after game
   */
  async updateUserStats(result) {
    if (!this.userId) return false;

    try {
      const { doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      const userRef = doc(this.db.firestore, 'users', this.userId);
      const updateData = {
        'stats.totalGames': arrayUnion(result.won ? 1 : 0)?.length || 0,
        'stats.totalErrors': result.mistakes,
        'stats.totalHints': result.hints
      };

      // Update best time if won
      if (result.won) {
        const profile = await this.getUserProfile();
        const currentBest = profile.stats.bestTimes[result.difficulty];

        if (!currentBest || result.time < currentBest) {
          updateData[`stats.bestTimes.${result.difficulty}`] = result.time;
        }

        updateData['stats.gamesWon'] = (profile.stats.gamesWon || 0) + 1;
      }

      await updateDoc(userRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating stats:', error);
      return false;
    }
  }

  /**
   * LEADERBOARD: Update leaderboard position
   */
  async updateLeaderboard(difficulty, time) {
    if (!this.userId || !this.nickname) return false;

    try {
      const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      const leaderboardRef = doc(this.db.firestore, `leaderboards/${difficulty}`, this.userId);
      const profile = await this.getUserProfile();

      // Only update if better time or no entry exists
      const currentEntry = await this.getLeaderboardEntry(difficulty);
      if (!currentEntry || time < currentEntry.bestTime) {
        await setDoc(leaderboardRef, {
          nickname: this.nickname,
          userId: this.userId,
          bestTime: time,
          gamesWon: (profile.stats.gamesWon || 0) + 1,
          lastUpdated: serverTimestamp()
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      return false;
    }
  }

  /**
   * LEADERBOARD: Get user's leaderboard entry
   */
  async getLeaderboardEntry(difficulty) {
    if (!this.userId) return null;

    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      const entryRef = doc(this.db.firestore, `leaderboards/${difficulty}`, this.userId);
      const entrySnap = await getDoc(entryRef);

      return entrySnap.exists() ? entrySnap.data() : null;
    } catch (error) {
      console.error('Error getting leaderboard entry:', error);
      return null;
    }
  }

  /**
   * LEADERBOARD: Get top 10 + user
   * @param {string} difficulty - 'easy', 'medium', 'hard', 'expert'
   * @returns {object} { top10: [], userRank: number, userEntry: object }
   */
  async getLeaderboard(difficulty) {
    try {
      const { collection, query, orderBy, limit, getDocs, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      // Get top 10
      const q = query(
        collection(this.db.firestore, `leaderboards/${difficulty}`),
        orderBy('bestTime', 'asc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const top10 = [];
      let userRank = null;
      let userEntry = null;

      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        top10.push({
          rank: index + 1,
          ...data
        });

        if (data.userId === this.userId) {
          userRank = index + 1;
          userEntry = data;
        }
      });

      // If user is not in top 10, get their position
      if (!userEntry && this.userId) {
        const userEntryRef = doc(this.db.firestore, `leaderboards/${difficulty}`, this.userId);
        const userEntrySnap = await getDoc(userEntryRef);

        if (userEntrySnap.exists()) {
          userEntry = userEntrySnap.data();

          // Calculate actual rank (for reference only)
          const allResults = await getDocs(
            query(
              collection(this.db.firestore, `leaderboards/${difficulty}`),
              orderBy('bestTime', 'asc')
            )
          );

          let rank = 0;
          allResults.forEach((doc) => {
            rank++;
            if (doc.id === this.userId) {
              userRank = rank;
            }
          });
        }
      }

      return {
        top10,
        userRank: userRank || null,
        userEntry: userEntry || null,
        difficulty
      };
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return { top10: [], userRank: null, userEntry: null, difficulty };
    }
  }

  /**
   * HISTORY: Get user's games
   */
  async getUserGames(limit = 10) {
    if (!this.userId) return [];

    try {
      const { collection, query, where, orderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      const q = query(
        collection(this.db.firestore, 'games'),
        where('userId', '==', this.userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const games = [];

      querySnapshot.forEach((doc, index) => {
        if (index < limit) {
          games.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });

      return games;
    } catch (error) {
      console.error('Error getting game history:', error);
      return [];
    }
  }

  /**
   * GAME: Delete in-progress game
   */
  async deleteGameState(gameId) {
    if (!this.userId) return false;

    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');

      const gameRef = ref(this.db.realtime, `games_progress/${this.userId}/${gameId}`);
      await remove(gameRef);
      return true;
    } catch (error) {
      console.error('Error deleting state:', error);
      return false;
    }
  }

  /**
   * UTILITY: Generate unique game ID
   */
  generateGameId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * UTILITY: Get current auth state
   */
  getAuthState() {
    return {
      isAuthenticated: !!this.userId,
      userId: this.userId,
      nickname: this.nickname
    };
  }

  /**
   * TESTING: Mock for Node.js
   */
  initializeMock() {
    this.userId = 'mock_user_' + Math.random().toString(36).substr(2, 9);
    this.nickname = 'Player_MOCK';
    console.log('Mock mode - no real Firebase connection');
    return true;
  }

  /**
   * TESTING: Simulate game result
   */
  async mockSaveResult(difficulty = 'easy', won = true, time = 245) {
    return {
      success: true,
      message: 'Mock: result saved',
      gameId: this.generateGameId(),
      data: { difficulty, won, time }
    };
  }
}

export default FirebaseService;
