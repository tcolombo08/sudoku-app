# 🚀 Sudoku App - Quick Start Guide

## 1️⃣ Primeros Pasos

### Clonar el repo
```bash
git clone https://github.com/tu-usuario/sudoku-app.git
cd sudoku-app
```

### Instalar dependencias
```bash
npm install
```

### Ejecutar tests (verificar que todo funciona)
```bash
npm test
```

Deberías ver:
```
✅ Test generador Sudoku - PASS
✅ Test lógica juego - PASS
✅ Tests totales: 12/12 PASS
```

---

## 2️⃣ Configurar Firebase

### Opción A: Setup automático
```bash
npm run setup
# Sigue las instrucciones interactivas
```

### Opción B: Manual
1. Renombra `firebase.config.template.js` → `firebase.config.js`
2. Actualiza los valores con tus credenciales de Firebase
3. Ver `docs/FIREBASE-SETUP.md` para instrucciones detalladas

---

## 3️⃣ Entender la estructura

**Código lógico (sin UI):**
```javascript
// shared/sudokuGenerator.js
const gen = new SudokuGenerator();
const game = gen.generate('medium'); // {puzzle, solution}
```

**Lógica del juego:**
```javascript
// shared/gameLogic.js
const gameLogic = new GameLogic(puzzle, solution);
gameLogic.setMode('complete');
gameLogic.placeNumber(0, 0, 5); // validar número
```

**Backend:**
```javascript
// shared/firebase.js
const firebase = new FirebaseService(firebaseConfig);
await firebase.initialize();
await firebase.saveGameResult({...});
```

---

## 4️⃣ Estructura del Proyecto

```
sudoku-app/
├── shared/             ← Código compartido (Node.js puro)
│   ├── sudokuGenerator.js
│   ├── gameLogic.js
│   ├── firebase.js
│   └── test-*.js
├── web/                ← React (próximo)
├── mobile/             ← React Native (después)
├── docs/               ← Documentación completa
├── README.md           ← Overview
└── PROGRESS.md         ← Estado detallado
```

---

## 5️⃣ Próximos Pasos

### Para Web (React)
```bash
cd web
npm create vite@latest . -- --template react
npm install
npm run dev
```

### Para Mobile (React Native)
```bash
cd mobile
npx create-expo-app .
npm install
npm start
```

---

## 📚 Documentación

**Para entender:**
- `README.md` - Overview del proyecto
- `ARCHITECTURE.md` - Diagramas y flujos
- `docs/FIREBASE-SETUP.md` - Configurar Firebase
- `docs/FIREBASE-API.md` - API completa

**Para desarrollar:**
- `shared/gameLogic.js` - Lógica del juego (leer)
- `shared/firebase.js` - Backend (leer)
- `PROGRESS.md` - Estado actual

---

## 🧪 Testing

```bash
# Tests de generador
npm run test:sudoku

# Tests de lógica
npm run test:gamelogic

# Todos los tests
npm test
```

---

## 🔥 Firebase Testing

Sin credenciales reales:
```javascript
const firebase = new FirebaseService({});
firebase.initializeMock();

// Ahora puedes usar todos los métodos
const result = await firebase.mockSaveResult('easy', true, 245);
```

Con credenciales:
```javascript
const firebase = new FirebaseService(firebaseConfig);
await firebase.initialize();

// Ahora conecta a Firebase real
```

---

## 📱 Desarrollo Local

### Web
```bash
cd web
npm run dev
# Abre http://localhost:5173
```

### Mobile (con Expo)
```bash
cd mobile
npm start
# Escanea QR con Expo Go app
```

---

## ⚙️ Configuración importante

### .gitignore (NO subir a GitHub)
```
firebase.config.js        ← Credenciales (PRIVADO)
.env.local               ← Variables de ambiente
node_modules/            ← Dependencias
```

### Commit inicial sugerido
```bash
git add .
git commit -m "Initial commit: game logic + firebase backend

- Sudoku generator (4 levels)
- Game logic (validation, lives, timer, undo/redo)
- Firebase service (auth, persistence, leaderboard)
- Full documentation
"
git push origin main
```

---

## 🐛 Si algo no funciona

1. **npm test falla**
   - Verifica Node.js: `node --version` (debe ser ≥18)
   - Reinstala: `rm -rf node_modules && npm install`

2. **Firebase no conecta**
   - Verifica `firebase.config.js` existe
   - Copia valores correctamente desde Firebase Console
   - Revisa `docs/FIREBASE-SETUP.md`

3. **Código antiguo o cached**
   - `npm cache clean --force`
   - `git status` para ver cambios

---

## 💡 Tips para desarrolladores

1. **Todos los métodos son async**
   ```javascript
   const result = await firebase.saveGameResult({...});
   ```

2. **GameLogic es stateful**
   ```javascript
   const game = new GameLogic(puzzle, solution);
   game.placeNumber(0, 0, 5); // modifica estado interno
   ```

3. **Firebase se inicializa una sola vez**
   ```javascript
   // NO hacer esto:
   await firebase.initialize();
   await firebase.initialize(); // ❌ Error

   // Hacer esto:
   if (!firebase.userId) {
     await firebase.initialize();
   }
   ```

4. **Guardar estado cada 10 segundos**
   ```javascript
   if (moveCount % 10 === 0) {
     await firebase.saveGameState(gameId, game.getState());
   }
   ```

---

## 🎯 Roadmap

- ✅ Backend logic (generador + game + firebase)
- 🚀 Web frontend (React)
- ⏳ Mobile app (React Native)
- ⏳ Ads integration (AdMob)
- ⏳ App Store / Play Store deployment

**Tiempo estimado total:** 30-35 horas

---

## 📞 Desarrollo

**Stack:**
- Backend: Node.js puro (zero dependencies)
- Web: React 18 + Vite
- Mobile: React Native + Expo
- Database: Firebase (Firestore + Realtime)

**Arquitectura:**
- `shared/` - Lógica pura (reutilizable)
- `web/` - UI React (browser)
- `mobile/` - UI React Native (iOS/Android)

---

**¿Listo para empezar?**

```bash
npm test
# Si ves ✅ TODOS LOS TESTS PASANDO, estás listo!
```

Luego: `npm run dev:web` para iniciar frontend.

---

**Made with ❤️ | Sudoku App v1.0**
