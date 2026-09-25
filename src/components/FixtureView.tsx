import { useState } from 'react';
import { Layers, Camera, Share2, Star } from 'lucide-react';
import { Match, Team, TournamentData } from '../types';
import { getFavoriteTeam, setFavoriteTeam } from '../utils/favorites';

interface FixtureViewProps {
  matches: Match[];
  teams: Team[];
  tournamentId: string;
  onSelectMatch: (match: Match) => void;
  onShareResults?: (roundLabel?: string) => void;
  onShareFixtureImage?: () => void;
  onShareSingleMatch?: (match: Match) => void;
  linkedTournaments?: TournamentData[];
  currentTournamentId?: string;
  currentCategory?: string;
  onSelectForeignMatch?: (tournamentId: string, match: Match) => void;
}

interface MatchCardProps {
  match: Match;
  teams: Team[];
  onShareSingleMatch?: (match: Match) => void;
  onClick: () => void;
  categoryTag?: string;
  categoryColor?: string;
  favoriteTeamId?: string | null;
}

function MatchCard({ match, teams, onShareSingleMatch, onClick, categoryTag, categoryColor, favoriteTeamId }: MatchCardProps) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const teamA = teamMap.get(match.teamAId);
  const teamB = teamMap.get(match.teamBId);
  const nameA = teamA?.name || match.placeholderA || 'Por Definir';
  const nameB = teamB?.name || match.placeholderB || 'Por Definir';
  const colorA = teamA?.color || '#94a3b8';
  const colorB = teamB?.color || '#94a3b8';
  const isPlayoff = match.stage !== 'group';
  const involvesFavorite = !!favoriteTeamId && (match.teamAId === favoriteTeamId || match.teamBId === favoriteTeamId);

  return (
    <div
      id={`match-card-${match.id}`}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border active:scale-[0.985] transition-all cursor-pointer hover:shadow-md ${
        involvesFavorite
          ? 'border-amber-300 dark:border-amber-700 ring-1 ring-amber-200/60 dark:ring-amber-800/40'
          : 'border-slate-200/70 dark:border-slate-800 active:border-sky-300 dark:active:border-sky-700'
      }`}
    >
      {/* Match Header Badge Row */}
      <div className="flex items-center justify-between text-[11px] mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoryTag && (
            <span
              className="px-2 py-0.5 rounded-md font-black text-white"
              style={{ backgroundColor: categoryColor || '#64748b' }}
            >
              {categoryTag}
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded-md font-bold ${
              isPlayoff
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {match.stageLabel}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-semibold">
            {match.court}
          </span>
          {(match.date || match.time) && (
            <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-semibold">
              🕒 {match.date ? formatShortDate(match.date) : ''}{match.date && match.time ? ' · ' : ''}{match.time || ''}
            </span>
          )}
          {match.photoUrl && (
            <span className="px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-bold flex items-center gap-0.5 text-[10px]">
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
              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition-colors active:scale-95 border border-emerald-200/50 dark:border-emerald-800/50"
              title="Compartir este partido por WhatsApp"
            >
              <Share2 className="w-3 h-3 stroke-[2.5]" />
              <span>Compartir</span>
            </button>
          )}

          {match.isCompleted ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-full text-[10px]">
              Finalizado ✓
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-full text-[10px]">
              Planilla ✎
            </span>
          )}
        </div>
      </div>

      {/* Score and Teams Main Line */}
      <div className="flex items-center justify-between gap-2 py-1">
        {/* Team A */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20"
            style={{ backgroundColor: colorA }}
          />
          <span
            className={`text-sm truncate ${
              match.teamAId === favoriteTeamId
                ? 'font-black text-amber-700 dark:text-amber-400'
                : 'font-bold text-slate-900 dark:text-slate-100'
            }`}
          >
            {nameA}
          </span>
          {match.teamAId === favoriteTeamId && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
        </div>

        {/* Big centered score, FotMob-style */}
        <div className="flex items-center justify-center gap-2 shrink-0 min-w-[64px]">
          <span className={`text-2xl leading-none tabular-nums ${match.isCompleted ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-300 dark:text-slate-600'}`}>
            {match.scoreA !== null ? match.scoreA : '-'}
          </span>
          <span className="text-slate-300 dark:text-slate-600 text-sm font-bold">:</span>
          <span className={`text-2xl leading-none tabular-nums ${match.isCompleted ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-300 dark:text-slate-600'}`}>
            {match.scoreB !== null ? match.scoreB : '-'}
          </span>
        </div>

        {/* Team B */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0 text-right">
          {match.teamBId === favoriteTeamId && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
          <span
            className={`text-sm truncate ${
              match.teamBId === favoriteTeamId
                ? 'font-black text-amber-700 dark:text-amber-400'
                : 'font-bold text-slate-900 dark:text-slate-100'
            }`}
          >
            {nameB}
          </span>
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20"
            style={{ backgroundColor: colorB }}
          />
        </div>
      </div>

      {/* Shoot-out indicator */}
      {match.isShootout && (
        <div className="mt-1 text-center text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 py-0.5 rounded-md">
          Definición por Shoot-outs (SO: {match.shootoutScoreA ?? 0} - {match.shootoutScoreB ?? 0})
        </div>
      )}

      {/* Scorers & Cards Details if completed */}
      {match.isCompleted && (match.goals?.length > 0 || match.sanctions?.length > 0) && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
          {match.goals?.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                {match.goals
                  .filter((g) => g.teamId === match.teamAId)
                  .map((g) => (
                    <div key={g.id} className="flex items-center gap-1 truncate">
                      <span className="text-[10px] shrink-0">🏑</span>
                      <span className="truncate">
                        {g.playerName}
                        {g.count > 1 ? ` (x${g.count})` : ''}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="space-y-0.5 text-right">
                {match.goals
                  .filter((g) => g.teamId === match.teamBId)
                  .map((g) => (
                    <div key={g.id} className="flex items-center justify-end gap-1 truncate">
                      <span className="truncate">
                        {g.playerName}
                        {g.count > 1 ? ` (x${g.count})` : ''}
                      </span>
                      <span className="text-[10px] shrink-0">🏑</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {match.sanctions?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {match.sanctions.map((s) => (
                <span
                  key={s.id}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    s.cardType === 'green'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                      : s.cardType === 'yellow'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
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
}

function formatShortDate(isoDate: string): string {
  // isoDate is "YYYY-MM-DD" from a <input type="date">; parse manually to avoid timezone shifts.
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

const CATEGORY_TAG_COLORS = ['#0284c7', '#dc2626', '#059669', '#7c3aed', '#d97706'];

export function FixtureView({
  matches,
  teams,
  tournamentId,
  onSelectMatch,
  onShareResults,
  onShareFixtureImage,
  onShareSingleMatch,
  linkedTournaments = [],
  currentTournamentId,
  currentCategory,
  onSelectForeignMatch,
}: FixtureViewProps) {
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'own' | 'combined'>('own');
  const [favoriteTeamId, setFavoriteTeamIdState] = useState<string | null>(() => getFavoriteTeam(tournamentId));
  const [onlyFavorite, setOnlyFavorite] = useState(false);

  const favoriteTeam = teams.find((t) => t.id === favoriteTeamId) || null;

  const isCombined = viewMode === 'combined' && linkedTournaments.length > 0;

  // Get unique stage labels for filter bar (own tournament, or union with linked ones in combined mode),
  // sorted by round number so a manually-reordered "Fecha 2" always appears after "Fecha 1"
  // regardless of where that match sits in the underlying matches array.
  const STAGE_SORT_WEIGHT: Record<string, number> = { group: 0, quarter: 1, semi: 2, third_place: 3, final: 4 };
  const roundLabels = Array.from(
    (isCombined ? [matches, ...linkedTournaments.map((t) => t.matches)].flat() : matches).reduce((map, m) => {
      const label = m.stageLabel || `Fecha ${m.round}`;
      if (!map.has(label)) {
        map.set(label, { round: m.round, stageWeight: STAGE_SORT_WEIGHT[m.stage] ?? 0 });
      }
      return map;
    }, new Map<string, { round: number; stageWeight: number }>())
  )
    .sort((a, b) => a[1].stageWeight - b[1].stageWeight || a[1].round - b[1].round)
    .map(([label]) => label);

  // Build the list of entries to render in combined mode: one entry per match, tagged with its own tournament/category
  const combinedEntries = isCombined
    ? [
        { id: currentTournamentId || 'current', category: currentCategory || 'Este torneo', teams, matches, isOwn: true },
        ...linkedTournaments.map((t) => ({
          id: t.config.id,
          category: t.config.category || t.config.name,
          teams: t.teams,
          matches: t.matches,
          isOwn: false,
        })),
      ]
        .flatMap((entry, entryIdx) =>
          entry.matches
            .filter((m) => selectedRoundFilter === 'all' || (m.stageLabel || `Fecha ${m.round}`) === selectedRoundFilter)
            .map((m) => ({
              match: m,
              teams: entry.teams,
              tournamentId: entry.id,
              categoryTag: entry.category,
              categoryColor: CATEGORY_TAG_COLORS[entryIdx % CATEGORY_TAG_COLORS.length],
              isOwn: entry.isOwn,
            }))
        )
        .sort((a, b) => a.match.court.localeCompare(b.match.court))
    : [];

  const filteredMatches = matches
    .filter((m) => {
      if (selectedRoundFilter !== 'all' && (m.stageLabel || `Fecha ${m.round}`) !== selectedRoundFilter) return false;
      if (onlyFavorite && favoriteTeamId && m.teamAId !== favoriteTeamId && m.teamBId !== favoriteTeamId) return false;
      return true;
    })
    .sort((a, b) => {
      const weightA = STAGE_SORT_WEIGHT[a.stage] ?? 0;
      const weightB = STAGE_SORT_WEIGHT[b.stage] ?? 0;
      return weightA - weightB || a.round - b.round || a.court.localeCompare(b.court);
    });

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Own / Combined toggle */}
      {linkedTournaments.length > 0 && (
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setViewMode('own')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
              viewMode === 'own'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Solo este torneo
          </button>
          <button
            onClick={() => setViewMode('combined')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
              viewMode === 'combined'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Evento Combinado</span>
          </button>
        </div>
      )}

      {/* Horizontal Round/Stage Selector Scrollbar (iOS Segmented Style) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar flex-1">
          <button
            onClick={() => setSelectedRoundFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 min-h-[36px] ${
              selectedRoundFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({isCombined ? combinedEntries.length : matches.length})
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
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {!isCombined && onShareResults && matches.length > 0 && (
          <button
            id="btn-share-results-whatsapp"
            onClick={() => onShareResults(selectedRoundFilter)}
            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:bg-emerald-200 font-bold rounded-full text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 min-h-[36px] border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs"
            title="Compartir resultados de esta jornada en WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[11px] font-bold">
              {selectedRoundFilter === 'all' ? 'Compartir' : `Compartir ${selectedRoundFilter}`}
            </span>
          </button>
        )}
        {!isCombined && onShareFixtureImage && matches.length > 0 && (
          <button
            id="btn-share-fixture-image"
            onClick={onShareFixtureImage}
            className="p-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 active:bg-sky-200 font-bold rounded-full transition-all active:scale-95 shrink-0 border border-sky-200/60 dark:border-sky-800/60 shadow-xs"
            title="Compartir fixture como imagen"
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {isCombined && (
        <p className="text-xs text-slate-500 dark:text-slate-400 px-1 -mt-1">
          Mostrando: {[currentCategory || 'Este torneo', ...linkedTournaments.map((t) => t.config.category || t.config.name)].join(' · ')}. Tocá un partido de otra categoría para cambiar de torneo y cargar su resultado.
        </p>
      )}

      {/* Favorite team picker + quick filter */}
      {!isCombined && teams.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={favoriteTeamId || ''}
            onChange={(e) => {
              const id = e.target.value || null;
              setFavoriteTeamIdState(id);
              setFavoriteTeam(tournamentId, id);
              if (!id) setOnlyFavorite(false);
            }}
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[36px]"
          >
            <option value="">⭐ Elegir equipo favorito...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {favoriteTeam && (
            <button
              onClick={() => setOnlyFavorite((v) => !v)}
              className={`shrink-0 px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 min-h-[36px] transition-all active:scale-95 ${
                onlyFavorite
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorite ? 'fill-white' : 'fill-amber-400 text-amber-400'}`} />
              <span className="truncate max-w-[100px]">{favoriteTeam.name}</span>
            </button>
          )}
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-3">
        {isCombined ? (
          combinedEntries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200/60 dark:border-slate-800 shadow-xs transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No hay partidos en esta fecha.</p>
            </div>
          ) : (
            combinedEntries.map(({ match, teams: entryTeams, tournamentId, categoryTag, categoryColor, isOwn }) => (
              <MatchCard
                key={`${tournamentId}-${match.id}`}
                match={match}
                teams={entryTeams}
                categoryTag={categoryTag}
                categoryColor={categoryColor}
                onShareSingleMatch={isOwn ? onShareSingleMatch : undefined}
                favoriteTeamId={isOwn ? favoriteTeamId : null}
                onClick={() => {
                  if (isOwn) {
                    onSelectMatch(match);
                  } else if (onSelectForeignMatch) {
                    onSelectForeignMatch(tournamentId, match);
                  }
                }}
              />
            ))
          )
        ) : filteredMatches.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200/60 dark:border-slate-800 shadow-xs transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No hay partidos en esta fecha.</p>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              teams={teams}
              onShareSingleMatch={onShareSingleMatch}
              favoriteTeamId={favoriteTeamId}
              onClick={() => onSelectMatch(match)}
            />
          ))
        )}
      </div>
    </div>
  );
}
