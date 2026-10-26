const admin = require('firebase-admin');
const logger = require('../utils/logger');

let app;

function initFirebase() {
  if (app) return app;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  try {
    // Full service account — most secure
    if (projectId && clientEmail && privateKey) {
      app = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      logger.info('Firebase Admin initialized with service account');
    }
    // Project ID only — can still verify tokens via Google's public keys
    else if (projectId) {
      app = admin.initializeApp({ projectId });
      logger.info(`Firebase Admin initialized with projectId: ${projectId}`);
    }
    // Nothing configured
    else {
      app = admin.initializeApp({ projectId: 'demo-project' });
      logger.warn('Firebase Admin: no projectId configured');
    }
  } catch (err) {
    if (err.code === 'app/duplicate-app') {
      app = admin.app();
    } else {
      logger.error('Firebase Admin init failed:', err.message);
      // Return stub so server doesn't crash
      app = { auth: () => ({ verifyIdToken: async () => { throw new Error('Firebase not configured'); } }) };
    }
  }

  return app;
}

module.exports = { initFirebase };
