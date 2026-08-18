/**
 * Firebase Admin SDK initialisation.
 *
 * Credential resolution order:
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON env var (raw JSON string)
 *   2. GOOGLE_APPLICATION_CREDENTIALS env var (path to key file)
 *   3. Application default credentials (when deployed on Google Cloud)
 *
 * If none are available, the app runs in DEMO mode with an in-memory store,
 * pre-seeded with typical Indus Wok kitchen stock, so you can use the full
 * dashboard before wiring up Firebase.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;
let demoMode = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (
    process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ) {
    const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (
    process.env.K_SERVICE ||
    process.env.FUNCTION_TARGET ||
    process.env.GOOGLE_CLOUD_PROJECT
  ) {
    admin.initializeApp(); // application default credentials on Google Cloud
  } else {
    throw new Error('No Firebase credentials found');
  }
  db = admin.firestore();
  console.log('✅ Firebase connected');
} catch (err) {
  demoMode = true;
  console.warn('⚠️  Firebase not configured — running in DEMO mode (in-memory data).');
  console.warn('    Add serviceAccountKey.json + .env to connect Firestore. See README.');
}

module.exports = { admin, db, demoMode };
