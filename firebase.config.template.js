/**
 * Firebase Configuration Template
 * 
 * INSTRUCCIONES:
 * 1. Ve a https://firebase.google.com y crea un nuevo proyecto
 * 2. En Project Settings, copia tu configuración
 * 3. Reemplaza los valores de abajo
 * 4. Renombra este archivo a `firebase.config.js`
 * 5. Asegúrate de que está en .gitignore para NO subir a GitHub
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
 * Firestore Rules (copiar en Firebase Console > Firestore > Rules):
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Usuarios solo pueden leer/escribir su propio perfil
 *     match /users/{userId} {
 *       allow read, write: if request.auth.uid == userId;
 *     }
 * 
 *     // Juegos: solo el propietario puede leer/escribir
 *     match /games/{gameId} {
 *       allow read, write: if request.auth.uid == resource.data.userId;
 *     }
 * 
 *     // Leaderboards: públicos para lectura, privados para escritura
 *     match /leaderboards/{difficulty}/{userId} {
 *       allow read: if true;
 *       allow write: if false; // Solo server-side updates
 *     }
 *   }
 * }
 */

/**
 * Realtime Database Rules (copiar en Firebase Console > Realtime Database > Rules):
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
