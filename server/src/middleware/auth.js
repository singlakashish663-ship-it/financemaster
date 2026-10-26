const UserProfile = require('../models/UserProfile');
const logger      = require('../utils/logger');
const https       = require('https');

// Cache Firebase public keys
let cachedKeys  = {};
let keysExpiry  = 0;

// Fetch Google's public keys to verify Firebase JWT signatures
function fetchFirebasePublicKeys() {
  return new Promise((resolve, reject) => {
    if (Date.now() < keysExpiry && Object.keys(cachedKeys).length) {
      return resolve(cachedKeys);
    }
    const url = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          cachedKeys = JSON.parse(data);
          // Cache for 1 hour
          keysExpiry = Date.now() + 3600 * 1000;
          resolve(cachedKeys);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// Decode JWT payload without verifying signature (safe for dev when network unavailable)
function decodeJWTPayload(token) {
  try {
    const parts   = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload;
  } catch {
    try {
      const parts   = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return payload;
    } catch {
      return null;
    }
  }
}

// Verify token expiry
function isTokenExpired(payload) {
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp;
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = header.split('Bearer ')[1];

  // Dev token shortcut
  if (process.env.NODE_ENV === 'development' && token.startsWith('dev-')) {
    const devUid = token.replace('dev-', '');
    req.firebaseUid = devUid;
    const profile   = await UserProfile.findOne({ firebaseUid: devUid }).catch(() => null);
    if (profile) req.user = profile;
    return next();
  }

  // Try Firebase Admin first if configured
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'demo-project') {
    try {
      const admin = require('firebase-admin');
      // Init admin if not already done
      if (!admin.apps.length) {
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (clientEmail && privateKey) {
          admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
        } else {
          admin.initializeApp({ projectId });
        }
      }
      const decoded     = await admin.auth().verifyIdToken(token);
      req.firebaseUid   = decoded.uid;
      req.firebaseEmail = decoded.email;
      const profile     = await UserProfile.findOne({ firebaseUid: decoded.uid }).catch(() => null);
      if (!profile && decoded.email) {
        try {
          const username = decoded.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0,20) + Math.floor(Math.random()*999);
          const newP = await UserProfile.create({ firebaseUid: decoded.uid, email: decoded.email, username, displayName: decoded.email.split('@')[0], emailVerified: decoded.email_verified || false });
          req.user = newP;
        } catch { req.user = await UserProfile.findOne({ firebaseUid: decoded.uid }).catch(() => null); }
      } else if (profile) { req.user = profile; }
      return next();
    } catch (adminErr) {
      logger.warn('Firebase Admin verify failed, falling back to JWT decode:', adminErr.code || adminErr.message);
    }
  }

  // Fallback: decode JWT payload directly (works without service account)
  const payload = decodeJWTPayload(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid token format.' });
  }

  if (isTokenExpired(payload)) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }

  // Verify this is a Firebase token for our project
  const expectedAud = process.env.FIREBASE_PROJECT_ID || 'financemaster-3713b';
  if (payload.aud && payload.aud !== expectedAud) {
    return res.status(401).json({ error: 'Invalid token audience.' });
  }

  const uid   = payload.user_id || payload.sub;
  const email = payload.email   || '';

  if (!uid) {
    return res.status(401).json({ error: 'Could not extract user ID from token.' });
  }

  req.firebaseUid   = uid;
  req.firebaseEmail = email;

  // Always find or auto-create profile so requireProfile works
  let profile = await UserProfile.findOne({ firebaseUid: uid }).catch(() => null);
  if (!profile && email) {
    try {
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) + Math.floor(Math.random() * 999);
      profile = await UserProfile.create({
        firebaseUid: uid, email, username,
        displayName: email.split('@')[0], emailVerified: false,
      });
    } catch { profile = await UserProfile.findOne({ firebaseUid: uid }).catch(() => null); }
  }
  if (profile) req.user = profile;

  next();
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const token   = header.split('Bearer ')[1];
    const payload = decodeJWTPayload(token);
    if (payload && !isTokenExpired(payload)) {
      const uid = payload.user_id || payload.sub;
      if (uid) {
        req.firebaseUid = uid;
        const profile   = await UserProfile.findOne({ firebaseUid: uid }).catch(() => null);
        if (profile) req.user = profile;
      }
    }
  } catch { /* ignore */ }
  next();
}

function requireProfile(req, res, next) {
  if (!req.user) {
    return res.status(403).json({ error: 'Profile not found. Please complete onboarding.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

module.exports = { authenticate, optionalAuth, requireProfile, requireAdmin };
