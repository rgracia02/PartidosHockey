// Remembers the edit PIN for each shared tournament on THIS device only (never exported, never
// synced) so the organizer doesn't have to retype it every time they open the app.
const STORAGE_KEY = 'hockey_share_pins';

function readMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSavedPin(shareCode: string): string {
  return readMap()[shareCode] || '';
}

export function savePin(shareCode: string, pin: string): void {
  try {
    const map = readMap();
    map[shareCode] = pin;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('No se pudo guardar la clave localmente:', e);
  }
}
