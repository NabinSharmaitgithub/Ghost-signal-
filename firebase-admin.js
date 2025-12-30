// Server-side Admin SDK initialization
// Use this for Cloud Functions or backend Node.js scripts
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin Initialized");
} catch (error) {
  console.error("Firebase Admin Initialization Failed:", error);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };