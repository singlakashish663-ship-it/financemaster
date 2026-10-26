import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Detect demo / missing config
const isDemoMode = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('demo');

let app, auth;

if (!isDemoMode) {
  app  = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  // Stub auth object so the app doesn't crash without real Firebase keys
  auth = {
    currentUser: null,
    onAuthStateChanged: (cb) => { cb(null); return () => {}; },
  };
}

const googleProvider = new GoogleAuthProvider();
if (!isDemoMode) {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

// ---- Helpers ----

const demoError = () => Promise.reject(
  new Error('Firebase not configured. Add your Firebase keys to client/.env to enable authentication.')
);

export const registerWithEmail = async (email, password, displayName) => {
  if (isDemoMode) return demoError();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await sendEmailVerification(cred.user);
  return cred.user;
};

export const loginWithEmail = async (email, password) => {
  if (isDemoMode) return demoError();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const loginWithGoogle = async () => {
  if (isDemoMode) return demoError();
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
};

export const resetPassword = async (email) => {
  if (isDemoMode) return demoError();
  await sendPasswordResetEmail(auth, email);
};

export const resendVerification = async () => {
  if (isDemoMode) return;
  if (auth.currentUser) await sendEmailVerification(auth.currentUser);
};

export const logout = async () => {
  if (isDemoMode) return;
  await signOut(auth);
};

export const getIdToken = async () => {
  if (isDemoMode || !auth.currentUser) return null;
  return auth.currentUser.getIdToken(true);
};

export const updateUserProfile = async (data) => {
  if (isDemoMode || !auth.currentUser) return;
  await updateProfile(auth.currentUser, data);
};

export const changePassword = async (currentPassword, newPassword) => {
  if (isDemoMode) return demoError();
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

export const deleteAccount = async (password) => {
  if (isDemoMode) return demoError();
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  await deleteUser(user);
};

export const onAuthChange = (callback) => {
  if (isDemoMode) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export { isDemoMode };
export default app;
