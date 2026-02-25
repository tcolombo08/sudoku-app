# Firebase Setup Guide

## Quick Steps (5 min)

### 1. Create Firebase project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" -> "Create project"
3. Name: `sudoku-app` (or whatever you prefer)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Configure Authentication

1. In Firebase Console -> **Authentication**
2. Click "Get started"
3. In "Sign-in method" -> enable **Anonymous**
4. Click "Enable" and "Save"

### 3. Create Firestore Database

1. Firebase Console -> **Firestore Database**
2. Click "Create database"
3. Location: `us-central1` (or closest to you)
4. Mode: **Start in test mode** (change later)
5. Click "Create"

### 4. Create Realtime Database

1. Firebase Console -> **Realtime Database**
2. Click "Create database"
3. Location: `us-central1`
4. Mode: **Start in test mode**
5. Click "Create"

### 5. Get credentials

1. Firebase Console -> Project Settings (gear icon, top left)
2. Tab "General"
3. Find "Your apps"
4. If no apps exist, click "Add app" -> Web (</>)
5. Name: `sudoku-web`
6. Copy the firebaseConfig object

### 6. Configure local project

```bash
# In the project root
npm run setup

# It will ask for Firebase values
# Or rename and edit manually:
cp firebase.config.template.js firebase.config.js
```

---

## Firestore Rules (Security)

Copy this in **Firestore -> Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: only read/write own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Games: only owner can read/write
    match /games/{gameId} {
      allow create: if request.auth.uid != null;
      allow read, update, delete: if request.auth.uid == resource.data.userId;
    }

    // Leaderboards: public read
    match /leaderboards/{difficulty}/{userId} {
      allow read: if true;
      allow write: if false; // Backend only
    }
  }
}
```

Click "Publish" when done.

---

## Realtime Database Rules

Go to **Realtime Database -> Rules** and replace with:

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

## Expected Data Structure

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

## Using Firebase in your code

### In React (Web)

```javascript
import FirebaseService from '../shared/firebase.js';
import firebaseConfig from '../firebase.config.js';

// Initialize (once in App.jsx)
useEffect(() => {
  const firebase = new FirebaseService(firebaseConfig);
  await firebase.initialize();

  // Store in global state (zustand or context)
}, []);

// Use in components
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

### In React Native (Mobile)

```javascript
import FirebaseService from '../shared/firebase.js';
import firebaseConfig from '../firebase.config.js';

// In App.tsx or main index
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

## Testing without Firebase

For testing/development without real credentials:

```javascript
const firebase = new FirebaseService({});
firebase.initializeMock();

// Use methods as normal
const result = await firebase.mockSaveResult('easy', true, 245);
```

---

## Troubleshooting

### Error: "Firebase app already initialized"
- Don't call `initialize()` more than once
- Use a singleton or global context

### Error: "Permission denied" in Firestore
- Check that security rules are correct
- Make sure you're authenticated (`request.auth.uid != null`)

### Error: "CORS policy" in browser
- Make sure the domain is authorized
- Firebase Console -> Authentication -> Authorized domains

### Leaderboard too slow
- Create an index in Firestore
- Firestore -> Indexes -> Create index
- Collection: `leaderboards/{difficulty}`
- Fields: `bestTime (Ascending)`

---

## Firebase Costs

**Free plan is enough to start:**

- 1 GB Firestore storage
- 10 GB Realtime Database
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day

**Costs activate if you exceed limits. For monetization later:**
- Pay only for what you use
- First $5-10 per month typically free

---

## Next steps

1. Create Firebase project
2. Configure Authentication
3. Create Firestore + Realtime DB
4. Add Firebase Rules
5. Create Web frontend (React)
6. Create Mobile app (React Native)

---

**Questions?** Check:
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Beginner Guide](https://firebase.google.com/docs/firestore/quickstart)
- Code in `shared/firebase.js` (has comments)
