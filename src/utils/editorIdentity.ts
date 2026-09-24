// Remembers a display name for THIS device (e.g. "Ana"), used to label its own edits in a shared
// tournament's activity log. Stored locally only - never required, never synced as an "account".
const STORAGE_KEY = 'hockey_editor_name';

export function getEditorName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setEditorName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch (e) {
    console.error('No se pudo guardar el nombre localmente:', e);
  }
}
