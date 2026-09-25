// Remembers a favorite team per tournament, on this device only (never synced). Used to highlight
// that team first in Fixture and Standings - like starring a team in SofaScore/FotMob.
const STORAGE_KEY = 'hockey_favorite_teams';

function readMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getFavoriteTeam(tournamentId: string): string | null {
  return readMap()[tournamentId] || null;
}

export function setFavoriteTeam(tournamentId: string, teamId: string | null): void {
  try {
    const map = readMap();
    if (teamId) {
      map[tournamentId] = teamId;
    } else {
      delete map[tournamentId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('No se pudo guardar el equipo favorito:', e);
  }
}
