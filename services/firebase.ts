import { APP_CONFIG } from '../constants';

// Use safe imports with any casting to avoid "no exported member" errors in strict environments
import * as _firebaseApp from 'firebase/app';
import * as _firebaseAuth from 'firebase/auth';
import * as _firebaseFirestore from 'firebase/firestore';

const { initializeApp } = _firebaseApp as any;
const { getAuth } = _firebaseAuth as any;
const { getFirestore } = _firebaseFirestore as any;

// Define types loosely to avoid import errors
type FirebaseApp = any;
type Auth = any;
type Firestore = any;

// Global instances
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

const config = APP_CONFIG.FIREBASE_CONFIG;

// Check if configuration is present (not the placeholder)
const isConfigured = config && config.apiKey && config.apiKey !== "YOUR_API_KEY";

if (isConfigured) {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("GhostSignal: Firebase Connection Established.");
  } catch (error) {
    console.error("GhostSignal: Firebase Initialization Error.", error);
  }
} else {
  console.log("GhostSignal: Firebase Config missing. Falling back to In-Memory Simulation.");
}

export { app, auth, db };