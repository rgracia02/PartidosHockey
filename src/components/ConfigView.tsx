import React, { useEffect, useState } from 'react';
import {
  Archive,
  Check,
  Code,
  Copy,
  Download,
  FolderOpen,
  Layers,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  Player,
  Team,
  TournamentConfig,
  TournamentData,
  TournamentFormat,
  TournamentStatus,
} from '../types';

interface ConfigViewProps {
  data: TournamentData;
  tournaments: TournamentData[];
  onSelectTournament: (id: string) => void;
  onOpenCreateTournamentModal: () => void;
  onDuplicateTournament: (id: string) => void;
  onDeleteTournament: (id: string) => void;
  onUpdateConfig: (config: TournamentConfig) => void;
  onUpdateTeams: (teams: Team[]) => void;
  onRegenerateFixture: () => void;
  onLoadDemoData: () => void;
  onOpenStandaloneModal: () => void;
  onImportJson: (imported: TournamentData) => void;
}

const COLOR_PRESETS = [
  '#0284C7', // Celeste / Sky
  '#059669', // Verde Césped
  '#DC2626', // Rojo
  '#D97706', // Ámbar / Oro
  '#7C3AED', // Violeta
  '#2563EB', // Azul Marino
  '#DB2777', // Rosa
  '#0F172A', // Negro / Azul noche
  '#EA580C', // Naranja
  '#475569', // Gris grafito
];

export function ConfigView({
  data,
  tournaments,
  onSelectTournament,
  onOpenCreateTournamentModal,
  onDuplicateTournament,
  onDeleteTournament,
  onUpdateConfig,
  onUpdateTeams,
  onRegenerateFixture,
  onLoadDemoData,
  onOpenStandaloneModal,
  onImportJson,
}: ConfigViewProps) {
  // New team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState(COLOR_PRESETS[0]);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Edit team state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamColor, setEditTeamColor] = useState(COLOR_PRESETS[0]);

  // New player form state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');

  // Edit player state
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerNumber, setEditPlayerNumber] = useState('');

  // WhatsApp template state
  const [whatsappHeaderInput, setWhatsappHeaderInput] = useState(data.config.whatsappHeader || '');
  const [whatsappFooterInput, setWhatsappFooterInput] = useState(data.config.whatsappFooter || '');
  const [whatsappSaveSuccess, setWhatsappSaveSuccess] = useState(false);

  useEffect(() => {
    setWhatsappHeaderInput(data.config.whatsappHeader || '');
    setWhatsappFooterInput(data.config.whatsappFooter || '');
  }, [data.config.id, data.config.whatsappHeader, data.config.whatsappFooter]);

  const handleSaveWhatsAppTemplate = () => {
    onUpdateConfig({
      ...data.config,
      whatsappHeader: whatsappHeaderInput.trim() ? whatsappHeaderInput.trim() : undefined,
      whatsappFooter: whatsappFooterInput.trim() ? whatsappFooterInput.trim() : undefined,
    });
    setWhatsappSaveSuccess(true);
    setTimeout(() => setWhatsappSaveSuccess(false), 2500);
  };

  const handleResetWhatsAppTemplate = () => {
    setWhatsappHeaderInput('');
    setWhatsappFooterInput('');
    onUpdateConfig({
      ...data.config,
      whatsappHeader: undefined,
      whatsappFooter: undefined,
    });
    setWhatsappSaveSuccess(true);
    setTimeout(() => setWhatsappSaveSuccess(false), 2500);
  };

  const handleStartEditTeam = (team: Team, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
    setEditTeamColor(team.color);
  };

  const handleSaveTeamEdit = (teamId: string) => {
    if (!editTeamName.trim()) return;
    const updated = data.teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          name: editTeamName.trim(),
          color: editTeamColor,
        };
      }
      return t;
    });
    onUpdateTeams(updated);
    setEditingTeamId(null);
  };

  const handleCancelTeamEdit = () => {
    setEditingTeamId(null);
  };

  const handleStartEditPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditPlayerName(player.name);
    setEditPlayerNumber(String(player.number));
  };

  const handleSavePlayerEdit = (teamId: string, playerId: string) => {
    if (!editPlayerName.trim()) return;
    const num = parseInt(editPlayerNumber, 10) || 1;
    const updated = data.teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.map((p) =>
            p.id === playerId ? { ...p, name: editPlayerName.trim(), number: num } : p
          ),
        };
      }
      return t;
    });
    onUpdateTeams(updated);
    setEditingPlayerId(null);
  };

  const handleCancelPlayerEdit = () => {
    setEditingPlayerId(null);
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam: Team = {
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newTeamName.trim(),
      color: newTeamColor,
      players: [],
    };

    const updated = [...data.teams, newTeam];
    onUpdateTeams(updated);
    setNewTeamName('');
    setExpandedTeamId(newTeam.id);
  };

  const handleRemoveTeam = (teamId: string) => {
    if (confirm('¿Eliminar este equipo y sus jugadoras/es?')) {
      const updated = data.teams.filter((t) => t.id !== teamId);
      onUpdateTeams(updated);
    }
  };

  const handleAddPlayer = (teamId: string) => {
    if (!newPlayerName.trim()) return;

    const num = parseInt(newPlayerNumber, 10) || 1;
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newPlayerName.trim(),
      number: num,
      teamId,
    };

    const updated = data.teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          players: [...t.players, newPlayer],
        };
      }
      return t;
    });

    onUpdateTeams(updated);
    setNewPlayerName('');
    setNewPlayerNumber('');
  };

  const handleRemovePlayer = (teamId: string, playerId: string) => {
    const updated = data.teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.filter((p) => p.id !== playerId),
        };
      }
      return t;
    });
    onUpdateTeams(updated);
  };

  const handleExportJson = () => {
    const exportPayload = {
      activeTournament: data,
      allTournaments: tournaments,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hockey-torneos-${data.config.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.config && parsed.teams && parsed.matches) {
          onImportJson(parsed);
          alert('¡Torneo importado con éxito!');
        } else if (parsed.activeTournament) {
          onImportJson(parsed.activeTournament);
          alert('¡Torneos importados con éxito!');
        } else {
          alert('Archivo JSON no válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 0. MULTI-TOURNAMENT MANAGEMENT SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mis Torneos ({tournaments.length})
            </h3>
          </div>
          <button
            onClick={onOpenCreateTournamentModal}
            className="px-3 py-1.5 bg-sky-600 active:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Torneo</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Gestiona torneos en curso, históricos y futuros. Toca cualquier torneo para activarlo:
        </p>

        {/* Tournament Cards List */}
        <div className="space-y-2">
          {tournaments.map((t) => {
            const isCurrent = t.config.id === data.config.id;
            const completedCount = t.matches.filter((m) => m.isCompleted).length;
            const status = t.config.status || 'active';

            return (
              <div
                key={t.config.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                  isCurrent
                    ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 ring-1 ring-sky-400'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  onClick={() => onSelectTournament(t.config.id)}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {status === 'active' && (
                      <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded font-black text-[9px]">
                        🟢 En Curso
                      </span>
                    )}
                    {status === 'completed' && (
                      <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded font-bold text-[9px]">
                        🏁 Finalizado
                      </span>
                    )}
                    {status === 'upcoming' && (
                      <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded font-bold text-[9px]">
                        ⏳ Próximo
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                      {t.config.season || '2026'} • {t.config.category || 'General'}
                    </span>
                  </div>

                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                    <span>{t.config.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] text-sky-700 dark:text-sky-300 font-black bg-sky-100 dark:bg-sky-900/60 px-1.5 py-0.2 rounded-md">
                        Activo
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                    {t.teams.length} equipos • {completedCount}/{t.matches.length} jugados
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onDuplicateTournament(t.config.id)}
                    title="Duplicar torneo (iniciar nueva edición con mismos equipos)"
                    className="p-2 text-slate-400 hover:text-sky-600 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {tournaments.length > 1 && (
                    <button
                      onClick={() => onDeleteTournament(t.config.id)}
                      title="Eliminar este torneo"
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. General Tournament Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span>⚙️</span>
          <span>Ajustes del Torneo Activo: {data.config.name}</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Nombre del Torneo</label>
            <input
              type="text"
              value={data.config.name}
              onChange={(e) =>
                onUpdateConfig({
                  ...data.config,
                  name: e.target.value,
                })
              }
              placeholder="Ej. Torneo Apertura 2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Categoría</label>
              <input
                type="text"
                value={data.config.category || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...data.config,
                    category: e.target.value,
                  })
                }
                placeholder="Primera Damas"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Año / Temporada</label>
              <input
                type="text"
                value={data.config.season || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...data.config,
                    season: e.target.value,
                  })
                }
                placeholder="2026"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Estado</label>
              <select
                value={data.config.status || 'active'}
                onChange={(e) =>
                  onUpdateConfig({
                    ...data.config,
                    status: e.target.value as TournamentStatus,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              >
                <option value="active">🟢 En Curso</option>
                <option value="completed">🏁 Finalizado</option>
                <option value="upcoming">⏳ Próximo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                Canchas en Simultáneo
              </label>
              <select
                value={data.config.courtsCount}
                onChange={(e) =>
                  onUpdateConfig({
                    ...data.config,
                    courtsCount: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              >
                <option value="1">1 Cancha (Cancha 1)</option>
                <option value="2">2 Canchas (Cancha 1 y 2)</option>
                <option value="3">3 Canchas (Cancha 1, 2 y 3)</option>
                <option value="4">4 Canchas (Canchas 1 a 4)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Formato</label>
              <select
                value={data.config.format}
                onChange={(e) =>
                  onUpdateConfig({
                    ...data.config,
                    format: e.target.value as TournamentFormat,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              >
                <option value="groups_only">Liga Simple (Solo Grupos)</option>
                <option value="groups_playoffs_final">Grupos + Final (1° vs 2°)</option>
                <option value="groups_playoffs_semis">Grupos + Semis (Top 4) + Final</option>
                <option value="groups_playoffs_quarters">Grupos + Cuartos + Semis + Final</option>
                <option value="knockout_only">Eliminación Directa Pura</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                Ruedas / Rondas
              </label>
              <select
                value={data.config.isDoubleRound ? 'double' : 'single'}
                onChange={(e) =>
                  onUpdateConfig({
                    ...data.config,
                    isDoubleRound: e.target.value === 'double',
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
              >
                <option value="single">🔄 Solo Ida (1 rueda)</option>
                <option value="double">🔁 Ida y Vuelta (2 ruedas)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              if (
                confirm(
                  '¿Deseas recalcular y regenerar el Fixture con los equipos y canchas actuales? Los resultados de partidos previos de este torneo se reiniciarán.'
                )
              ) {
                onRegenerateFixture();
              }
            }}
            className="w-full py-3 bg-slate-900 dark:bg-sky-600 active:bg-black dark:active:bg-sky-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 mt-2 min-h-[44px] active:scale-95 transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerar Fixture de este Torneo</span>
          </button>
        </div>
      </div>

      {/* 2. Teams & Roster Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Equipos y Planteles ({data.teams.length})
            </h3>
          </div>
        </div>

        {/* Add Team Form */}
        <form onSubmit={handleAddTeam} className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-700 mb-4 space-y-3">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">Nuevo Equipo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Nombre del equipo (ej. Belgrano HC)"
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!newTeamName.trim()}
              className="px-4 py-2 bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl text-xs disabled:opacity-40 min-h-[44px] flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>

          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-400 font-bold mb-1.5 uppercase">
              Color Distintivo
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setNewTeamColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    newTeamColor === color ? 'scale-125 ring-2 ring-slate-900 dark:ring-white ring-offset-2 dark:ring-offset-slate-800' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </form>

        {/* Teams List */}
        <div className="space-y-2">
          {data.teams.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No hay equipos inscriptos en este torneo. Agrega uno arriba.
            </p>
          ) : (
            data.teams.map((team) => {
              const isExpanded = expandedTeamId === team.id;
              const isEditingThisTeam = editingTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40"
                >
                  {/* Team Header or Team Edit Form */}
                  {isEditingThisTeam ? (
                    <div className="p-3 bg-sky-50/70 dark:bg-sky-950/40 border-b border-sky-200 dark:border-sky-800/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          <span>Editar Equipo</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleCancelTeamEdit}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                            Nombre del Equipo
                          </label>
                          <input
                            type="text"
                            value={editTeamName}
                            onChange={(e) => setEditTeamName(e.target.value)}
                            placeholder="Nombre del equipo"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                            Color Distintivo
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {COLOR_PRESETS.map((color) => (
                              <button
                                type="button"
                                key={color}
                                onClick={() => setEditTeamColor(color)}
                                className={`w-6 h-6 rounded-full transition-transform ${
                                  editTeamColor === color
                                    ? 'scale-125 ring-2 ring-slate-900 dark:ring-white ring-offset-2 dark:ring-offset-slate-900'
                                    : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveTeamEdit(team.id)}
                          disabled={!editTeamName.trim()}
                          className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Guardar Cambios</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelTeamEdit}
                          className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{team.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {team.players.length} {team.players.length === 1 ? 'jugadora/or' : 'jugadoras/es'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleStartEditTeam(team, e)}
                          title="Editar nombre y color del equipo"
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTeam(team.id);
                          }}
                          title="Eliminar equipo"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-slate-400 font-bold px-1">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Player Roster Form */}
                  {isExpanded && (
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          placeholder="N°"
                          value={newPlayerNumber}
                          onChange={(e) => setNewPlayerNumber(e.target.value)}
                          className="w-14 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-bold text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Nombre jugadora/or..."
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddPlayer(team.id)}
                          className="px-3 py-1.5 bg-sky-600 text-white font-bold rounded-xl text-xs shrink-0"
                        >
                          + Agregar
                        </button>
                      </div>

                      {/* Players list */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto no-scrollbar">
                        {team.players.map((player) => {
                          const isEditingPlayer = editingPlayerId === player.id;
                          return (
                            <div
                              key={player.id}
                              className="py-1.5 flex items-center justify-between text-xs gap-2"
                            >
                              {isEditingPlayer ? (
                                <div className="flex items-center gap-1.5 flex-1">
                                  <input
                                    type="number"
                                    value={editPlayerNumber}
                                    onChange={(e) => setEditPlayerNumber(e.target.value)}
                                    className="w-12 px-1.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold text-slate-900 dark:text-white"
                                  />
                                  <input
                                    type="text"
                                    value={editPlayerName}
                                    onChange={(e) => setEditPlayerName(e.target.value)}
                                    className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSavePlayerEdit(team.id, player.id)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg"
                                    title="Guardar jugador"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelPlayerEdit}
                                    className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                    title="Cancelar"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                    <span className="font-bold text-sky-600 dark:text-sky-400 mr-1.5">
                                      #{player.number}
                                    </span>
                                    {player.name}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditPlayer(player)}
                                      className="text-slate-400 hover:text-sky-600 p-1 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800"
                                      title="Editar jugadora/or"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePlayer(team.id, player.id)}
                                      className="text-slate-300 dark:text-slate-600 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
                                      title="Eliminar jugadora/or"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. WhatsApp Messages & Default Templates */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <MessageCircle className="w-4 h-4" />
            </span>
            <span>Mensajes y Plantilla de WhatsApp</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            Auto-formato
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Personaliza los textos predeterminados que se añaden al principio y al final de todos los mensajes al compartir resultados, posiciones, fixture o goleadores.
        </p>

        <div className="space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Encabezado / Mensaje Superior
              </label>
              <span className="text-[10px] text-slate-400">
                Usa <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">*texto*</code> para negrita
              </span>
            </div>
            <textarea
              value={whatsappHeaderInput}
              onChange={(e) => setWhatsappHeaderInput(e.target.value)}
              placeholder={`🏑 *${data.config.name.toUpperCase()}*${data.config.category ? ` - ${data.config.category}` : ''}\n¡Atención jugadoras y delegados!`}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Si lo dejas vacío, usará automáticamente el nombre y categoría del torneo.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Firma / Pie de Mensaje
              </label>
              <span className="text-[10px] text-slate-400">
                Usa <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">_texto_</code> para cursiva
              </span>
            </div>
            <textarea
              value={whatsappFooterInput}
              onChange={(e) => setWhatsappFooterInput(e.target.value)}
              placeholder="Organiza: Subcomisión de Hockey • Dudas o cambios por privado 🏑"
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Reemplaza la firma estándar al final de cada mensaje enviado a los grupos.
            </p>
          </div>

          {/* Live Preview Box */}
          <div className="pt-2">
            <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Vista Previa en WhatsApp:
            </span>
            <div className="bg-[#EFEAE2] dark:bg-[#121B22] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner font-sans text-xs">
              <div className="bg-white dark:bg-[#1F2C34] text-slate-900 dark:text-[#E9EDEF] p-3 rounded-2xl rounded-tl-none shadow-xs border border-slate-200/50 dark:border-slate-700/50 space-y-2 max-w-sm">
                <div className="font-bold whitespace-pre-line text-emerald-800 dark:text-emerald-400">
                  {whatsappHeaderInput.trim()
                    ? whatsappHeaderInput.trim()
                    : `🏑 *${data.config.name.toUpperCase()}*${data.config.category ? ` - ${data.config.category}` : ''}`}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                  🏆 *TABLA DE POSICIONES*<br />
                  🥇 *{data.teams[0]?.name || 'Equipo 1'}* (6 pts)<br />
                  🥈 *{data.teams[1]?.name || 'Equipo 2'}* (3 pts)<br />
                  ... [Contenido del mensaje]
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic whitespace-pre-line">
                  {whatsappFooterInput.trim()
                    ? whatsappFooterInput.trim()
                    : '_Generado con Hockey Torneos PWA_ 🏑'}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleSaveWhatsAppTemplate}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 min-h-[44px] transition-all active:scale-95 shadow-xs ${
                whatsappSaveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {whatsappSaveSuccess
                  ? '¡Mensajes Guardados!'
                  : 'Guardar Mensajes Predeterminados'}
              </span>
            </button>

            <button
              onClick={handleResetWhatsAppTemplate}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Backup, Demo Data and Reset */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2.5 transition-colors">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Respaldo & Muestra
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJson}
            className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar JSON</span>
          </button>

          <label className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px] cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Importar JSON</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>

        <button
          onClick={() => {
            if (confirm('¿Restablecer todos los torneos al set de datos de prueba?')) {
              onLoadDemoData();
            }
          }}
          className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 active:scale-98 transition-all min-h-[44px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Torneos Demo</span>
        </button>
      </div>
    </div>
  );
}
