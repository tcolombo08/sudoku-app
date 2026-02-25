/**
 * Firebase Configuration Template
 *
 * INSTRUCTIONS:
 * 1. Go to https://firebase.google.com and create a new project
 * 2. In Project Settings, copy your configuration
 * 3. Replace the values below
 * 4. Rename this file to `firebase.config.js`
 * 5. Make sure it is listed in .gitignore to NOT push to GitHub
 */

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
};

/**
 * Firestore Rules (copy in Firebase Console > Firestore > Rules):
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Users can only read/write their own profile
 *     match /users/{userId} {
 *       allow read, write: if request.auth.uid == userId;
 *     }
 *
 *     // Games: only the owner can read/write
 *     match /games/{gameId} {
 *       allow read, write: if request.auth.uid == resource.data.userId;
 *     }
 *
 *     // Leaderboards: public read, private write
 *     match /leaderboards/{difficulty}/{userId} {
 *       allow read: if true;
 *       allow write: if false; // Server-side updates only
 *     }
 *   }
 * }
 */

/**
 * Realtime Database Rules (copy in Firebase Console > Realtime Database > Rules):
 *
 * {
 *   "rules": {
 *     "games_progress": {
 *       "$uid": {
 *         ".read": "auth.uid == $uid",
 *         ".write": "auth.uid == $uid"
 *       }
 *     }
 *   }
 * }
 */

export default firebaseConfig;
