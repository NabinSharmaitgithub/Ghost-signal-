import * as admin from 'firebase-admin';
// Note: In a real deployment, secrets should not be imported directly from a JSON file in version control.
// Use environment variables (GOOGLE_APPLICATION_CREDENTIALS) or secret managers.
// This is a placeholder for development.
import serviceAccount from '../serviceAccountKey.json';

// Prevent multiple initializations
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any)
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;