# 📚 Firebase Service API

## Inicialización

```javascript
import FirebaseService from './firebase.js';
import firebaseConfig from './firebase.config.js';

const firebase = new FirebaseService(firebaseConfig);
await firebase.initialize();
```

---

## API Reference

### Autenticación

#### `initialize()`
Inicializa Firebase (llamar una sola vez).

```javascript
const success = await firebase.initialize();
// Returns: boolean
```

#### `getAuthState()`
Obtiene el estado actual de autenticación.

```javascript
const state = firebase.getAuthState();
// Returns: {
//   isAuthenticated: boolean,
//   userId: string,
//   nickname: string
// }
```

---

### Perfil de Usuario

#### `createUserProfile(nickname)`
Crea perfil con nickname aleatorio.

```javascript
const success = await firebase.createUserProfile('MyPlayer');
// Returns: boolean
```

#### `getUserProfile()`
Obtiene el perfil actual del usuario.

```javascript
const profile = await firebase.getUserProfile();
// Returns: {
//   profile: {
//     nickname: string,
//     createdAt: Timestamp,
//     updatedAt: Timestamp
//   },
//   stats: {
//     gamesWon: number,
//     totalGames: number,
//     bestTimes: {
//       easy: number | null,
//       medium: number | null,
//       hard: number | null,
//       expert: number | null
//     },
//     totalErrors: number,
//     totalHints: number
//   }
// }
```

#### `updateNickname(newNickname)`
Cambia el nickname del usuario.

```javascript
const result = await firebase.updateNickname('NewName');
// Returns: {
//   success: boolean,
//   message: string
// }
```

---

### Juegos en Progreso

#### `saveGameState(gameId, gameState)`
Guarda el estado actual del juego (se puede reanudar).

```javascript
const gameState = {
  mode: 'medium',           // dificultad
  board: [...],             // tablero actual
  notes: [...],             // anotaciones
  lives: 2,                 // vidas restantes
  elapsedSeconds: 342       // segundos jugados
};

const success = await firebase.saveGameState('game_123', gameState);
// Returns: boolean
```

**Nota:** Se guarda en Realtime Database para sync rápido.

#### `getGameState(gameId)`
Obtiene una partida en progreso para reanudar.

```javascript
const state = await firebase.getGameState('game_123');
// Returns: {
//   userId: string,
//   difficulty: string,
//   board: number[][],
//   notes: number[][][],
//   lives: number,
//   elapsedSeconds: number,
//   createdAt: number,
//   updatedAt: number
// } | null
```

#### `deleteGameState(gameId)`
Elimina una partida en progreso.

```javascript
const success = await firebase.deleteGameState('game_123');
// Returns: boolean
```

---

### Resultados de Juegos

#### `saveGameResult(result)`
Guarda el resultado final de un juego completado.

```javascript
const result = {
  gameId: 'game_123',       // ID único de la partida
  difficulty: 'medium',     // easy, medium, hard, expert
  won: true,                // ¿ganó?
  time: 245,                // segundos
  mistakes: 1,              // errores cometidos
  hints: 0,                 // hints usados
  totalMoves: 81            // movimientos totales
};

const response = await firebase.saveGameResult(result);
// Returns: {
//   success: boolean,
//   gameId: string,
//   error?: string
// }
```

**Efectos secundarios:**
- Actualiza estadísticas del usuario
- Actualiza leaderboard si ganó
- Elimina partida en progreso

#### `getUserGames(limit = 10)`
Obtiene el historial de juegos del usuario.

```javascript
const games = await firebase.getUserGames(20);
// Returns: [
//   {
//     id: string,
//     userId: string,
//     difficulty: string,
//     won: boolean,
//     time: number,
//     mistakes: number,
//     hints: number,
//     totalMoves: number,
//     createdAt: Timestamp
//   },
//   ...
// ]
```

---

### Leaderboard

#### `getLeaderboard(difficulty)`
Obtiene top 10 + posición del usuario.

```javascript
const leaderboard = await firebase.getLeaderboard('medium');
// Returns: {
//   top10: [
//     {
//       rank: 1,
//       nickname: string,
//       userId: string,
//       bestTime: number,
//       gamesWon: number,
//       lastUpdated: Timestamp
//     },
//     ...
//   ],
//   userRank: number | null,
//   userEntry: {
//     nickname: string,
//     userId: string,
//     bestTime: number,
//     gamesWon: number,
//     lastUpdated: Timestamp
//   } | null,
//   difficulty: string
// }
```

#### `getLeaderboardEntry(difficulty)`
Obtiene solo la entrada del usuario en un leaderboard.

```javascript
const entry = await firebase.getLeaderboardEntry('hard');
// Returns: {
//   nickname: string,
//   userId: string,
//   bestTime: number,
//   gamesWon: number,
//   lastUpdated: Timestamp
// } | null
```

---

### Utilidades

#### `generateGameId()`
Genera un ID único para una partida.

```javascript
const gameId = firebase.generateGameId();
// Returns: string (ej: "game_1708876543_abc123def")
```

#### `initializeMock()`
Para testing sin credenciales reales.

```javascript
firebase.initializeMock();
// Simula autenticación, no usa Firebase real
```

#### `mockSaveResult(difficulty, won, time)`
Para testing, simula guardar un resultado.

```javascript
const result = await firebase.mockSaveResult('easy', true, 245);
// Returns: {
//   success: true,
//   message: string,
//   gameId: string,
//   data: { difficulty, won, time }
// }
```

---

## Flujo típico de uso

### 1. Iniciar app

```javascript
const firebase = new FirebaseService(firebaseConfig);
await firebase.initialize();

// El usuario ya está autenticado anónimamente
const state = firebase.getAuthState();
// { isAuthenticated: true, userId: "...", nickname: "Player_ABC" }
```

### 2. Generar nuevo juego

```javascript
import SudokuGenerator from './sudokuGenerator.js';
import GameLogic from './gameLogic.js';

const generator = new SudokuGenerator();
const gameData = generator.generate('medium');
const game = new GameLogic(gameData.puzzle, gameData.solution);

const gameId = firebase.generateGameId();
// Guarda estado inicial
await firebase.saveGameState(gameId, game.getState());
```

### 3. Jugar

```javascript
// Mientras juega, guardar cada movimiento
const result = game.placeNumber(0, 0, 5);

// Guardar en Firebase cada 10 segundos (para poder reanudar)
if (moveCount % 10 === 0) {
  await firebase.saveGameState(gameId, game.getState());
}
```

### 4. Victoria o derrota

```javascript
if (game.isWon) {
  // Guardar resultado final
  const result = await firebase.saveGameResult({
    gameId,
    difficulty: 'medium',
    won: true,
    time: game.elapsedSeconds,
    mistakes: game.stats.mistakesMade,
    hints: game.stats.hintsUsed,
    totalMoves: game.stats.movementsTotal
  });
  
  // Mostrar leaderboard
  const leaderboard = await firebase.getLeaderboard('medium');
}

if (game.lives === 0) {
  // Guardar como derrota (no actualiza leaderboard)
  await firebase.saveGameResult({
    gameId,
    difficulty: 'medium',
    won: false,
    time: game.elapsedSeconds,
    mistakes: game.stats.mistakesMade,
    hints: game.stats.hintsUsed,
    totalMoves: game.stats.movementsTotal
  });
}
```

### 5. Reanudar partida

```javascript
const savedState = await firebase.getGameState(gameId);

if (savedState) {
  // Reconstruir juego desde estado guardado
  const game = new GameLogic(puzzle, solution);
  game.board = savedState.board;
  game.notes = savedState.notes;
  game.lives = savedState.lives;
  game.elapsedSeconds = savedState.elapsedSeconds;
  // ... continuar jugando
}
```

### 6. Ver estadísticas

```javascript
const profile = await firebase.getUserProfile();
console.log('Juegos ganados:', profile.stats.gamesWon);
console.log('Mejor tiempo (medium):', profile.stats.bestTimes.medium);

const games = await firebase.getUserGames(10);
console.log('Últimos 10 juegos:', games);
```

---

## Error Handling

Todos los métodos pueden fallar. Ejemplo seguro:

```javascript
try {
  const result = await firebase.saveGameResult(gameResult);
  
  if (result.success) {
    console.log('Guardado correctamente');
  } else {
    console.error('Error:', result.error);
  }
} catch (error) {
  console.error('Error de Firebase:', error.message);
  // Mostrar mensaje al usuario
}
```

---

## Limits y consideraciones

| Recurso | Límite Gratis |
|---------|---|
| Firestore reads | 50,000/día |
| Firestore writes | 20,000/día |
| Firestore deletes | 20,000/día |
| Realtime DB | 10GB total |
| Auth (usuarios anónimos) | Sin límite |

**Tips para optimizar:**
- Guarda estado cada 10 segundos, no cada movimiento
- Usa Realtime DB para estado (sync rápido)
- Usa Firestore para resultados (queries)
- Cachea leaderboard en cliente

---

## Debugging

### Ver logs de Firebase

```javascript
// En navegador console:
firebase.getAuthState()
// Ver estado actual

// Firestore queries
// Firebase Console → Firestore → Ejecutar queries
```

### Simular offline mode (web)

```javascript
// En DevTools → Network → Offline
// La app debería guardar localmente y syncear cuando vuelva
```

---

**Última actualización:** 25/02/2026
