import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
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

/** True when the app is running as an installed/"Add to Home Screen" app (iOS or Android), instead
 * of inside a normal browser tab. In that mode, Google's sign-in popup can't communicate back with
 * the page that opened it (no real window/opener relationship), so the popup flow hangs forever -
 * we need to use a full-page redirect instead in that case. */
function isStandaloneApp(): boolean {
  try {
    const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const displayModeStandalone =
      typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
    return !!(iosStandalone || displayModeStandalone);
  } catch {
    return false;
  }
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

/** Starts Google sign-in. Inside an installed/home-screen app this navigates away (full-page
 * redirect) and never resolves in this same page load - the result arrives later via
 * `completeGoogleRedirectSignIn()` once the app reloads. Inside a normal browser tab it uses the
 * usual popup and resolves right away. */
export async function signInWithGoogle(): Promise<GoogleUser | null> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase no está configurado.');
  const provider = new GoogleAuthProvider();

  if (isStandaloneApp()) {
    await signInWithRedirect(auth, provider);
    return null; // the page is navigating away; nothing more to do here
  }

  const result = await signInWithPopup(auth, provider);
  await result.user.getIdToken(true);
  return toGoogleUser(result.user);
}

/** Call this once when the app starts up, to pick up the result of a sign-in that used the
 * full-page redirect (see `signInWithGoogle`). Returns null if there was no pending redirect, or if
 * Firebase isn't configured. Throws if the redirect itself failed. */
export async function completeGoogleRedirectSignIn(): Promise<GoogleUser | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  const result = await getRedirectResult(auth);
  if (!result) return null;
  await result.user.getIdToken(true);
  return toGoogleUser(result.user);
}

export async function signOutOfGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}
