# 🏗️ ARQUITECTURA TÉCNICA

---

## 📐 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO (React Web / RN Mobile)          │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Event: "Tap celda [0,0]"
         │ Payload: {row: 0, col: 0, num: 5}
         ↓
┌─────────────────────────────────────────────────────────────┐
│                      GameLogic (JavaScript)                  │
│                                                              │
│  placeNumber(0, 0, 5)                                       │
│    ├─ Validar coordenadas                                   │
│    ├─ Verificar no es celda original                        │
│    ├─ Si mode='annotation':                                 │
│    │   └─ toggleAnnotation() → notas[0][0] = [5]           │
│    ├─ Si mode='complete':                                   │
│    │   └─ placeAndValidate() → 5 == solución[0][0]?       │
│    │       ├─ Sí? ✓ board[0][0] = 5                        │
│    │       ├─ No? ✗ lives--                                 │
│    │       └─ isSolved()? → endGame()                       │
│    └─ Guardar en historial                                  │
│                                                              │
│  Returns: {                                                  │
│    success: true,                                            │
│    isCorrect: true,                                          │
│    isWon: false,                                             │
│    livesRemaining: 3                                         │
│  }                                                            │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Response
         ↓
┌─────────────────────────────────────────────────────────────┐
│              Firebase (Firestore + Realtime DB)             │
│                                                              │
│  gameLogic.getState() → serializa estado                    │
│  {                                                           │
│    board, notes, lives, time, stats                         │
│  }                                                           │
│                                                              │
│  firebase.saveGameState(gameId, state)                      │
│    └─ db.collection('games').doc(gameId).update(state)     │
│                                                              │
│  Cuando gana:                                                │
│  firebase.saveResult(userId, result)                        │
│    └─ Actualiza leaderboard en tiempo real                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes

### 1. SudokuGenerator (Generación)

```javascript
class SudokuGenerator
  ├─ generateFullBoard()        → tablero 9x9 válido lleno
  │  ├─ fillSubgrid()           → llena diagonales
  │  └─ solveBoard()            → backtracking recursivo
  ├─ generate(difficulty)       → puzzle + solution
  │  └─ remover números según dificultad
  ├─ isValid(row, col, num)    → validar número en posición
  │  ├─ validar fila
  │  ├─ validar columna
  │  └─ validar subgrid 3x3
  └─ shuffle()                 → Fisher-Yates aleatorio
```

**Entrada:** `'easy'` | `'medium'` | `'hard'` | `'expert'`  
**Salida:** `{puzzle: 2D[], solution: 2D[], difficulty: string}`

---

### 2. GameLogic (Juego en vivo)

```javascript
class GameLogic
  ├─ Constructor(puzzle, solution)
  │  └─ Inicializa board, notes, lives=3, timer
  │
  ├─ placeNumber(row, col, num)
  │  ├─ [Validation]
  │  ├─ [History save]
  │  ├─ Si mode='annotation' → toggleAnnotation()
  │  └─ Si mode='complete' → placeAndValidate()
  │
  ├─ placeAndValidate()        → valida contra solución
  │  ├─ Si correcto: board[r][c] = num
  │  ├─ Si incorrecto: lives--
  │  └─ isSolved()? → endGame()
  │
  ├─ isSolved()                → ¿sudoku completo?
  │  ├─ Todas las celdas llenas?
  │  └─ ¿Coincide con solución?
  │
  ├─ updateTimer()             → HH:MM:SS
  ├─ getHint(row, col)        → solución[r][c]
  ├─ undo() / redo()          → navegación historial
  ├─ hasConflict()            → números duplicados?
  └─ getState() / getResult() → serializar para persistencia
```

**Estados:**
- `mode: 'annotation'` (borrador, sin validación)
- `mode: 'complete'` (validación en cada número)

**Salidas:**
```javascript
{
  success: true,
  isCorrect: true,     // null si mode=annotation
  isWon: false,        // true si completó puzzle
  isGameOver: false,   // true si 0 vidas
  livesRemaining: 3,
  message: "string"
}
```

---

### 3. Firebase (Backend)

```javascript
class FirebaseService
  ├─ initAuth()
  │  └─ signInAnonymously() → userId
  │
  ├─ createUser(nickname)
  │  └─ users/{userId}/profile = {nickname, createdAt}
  │
  ├─ saveGameState(gameId, state)
  │  └─ games/{gameId} = {userId, difficulty, board, notes, ...}
  │
  ├─ saveGameResult(result)
  │  ├─ games/{gameId} = {won, time, mistakes, hints}
  │  └─ updateLeaderboard(userId, difficulty, time)
  │
  ├─ getLeaderboard(difficulty, limit=10)
  │  └─ Retorna top 10 + usuario si está fuera
  │
  ├─ getUserProfile()
  │  └─ nickname, stats, bestTimes por dificultad
  │
  └─ updateNickname(newNickname)
     └─ users/{userId}/profile/nickname
```

**Firestore Schema:**
```
users/
  {userId}/
    profile/
      nickname: string
      createdAt: Timestamp
      updatedAt: Timestamp
    stats/
      gamesWon: number
      totalGames: number
      bestTimes: {
        easy: number,
        medium: number,
        hard: number,
        expert: number
      }

games/
  {gameId}/
    userId: string
    difficulty: string
    createdAt: Timestamp
    result: {
      won: boolean,
      time: number,
      mistakes: number,
      hints: number
    }
    state?: {  // Partida en progreso
      board: number[][],
      notes: number[][][],
      lives: number,
      elapsedSeconds: number
    }

leaderboards/
  {difficulty}/
    {userId}/
      nickname: string
      bestTime: number
      gamesWon: number
      lastUpdated: Timestamp
```

---

## 🔄 Flujos Principales

### Flujo 1: Iniciar nuevo juego

```
1. UI: Usuario toca "Nuevo Juego" + selecciona dificultad
   ↓
2. SudokuGenerator.generate(difficulty)
   └─ Retorna: {puzzle, solution}
   ↓
3. GameLogic(puzzle, solution)
   └─ Inicializa juego
   ↓
4. Firebase.saveGameState(gameId, initialState)
   └─ Guarda estado inicial
   ↓
5. UI: Renderiza board + numberPad
```

### Flujo 2: Jugar (Completar modo)

```
1. Usuario: Toca celda [0,0], toca "5"
   ↓
2. GameLogic.setMode('complete')
   GameLogic.placeNumber(0, 0, 5)
   ↓
3. Validación:
   a) ¿5 == solución[0][0]? 
   b) Si SÍ:
      - board[0][0] = 5
      - Retorna {isCorrect: true}
   c) Si NO:
      - lives--
      - Retorna {isCorrect: false, livesRemaining: 2}
   ↓
4. UI: Visualiza número (verde/rojo)
   ↓
5. ¿isSolved()? 
   a) No → volver a paso 1
   b) Sí → Flujo 3 (Victoria)
```

### Flujo 3: Victoria

```
1. GameLogic.isSolved() = true
   ↓
2. GameLogic.endGame(true)
   └─ elapsedSeconds = final
   ↓
3. GameLogic.getResult()
   {won: true, time: 245, mistakes: 2, hints: 0}
   ↓
4. Firebase.saveGameResult(result)
   ├─ Crea documento en games/
   └─ Actualiza leaderboard
   ↓
5. UI: Muestra panel de victoria
   ├─ Tiempo: 4:05
   ├─ Errores: 2
   ├─ Ad corto (5s)
   └─ Botón "Siguiente juego"
```

### Flujo 4: Game Over (0 vidas)

```
1. lives = 1, usuario comete error
   ↓
2. GameLogic.placeNumber() → lives--
   ↓
3. lives = 0 → GameLogic.endGame(false)
   ↓
4. GameLogic.getResult()
   {won: false, ...}
   ↓
5. Firebase.saveGameResult(result)
   ├─ Marca como pérdida
   └─ NO actualiza leaderboard
   ↓
6. UI: Muestra panel de derrota
   ├─ "Game Over"
   ├─ Botón "Ver solución"
   ├─ Ad largo (30s) → +1 vida?
   └─ Botón "Reintentar"
```

---

## 💾 Persistencia

### Estado en progreso
Se guarda **cada movimiento** en Firebase Realtime DB para reanudar:

```javascript
gameState = {
  gameId: "game_123",
  userId: "user_456",
  board: [...],      // números colocados
  notes: [...],      // anotaciones
  lives: 2,
  elapsedSeconds: 342,
  difficulty: "medium",
  createdAt: timestamp
}

firebase.saveGameState(gameId, gameState)
// Sobre-escribe en Realtime DB (rápido, eventual consistent)
```

### Resultado final
Se guarda **una sola vez** cuando termina:

```javascript
gameResult = {
  gameId: "game_123",
  userId: "user_456",
  difficulty: "medium",
  won: true,
  time: 382,
  mistakes: 1,
  hints: 0,
  createdAt: timestamp
}

firebase.saveGameResult(gameResult)
// Escribe en Firestore (persistencia, para analytics)
```

---

## 📱 Adaptación a Plataformas

### Web (React)
```javascript
import GameLogic from '../shared/gameLogic.js'
import SudokuGenerator from '../shared/sudokuGenerator.js'

// Uso directo en React
const [gameState, setGameState] = useState(...)
const game = useRef(new GameLogic(puzzle, solution))

const handleCellClick = (row, col, num) => {
  const result = game.current.placeNumber(row, col, num)
  setGameState(game.current.getState())
}
```

### Mobile (React Native)
```javascript
import { GameLogic } from '../shared/gameLogic.js'
import Sound from 'react-native-sound'
import { Vibration } from 'react-native'

const handleCellClick = (row, col, num) => {
  const result = game.current.placeNumber(row, col, num)
  
  if (result.isCorrect === true) {
    Sound.play('click.mp3')
  } else if (result.isCorrect === false) {
    Sound.play('buzz.mp3')
    Vibration.vibrate([0, 100]) // 100ms vibration
  }
}
```

---

## 🎯 Decisiones de Diseño

| Decision | Razón |
|----------|-------|
| **GameLogic = JS puro** | Reutilizable en web + mobile sin cambios |
| **Separar lógica de UI** | Facilita testing y debugging |
| **Historial de estados** | Permite undo/redo sin complejidad |
| **Validación incremental** | No recalcula toda la solución |
| **Firebase Realtime** | Mejor para juegos (sync rápido) |
| **Firestore para resultados** | Mejor para analytics (queries) |
| **Anonymous auth** | Frictionless UX (no requiere email) |

---

## 🚀 Performance

| Operación | Tiempo |
|-----------|--------|
| Generar Sudoku | ~100-200ms |
| placeNumber() | < 1ms |
| isSolved() | < 5ms |
| hasConflict() | < 1ms |
| Guardar en Firebase | ~100ms |
| Leaderboard query | ~50-200ms |

**Memory:**
- GameLogic instance: ~50KB
- Board storage: ~1KB
- Historial (100 states): ~100KB

---

## 🔐 Security

**Firestore Rules:**
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

match /games/{gameId} {
  allow create, update: if request.auth.uid == resource.data.userId;
  allow read: if request.auth.uid == resource.data.userId;
}

match /leaderboards/{difficulty}/{userId} {
  allow read: if true;  // públicos
  allow write: if false; // solo server-side updates
}
```

---

**Última actualización:** 25/02/2026
