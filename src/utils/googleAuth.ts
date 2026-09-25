import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export interface GoogleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

function toGoogleUser(u: User): GoogleUser {
  return {
    uid: u.uid,
    email: (u.email || '').toLowerCase(),
    displayName: u.displayName || u.email || 'Usuario',
    photoURL: u.photoURL,
  };
}

/** Calls `onChange` immediately and again whenever the signed-in Google account changes. */
export function subscribeToGoogleUser(onChange: (user: GoogleUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    onChange(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (u) => onChange(u ? toGoogleUser(u) : null));
}

/**
 * Sends the browser to Google's sign-in page and back (avoids the popup + Cross-Origin-Opener-
 * Policy issues some browsers have with `signInWithPopup` on GitHub Pages and similar hosts).
 * Since this navigates away, it doesn't return the signed-in user directly - `subscribeToGoogleUser`
 * picks it up via `onAuthStateChanged` once the page comes back. Throws if Firebase isn't configured.
 */
export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase no está configurado.');
  await signInWithRedirect(auth, new GoogleAuthProvider());
}

/**
 * Call once on app startup to surface any error from a sign-in redirect that just completed
 * (e.g. the person closed Google's account picker). A successful sign-in doesn't need this -
 * `subscribeToGoogleUser`'s onAuthStateChanged already reports the new user on its own.
 */
export async function checkGoogleRedirectResult(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  try {
    await getRedirectResult(auth);
  } catch (err) {
    console.error('Error al completar el login con Google:', err);
  }
}

export async function signOutOfGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}
