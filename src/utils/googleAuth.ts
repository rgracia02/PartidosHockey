import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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

/** Calls `onChange` immediately and again whenever the signed-in Google account changes. Forces a
 * fresh ID token before reporting a signed-in user, so anything that reads Firestore right after
 * (like the authorized-creators list) doesn't race a token that hasn't fully propagated yet. */
export function subscribeToGoogleUser(onChange: (user: GoogleUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    onChange(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (u) => {
    if (u) {
      try {
        await u.getIdToken(true);
      } catch (err) {
        console.error('No se pudo refrescar el token de sesión:', err);
      }
    }
    onChange(u ? toGoogleUser(u) : null);
  });
}

/** Opens the Google sign-in popup. Throws if Firebase isn't configured or the popup is blocked. */
export async function signInWithGoogle(): Promise<GoogleUser> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase no está configurado.');
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  await result.user.getIdToken(true);
  return toGoogleUser(result.user);
}

export async function signOutOfGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}
