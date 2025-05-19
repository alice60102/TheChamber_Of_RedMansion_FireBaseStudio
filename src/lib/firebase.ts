// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore'; // Uncomment if you need Firestore
// import { getStorage } from 'firebase/storage'; // Uncomment if you need Storage
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you need Analytics

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// --- DEBUGGING LOG ---
// This log will appear in your SERVER-SIDE terminal when the app starts (or on first import).
// Check if these values match exactly what's in your Firebase project console.
console.log("Firebase Initialization Attempting with:");
console.log("Project ID:", firebaseConfig.projectId);
console.log("Auth Domain:", firebaseConfig.authDomain);
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is MISSING in .env file or not prefixed with NEXT_PUBLIC_!");
}
if (!firebaseConfig.projectId) {
  console.error("Firebase Project ID is MISSING in .env file or not prefixed with NEXT_PUBLIC_!");
}
// --- END DEBUGGING LOG ---

// Initialize Firebase
// This pattern prevents re-initializing the app on hot reloads in development
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// const db = getFirestore(app); // Uncomment if you need Firestore
// const storage = getStorage(app); // Uncomment if you need Storage
// const analytics = getAnalytics(app); // Uncomment if you need Analytics (ensure measurementId is also set)

export { app, auth /*, db, storage, analytics */ };
