import { ChevronRight, Info, Medal, Share2, Trophy } from 'lucide-react';
import { StandingsRow, TournamentFormat } from '../types';

interface StandingsViewProps {
  standings: StandingsRow[];
  format: TournamentFormat;
  onSelectTeam?: (teamId: string) => void;
  onShareStandings?: () => void;
}

export function StandingsView({ standings, format, onShareStandings }: StandingsViewProps) {
  // Determine cutoff for playoffs
  let playoffCutoff = 0;
  let playoffLabel = '';
  if (format === 'groups_playoffs_final') {
    playoffCutoff = 2;
    playoffLabel = 'Pasan a la Gran Final';
  } else if (format === 'groups_playoffs_semis') {
    playoffCutoff = 4;
    playoffLabel = 'Pasan a Semifinales';
  } else if (format === 'groups_playoffs_quarters') {
    playoffCutoff = 8;
    playoffLabel = 'Pasan a Cuartos de Final';
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Standings Grouped iOS Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-none">Tabla de Posiciones</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Fase Regular / Liga</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {onShareStandings && standings.length > 0 && (
              <button
                id="btn-share-standings-whatsapp"
                onClick={onShareStandings}
                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95"
                title="Compartir tabla de posiciones en WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            )}
            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
              {standings.length} Equipos
            </span>
          </div>
        </div>

        {standings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No hay equipos cargados en el torneo.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
            <table className="w-full text-left text-xs min-w-[340px]">
              <thead>
                <tr className="text-slate-400 text-[11px] font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-2.5 pl-1 w-6 text-center">#</th>
                  <th className="py-2.5 pl-2">Equipo</th>
                  <th className="py-2.5 text-center font-black text-slate-800 w-10">PTS</th>
                  <th className="py-2.5 text-center w-8">PJ</th>
                  <th className="py-2.5 text-center w-8 text-slate-500">PG</th>
                  <th className="py-2.5 text-center w-8 text-slate-500">PE</th>
                  <th className="py-2.5 text-center w-8 text-slate-500">PP</th>
                  <th className="py-2.5 text-center w-9 font-semibold text-slate-700">DG</th>
                  <th className="py-2.5 text-center w-8 text-slate-500">GF</th>
                  <th className="py-2.5 text-center w-8 text-slate-500 pr-1">GC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standings.map((row, idx) => {
                  const isQualified = playoffCutoff > 0 && idx < playoffCutoff;
                  const isLastQualified = playoffCutoff > 0 && idx === playoffCutoff - 1;

                  return (
                    <tr
                      key={row.teamId}
                      className={`group transition-colors ${
                        isQualified ? 'bg-sky-50/25 hover:bg-sky-50/50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 pl-1 text-center font-bold text-slate-400">
                        {idx === 0 ? (
                          <span className="text-amber-500 font-black">1</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-500 font-bold">2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-700 font-bold">3</span>
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="py-3 pl-2 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                            style={{ backgroundColor: row.teamColor }}
                          />
                          <span className="truncate max-w-[130px]">{row.teamName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center font-black text-sky-600 text-sm bg-sky-50/60 rounded-lg">
                        {row.points}
                      </td>
                      <td className="py-3 text-center text-slate-700 font-semibold">{row.played}</td>
                      <td className="py-3 text-center text-slate-500">{row.won}</td>
                      <td className="py-3 text-center text-slate-500">{row.drawn}</td>
                      <td className="py-3 text-center text-slate-500">{row.lost}</td>
                      <td className="py-3 text-center font-bold text-slate-800">
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </td>
                      <td className="py-3 text-center text-slate-500">{row.goalsFor}</td>
                      <td className="py-3 text-center text-slate-400 pr-1">{row.goalsAgainst}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {playoffCutoff > 0 && standings.length >= playoffCutoff && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-sky-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
            <span>Los primeros <strong>{playoffCutoff} puestos</strong> {playoffLabel}.</span>
          </div>
        )}
      </div>

      {/* Scoring rules info card */}
      <div className="bg-white/80 rounded-2xl p-3.5 border border-slate-200/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-700 mb-0.5">Criterio de desempate oficial</p>
          <span>Puntos (3 por PG, 1 por PE) &gt; Diferencia de Gol &gt; Goles a Favor &gt; Sorteo/Fair Play.</span>
        </div>
      </div>
    </div>
  );
}
