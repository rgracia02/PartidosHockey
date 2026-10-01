import { useState } from 'react';
import { Camera, ChevronRight, Info, Medal, Share2, Star, Trophy } from 'lucide-react';
import { StandingsRow, TournamentFormat } from '../types';
import { getFavoriteTeam, setFavoriteTeam } from '../utils/favorites';

interface StandingsViewProps {
  standings: StandingsRow[];
  format: TournamentFormat;
  tournamentId: string;
  onSelectTeam?: (teamId: string) => void;
  onShareStandings?: () => void;
  onShareStandingsImage?: () => void;
}

export function StandingsView({ standings, format, tournamentId, onShareStandings, onShareStandingsImage }: StandingsViewProps) {
  const [favoriteTeamId, setFavoriteTeamIdState] = useState<string | null>(() => getFavoriteTeam(tournamentId));

  const toggleFavorite = (teamId: string) => {
    const next = favoriteTeamId === teamId ? null : teamId;
    setFavoriteTeamIdState(next);
    setFavoriteTeam(tournamentId, next);
  };
  // Determine cutoff for playoffs
  let playoffCutoff = 0;
  let playoffLabel = '';
  if (format === 'groups_playoffs_final') {
    playoffCutoff = 2;
    playoffLabel = 'pasan a la Gran Final';
  } else if (format === 'groups_playoffs_semis') {
    playoffCutoff = 4;
    playoffLabel = 'pasan a Semifinales';
  } else if (format === 'groups_playoffs_top5') {
    playoffCutoff = 5;
    playoffLabel = 'clasifican a playoffs (el 1° pasa directo a semifinales)';
  } else if (format === 'groups_playoffs_quarters') {
    playoffCutoff = 8;
    playoffLabel = 'pasan a Cuartos de Final';
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Standings Grouped iOS Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Tabla de Posiciones</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Fase Regular / Liga</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {onShareStandingsImage && standings.length > 0 && (
              <button
                id="btn-share-standings-image"
                onClick={onShareStandingsImage}
                className="w-11 h-11 flex items-center justify-center bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 active:bg-sky-200 font-bold rounded-xl transition-all active:scale-95"
                title="Compartir tabla de posiciones como imagen"
                aria-label="Compartir tabla de posiciones como imagen"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            {onShareStandings && standings.length > 0 && (
              <button
                id="btn-share-standings-whatsapp"
                onClick={onShareStandings}
                className="px-3 min-h-[44px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:bg-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95"
                title="Compartir tabla de posiciones en WhatsApp"
                aria-label="Compartir tabla de posiciones en WhatsApp"
              >
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden min-[400px]:inline">Compartir</span>
              </button>
            )}
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {standings.length} Equipos
            </span>
          </div>
        </div>

        {standings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600 dark:text-slate-400">
            No hay equipos cargados en el torneo.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
            <table className="w-full text-left text-xs tabular-nums">
              <caption className="sr-only">Tabla de posiciones. Columnas: puntos, partidos jugados, ganados, empatados, perdidos, diferencia de gol, goles a favor y en contra.</caption>
              <thead>
                <tr className="text-slate-600 dark:text-slate-400 text-xs font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                  <th scope="col" className="py-2.5 pl-1 w-6 text-center"><abbr title="Posición" className="no-underline">#</abbr></th>
                  <th scope="col" className="py-2.5 pl-1">Equipo</th>
                  <th scope="col" className="py-2.5 text-center font-black text-slate-800 dark:text-slate-200 w-10"><abbr title="Puntos" className="no-underline">PTS</abbr></th>
                  <th scope="col" className="py-2.5 text-center w-8"><abbr title="Partidos jugados" className="no-underline">PJ</abbr></th>
                  <th scope="col" className="py-2.5 text-center w-8 hidden min-[400px]:table-cell"><abbr title="Partidos ganados" className="no-underline">PG</abbr></th>
                  <th scope="col" className="py-2.5 text-center w-8 hidden min-[400px]:table-cell"><abbr title="Partidos empatados" className="no-underline">PE</abbr></th>
                  <th scope="col" className="py-2.5 text-center w-8 hidden min-[400px]:table-cell"><abbr title="Partidos perdidos" className="no-underline">PP</abbr></th>
                  <th scope="col" className="py-2.5 text-center w-9 font-semibold text-slate-700 dark:text-slate-300"><abbr title="Diferencia de gol" className="no-underline">DG</abbr></th>
                  <th scope="col" className="py-2.5 text-center w-8"><abbr title="Goles a favor" className="no-underline">GF</abbr></th>
                  <th scope="col" className="py-2.5 text-center w-8 pr-1"><abbr title="Goles en contra" className="no-underline">GC</abbr></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {standings.map((row, idx) => {
                  const isQualified = playoffCutoff > 0 && idx < playoffCutoff;
                  const isFavorite = row.teamId === favoriteTeamId;

                  return (
                    <tr
                      key={row.teamId}
                      className={`group transition-colors border-l-4 ${
                        isQualified ? 'border-l-emerald-500' : 'border-l-transparent'
                      } ${
                        isFavorite
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30'
                          : isQualified
                          ? 'bg-sky-50/30 dark:bg-sky-950/20 hover:bg-sky-50/50 dark:hover:bg-sky-950/40'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 pl-1 text-center font-bold text-slate-600 dark:text-slate-400">
                        {idx === 0 ? (
                          <span className="text-amber-700 dark:text-amber-400 font-black">1</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-600 dark:text-slate-300 font-bold">2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-800 dark:text-amber-500 font-bold">3</span>
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <th scope="row" className="py-1 pl-1 font-semibold text-slate-900 dark:text-slate-100 text-left">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleFavorite(row.teamId)}
                            className="w-10 h-11 -ml-2 flex items-center justify-center shrink-0"
                            aria-label={isFavorite ? `Quitar a ${row.teamName} de favoritos` : `Marcar a ${row.teamName} como favorito`}
                            aria-pressed={isFavorite}
                            title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                          >
                            <Star aria-hidden="true" className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-600 dark:text-slate-400'}`} />
                          </button>
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20"
                            style={{ backgroundColor: row.teamColor }}
                          />
                          <span className="line-clamp-2 break-words leading-tight">{row.teamName}</span>
                        </div>
                      </th>
                      <td className="py-3 text-center font-black text-sky-700 dark:text-sky-400 text-sm bg-sky-50/60 dark:bg-sky-950/50 rounded-lg">
                        {row.points}
                      </td>
                      <td className="py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{row.played}</td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-400 hidden min-[400px]:table-cell">{row.won}</td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-400 hidden min-[400px]:table-cell">{row.drawn}</td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-400 hidden min-[400px]:table-cell">{row.lost}</td>
                      <td className="py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-400">{row.goalsFor}</td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-400 pr-1">{row.goalsAgainst}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {playoffCutoff > 0 && standings.length >= playoffCutoff && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Los primeros <strong>{playoffCutoff} puestos</strong> {playoffLabel}.</span>
          </div>
        )}
      </div>

      {/* Scoring rules info card */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3 transition-colors">
        <Info className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Criterio de desempate oficial</p>
          <span>Puntos (3 por PG, 1 por PE) &gt; Diferencia de Gol &gt; Goles a Favor &gt; Sorteo/Fair Play.</span>
        </div>
      </div>
    </div>
  );
}
