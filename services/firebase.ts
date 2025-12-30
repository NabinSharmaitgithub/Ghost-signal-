import { APP_CONFIG } from '../constants';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Global instances
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;

const config = APP_CONFIG.FIREBASE_CONFIG;

// Check if configuration is present (not the placeholder)
const isConfigured = config && config.apiKey && config.apiKey !== "YOUR_API_KEY";

if (isConfigured) {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    if (config.measurementId) {
        try {
            analytics = getAnalytics(app);
        } catch (e) {
            console.log("Firebase Analytics not supported in this environment");
        }
    }
    console.log("GhostSignal: Firebase Connection Established.");
  } catch (error) {
    console.error("GhostSignal: Firebase Initialization Error.", error);
  }
} else {
  console.log("GhostSignal: Firebase Config missing. Falling back to In-Memory Simulation.");
}

export { app, auth, db, analytics };