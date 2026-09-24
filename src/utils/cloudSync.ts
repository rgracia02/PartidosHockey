import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { TournamentData } from '../types';
import { getDb } from './firebase';

const COLLECTION = 'sharedTournaments';

// Characters chosen to avoid visual mix-ups when read out loud or typed on a phone (no 0/O, 1/l/I).
const CODE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

function randomShareCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

export interface ShareInfo {
  shareCode: string;
  editPassword: string;
}

/**
 * Publishes a tournament to the cloud for the first time: picks a short share code and stores the
 * whole tournament under it, gated by the given PIN. Returns null if Firebase isn't configured yet.
 */
export async function publishTournament(
  data: TournamentData,
  editPassword: string
): Promise<ShareInfo | null> {
  const db = getDb();
  if (!db) return null;

  const shareCode = randomShareCode();
  await setDoc(doc(db, COLLECTION, shareCode), {
    editPassword,
    payload: data,
    updatedAt: serverTimestamp(),
  });
  return { shareCode, editPassword };
}

/**
 * Pushes a local change to an already-published tournament. The Firestore rules only accept the
 * write if `editPassword` matches what's already stored, so this returns false (instead of
 * throwing) when the PIN is wrong, letting the caller show a friendly message.
 */
export async function pushTournamentUpdate(
  shareCode: string,
  editPassword: string,
  data: TournamentData
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await updateDoc(doc(db, COLLECTION, shareCode), {
      editPassword,
      payload: data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('No se pudo sincronizar con la nube (¿clave incorrecta?):', err);
    return false;
  }
}

/** One-time read of a shared tournament, e.g. to check a code exists before subscribing. */
export async function fetchSharedTournament(shareCode: string): Promise<TournamentData | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, COLLECTION, shareCode));
  if (!snap.exists()) return null;
  return (snap.data().payload as TournamentData) ?? null;
}

/**
 * Live subscription: calls `onUpdate` immediately and again every time the shared tournament
 * changes, from ANY device. Returns an unsubscribe function.
 */
export function subscribeToSharedTournament(
  shareCode: string,
  onUpdate: (data: TournamentData | null) => void
): () => void {
  const db = getDb();
  if (!db) return () => {};
  return onSnapshot(
    doc(db, COLLECTION, shareCode),
    (snap) => onUpdate(snap.exists() ? ((snap.data().payload as TournamentData) ?? null) : null),
    (err) => {
      console.error('Error de sincronización en vivo:', err);
      onUpdate(null);
    }
  );
}
