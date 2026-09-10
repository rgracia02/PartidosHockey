import { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Share2 } from 'lucide-react';
import { Match, Team } from '../types';

interface FixtureViewProps {
  matches: Match[];
  teams: Team[];
  onSelectMatch: (match: Match) => void;
  onShareResults?: (roundLabel?: string) => void;
  onShareSingleMatch?: (match: Match) => void;
}

export function FixtureView({
  matches,
  teams,
  onSelectMatch,
  onShareResults,
  onShareSingleMatch,
}: FixtureViewProps) {
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>('all');

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Get unique stage labels for filter bar
  const roundLabels = Array.from(
    new Set(matches.map((m) => m.stageLabel || `Fecha ${m.round}`))
  );

  const filteredMatches = matches.filter((m) => {
    if (selectedRoundFilter === 'all') return true;
    return (m.stageLabel || `Fecha ${m.round}`) === selectedRoundFilter;
  });

  const pendingCount = matches.filter((m) => !m.isCompleted).length;

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Horizontal Round/Stage Selector Scrollbar (iOS Segmented Style) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar flex-1">
          <button
            onClick={() => setSelectedRoundFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 min-h-[36px] ${
              selectedRoundFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            Todos ({matches.length})
          </button>
          {roundLabels.map((label) => {
            const isSelected = selectedRoundFilter === label;
            return (
              <button
                key={label}
                onClick={() => setSelectedRoundFilter(label)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 min-h-[36px] ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {onShareResults && matches.length > 0 && (
          <button
            id="btn-share-results-whatsapp"
            onClick={() => onShareResults(selectedRoundFilter)}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 font-bold rounded-full text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 min-h-[36px] border border-emerald-200/60 shadow-xs"
            title="Compartir resultados de esta jornada en WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[11px] font-bold">
              {selectedRoundFilter === 'all' ? 'Compartir' : `Compartir ${selectedRoundFilter}`}
            </span>
          </button>
        )}
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/60 shadow-xs">
            <p className="text-xs text-slate-400 font-medium">No hay partidos en esta fecha.</p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const teamA = teamMap.get(match.teamAId);
            const teamB = teamMap.get(match.teamBId);
            const nameA = teamA?.name || match.placeholderA || 'Por Definir';
            const nameB = teamB?.name || match.placeholderB || 'Por Definir';
            const colorA = teamA?.color || '#94a3b8';
            const colorB = teamB?.color || '#94a3b8';

            const isPlayoff = match.stage !== 'group';

            return (
              <div
                key={match.id}
                id={`match-card-${match.id}`}
                onClick={() => onSelectMatch(match)}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/70 active:scale-[0.985] active:border-sky-300 transition-all cursor-pointer hover:shadow-md"
              >
                {/* Match Header Badge Row */}
                <div className="flex items-center justify-between text-[11px] mb-2.5 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        isPlayoff
                          ? 'bg-amber-100 text-amber-900 font-black'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {match.stageLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold">
                      {match.court}
                    </span>
                    {match.photoUrl && (
                      <span className="px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 font-bold flex items-center gap-0.5 text-[10px]">
                        📸 Foto
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onShareSingleMatch && (
                      <button
                        type="button"
                        id={`btn-share-match-${match.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareSingleMatch(match);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center gap-1 transition-colors active:scale-95 border border-emerald-200/50"
                        title="Compartir este partido por WhatsApp"
                      >
                        <Share2 className="w-3 h-3 stroke-[2.5]" />
                        <span>Compartir</span>
                      </button>
                    )}

                    {match.isCompleted ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[10px]">
                        Finalizado ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-[10px]">
                        Planilla ✎
                      </span>
                    )}
                  </div>
                </div>

                {/* Score and Teams Main Line */}
                <div className="flex items-center justify-between gap-3 py-1">
                  {/* Team A */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                      style={{ backgroundColor: colorA }}
                    />
                    <span className="font-bold text-sm text-slate-900 truncate">{nameA}</span>
                  </div>

                  {/* Score Pill */}
                  <div className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-slate-100/90 rounded-2xl font-black text-slate-900 shrink-0 min-w-[72px]">
                    <span className="text-base">
                      {match.scoreA !== null ? match.scoreA : '-'}
                    </span>
                    <span className="text-slate-300 text-xs font-bold">:</span>
                    <span className="text-base">
                      {match.scoreB !== null ? match.scoreB : '-'}
                    </span>
                  </div>

                  {/* Team B */}
                  <div className="flex items-center gap-2 flex-1 justify-end min-w-0 text-right">
                    <span className="font-bold text-sm text-slate-900 truncate">{nameB}</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                      style={{ backgroundColor: colorB }}
                    />
                  </div>
                </div>

                {/* Shoot-out indicator */}
                {match.isShootout && (
                  <div className="mt-1 text-center text-[10px] font-bold text-purple-700 bg-purple-50 py-0.5 rounded-md">
                    Definición por Shoot-outs (SO: {match.shootoutScoreA ?? 0} - {match.shootoutScoreB ?? 0})
                  </div>
                )}

                {/* Scorers & Cards Details if completed */}
                {match.isCompleted && (match.goals?.length > 0 || match.sanctions?.length > 0) && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
                    {match.goals?.length > 0 && (
                      <div className="flex items-start gap-1">
                        <span className="text-xs">🏑</span>
                        <span className="truncate">
                          {match.goals
                            .map((g) => `${g.playerName}${g.count > 1 ? ` (x${g.count})` : ''}`)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {match.sanctions?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {match.sanctions.map((s) => (
                          <span
                            key={s.id}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              s.cardType === 'green'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.cardType === 'yellow'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.cardType === 'green' ? '🟢' : s.cardType === 'yellow' ? '🟡' : '🔴'}{' '}
                            {s.playerName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
