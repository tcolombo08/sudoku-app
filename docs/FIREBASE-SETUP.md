# 🔥 Firebase Setup Guide

## Pasos rápidos (5 min)

### 1. Crear proyecto Firebase

1. Ve a [firebase.google.com](https://firebase.google.com)
2. Click en "Get Started" → "Create project"
3. Nombre: `sudoku-app` (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Click "Create project"

### 2. Configurar Autenticación

1. En Firebase Console → **Authentication**
2. Click en "Get started"
3. En "Sign-in method" → habilita **Anonymous**
4. Click "Enable" y "Save"

### 3. Crear Firestore Database

1. Firebase Console → **Firestore Database**
2. Click "Create database"
3. Ubicación: `us-central1` (o la más cercana)
4. Modo: **Start in test mode** (cambiar después)
5. Click "Create"

### 4. Crear Realtime Database

1. Firebase Console → **Realtime Database**
2. Click "Create database"
3. Ubicación: `us-central1`
4. Modo: **Start in test mode**
5. Click "Create"

### 5. Obtener credenciales

1. Firebase Console → Project Settings (rueda ⚙️ arriba a la izquierda)
2. Tab "General"
3. Busca "Your apps" 
4. Si no hay apps, click "Add app" → Web (</>)
5. Nombre: `sudoku-web`
6. Copia el objeto firebaseConfig

### 6. Configurar proyecto local

```bash
# En la raíz del proyecto
npm run setup

# Te pedirá los valores de Firebase
# O renombra y edita manualmente:
cp firebase.config.template.js firebase.config.js
```

---

## Firestore Rules (Seguridad)

Copia esto en **Firestore → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: solo lectura/escritura propia
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Juegos: solo propietario puede leer/escribir
    match /games/{gameId} {
      allow create: if request.auth.uid != null;
      allow read, update, delete: if request.auth.uid == resource.data.userId;
    }

    // Leaderboards: públicos para lectura
    match /leaderboards/{difficulty}/{userId} {
      allow read: if true;
      allow write: if false; // Solo backend
    }
  }
}
```

Click "Publish" cuando termines.

---

## Realtime Database Rules

Ve a **Realtime Database → Rules** y reemplaza con:

```json
{
  "rules": {
    "games_progress": {
      "$uid": {
        ".read": "auth.uid == $uid",
        ".write": "auth.uid == $uid",
        "$other": {
          ".validate": false
        }
      }
    }
  }
}
```

Click "Publish".

---

## Estructura de datos esperada

### Firestore

```
users/
  {userId}/
    profile/
      nickname: "Player_ABC"
      createdAt: Timestamp
      updatedAt: Timestamp
    stats/
      gamesWon: 5
      totalGames: 12
      bestTimes: {
        easy: 120,
        medium: 245,
        hard: 450,
        expert: null
      }
      totalErrors: 8
      totalHints: 2

games/
  {gameId}/
    userId: "user_123"
    difficulty: "medium"
    won: true
    time: 245
    mistakes: 1
    hints: 0
    totalMoves: 81
    createdAt: Timestamp

leaderboards/
  easy/
    {userId}/
      nickname: "Player_ABC"
      userId: "user_123"
      bestTime: 120
      gamesWon: 10
      lastUpdated: Timestamp
  medium/
    {userId}/
      ...
  hard/
    {userId}/
      ...
  expert/
    {userId}/
      ...
```

### Realtime Database

```
games_progress/
  {userId}/
    {gameId}/
      userId: "user_123"
      difficulty: "medium"
      board: [[0,0,1,...],[...]]
      notes: [[[1,2,3],[4,5],...],...]
      lives: 2
      elapsedSeconds: 342
      createdAt: 1708876543000
      updatedAt: 1708876543000
```

---

## Usar Firebase en tu código

### En React (Web)

```javascript
import FirebaseService from '../shared/firebase.js';
import firebaseConfig from '../firebase.config.js';

// Inicializar (una sola vez en App.jsx)
useEffect(() => {
  const firebase = new FirebaseService(firebaseConfig);
  await firebase.initialize();
  
  // Guardar en estado global (zustand o context)
}, []);

// Usar en componentes
const handleSaveGame = async () => {
  const result = await firebase.saveGameResult({
    gameId: gameId,
    difficulty: 'medium',
    won: true,
    time: 245,
    mistakes: 1,
    hints: 0,
    totalMoves: 81
  });
  
  if (result.success) {
    console.log('Game saved!');
  }
};
```

### En React Native (Mobile)

```javascript
import FirebaseService from '../shared/firebase.js';
import firebaseConfig from '../firebase.config.js';

// En App.tsx o main index
useEffect(() => {
  const setupFirebase = async () => {
    const firebase = new FirebaseService(firebaseConfig);
    await firebase.initialize();
    setFirebaseService(firebase);
  };
  
  setupFirebase();
}, []);
```

---

## Testing sin Firebase

Para testing/desarrollo sin credenciales reales:

```javascript
const firebase = new FirebaseService({});
firebase.initializeMock();

// Usa métodos como normalmente
const result = await firebase.mockSaveResult('easy', true, 245);
```

---

## Troubleshooting

### Error: "Firebase app already initialized"
- No llames `initialize()` más de una vez
- Usa un singleton o context global

### Error: "Permission denied" en Firestore
- Verifica que las reglas de seguridad estén correctas
- Asegúrate de estar autenticado (`request.auth.uid != null`)

### Error: "CORS policy" en navegador
- Asegúrate de que el dominio está autorizado
- Firebase Console → Authentication → Authorized domains

### Leaderboard muy lento
- Crea un índice en Firestore
- Firestore → Indexes → Create index
- Collection: `leaderboards/{difficulty}`
- Fields: `bestTime (Ascending)`

---

## Costo de Firebase

**Plan Gratis es suficiente para empezar:**

- 1 GB almacenamiento Firestore
- 10 GB Realtime Database
- 50,000 lecturas/día
- 20,000 escrituras/día
- 20,000 deletes/día

**Costo se activa si superas. Para monetizar después:**
- Pagas solo por lo que usas
- Primeros $5-10 al mes típicamente gratis

---

## Próximos pasos

1. ✅ Crear proyecto Firebase
2. ✅ Configurar Autenticación
3. ✅ Crear Firestore + Realtime DB
4. ✅ Agregar Firebase Rules
5. ⏳ Crear Web frontend (React)
6. ⏳ Crear Mobile app (React Native)

---

**¿Dudas?** Revisa:
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Beginner Guide](https://firebase.google.com/docs/firestore/quickstart)
- Código en `shared/firebase.js` (tiene comentarios)
