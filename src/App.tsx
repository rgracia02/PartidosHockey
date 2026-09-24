import { useEffect, useMemo, useState } from 'react';
import { ConfigView } from './components/ConfigView';
import { FixtureView } from './components/FixtureView';
import { Header } from './components/Header';
import { PostMatchModal } from './components/PostMatchModal';
import { ScorersView } from './components/ScorersView';
import { SingleMatchShareModal } from './components/SingleMatchShareModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { StandingsView } from './components/StandingsView';
import { TabBar, TabType } from './components/TabBar';
import { TournamentSwitcherModal } from './components/TournamentSwitcherModal';
import { ShareType, WhatsAppShareModal } from './components/WhatsAppShareModal';
import { ImageShareModal, ImageShareType } from './components/ImageShareModal';
import { Match, Team, TournamentConfig, TournamentData, TournamentFormat, TournamentStatus } from './types';
import {
  calculatePlayerCards,
  calculateStandings,
  calculateTopScorers,
  clearScheduleForStage,
  createNewTournament,
  DEFAULT_TOURNAMENTS,
  formatWhatsAppResults,
  formatWhatsAppScorers,
  formatWhatsAppStandings,
  formatWhatsAppSummary,
  generateFixture,
  INITIAL_DEMO_DATA,
  scheduleMatchday,
  syncPlayoffMatches,
} from './utils/tournamentEngine';

const LOCAL_STORAGE_KEY_V3 = 'hockey_torneos_state_v3';
const LEGACY_STORAGE_KEY_V2 = 'hockey_torneos_state_v2';

function sanitizeTournament(t: any): TournamentData {
  if (!t || typeof t !== 'object') return INITIAL_DEMO_DATA;
  const config: TournamentConfig = {
    id: t.config?.id || `t-${Date.now()}`,
    name: t.config?.name || 'Torneo de Hockey',
    category: t.config?.category || 'General',
    season: t.config?.season || `${new Date().getFullYear()}`,
    status: t.config?.status || 'active',
    courtsCount: Number(t.config?.courtsCount) || 1,
    format: t.config?.format || 'groups_playoffs_semis',
    isDoubleRound: Boolean(t.config?.isDoubleRound),
    includeThirdPlace: Boolean(t.config?.includeThirdPlace),
    whatsappHeader: t.config?.whatsappHeader,
    whatsappFooter: t.config?.whatsappFooter,
    eventGroupId: t.config?.eventGroupId,
    eventLabel: t.config?.eventLabel,
    courtLabelOffset: Number(t.config?.courtLabelOffset) || 0,
    matchDurationMinutes: t.config?.matchDurationMinutes ? Number(t.config.matchDurationMinutes) : undefined,
    pointsWin: t.config?.pointsWin ?? 3,
    pointsDraw: t.config?.pointsDraw ?? 1,
    pointsLoss: t.config?.pointsLoss ?? 0,
  };
  const teams: Team[] = Array.isArray(t.teams)
    ? t.teams.map((tm: any, idx: number) => ({
        id: tm?.id || `team-${idx + 1}`,
        name: tm?.name || `Equipo ${idx + 1}`,
        color: tm?.color || '#0284c7',
        players: Array.isArray(tm?.players)
          ? tm.players.map((p: any, pIdx: number) => ({
              id: p?.id || `p-${idx + 1}-${pIdx + 1}`,
              name: p?.name || `Jugador ${pIdx + 1}`,
              number: Number(p?.number) || 0,
              teamId: tm?.id || `team-${idx + 1}`,
            }))
          : [],
      }))
    : [];
  const matches: Match[] = Array.isArray(t.matches)
    ? t.matches.map((m: any, mIdx: number) => ({
        id: m?.id || `m-${mIdx + 1}`,
        round: Number(m?.round) || 1,
        stage: m?.stage || 'group',
        stageLabel: m?.stageLabel || `Fecha ${m?.round || 1}`,
        court: m?.court || 'Cancha 1',
        teamAId: m?.teamAId || '',
        teamBId: m?.teamBId || '',
        placeholderA: m?.placeholderA,
        placeholderB: m?.placeholderB,
        bracketKey: m?.bracketKey,
        isManualCross: Boolean(m?.isManualCross),
        date: m?.date,
        time: m?.time,
        scoreA: typeof m?.scoreA === 'number' ? m.scoreA : null,
        scoreB: typeof m?.scoreB === 'number' ? m.scoreB : null,
        isCompleted: Boolean(m?.isCompleted),
        isShootout: Boolean(m?.isShootout),
        shootoutWinnerTeamId: m?.shootoutWinnerTeamId,
        shootoutScoreA: m?.shootoutScoreA,
        shootoutScoreB: m?.shootoutScoreB,
        goals: Array.isArray(m?.goals) ? m.goals : [],
        sanctions: Array.isArray(m?.sanctions) ? m.sanctions : [],
        photoUrl: m?.photoUrl,
        notes: m?.notes,
      }))
    : [];
  return {
    config,
    teams,
    matches,
    lastUpdated: t.lastUpdated || new Date().toISOString(),
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('posiciones');

  // Multi-tournament state
  const [tournaments, setTournaments] = useState<TournamentData[]>(() => {
    try {
      const savedV3 = localStorage.getItem(LOCAL_STORAGE_KEY_V3);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeTournament);
        }
      }

      // Legacy migration from v2 single tournament
      const legacyV2 = localStorage.getItem(LEGACY_STORAGE_KEY_V2);
      if (legacyV2) {
        const parsedLegacy = JSON.parse(legacyV2);
        if (parsedLegacy?.config && parsedLegacy?.teams) {
          const sanitizedLegacy = sanitizeTournament(parsedLegacy);
          return [sanitizedLegacy, ...DEFAULT_TOURNAMENTS.filter((t) => t.config.id !== sanitizedLegacy.config.id)];
        }
      }
    } catch (e) {
      console.error('Error loading tournaments list from localStorage:', e);
    }
    return DEFAULT_TOURNAMENTS.map(sanitizeTournament);
  });

  const [activeTournamentId, setActiveTournamentId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('hockey_active_tournament_id');
      if (savedActive) return savedActive;
    } catch (e) {
      // ignore
    }
    return tournaments[0]?.config?.id || 'demo-tournament-2026';
  });

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchToShare, setMatchToShare] = useState<Match | null>(null);
  const [showStandaloneModal, setShowStandaloneModal] = useState(false);
  const [showSwitcherModal, setShowSwitcherModal] = useState(false);
  const [switcherInitialMode, setSwitcherInitialMode] = useState<'list' | 'create'>('list');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showImageShareModal, setShowImageShareModal] = useState(false);
  const [imageShareType, setImageShareType] = useState<ImageShareType>('standings');
  const [whatsAppShareType, setWhatsAppShareType] = useState<ShareType>('standings');
  const [whatsAppRoundFilter, setWhatsAppRoundFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark / Light Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('hockey_theme_mode');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hockey_theme_mode', isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Keep the iOS status bar / Safari toolbar color in sync with the app's
      // actual theme so it never shows a mismatched white/dark bar up top.
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDarkMode ? '#020617' : '#F2F2F7');
      }
    } catch (e) {
      // ignore
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Active tournament data reference
  const currentTournament = useMemo(() => {
    return tournaments.find((t) => t.config.id === activeTournamentId) || tournaments[0] || INITIAL_DEMO_DATA;
  }, [tournaments, activeTournamentId]);

  // Persist all tournaments whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_V3, JSON.stringify(tournaments));
      localStorage.setItem('hockey_active_tournament_id', activeTournamentId);
    } catch (e) {
      console.error('Error saving tournaments list to localStorage:', e);
    }
  }, [tournaments, activeTournamentId]);

  // Update a specific tournament in the state
  const updateCurrentTournament = (updater: (prev: TournamentData) => TournamentData) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.config.id === currentTournament.config.id) {
          return updater(t);
        }
        return t;
      })
    );
  };

  // Standings calculation for active tournament
  const standings = useMemo(() => {
    return calculateStandings(currentTournament?.teams || [], currentTournament?.matches || [], currentTournament?.config);
  }, [currentTournament?.teams, currentTournament?.matches, currentTournament?.config]);

  // Scorers calculation
  const topScorers = useMemo(() => {
    return calculateTopScorers(currentTournament?.teams || [], currentTournament?.matches || []);
  }, [currentTournament?.teams, currentTournament?.matches]);

  // Player cards calculation
  const cardStats = useMemo(() => {
    return calculatePlayerCards(currentTournament?.teams || [], currentTournament?.matches || []);
  }, [currentTournament?.teams, currentTournament?.matches]);

  // Pending matches counter
  const pendingCount = useMemo(() => {
    return (currentTournament?.matches || []).filter((m) => !m.isCompleted).length;
  }, [currentTournament?.matches]);

  // Other tournaments sharing the same eventGroupId as the active one (e.g. Damas + Varones, same jornada)
  const linkedTournaments = useMemo(() => {
    if (!currentTournament?.config.eventGroupId) return [];
    return tournaments.filter(
      (t) =>
        t.config.eventGroupId === currentTournament.config.eventGroupId &&
        t.config.id !== currentTournament.config.id
    );
  }, [tournaments, currentTournament?.config.eventGroupId, currentTournament?.config.id]);

  // Multi-Tournament Handlers
  const handleSelectTournament = (id: string) => {
    setActiveTournamentId(id);
    const selected = tournaments.find((t) => t.config.id === id);
    if (selected) {
      showToast(`🏆 Torneo activo: ${selected.config.name}`);
    }
  };

  const handleCreateTournament = (
    name: string,
    category: string,
    season: string,
    status: TournamentStatus,
    format: TournamentFormat,
    courtsCount: number,
    sourceTournamentId?: string,
    isDoubleRound?: boolean
  ) => {
    let sourceTeams: Team[] | undefined = undefined;
    if (sourceTournamentId && sourceTournamentId !== 'none') {
      const source = tournaments.find((t) => t.config.id === sourceTournamentId);
      if (source) {
        sourceTeams = source.teams;
      }
    }

    const created = createNewTournament(
      name,
      category,
      season,
      format,
      courtsCount,
      sourceTeams,
      isDoubleRound || false
    );
    created.config.status = status;

    setTournaments((prev) => [created, ...prev]);
    setActiveTournamentId(created.config.id);
    showToast(`✓ ¡Torneo "${created.config.name}" creado!`);
  };

  const handleDuplicateTournament = (id: string) => {
    const source = tournaments.find((t) => t.config.id === id);
    if (!source) return;

    const newName = `${source.config.name} (Copia)`;
    const newTournament = createNewTournament(
      newName,
      source.config.category || 'General',
      `${new Date().getFullYear()}`,
      source.config.format,
      source.config.courtsCount,
      source.teams,
      source.config.isDoubleRound || false
    );

    setTournaments((prev) => [newTournament, ...prev]);
    setActiveTournamentId(newTournament.config.id);
    showToast(`✓ Torneo duplicado: ${newName}`);
  };

  const handleDeleteTournament = (id: string) => {
    if (tournaments.length <= 1) {
      alert('Debes mantener al menos un torneo en la aplicación.');
      return;
    }

    const target = tournaments.find((t) => t.config.id === id);
    if (confirm(`¿Estás seguro de eliminar el torneo "${target?.config.name}"?`)) {
      const filtered = tournaments.filter((t) => t.config.id !== id);
      setTournaments(filtered);
      if (activeTournamentId === id) {
        setActiveTournamentId(filtered[0].config.id);
      }
      showToast('✓ Torneo eliminado');
    }
  };

  // Link the active tournament with another one as the same combined event (e.g. Damas + Varones, same jornada).
  // This is a one-click action: it regenerates both fixtures automatically so the user doesn't
  // need extra steps. By default both keep their own court numbering (they share the same physical
  // courts, just at different times of the day). Only if useSeparateCourts is true do we shift the
  // second tournament's court numbers so they don't overlap with the first (for venues with more courts).
  const handleLinkTournamentEvent = (targetId: string, useSeparateCourts: boolean = false) => {
    const target = tournaments.find((t) => t.config.id === targetId);
    if (!target) return;

    const currentHasResults = currentTournament.matches.some((m) => m.isCompleted);
    const targetHasResults = target.matches.some((m) => m.isCompleted);
    if (currentHasResults || targetHasResults) {
      const proceed = confirm(
        `Para combinar "${currentTournament.config.name}" con "${target.config.name}" hay que regenerar el fixture de ambos, y eso reinicia los resultados ya cargados. ¿Querés continuar?`
      );
      if (!proceed) return;
    }

    const groupId =
      currentTournament.config.eventGroupId ||
      target.config.eventGroupId ||
      `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const currentOffset = currentTournament.config.courtLabelOffset || 0;
    const targetOffset = useSeparateCourts ? currentOffset + currentTournament.config.courtsCount : 0;

    setTournaments((prev) =>
      prev.map((t) => {
        if (t.config.id === currentTournament.config.id) {
          const newConfig = { ...t.config, eventGroupId: groupId };
          const newMatches = generateFixture(
            t.teams,
            newConfig.format,
            newConfig.courtsCount,
            newConfig.isDoubleRound || false,
            newConfig.courtLabelOffset || 0,
            newConfig.includeThirdPlace || false
          );
          return { ...t, config: newConfig, matches: newMatches, lastUpdated: new Date().toISOString() };
        }
        if (t.config.id === targetId) {
          const newConfig = { ...t.config, eventGroupId: groupId, courtLabelOffset: targetOffset };
          const newMatches = generateFixture(
            t.teams,
            newConfig.format,
            newConfig.courtsCount,
            newConfig.isDoubleRound || false,
            targetOffset,
            newConfig.includeThirdPlace || false
          );
          return { ...t, config: newConfig, matches: newMatches, lastUpdated: new Date().toISOString() };
        }
        return t;
      })
    );
    showToast(`✓ "${currentTournament.config.name}" y "${target.config.name}" combinados. Mirá la pestaña Fixture → Evento Combinado.`);
  };

  // Remove the active tournament from its combined-event group
  const handleUnlinkTournamentEvent = () => {
    const proceed = confirm(
      'Al desvincular se regenera el fixture de este torneo (vuelve a usar Cancha 1 en adelante) y se reinician sus resultados. ¿Continuar?'
    );
    if (!proceed) return;

    updateCurrentTournament((prev) => {
      const newConfig = { ...prev.config, eventGroupId: undefined, courtLabelOffset: 0 };
      const newMatches = generateFixture(
        prev.teams,
        newConfig.format,
        newConfig.courtsCount,
        newConfig.isDoubleRound || false,
        0,
        newConfig.includeThirdPlace || false
      );
      return { ...prev, config: newConfig, matches: newMatches, lastUpdated: new Date().toISOString() };
    });
    showToast('✓ Torneo desvinculado del evento combinado');
  };

  // Manually move a group-stage match to a different Fecha (round) and/or Cancha,
  // for when the user wants a different order than the auto-generated fixture.
  const handleRescheduleMatch = (matchId: string, newRound: number, newCourt: string) => {
    updateCurrentTournament((prev) => ({
      ...prev,
      matches: prev.matches.map((m) =>
        m.id === matchId
          ? { ...m, round: newRound, stageLabel: m.stage === 'group' ? `Fecha ${newRound}` : m.stageLabel, court: newCourt }
          : m
      ),
      lastUpdated: new Date().toISOString(),
    }));
    showToast('✓ Partido reprogramado');
  };

  // Manually move a single match to a different day/time (e.g. a team can't travel that day),
  // without touching the rest of that Fecha's schedule. Empty strings clear the match's schedule.
  const handleSetMatchDateTime = (matchId: string, date: string, time: string) => {
    updateCurrentTournament((prev) => ({
      ...prev,
      matches: prev.matches.map((m) =>
        m.id === matchId ? { ...m, date: date || undefined, time: time || undefined } : m
      ),
      lastUpdated: new Date().toISOString(),
    }));
    showToast(date ? '✓ Horario del partido actualizado' : '✓ Se quitó el horario del partido');
  };

  // Given the physical capacity of a single playing day (courts available + time window), figures
  // out on its own how many whole Fechas fit and assigns real court + kickoff time to each match in
  // them. If linked to another category sharing the same physical courts, its matches on that same
  // date are taken into account so the two categories share the time grid without overlapping.
  const handleScheduleMatchday = (
    date: string,
    startTime: string,
    endTime: string,
    courtsAvailable: number,
    durationMinutes: number
  ) => {
    let scheduledLabels: string[] = [];
    let leftover: string | undefined;
    updateCurrentTournament((prev) => {
      const otherMatches = linkedTournaments.flatMap((t) => t.matches);
      const result = scheduleMatchday(
        prev.matches,
        {
          date,
          startTime,
          endTime,
          courtsAvailable,
          durationMinutes,
          courtLabelOffset: prev.config.courtLabelOffset || 0,
        },
        otherMatches
      );
      scheduledLabels = result.scheduledStageLabels;
      leftover = result.leftoverStageLabel;
      return {
        ...prev,
        config: { ...prev.config, matchDurationMinutes: durationMinutes },
        matches: result.matches,
        lastUpdated: new Date().toISOString(),
      };
    });

    if (scheduledLabels.length === 0) {
      showToast(
        leftover
          ? `⚠️ ${leftover} no entra en ese horario/canchas. Probá agrandar la ventana o sumar canchas.`
          : '⚠️ No hay Fechas pendientes de asignar.'
      );
    } else {
      showToast(`✓ Se asignaron ${scheduledLabels.join(', ')} a ese día${leftover ? ` (${leftover} queda para otro día)` : ''}`);
    }
  };

  const handleClearStageSchedule = (stageLabel: string) => {
    updateCurrentTournament((prev) => ({
      ...prev,
      matches: clearScheduleForStage(prev.matches, stageLabel),
      lastUpdated: new Date().toISOString(),
    }));
    showToast(`✓ Se quitó el horario de ${stageLabel}`);
  };

  // Manually set the two teams facing off in a playoff match (semi/third_place/final),
  // overriding the automatic standings-based assignment for that match.
  const handleSetManualCross = (matchId: string, teamAId: string, teamBId: string) => {
    updateCurrentTournament((prev) => ({
      ...prev,
      matches: prev.matches.map((m) =>
        m.id === matchId ? { ...m, teamAId, teamBId, isManualCross: true } : m
      ),
      lastUpdated: new Date().toISOString(),
    }));
    showToast('✓ Cruce actualizado');
  };

  // Return a playoff match to automatic assignment based on standings
  const handleResetManualCross = (matchId: string) => {
    updateCurrentTournament((prev) => {
      const clearedMatches = prev.matches.map((m) =>
        m.id === matchId ? { ...m, teamAId: '', teamBId: '', isManualCross: false } : m
      );
      const curStandings = calculateStandings(prev.teams, clearedMatches, prev.config);
      const synced = syncPlayoffMatches(clearedMatches, curStandings, prev.teams);
      return { ...prev, matches: synced, lastUpdated: new Date().toISOString() };
    });
    showToast('✓ Cruce vuelto a automático');
  };

  // Match & Config Handlers for Active Tournament
  const handleSaveMatch = (updatedMatch: Match, andShare: boolean = false) => {
    updateCurrentTournament((prev) => {
      const updatedMatches = prev.matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
      const curStandings = calculateStandings(prev.teams, updatedMatches, prev.config);
      const syncedMatches = syncPlayoffMatches(updatedMatches, curStandings, prev.teams);
      return {
        ...prev,
        matches: syncedMatches,
        lastUpdated: new Date().toISOString(),
      };
    });
    setSelectedMatch(null);
    showToast('✓ ¡Planilla de partido guardada!');

    if (andShare) {
      setMatchToShare(updatedMatch);
    }
  };

  const handleSaveMatchPhoto = (matchId: string, photoUrl: string | undefined) => {
    updateCurrentTournament((prev) => ({
      ...prev,
      matches: prev.matches.map((m) => (m.id === matchId ? { ...m, photoUrl } : m)),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const handleUpdateConfig = (newConfig: TournamentConfig) => {
    updateCurrentTournament((prev) => ({
      ...prev,
      config: newConfig,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const handleUpdateTeams = (newTeams: Team[]) => {
    updateCurrentTournament((prev) => ({
      ...prev,
      teams: newTeams,
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Rebuild only the playoff bracket (e.g. after changing the format) and keep every
  // group-stage match and result that is already loaded.
  const handleRegeneratePlayoffs = () => {
    updateCurrentTournament((prev) => {
      const fresh = generateFixture(
        prev.teams,
        prev.config.format,
        prev.config.courtsCount,
        prev.config.isDoubleRound || false,
        prev.config.courtLabelOffset || 0,
        prev.config.includeThirdPlace || false
      );
      const groupMatches = prev.matches.filter((m) => m.stage === 'group');
      const playoffMatches = fresh.filter((m) => m.stage !== 'group');
      const combined = [...groupMatches, ...playoffMatches];
      const curStandings = calculateStandings(prev.teams, combined, prev.config);
      return {
        ...prev,
        matches: syncPlayoffMatches(combined, curStandings, prev.teams),
        lastUpdated: new Date().toISOString(),
      };
    });
    showToast('✓ Playoffs regenerados (se conservaron los resultados de la fase regular)');
  };

  const handleRegenerateFixture = () => {
    const newMatches = generateFixture(
      currentTournament.teams,
      currentTournament.config.format,
      currentTournament.config.courtsCount,
      currentTournament.config.isDoubleRound || false,
      currentTournament.config.courtLabelOffset || 0,
      currentTournament.config.includeThirdPlace || false
    );
    updateCurrentTournament((prev) => ({
      ...prev,
      matches: newMatches,
      lastUpdated: new Date().toISOString(),
    }));
    showToast('✓ Fixture regenerado con éxito');
  };

  const handleLoadDemo = () => {
    setTournaments(DEFAULT_TOURNAMENTS);
    setActiveTournamentId(DEFAULT_TOURNAMENTS[0].config.id);
    showToast('✓ Set de torneos demo cargado');
  };

  const handleImportJson = (imported: TournamentData) => {
    // Add imported tournament to list
    setTournaments((prev) => {
      const exists = prev.some((t) => t.config.id === imported.config.id);
      if (exists) {
        return prev.map((t) => (t.config.id === imported.config.id ? imported : t));
      }
      return [imported, ...prev];
    });
    setActiveTournamentId(imported.config.id);
  };

  const handleOpenShareModal = (type: ShareType = 'standings', roundFilter: string = 'all') => {
    setWhatsAppShareType(type);
    setWhatsAppRoundFilter(roundFilter);
    setShowWhatsAppModal(true);
  };

  const handleOpenImageShareModal = (type: ImageShareType) => {
    setImageShareType(type);
    setShowImageShareModal(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-[#F2F2F7] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative pb-safe-tabbar transition-colors">
      {/* iOS App Navigation Header */}
      <Header
        tournamentName={currentTournament.config.name}
        category={currentTournament.config.category}
        season={currentTournament.config.season}
        status={currentTournament.config.status}
        isDark={isDarkMode}
        onToggleTheme={toggleTheme}
        onShareWhatsApp={() => {
          if (activeTab === 'posiciones') handleOpenShareModal('standings');
          else if (activeTab === 'fixture') handleOpenShareModal('results');
          else if (activeTab === 'goleadores') handleOpenShareModal('scorers');
          else handleOpenShareModal('summary');
        }}
        onOpenTournamentSwitcher={() => {
          setSwitcherInitialMode('list');
          setShowSwitcherModal(true);
        }}
      />

      {/* Main Tab Views */}
      <main className="flex-1 p-4">
        {activeTab === 'posiciones' && (
          <StandingsView
            standings={standings}
            format={currentTournament.config.format}
            onShareStandings={() => handleOpenShareModal('standings')}
            onShareStandingsImage={() => handleOpenImageShareModal('standings')}
          />
        )}

        {activeTab === 'fixture' && (
          <FixtureView
            matches={currentTournament.matches}
            teams={currentTournament.teams}
            onSelectMatch={(m) => setSelectedMatch(m)}
            onShareResults={(roundLabel) => handleOpenShareModal('results', roundLabel || 'all')}
            onShareFixtureImage={() => handleOpenImageShareModal('fixture')}
            onShareSingleMatch={(m) => setMatchToShare(m)}
            linkedTournaments={linkedTournaments}
            currentTournamentId={currentTournament.config.id}
            currentCategory={currentTournament.config.category || currentTournament.config.name}
            onSelectForeignMatch={(tournamentId, match) => {
              setActiveTournamentId(tournamentId);
              setSelectedMatch(match);
              const foreign = tournaments.find((t) => t.config.id === tournamentId);
              showToast(`🏆 Cambiaste a "${foreign?.config.name}" para cargar este partido`);
            }}
          />
        )}

        {activeTab === 'goleadores' && (
          <ScorersView
            scorers={topScorers}
            cardStats={cardStats}
            onShareScorers={() => handleOpenShareModal('scorers')}
          />
        )}

        {activeTab === 'config' && (
          <ConfigView
            data={currentTournament}
            tournaments={tournaments}
            onSelectTournament={handleSelectTournament}
            onOpenCreateTournamentModal={() => {
              setSwitcherInitialMode('create');
              setShowSwitcherModal(true);
            }}
            onDuplicateTournament={handleDuplicateTournament}
            onDeleteTournament={handleDeleteTournament}
            onUpdateConfig={handleUpdateConfig}
            onUpdateTeams={handleUpdateTeams}
            onRegenerateFixture={handleRegenerateFixture}
            onRegeneratePlayoffs={handleRegeneratePlayoffs}
            onLoadDemoData={handleLoadDemo}
            onOpenStandaloneModal={() => setShowStandaloneModal(true)}
            onImportJson={handleImportJson}
            onLinkTournamentEvent={handleLinkTournamentEvent}
            onUnlinkTournamentEvent={handleUnlinkTournamentEvent}
            onSetManualCross={handleSetManualCross}
            onResetManualCross={handleResetManualCross}
            onRescheduleMatch={handleRescheduleMatch}
            onSetMatchDateTime={handleSetMatchDateTime}
            onScheduleMatchday={handleScheduleMatchday}
            onClearStageSchedule={handleClearStageSchedule}
          />
        )}
      </main>

      {/* WhatsApp Share Sheet Modal */}
      {showWhatsAppModal && (
        <WhatsAppShareModal
          initialType={whatsAppShareType}
          initialRoundFilter={whatsAppRoundFilter}
          config={currentTournament.config}
          standings={standings}
          matches={currentTournament.matches}
          teams={currentTournament.teams}
          topScorers={topScorers}
          cardStats={cardStats}
          linkedTournaments={linkedTournaments}
          onClose={() => setShowWhatsAppModal(false)}
          onSaveMatchPhoto={handleSaveMatchPhoto}
          onToast={showToast}
        />
      )}

      {/* Image Share Modal (standings/fixture as PNG) */}
      {showImageShareModal && (
        <ImageShareModal
          type={imageShareType}
          tournamentName={currentTournament.config.name}
          category={currentTournament.config.category}
          format={currentTournament.config.format}
          standings={standings}
          matches={currentTournament.matches}
          teams={currentTournament.teams}
          onClose={() => setShowImageShareModal(false)}
          onToast={showToast}
        />
      )}

      {/* Single Match WhatsApp Share with Photo Modal */}
      {matchToShare && (
        <SingleMatchShareModal
          match={matchToShare}
          teams={currentTournament.teams}
          config={currentTournament.config}
          onClose={() => setMatchToShare(null)}
          onSaveMatchPhoto={handleSaveMatchPhoto}
          onToast={showToast}
        />
      )}

      {/* Post-Match Modal Sheet */}
      {selectedMatch && (
        <PostMatchModal
          match={selectedMatch}
          teams={currentTournament.teams}
          onSave={handleSaveMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {/* Standalone GitHub Pages Export Modal */}
      {showStandaloneModal && (
        <StandaloneExportModal onClose={() => setShowStandaloneModal(false)} />
      )}

      {/* Tournament Switcher & Creator Modal */}
      {showSwitcherModal && (
        <TournamentSwitcherModal
          tournaments={tournaments}
          activeTournamentId={currentTournament.config.id}
          onSelectTournament={handleSelectTournament}
          onCreateTournament={handleCreateTournament}
          onClose={() => setShowSwitcherModal(false)}
          initialMode={switcherInitialMode}
        />
      )}

      {/* Toast notification banner */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 border border-slate-700/50"
        >
          {toastMessage}
        </div>
      )}

      {/* Fixed iOS Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onSelectTab={(t) => setActiveTab(t)}
        pendingMatchesCount={pendingCount}
        onAddTournament={() => {
          setSwitcherInitialMode('create');
          setShowSwitcherModal(true);
        }}
      />
    </div>
  );
}
