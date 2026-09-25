import { Calendar, ChevronRight, Flame, Plus, Trophy } from 'lucide-react';
import { ActivityLogEntry, Match, ScorerStat, StandingsRow, Team } from '../types';

interface HomeViewProps {
  tournamentName: string;
  matches: Match[];
  teams: Team[];
  standings: StandingsRow[];
  topScorers: ScorerStat[];
  activityLog?: ActivityLogEntry[];
  onGoToFixture: () => void;
  onGoToStandings: () => void;
  onGoToScorers: () => void;
  onSelectMatch: (match: Match) => void;
  onAddTournament: () => void;
}

function formatShortDate(isoDate?: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

function getNextMatch(matches: Match[]): Match | null {
  const pending = matches.filter((m) => !m.isCompleted && m.teamAId && m.teamBId);
  if (pending.length === 0) return null;
  const withDate = pending.filter((m) => m.date);
  if (withDate.length > 0) {
    return [...withDate].sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`))[0];
  }
  return pending[0];
}

function getLastResult(matches: Match[]): Match | null {
  const completed = matches.filter((m) => m.isCompleted && m.teamAId && m.teamBId);
  if (completed.length === 0) return null;
  const withDate = completed.filter((m) => m.date);
  if (withDate.length > 0) {
    return [...withDate].sort((a, b) => `${b.date}${b.time || ''}`.localeCompare(`${a.date}${a.time || ''}`))[0];
  }
  return completed[completed.length - 1];
}

function formatLogTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'recién';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

export function HomeView({
  matches,
  teams,
  standings,
  topScorers,
  activityLog,
  onGoToFixture,
  onGoToStandings,
  onGoToScorers,
  onSelectMatch,
  onAddTournament,
}: HomeViewProps) {
  const teamName = (id: string) => teams.find((t) => t.id === id)?.name || 'Por definir';
  const teamColor = (id: string) => teams.find((t) => t.id === id)?.color || '#94A3B8';

  const nextMatch = getNextMatch(matches);
  const lastResult = getLastResult(matches);
  const topScorer = topScorers[0];
  const podium = standings.slice(0, 3);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Next match hero */}
      {nextMatch ? (
        <button
          onClick={() => onSelectMatch(nextMatch)}
          className="w-full text-left bg-gradient-to-br from-sky-600 to-sky-700 dark:from-sky-700 dark:to-sky-900 rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-1.5 text-sky-100 text-[11px] font-bold uppercase tracking-wide mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Próximo partido</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: teamColor(nextMatch.teamAId) }} />
              <span className="text-white font-bold text-sm truncate">{nextMatch.placeholderA || teamName(nextMatch.teamAId)}</span>
            </div>
            <span className="text-sky-200 text-xs font-bold shrink-0">vs</span>
            <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
              <span className="text-white font-bold text-sm truncate text-right">{nextMatch.placeholderB || teamName(nextMatch.teamBId)}</span>
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: teamColor(nextMatch.teamBId) }} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px] font-semibold text-sky-100">
            <span className="bg-white/15 rounded-md px-2 py-0.5">{nextMatch.stageLabel}</span>
            <span className="bg-white/15 rounded-md px-2 py-0.5">{nextMatch.court}</span>
            {(nextMatch.date || nextMatch.time) && (
              <span className="bg-white/15 rounded-md px-2 py-0.5">
                {formatShortDate(nextMatch.date)} {nextMatch.time}
              </span>
            )}
          </div>
        </button>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="text-2xl mb-1">🏆</div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Todos los partidos están cargados</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">No hay partidos pendientes en este torneo.</p>
        </div>
      )}

      {/* Mini standings */}
      {podium.length > 0 && (
        <button
          onClick={onGoToStandings}
          className="w-full text-left bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tabla de posiciones</h3>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="space-y-1.5">
            {podium.map((row) => (
              <div key={row.teamId} className="flex items-center gap-2.5">
                <span className="w-5 text-center text-xs font-black text-slate-400 dark:text-slate-500">{row.rank}</span>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.teamColor }} />
                <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{row.teamName}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{row.points} pts</span>
              </div>
            ))}
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Last result */}
        <button
          onClick={onGoToFixture}
          disabled={!lastResult}
          className="text-left bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Último resultado</h3>
          {lastResult ? (
            <>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{teamName(lastResult.teamAId)}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {lastResult.scoreA} - {lastResult.scoreB}
              </p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{teamName(lastResult.teamBId)}</p>
            </>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">Todavía no hay resultados</p>
          )}
        </button>

        {/* Top scorer */}
        <button
          onClick={onGoToScorers}
          disabled={!topScorer}
          className="text-left bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-1 mb-2">
            <Flame className="w-3 h-3 text-rose-500" />
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Goleador</h3>
          </div>
          {topScorer ? (
            <>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{topScorer.playerName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{topScorer.teamName}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight mt-1">{topScorer.goals} goles</p>
            </>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">Todavía sin goles cargados</p>
          )}
        </button>
      </div>

      {/* Recent activity (only meaningful for shared/cloud tournaments) */}
      {activityLog && activityLog.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Actividad reciente</h3>
          <div className="space-y-1.5">
            {activityLog.slice(0, 3).map((entry) => (
              <div key={entry.id} className="text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-200">{entry.by}</span>
                <span className="text-slate-500 dark:text-slate-400"> {entry.message}</span>
                <span className="text-slate-400 dark:text-slate-500"> · {formatLogTime(entry.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onAddTournament}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-xs active:scale-[0.99] transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Torneo</span>
      </button>
    </div>
  );
}
