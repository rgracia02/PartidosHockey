import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  Flag,
  Flame,
  MessageCircle,
  Minus,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { GoalRecord, HockeyCardType, Match, Player, Referee, SanctionRecord, Team } from '../types';
import { compressImageFile } from '../utils/imageCompress';
import { useDialogA11y } from '../utils/useDialogA11y';

interface PostMatchModalProps {
  match: Match;
  teams: Team[];
  referees: Referee[];
  onSave: (updatedMatch: Match, andShare?: boolean) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------------------------
// Piezas chicas de la planilla. Todos los botones miden al menos 44×44 px para poder tocarlos
// con el partido en juego, y llevan nombre accesible (lector de pantalla).
// ---------------------------------------------------------------------------------------------
interface ScoreStepperProps {
  name: string;
  color: string;
  value: number;
  onChange: (next: number) => void;
}

function ScoreStepper({ name, color, value, onChange }: ScoreStepperProps) {
  return (
    <div
      role="group"
      aria-label={`Marcador de ${name}`}
      className="flex flex-col items-center text-center p-1.5 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-800"
    >
      <div className="flex items-center gap-1.5 mb-2 max-w-full px-1">
        <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} aria-hidden="true" />
        <span className="font-bold text-xs text-slate-800 truncate dark:text-slate-200">{name}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Restar un gol a ${name}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-11 h-11 rounded-2xl bg-white border border-slate-300 shadow-xs flex items-center justify-center text-slate-700 active:bg-slate-100 active:scale-90 transition-all dark:bg-slate-900 dark:text-slate-300 dark:border-slate-600 dark:active:bg-slate-700"
        >
          <Minus className="w-4 h-4 stroke-[3]" aria-hidden="true" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          value={value}
          aria-label={`Goles de ${name}`}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-11 h-11 text-center text-3xl font-black text-slate-900 bg-transparent rounded-lg focus-visible:outline-2 focus-visible:outline-sky-600 dark:text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`Sumar un gol a ${name}`}
          onClick={() => onChange(value + 1)}
          className="w-11 h-11 rounded-2xl bg-sky-700 text-white shadow-xs flex items-center justify-center active:bg-sky-800 active:scale-90 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

interface TeamGoalListProps {
  team: Team | undefined;
  name: string;
  color: string;
  goals: GoalRecord[];
  onAdd: (player: Player) => void;
  onDecrease: (playerId: string) => void;
}

function TeamGoalList({ team, name, color, goals, onAdd, onDecrease }: TeamGoalListProps) {
  const players = team?.players ?? [];
  return (
    <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100 dark:bg-slate-800 dark:border-slate-800">
      <p className="text-xs font-bold text-slate-700 mb-2 truncate flex items-center gap-1.5 dark:text-slate-300">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
        {name}
      </p>

      {players.length === 0 ? (
        <p className="text-xs text-slate-600 dark:text-slate-400 px-1 py-2">
          Este equipo no tiene jugadoras/es cargados. Podés agregarlos en Configuración → Equipos.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {players.map((p) => {
            const goal = goals.find((g) => g.playerId === p.id);
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 bg-white pl-3 pr-1.5 py-1 rounded-xl border border-slate-100 text-xs shadow-2xs dark:bg-slate-900 dark:border-slate-800"
              >
                <span className="truncate text-slate-800 font-medium dark:text-slate-200">
                  #{p.number} {p.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {goal && (
                    <button
                      type="button"
                      aria-label={`Quitar un gol a ${p.name}`}
                      onClick={() => onDecrease(p.id)}
                      className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center active:scale-95 dark:text-slate-300 dark:bg-slate-800"
                    >
                      <Minus className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Sumar un gol a ${p.name}${goal ? ` (lleva ${goal.count})` : ''}`}
                    onClick={() => onAdd(p)}
                    className="min-h-[44px] min-w-[64px] px-3 rounded-xl bg-sky-50 text-sky-800 font-bold text-xs hover:bg-sky-100 active:scale-95 dark:bg-sky-950/60 dark:text-sky-300"
                  >
                    {goal ? `(${goal.count}) +1` : '+ Gol'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function PostMatchModal({ match, teams, referees, onSave, onClose }: PostMatchModalProps) {
  const [scoreA, setScoreA] = useState<number>(match.scoreA ?? 0);
  const [scoreB, setScoreB] = useState<number>(match.scoreB ?? 0);
  const [isShootout, setIsShootout] = useState<boolean>(match.isShootout || false);
  const [shootoutScoreA, setShootoutScoreA] = useState<number>(match.shootoutScoreA ?? 0);
  const [shootoutScoreB, setShootoutScoreB] = useState<number>(match.shootoutScoreB ?? 0);
  const [shootoutWinner, setShootoutWinner] = useState<string>(
    match.shootoutWinnerTeamId || match.teamAId || ''
  );

  const [goals, setGoals] = useState<GoalRecord[]>(match.goals ? [...match.goals] : []);
  const [sanctions, setSanctions] = useState<SanctionRecord[]>(
    match.sanctions ? [...match.sanctions] : []
  );
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(match.photoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [referee1Id, setReferee1Id] = useState<string>(match.refereeIds?.[0] || '');
  const [referee2Id, setReferee2Id] = useState<string>(match.refereeIds?.[1] || '');

  // Selected player for sanction form
  const [sanctionPlayerId, setSanctionPlayerId] = useState<string>('');
  const [sanctionCardType, setSanctionCardType] = useState<HockeyCardType>('green');
  const [sanctionMinute, setSanctionMinute] = useState<string>('');

  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);
  const nameA = teamA?.name || match.placeholderA || 'Equipo A';
  const nameB = teamB?.name || match.placeholderB || 'Equipo B';

  const isPlayoffOrKnockout = match.stage !== 'group';
  const isTied = scoreA === scoreB;

  // Goles asignados a jugadores por equipo (para avisar si no coinciden con el marcador).
  const assignedA = goals.filter((g) => g.teamId === match.teamAId).reduce((n, g) => n + g.count, 0);
  const assignedB = goals.filter((g) => g.teamId === match.teamBId).reduce((n, g) => n + g.count, 0);
  const goalsMismatch = assignedA !== scoreA || assignedB !== scoreB;

  // ---- Descartar cambios sin querer ------------------------------------------------------
  // Se guarda una "foto" del estado inicial; si algo cambió, cerrar pide confirmación.
  const buildSnapshot = () =>
    JSON.stringify({
      scoreA,
      scoreB,
      isShootout,
      shootoutScoreA,
      shootoutScoreB,
      shootoutWinner,
      goals,
      sanctions,
      photoUrl,
      referee1Id,
      referee2Id,
    });
  const initialSnapshotRef = useRef<string | null>(null);
  if (initialSnapshotRef.current === null) initialSnapshotRef.current = buildSnapshot();
  const isDirty = buildSnapshot() !== initialSnapshotRef.current;
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const requestClose = () => {
    if (confirmDiscard) {
      setConfirmDiscard(false);
      return;
    }
    if (isDirty) setConfirmDiscard(true);
    else onClose();
  };
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogA11y(dialogRef, requestClose);

  // Goals logic
  const handleAddGoal = (player: Player, teamId: string) => {
    setGoals((prev) => {
      const existing = prev.find((g) => g.playerId === player.id);
      if (existing) {
        return prev.map((g) =>
          g.playerId === player.id ? { ...g, count: g.count + 1 } : g
        );
      }
      return [
        ...prev,
        {
          id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          playerId: player.id,
          playerName: player.name,
          teamId,
          count: 1,
        },
      ];
    });

    // Automatically sync score if desired
    if (teamId === match.teamAId) {
      setScoreA((prev) => prev + 1);
    } else {
      setScoreB((prev) => prev + 1);
    }
  };

  const handleDecreaseGoal = (playerId: string, teamId: string) => {
    setGoals((prev) => {
      const existing = prev.find((g) => g.playerId === playerId);
      if (!existing) return prev;
      if (existing.count <= 1) {
        return prev.filter((g) => g.playerId !== playerId);
      }
      return prev.map((g) =>
        g.playerId === playerId ? { ...g, count: g.count - 1 } : g
      );
    });

    if (teamId === match.teamAId) {
      setScoreA((prev) => Math.max(0, prev - 1));
    } else {
      setScoreB((prev) => Math.max(0, prev - 1));
    }
  };

  // Sanctions logic
  const handleAddSanction = () => {
    if (!sanctionPlayerId) return;

    let foundPlayer: Player | undefined;
    let foundTeamId = '';

    if (teamA?.players.some((p) => p.id === sanctionPlayerId)) {
      foundPlayer = teamA.players.find((p) => p.id === sanctionPlayerId);
      foundTeamId = teamA.id;
    } else if (teamB?.players.some((p) => p.id === sanctionPlayerId)) {
      foundPlayer = teamB.players.find((p) => p.id === sanctionPlayerId);
      foundTeamId = teamB.id;
    }

    if (!foundPlayer) return;

    const newSanction: SanctionRecord = {
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: foundPlayer.id,
      playerName: foundPlayer.name,
      teamId: foundTeamId,
      cardType: sanctionCardType,
      minute: sanctionMinute ? parseInt(sanctionMinute, 10) : undefined,
    };

    setSanctions((prev) => [...prev, newSanction]);
    setSanctionPlayerId('');
    setSanctionMinute('');
  };

  const handleRemoveSanction = (id: string) => {
    setSanctions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    // Se achica antes de guardar: una foto de celular en base64 puede llenar el almacenamiento.
    compressImageFile(file)
      .then((result) => setPhotoUrl(result))
      .catch(() => setPhotoError('No se pudo procesar la foto. Probá con otra.'));
    // Permite volver a elegir el mismo archivo si hace falta.
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (andShare: boolean = false) => {
    const updated: Match = {
      ...match,
      scoreA: Math.max(0, Number(scoreA)),
      scoreB: Math.max(0, Number(scoreB)),
      isCompleted: true,
      isShootout: isPlayoffOrKnockout && isTied ? isShootout : false,
      shootoutScoreA: isShootout ? shootoutScoreA : undefined,
      shootoutScoreB: isShootout ? shootoutScoreB : undefined,
      shootoutWinnerTeamId: isShootout ? shootoutWinner : undefined,
      goals,
      sanctions,
      photoUrl,
      refereeIds: [referee1Id, referee2Id].filter((id) => !!id),
    };

    onSave(updated, andShare);
  };

  return (
    <div
      id="post-match-bottom-sheet"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-0 transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-post-match-title"
        tabIndex={-1}
        className="relative outline-none bg-[#F2F2F7] dark:bg-slate-950 w-full max-w-lg rounded-t-[32px] p-5 pb-safe max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* iOS Drag Handle indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 shrink-0" aria-hidden="true" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 shrink-0 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
              {match.stageLabel} • {match.court}
            </span>
            <h3 id="dlg-post-match-title" className="text-lg font-black text-slate-900 tracking-tight dark:text-white">
              Planilla de Cierre
            </h3>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Cerrar planilla"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-slate-200/80 text-slate-700 hover:bg-slate-300 active:scale-95 transition-all dark:bg-slate-800 dark:text-slate-300"
          >
            <X className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
          {/* Main Score Stepper Box (Apple Style) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider text-center mb-3 dark:text-slate-400">
              Marcador Final
            </h4>

            <div className="grid grid-cols-2 gap-3 items-center">
              <ScoreStepper name={nameA} color={teamA?.color || '#0284c7'} value={scoreA} onChange={setScoreA} />
              <ScoreStepper name={nameB} color={teamB?.color || '#059669'} value={scoreB} onChange={setScoreB} />
            </div>

            {/* Shoot-outs option for Knockout/Playoff matches in case of a tie */}
            {isPlayoffOrKnockout && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center justify-between gap-3 cursor-pointer min-h-[44px]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Definición por Shoot-outs (Penales Australianos)
                  </span>
                  <input
                    type="checkbox"
                    checked={isShootout}
                    onChange={(e) => setIsShootout(e.target.checked)}
                    className="w-6 h-6 shrink-0 accent-sky-700 rounded"
                  />
                </label>

                {isShootout && (
                  <div className="mt-3 p-3 bg-violet-50/80 dark:bg-violet-950/30 rounded-2xl border border-violet-100 dark:border-violet-900/60 space-y-3">
                    <p className="text-xs font-semibold text-violet-900 dark:text-violet-300">
                      Resultado de tanda de Shoot-outs:
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <label htmlFor="pm-so-a" className="block text-xs text-slate-700 font-bold mb-1 truncate dark:text-slate-300">
                          {nameA}
                        </label>
                        <input
                          id="pm-so-a"
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          value={shootoutScoreA}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setShootoutScoreA(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full px-2 min-h-[44px] bg-white border border-violet-300 dark:border-violet-700 rounded-xl text-center font-bold text-sm dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                      <span className="text-sm font-black text-violet-700 dark:text-violet-300 pb-3" aria-hidden="true">-</span>
                      <div className="flex-1 min-w-0">
                        <label htmlFor="pm-so-b" className="block text-xs text-slate-700 font-bold mb-1 truncate dark:text-slate-300">
                          {nameB}
                        </label>
                        <input
                          id="pm-so-b"
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          value={shootoutScoreB}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setShootoutScoreB(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full px-2 min-h-[44px] bg-white border border-violet-300 dark:border-violet-700 rounded-xl text-center font-bold text-sm dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pm-so-winner" className="block text-xs text-slate-700 font-bold mb-1 dark:text-slate-300">
                        Equipo Ganador de la Llave:
                      </label>
                      <select
                        id="pm-so-winner"
                        value={shootoutWinner}
                        onChange={(e) => setShootoutWinner(e.target.value)}
                        className="w-full px-3 min-h-[44px] bg-white border border-violet-300 dark:border-violet-700 rounded-xl text-xs font-bold text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <option value={match.teamAId}>{nameA}</option>
                        <option value={match.teamBId}>{nameB}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Goals Assignment Section */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 mb-3 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider dark:text-slate-200">
                  Goleadores/as del Partido
                </h4>
              </div>
              <span className="text-xs text-slate-600 text-right dark:text-slate-400">Tocá para sumar gol</span>
            </div>

            {goalsMismatch && (assignedA + assignedB > 0 || scoreA + scoreB > 0) && (
              <p
                role="status"
                className="mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200"
              >
                El marcador es {scoreA}-{scoreB}, pero hay {assignedA}-{assignedB} goles con jugadora/or asignado. Podés
                dejarlo así si no sabés quién convirtió.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TeamGoalList
                team={teamA}
                name={nameA}
                color={teamA?.color || '#0284c7'}
                goals={goals}
                onAdd={(p) => handleAddGoal(p, match.teamAId)}
                onDecrease={(id) => handleDecreaseGoal(id, match.teamAId)}
              />
              <TeamGoalList
                team={teamB}
                name={nameB}
                color={teamB?.color || '#059669'}
                goals={goals}
                onAdd={(p) => handleAddGoal(p, match.teamBId)}
                onDecrease={(id) => handleDecreaseGoal(id, match.teamBId)}
              />
            </div>
          </div>

          {/* Sanctions Section (Tarjetas oficiales Hockey) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 mb-3 dark:border-slate-800">
              <ShieldAlert className="w-4 h-4 text-rose-600" aria-hidden="true" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider dark:text-slate-200">
                Tarjetas Oficiales de Hockey
              </h4>
            </div>

            {/* Quick Card Form */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tipo de tarjeta">
                <button
                  type="button"
                  aria-pressed={sanctionCardType === 'green'}
                  onClick={() => setSanctionCardType('green')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 min-h-[48px] ${
                    sanctionCardType === 'green'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  <span>🟢 Verde</span>
                  <span className="text-[11px] font-semibold">(2 min)</span>
                </button>

                <button
                  type="button"
                  aria-pressed={sanctionCardType === 'yellow'}
                  onClick={() => setSanctionCardType('yellow')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 min-h-[48px] ${
                    sanctionCardType === 'yellow'
                      ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs'
                      : 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  }`}
                >
                  <span>🟡 Amarilla</span>
                  <span className="text-[11px] font-semibold">(5/10 min)</span>
                </button>

                <button
                  type="button"
                  aria-pressed={sanctionCardType === 'red'}
                  onClick={() => setSanctionCardType('red')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 min-h-[48px] ${
                    sanctionCardType === 'red'
                      ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                      : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  <span>🔴 Roja</span>
                  <span className="text-[11px] font-semibold">(Expulsión)</span>
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  aria-label="Jugadora o jugador a sancionar"
                  value={sanctionPlayerId}
                  onChange={(e) => setSanctionPlayerId(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 min-h-[44px] dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="">Seleccionar jugadora/or...</option>
                  <optgroup label={nameA}>
                    {teamA?.players.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={nameB}>
                    {teamB?.players.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} {p.name}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <button
                  type="button"
                  onClick={handleAddSanction}
                  disabled={!sanctionPlayerId}
                  className="px-4 py-2.5 bg-slate-900 active:bg-black text-white font-bold text-xs rounded-2xl disabled:opacity-40 min-h-[44px] shrink-0 active:scale-95 transition-all dark:bg-slate-100 dark:text-slate-900"
                >
                  + Aplicar
                </button>
              </div>

              {/* Sanctions List */}
              {sanctions.length > 0 && (
                <ul className="flex flex-wrap gap-1.5 pt-2">
                  {sanctions.map((s) => (
                    <li
                      key={s.id}
                      className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-xl text-xs font-semibold ${
                        s.cardType === 'green'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : s.cardType === 'yellow'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <span aria-hidden="true">
                        {s.cardType === 'green' ? '🟢' : s.cardType === 'yellow' ? '🟡' : '🔴'}
                      </span>
                      <span>
                        <span className="sr-only">
                          {s.cardType === 'green' ? 'Tarjeta verde: ' : s.cardType === 'yellow' ? 'Tarjeta amarilla: ' : 'Tarjeta roja: '}
                        </span>
                        {s.playerName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSanction(s.id)}
                        aria-label={`Quitar tarjeta de ${s.playerName}`}
                        className="w-11 h-11 -my-2 flex items-center justify-center rounded-xl text-slate-700 hover:text-rose-700 dark:text-slate-300"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Referees, for tracking who officiated each match */}
          {referees.length > 0 && (
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Flag className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none dark:text-white">Árbitros</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Opcional • Para contabilizar arbitrajes</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="pm-ref-1" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Árbitro 1
                  </label>
                  <select
                    id="pm-ref-1"
                    value={referee1Id}
                    onChange={(e) => setReferee1Id(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white min-h-[44px]"
                  >
                    <option value="">Sin asignar</option>
                    {referees.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="pm-ref-2" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Árbitro 2
                  </label>
                  <select
                    id="pm-ref-2"
                    value={referee2Id}
                    onChange={(e) => setReferee2Id(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white min-h-[44px]"
                  >
                    <option value="">Sin asignar</option>
                    {referees.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Optional Match Photo Upload */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none dark:text-white">Foto del Partido</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Opcional • Para compartir en WhatsApp</p>
                </div>
              </div>
            </div>

            {photoUrl ? (
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-black/5 dark:border-slate-700">
                  <img
                    src={photoUrl}
                    alt="Foto del partido"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[44px] rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                  >
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>Cambiar foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="min-h-[44px] rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>Quitar foto</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[48px] py-3 px-3 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl bg-slate-50 text-center transition-all flex items-center justify-center gap-2 active:scale-[0.99] dark:bg-slate-800 dark:border-slate-600"
              >
                <Camera className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Subir foto o planilla</span>
              </button>
            )}

            {photoError && (
              <p role="alert" className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                {photoError}
              </p>
            )}

            {/* Sin "capture": así el celular ofrece cámara O galería (por ejemplo, para subir una planilla escaneada). */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="Elegir foto del partido"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Action Buttons: Guardar Planilla y Guardar + Compartir WhatsApp */}
        <div className="pt-3 border-t border-slate-200/80 shrink-0 flex flex-col gap-2 dark:border-slate-800">
          <button
            id="btn-save-and-share-whatsapp"
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full py-3.5 bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-2xl shadow-sm text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all min-h-[48px]"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" aria-hidden="true" />
            <span>Guardar y Compartir en WhatsApp</span>
          </button>

          <button
            id="btn-save-match"
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full py-3 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-400 text-slate-900 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all min-h-[48px] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>Guardar Planilla</span>
          </button>
        </div>

        {/* Confirmación antes de descartar cambios sin guardar */}
        {confirmDiscard && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dlg-discard-title"
            aria-describedby="dlg-discard-desc"
            className="absolute inset-0 z-10 flex items-end justify-center bg-black/40 p-4"
          >
            <div className="w-full rounded-3xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <h4 id="dlg-discard-title" className="text-base font-black text-slate-900 dark:text-white">
                ¿Descartar los cambios?
              </h4>
              <p id="dlg-discard-desc" className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Cargaste datos en la planilla que todavía no se guardaron.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirmDiscard(false)}
                  className="min-h-[48px] rounded-2xl bg-sky-700 active:bg-sky-800 text-white text-sm font-bold"
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[48px] rounded-2xl bg-white border border-rose-300 text-rose-800 text-sm font-bold dark:bg-slate-800 dark:border-rose-800 dark:text-rose-300"
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
