/**
 * Firebase Service para Sudoku App
 * Maneja: Auth, persistencia de juegos, leaderboards, perfil de usuario
 *
 * Inicialización requerida en main app:
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
   * Inicializar Firebase
   * Debe ser llamado una vez al cargar la app
   */
  async initialize() {
    try {
      // Importar dinámicamente en Node.js o navegador
      if (typeof window !== 'undefined') {
        // Navegador
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

        // Autenticación automática
        await this.setupAuth();
        return true;
      } else {
        // Node.js (para testing)
        console.warn('Firebase initialization en Node.js - usando mock');
        return this.initializeMock();
      }
    } catch (error) {
      console.error('Error inicializando Firebase:', error);
      return false;
    }
  }

  /**
   * Setup de autenticación anónima
   */
  async setupAuth() {
    return new Promise((resolve) => {
      if (!this.auth) {
        resolve(false);
        return;
      }

      // Detectar cambios de auth
      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          this.userId = user.uid;
          await this.ensureUserProfile();
          resolve(true);
        } else {
          // Iniciar sesión anónima
          const { signInAnonymously } = require('firebase/auth');
          try {
            const result = await signInAnonymously(this.auth);
            this.userId = result.user.uid;
            await this.ensureUserProfile();
            resolve(true);
          } catch (error) {
            console.error('Error en auth:', error);
            resolve(false);
          }
        }
      });
    });
  }

  /**
   * Asegurar que el usuario tiene un perfil
   */
  async ensureUserProfile() {
    try {
      const profile = await this.getUserProfile();
      if (!profile) {
        const randomNickname = `Player_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        await this.createUserProfile(randomNickname);
      }
    } catch (error) {
      console.error('Error en ensureUserProfile:', error);
    }
  }

  /**
   * AUTENTICACIÓN: Crear perfil de usuario
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
      console.error('Error creando perfil:', error);
      return false;
    }
  }

  /**
   * USUARIO: Obtener perfil actual
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
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  /**
   * USUARIO: Cambiar nickname
   */
  async updateNickname(newNickname) {
    if (!this.userId) return false;

    // Validar nickname
    if (!newNickname || newNickname.length < 2 || newNickname.length > 20) {
      return { success: false, message: 'Nickname debe tener 2-20 caracteres' };
    }

    try {
      const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      await updateDoc(doc(this.db.firestore, 'users', this.userId), {
        'profile.nickname': newNickname,
        'profile.updatedAt': serverTimestamp()
      });

      this.nickname = newNickname;
      return { success: true, message: 'Nickname actualizado' };
    } catch (error) {
      console.error('Error actualizando nickname:', error);
      return { success: false, message: 'Error actualizando nickname' };
    }
  }

  /**
   * JUEGO: Guardar estado en progreso (Realtime DB para sync rápido)
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
      console.error('Error guardando estado:', error);
      return false;
    }
  }

  /**
   * JUEGO: Obtener partida en progreso
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
      console.error('Error obteniendo estado:', error);
      return null;
    }
  }

  /**
   * JUEGO: Guardar resultado final (Firestore para persistencia + analytics)
   */
  async saveGameResult(result) {
    if (!this.userId) return false;

    try {
      const { collection, addDoc, serverTimestamp, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      // Guardar en colección games
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

      // Actualizar estadísticas del usuario
      await this.updateUserStats(result);

      // Si ganó, actualizar leaderboard
      if (result.won) {
        await this.updateLeaderboard(result.difficulty, result.time);
      }

      // Eliminar partida en progreso
      await this.deleteGameState(result.gameId);

      return { success: true, gameId: gameRef.id };
    } catch (error) {
      console.error('Error guardando resultado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * USUARIO: Actualizar estadísticas después de juego
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

      // Actualizar mejor tiempo si ganó
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
      console.error('Error actualizando stats:', error);
      return false;
    }
  }

  /**
   * LEADERBOARD: Actualizar posición en leaderboard
   */
  async updateLeaderboard(difficulty, time) {
    if (!this.userId || !this.nickname) return false;

    try {
      const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      const leaderboardRef = doc(this.db.firestore, `leaderboards/${difficulty}`, this.userId);
      const profile = await this.getUserProfile();

      // Solo actualizar si es mejor tiempo o no existe
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
      console.error('Error actualizando leaderboard:', error);
      return false;
    }
  }

  /**
   * LEADERBOARD: Obtener entrada del usuario en leaderboard
   */
  async getLeaderboardEntry(difficulty) {
    if (!this.userId) return null;

    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      const entryRef = doc(this.db.firestore, `leaderboards/${difficulty}`, this.userId);
      const entrySnap = await getDoc(entryRef);

      return entrySnap.exists() ? entrySnap.data() : null;
    } catch (error) {
      console.error('Error obteniendo entrada leaderboard:', error);
      return null;
    }
  }

  /**
   * LEADERBOARD: Obtener top 10 + usuario
   * @param {string} difficulty - 'easy', 'medium', 'hard', 'expert'
   * @returns {object} { top10: [], userRank: number, userEntry: object }
   */
  async getLeaderboard(difficulty) {
    try {
      const { collection, query, orderBy, limit, getDocs, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      // Obtener top 10
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

      // Si el usuario no está en top 10, obtener su posición
      if (!userEntry && this.userId) {
        const userEntryRef = doc(this.db.firestore, `leaderboards/${difficulty}`, this.userId);
        const userEntrySnap = await getDoc(userEntryRef);

        if (userEntrySnap.exists()) {
          userEntry = userEntrySnap.data();

          // Calcular posición real (solo para referencia)
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
      console.error('Error obteniendo leaderboard:', error);
      return { top10: [], userRank: null, userEntry: null, difficulty };
    }
  }

  /**
   * HISTORIAL: Obtener juegos del usuario
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
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * JUEGO: Eliminar partida en progreso
   */
  async deleteGameState(gameId) {
    if (!this.userId) return false;

    try {
      const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');

      const gameRef = ref(this.db.realtime, `games_progress/${this.userId}/${gameId}`);
      await remove(gameRef);
      return true;
    } catch (error) {
      console.error('Error eliminando estado:', error);
      return false;
    }
  }

  /**
   * UTILITY: Generar ID de juego único
   */
  generateGameId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * UTILITY: Obtener estado actual
   */
  getAuthState() {
    return {
      isAuthenticated: !!this.userId,
      userId: this.userId,
      nickname: this.nickname
    };
  }

  /**
   * TESTING: Mock para Node.js
   */
  initializeMock() {
    this.userId = 'mock_user_' + Math.random().toString(36).substr(2, 9);
    this.nickname = 'Player_MOCK';
    console.log('⚠️  Mock mode - no real Firebase connection');
    return true;
  }

  /**
   * TESTING: Simular resultado de juego
   */
  async mockSaveResult(difficulty = 'easy', won = true, time = 245) {
    return {
      success: true,
      message: 'Mock: resultado guardado',
      gameId: this.generateGameId(),
      data: { difficulty, won, time }
    };
  }
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirebaseService;
}
