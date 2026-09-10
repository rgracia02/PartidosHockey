import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  Flame,
  MessageCircle,
  Minus,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { GoalRecord, HockeyCardType, Match, Player, SanctionRecord, Team } from '../types';

interface PostMatchModalProps {
  match: Match;
  teams: Team[];
  onSave: (updatedMatch: Match, andShare?: boolean) => void;
  onClose: () => void;
}

export function PostMatchModal({ match, teams, onSave, onClose }: PostMatchModalProps) {
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
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
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
    };

    onSave(updated, andShare);
  };

  return (
    <div
      id="post-match-bottom-sheet"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-0 transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#F2F2F7] w-full max-w-lg rounded-t-[32px] p-5 pb-safe max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* iOS Drag Handle indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 shrink-0" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                {match.stageLabel} • {match.court}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Planilla de Cierre</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-200/80 text-slate-700 hover:bg-slate-300 active:scale-95 transition-all"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
          {/* Main Score Stepper Box (Apple Style) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Marcador Final
            </h4>

            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Team A Counter */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-2 max-w-full">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: teamA?.color || '#0284c7' }}
                  />
                  <span className="font-bold text-xs text-slate-800 truncate">{nameA}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScoreA((prev) => Math.max(0, prev - 1))}
                    className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center font-bold text-slate-700 active:bg-slate-100 active:scale-90 transition-all text-lg"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={scoreA}
                    onChange={(e) => setScoreA(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 text-center text-3xl font-black text-slate-900 bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={() => setScoreA((prev) => prev + 1)}
                    className="w-10 h-10 rounded-2xl bg-sky-600 text-white shadow-xs flex items-center justify-center font-bold active:bg-sky-700 active:scale-90 transition-all text-lg"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Team B Counter */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-2 max-w-full">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: teamB?.color || '#059669' }}
                  />
                  <span className="font-bold text-xs text-slate-800 truncate">{nameB}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScoreB((prev) => Math.max(0, prev - 1))}
                    className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center font-bold text-slate-700 active:bg-slate-100 active:scale-90 transition-all text-lg"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={scoreB}
                    onChange={(e) => setScoreB(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 text-center text-3xl font-black text-slate-900 bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={() => setScoreB((prev) => prev + 1)}
                    className="w-10 h-10 rounded-2xl bg-sky-600 text-white shadow-xs flex items-center justify-center font-bold active:bg-sky-700 active:scale-90 transition-all text-lg"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Shoot-outs option for Knockout/Playoff matches in case of a tie */}
            {isPlayoffOrKnockout && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-xs font-bold text-slate-800">
                    Definición por Shoot-outs (Penales Australianos)
                  </span>
                  <input
                    type="checkbox"
                    checked={isShootout}
                    onChange={(e) => setIsShootout(e.target.checked)}
                    className="w-5 h-5 accent-sky-600 rounded"
                  />
                </label>

                {isShootout && (
                  <div className="mt-3 p-3 bg-purple-50/80 rounded-2xl border border-purple-100 space-y-3">
                    <p className="text-[11px] font-semibold text-purple-900">
                      Resultado de tanda de Shoot-outs:
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-600 font-bold mb-1 truncate">
                          {nameA}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={shootoutScoreA}
                          onChange={(e) => setShootoutScoreA(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-purple-200 rounded-xl text-center font-bold text-sm"
                        />
                      </div>
                      <span className="text-xs font-black text-purple-400 mt-4">-</span>
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-600 font-bold mb-1 truncate">
                          {nameB}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={shootoutScoreB}
                          onChange={(e) => setShootoutScoreB(Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-purple-200 rounded-xl text-center font-bold text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold mb-1">
                        Equipo Ganador de la Llave:
                      </label>
                      <select
                        value={shootoutWinner}
                        onChange={(e) => setShootoutWinner(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800"
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
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Goleadores/as del Partido
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Toca para sumar gol</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Team A Players */}
              <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-700 mb-2 truncate flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: teamA?.color || '#0284c7' }}
                  />
                  {nameA}
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
                  {teamA?.players.map((p) => {
                    const goal = goals.find((g) => g.playerId === p.id);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100 text-xs shadow-2xs"
                      >
                        <span className="truncate text-slate-800 font-medium">
                          #{p.number} {p.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {goal && (
                            <button
                              onClick={() => handleDecreaseGoal(p.id, teamA.id)}
                              className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                          )}
                          <button
                            onClick={() => handleAddGoal(p, teamA.id)}
                            className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 active:scale-95"
                          >
                            {goal ? `(${goal.count}) +1` : '+ Gol'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team B Players */}
              <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-700 mb-2 truncate flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: teamB?.color || '#059669' }}
                  />
                  {nameB}
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
                  {teamB?.players.map((p) => {
                    const goal = goals.find((g) => g.playerId === p.id);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100 text-xs shadow-2xs"
                      >
                        <span className="truncate text-slate-800 font-medium">
                          #{p.number} {p.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {goal && (
                            <button
                              onClick={() => handleDecreaseGoal(p.id, teamB.id)}
                              className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                          )}
                          <button
                            onClick={() => handleAddGoal(p, teamB.id)}
                            className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 active:scale-95"
                          >
                            {goal ? `(${goal.count}) +1` : '+ Gol'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sanctions Section (Tarjetas oficiales Hockey) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 mb-3">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tarjetas Oficiales de Hockey
              </h4>
            </div>

            {/* Quick Card Form */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSanctionCardType('green')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 min-h-[44px] ${
                    sanctionCardType === 'green'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs scale-[1.02]'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <span>🟢 Verde</span>
                  <span className="text-[9px] opacity-80">(2 min)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSanctionCardType('yellow')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 min-h-[44px] ${
                    sanctionCardType === 'yellow'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-[1.02]'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <span>🟡 Amarilla</span>
                  <span className="text-[9px] opacity-80">(5/10 min)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSanctionCardType('red')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 min-h-[44px] ${
                    sanctionCardType === 'red'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs scale-[1.02]'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span>🔴 Roja</span>
                  <span className="text-[9px] opacity-80">(Expulsión)</span>
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={sanctionPlayerId}
                  onChange={(e) => setSanctionPlayerId(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 min-h-[44px]"
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
                  className="px-4 py-2.5 bg-slate-900 active:bg-black text-white font-bold text-xs rounded-2xl disabled:opacity-40 min-h-[44px] shrink-0 active:scale-95 transition-all"
                >
                  + Aplicar
                </button>
              </div>

              {/* Sanctions List */}
              {sanctions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {sanctions.map((s) => (
                    <div
                      key={s.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                        s.cardType === 'green'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : s.cardType === 'yellow'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <span>
                        {s.cardType === 'green' ? '🟢' : s.cardType === 'yellow' ? '🟡' : '🔴'}
                      </span>
                      <span>{s.playerName}</span>
                      <button
                        onClick={() => handleRemoveSanction(s.id)}
                        className="ml-1 text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional Match Photo Upload */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">Foto del Partido</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Opcional • Para compartir en WhatsApp</p>
                </div>
              </div>
            </div>

            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-black/5 flex items-center justify-center group">
                <img
                  src={photoUrl}
                  alt="Foto del partido"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white rounded-full text-slate-800 text-xs font-bold flex items-center gap-1 shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cambiar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 bg-rose-600 text-white rounded-full text-xs font-bold shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full sm:hidden"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-3 border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-2xl bg-slate-50 text-center transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Camera className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-bold text-slate-700">Subir foto o planilla</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Action Buttons: Guardar Planilla y Guardar + Compartir WhatsApp */}
        <div className="pt-3 border-t border-slate-200/80 shrink-0 flex flex-col gap-2">
          <button
            id="btn-save-and-share-whatsapp"
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full py-3.5 bg-emerald-600 active:bg-emerald-700 text-white font-black rounded-2xl shadow-sm text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all min-h-[46px]"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Guardar y Compartir en WhatsApp</span>
          </button>

          <button
            id="btn-save-match"
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all min-h-[42px]"
          >
            <Check className="w-4 h-4 text-slate-600 stroke-[2.5]" />
            <span>Guardar Planilla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
