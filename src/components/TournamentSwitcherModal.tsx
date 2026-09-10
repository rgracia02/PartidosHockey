import React, { useState, type FormEvent } from 'react';
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Layers,
  Plus,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { Team, TournamentConfig, TournamentData, TournamentFormat, TournamentStatus } from '../types';

interface TournamentSwitcherModalProps {
  tournaments: TournamentData[];
  activeTournamentId: string;
  onSelectTournament: (id: string) => void;
  onCreateTournament: (
    name: string,
    category: string,
    season: string,
    status: TournamentStatus,
    format: TournamentFormat,
    courtsCount: number,
    sourceTournamentId?: string
  ) => void;
  onClose: () => void;
}

export function TournamentSwitcherModal({
  tournaments,
  activeTournamentId,
  onSelectTournament,
  onCreateTournament,
  onClose,
}: TournamentSwitcherModalProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');
  const [isCreating, setIsCreating] = useState(false);

  // New Tournament Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Primera Damas');
  const [newSeason, setNewSeason] = useState(`${new Date().getFullYear()}`);
  const [newStatus, setNewStatus] = useState<TournamentStatus>('upcoming');
  const [newFormat, setNewFormat] = useState<TournamentFormat>('groups_playoffs_semis');
  const [newCourtsCount, setNewCourtsCount] = useState(2);
  const [sourceTournamentId, setSourceTournamentId] = useState<string>('none');

  const filteredTournaments = tournaments.filter((t) => {
    if (filter === 'all') return true;
    return t.config.status === filter;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onCreateTournament(
      newName.trim(),
      newCategory.trim(),
      newSeason.trim(),
      newStatus,
      newFormat,
      newCourtsCount,
      sourceTournamentId !== 'none' ? sourceTournamentId : undefined
    );
    setIsCreating(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[32px] sm:rounded-3xl p-5 pb-safe shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5 duration-200 transition-colors border border-transparent dark:border-slate-800">
        {/* Modal Header */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isCreating ? 'Crear Nuevo Torneo' : 'Mis Torneos'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isCreating
                  ? 'Configura las bases de la nueva competencia'
                  : `${tournaments.length} torneos registrados en la app`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode: Create New Tournament */}
        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="py-4 space-y-3.5 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Nombre del Torneo *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Torneo Clausura 2026, Seven Nocturno..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Categoría</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ej. Primera Damas, Sub-16"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Año / Temporada</label>
                <input
                  type="text"
                  value={newSeason}
                  onChange={(e) => setNewSeason(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Estado</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TournamentStatus)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
                >
                  <option value="upcoming">⏳ Próximo / Por Iniciar</option>
                  <option value="active">🟢 En Curso</option>
                  <option value="completed">🏁 Finalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Canchas</label>
                <select
                  value={newCourtsCount}
                  onChange={(e) => setNewCourtsCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
                >
                  <option value="1">1 Cancha</option>
                  <option value="2">2 Canchas</option>
                  <option value="3">3 Canchas</option>
                  <option value="4">4 Canchas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Formato de Competición
              </label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value as TournamentFormat)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              >
                <option value="groups_playoffs_semis">Grupos + Semifinales (Top 4) + Final</option>
                <option value="groups_playoffs_final">Grupos + Final Directa (1° vs 2°)</option>
                <option value="groups_playoffs_quarters">Grupos + Cuartos + Semis + Final</option>
                <option value="groups_only">Liga Simple (Todos contra todos)</option>
                <option value="knockout_only">Eliminación Directa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Copiar Equipos y Jugadores/as</span>
                <span className="text-[10px] font-normal text-slate-400">Opcional</span>
              </label>
              <select
                value={sourceTournamentId}
                onChange={(e) => setSourceTournamentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              >
                <option value="none">Sin equipos previos (Crear desde cero)</option>
                {tournaments.map((t) => (
                  <option key={t.config.id} value={t.config.id}>
                    Copiar de: {t.config.name} ({t.teams.length} equipos)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs min-h-[44px] transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-sky-600 active:bg-sky-700 text-white font-bold rounded-2xl text-xs min-h-[44px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Crear Torneo</span>
              </button>
            </div>
          </form>
        ) : (
          /* Mode: Tournament List & Filter */
          <div className="flex-1 overflow-hidden flex flex-col pt-3">
            {/* Filter Tabs */}
            <div className="bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center gap-1 mb-3">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Todos ({tournaments.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  filter === 'active'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                En Curso
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  filter === 'completed'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Anteriores
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  filter === 'upcoming'
                    ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Próximos
              </button>
            </div>

            {/* List of Tournaments */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5 no-scrollbar">
              {filteredTournaments.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                  No se encontraron torneos en este estado.
                </div>
              ) : (
                filteredTournaments.map((tournament) => {
                  const isActive = tournament.config.id === activeTournamentId;
                  const completedMatches = tournament.matches.filter((m) => m.isCompleted).length;
                  const totalMatches = tournament.matches.length;
                  const status = tournament.config.status || 'active';

                  return (
                    <div
                      key={tournament.config.id}
                      onClick={() => {
                        onSelectTournament(tournament.config.id);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex items-center justify-between ${
                        isActive
                          ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 ring-2 ring-sky-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          {status === 'active' && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-[10px] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              En Curso
                            </span>
                          )}
                          {status === 'completed' && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-black text-[10px] flex items-center gap-1">
                              🏁 Finalizado
                            </span>
                          )}
                          {status === 'upcoming' && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black text-[10px] flex items-center gap-1">
                              ⏳ Próximo
                            </span>
                          )}

                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400">
                            {tournament.config.season || '2026'} • {tournament.config.category || 'General'}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {tournament.config.name}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                          <span>{tournament.teams.length} equipos</span>
                          <span>•</span>
                          <span>
                            {totalMatches > 0
                              ? `${completedMatches}/${totalMatches} partidos jugados`
                              : 'Fixture pendiente'}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <span className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            <ChevronRight className="w-5 h-5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Add Tournament Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                id="btn-create-new-tournament-modal"
                onClick={() => setIsCreating(true)}
                className="w-full py-3.5 bg-slate-900 dark:bg-sky-600 active:bg-black dark:active:bg-sky-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all min-h-[46px]"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Torneo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
