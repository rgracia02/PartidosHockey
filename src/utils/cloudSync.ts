import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { TournamentData } from '../types';
import { getDb } from './firebase';

const COLLECTION = 'sharedTournaments';
const AUTHORIZED_CREATORS_DOC = 'appConfig/authorizedCreators';

// Firestore rejects any field whose value is `undefined` (it wants the key left out entirely, or
// deleteField()). Our TournamentData has plenty of optional fields (whatsappHeader, date, time,
// etc.) that are `undefined` rather than absent, so round-tripping through JSON strips those keys
// before we ever try to save.
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Characters chosen to avoid visual mix-ups when read out loud or typed on a phone (no 0/O, 1/l/I).
const CODE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

function randomShareCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

/**
 * Live subscription to the list of Google accounts allowed to publish new tournaments (see
 * firestore.rules). Calls `onUpdate` with an empty list if the document doesn't exist yet - it
 * has to be created once, by hand, in the Firebase console (Firestore Database → Data).
 */
export function subscribeToAuthorizedCreators(onUpdate: (emails: string[]) => void): () => void {
  const db = getDb();
  if (!db) {
    onUpdate([]);
    return () => {};
  }
  const [collectionName, docId] = AUTHORIZED_CREATORS_DOC.split('/');
  return onSnapshot(
    doc(db, collectionName, docId),
    (snap) => onUpdate(snap.exists() && Array.isArray(snap.data().emails) ? snap.data().emails : []),
    (err) => {
      console.error('No se pudo leer la lista de creadores autorizados:', err);
      onUpdate([]);
    }
  );
}

/** Adds an email to the authorized-creators list. Only works if the caller is already on it. */
export async function addAuthorizedCreator(email: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    const [collectionName, docId] = AUTHORIZED_CREATORS_DOC.split('/');
    await updateDoc(doc(db, collectionName, docId), {
      emails: arrayUnion(email.trim().toLowerCase()),
    });
    return true;
  } catch (err) {
    console.error('No se pudo agregar el mail autorizado:', err);
    return false;
  }
}

/** Removes an email from the authorized-creators list. Only works if the caller is already on it. */
export async function removeAuthorizedCreator(email: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    const [collectionName, docId] = AUTHORIZED_CREATORS_DOC.split('/');
    await updateDoc(doc(db, collectionName, docId), {
      emails: arrayRemove(email.trim().toLowerCase()),
    });
    return true;
  } catch (err) {
    console.error('No se pudo quitar el mail autorizado:', err);
    return false;
  }
}

export interface ShareInfo {
  shareCode: string;
  ownerUid: string;
  ownerEmail: string;
}

/**
 * Publishes a tournament to the cloud for the first time: picks a short share code and stores it
 * owned by the signed-in Google account (`ownerUid`/`ownerEmail`). Only the owner, or an email the
 * owner later adds to `shareEditorEmails`, can push edits back (enforced by firestore.rules).
 */
export async function publishTournament(
  data: TournamentData,
  ownerUid: string,
  ownerEmail: string
): Promise<ShareInfo | null> {
  const db = getDb();
  if (!db) return null;

  const shareCode = randomShareCode();
  await setDoc(doc(db, COLLECTION, shareCode), {
    ownerUid,
    ownerEmail,
    editorEmails: [],
    payload: sanitizeForFirestore(data),
    updatedAt: serverTimestamp(),
  });
  return { shareCode, ownerUid, ownerEmail };
}

/**
 * Pushes a local change up to an already-published tournament. The Firestore rules only accept
 * the write from the owner's account or an email on the editors list, so this returns false
 * (instead of throwing) when the signed-in account isn't allowed to edit.
 */
export async function pushTournamentUpdate(shareCode: string, data: TournamentData): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await updateDoc(doc(db, COLLECTION, shareCode), {
      payload: sanitizeForFirestore(data),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('No se pudo sincronizar con la nube (¿no tenés permiso de edición?):', err);
    return false;
  }
}

/** Owner-only: grants edit access to another Google account by email. */
export async function grantEditorAccess(shareCode: string, email: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await updateDoc(doc(db, COLLECTION, shareCode), {
      editorEmails: arrayUnion(email.trim().toLowerCase()),
    });
    return true;
  } catch (err) {
    console.error('No se pudo dar permiso de edición:', err);
    return false;
  }
}

/** Owner-only: revokes a previously granted editor's access. */
export async function revokeEditorAccess(shareCode: string, email: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await updateDoc(doc(db, COLLECTION, shareCode), {
      editorEmails: arrayRemove(email.trim().toLowerCase()),
    });
    return true;
  } catch (err) {
    console.error('No se pudo quitar el permiso de edición:', err);
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

export interface SharedTournamentSnapshot {
  data: TournamentData;
  ownerUid: string;
  ownerEmail: string;
  editorEmails: string[];
}

/**
 * Live subscription: calls `onUpdate` immediately and again every time the shared tournament
 * changes, from ANY device. Returns an unsubscribe function.
 */
export function subscribeToSharedTournament(
  shareCode: string,
  onUpdate: (snapshot: SharedTournamentSnapshot | null) => void
): () => void {
  const db = getDb();
  if (!db) return () => {};
  return onSnapshot(
    doc(db, COLLECTION, shareCode),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const raw = snap.data();
      onUpdate({
        data: raw.payload as TournamentData,
        ownerUid: raw.ownerUid || '',
        ownerEmail: raw.ownerEmail || '',
        editorEmails: Array.isArray(raw.editorEmails) ? raw.editorEmails : [],
      });
    },
    (err) => {
      console.error('Error de sincronización en vivo:', err);
      onUpdate(null);
    }
  );
}
