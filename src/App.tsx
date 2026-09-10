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
import { Match, Team, TournamentConfig, TournamentData, TournamentFormat, TournamentStatus } from './types';
import {
  calculatePlayerCards,
  calculateStandings,
  calculateTopScorers,
  createNewTournament,
  DEFAULT_TOURNAMENTS,
  formatWhatsAppResults,
  formatWhatsAppScorers,
  formatWhatsAppStandings,
  formatWhatsAppSummary,
  generateFixture,
  INITIAL_DEMO_DATA,
  syncPlayoffMatches,
} from './utils/tournamentEngine';

const LOCAL_STORAGE_KEY_V3 = 'hockey_torneos_state_v3';
const LEGACY_STORAGE_KEY_V2 = 'hockey_torneos_state_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('posiciones');

  // Multi-tournament state
  const [tournaments, setTournaments] = useState<TournamentData[]>(() => {
    try {
      const savedV3 = localStorage.getItem(LOCAL_STORAGE_KEY_V3);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Legacy migration from v2 single tournament
      const legacyV2 = localStorage.getItem(LEGACY_STORAGE_KEY_V2);
      if (legacyV2) {
        const parsedLegacy = JSON.parse(legacyV2);
        if (parsedLegacy.config && parsedLegacy.teams) {
          return [parsedLegacy, ...DEFAULT_TOURNAMENTS.filter((t) => t.config.id !== parsedLegacy.config.id)];
        }
      }
    } catch (e) {
      console.error('Error loading tournaments list from localStorage:', e);
    }
    return DEFAULT_TOURNAMENTS;
  });

  const [activeTournamentId, setActiveTournamentId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('hockey_active_tournament_id');
      if (savedActive) return savedActive;
    } catch (e) {
      // ignore
    }
    return tournaments[0]?.config.id || 'demo-tournament-2026';
  });

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchToShare, setMatchToShare] = useState<Match | null>(null);
  const [showStandaloneModal, setShowStandaloneModal] = useState(false);
  const [showSwitcherModal, setShowSwitcherModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
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
    return calculateStandings(currentTournament.teams, currentTournament.matches, currentTournament.config);
  }, [currentTournament.teams, currentTournament.matches, currentTournament.config]);

  // Sync playoff teams whenever group matches / standings update
  useEffect(() => {
    const updated = syncPlayoffMatches(currentTournament.matches, standings, currentTournament.teams);
    const hasDiff = updated.some(
      (m, idx) =>
        m.teamAId !== currentTournament.matches[idx]?.teamAId ||
        m.teamBId !== currentTournament.matches[idx]?.teamBId
    );
    if (hasDiff) {
      updateCurrentTournament((prev) => ({
        ...prev,
        matches: updated,
        lastUpdated: new Date().toISOString(),
      }));
    }
  }, [standings]);

  // Scorers calculation
  const topScorers = useMemo(() => {
    return calculateTopScorers(currentTournament.teams, currentTournament.matches);
  }, [currentTournament.teams, currentTournament.matches]);

  // Player cards calculation
  const cardStats = useMemo(() => {
    return calculatePlayerCards(currentTournament.teams, currentTournament.matches);
  }, [currentTournament.teams, currentTournament.matches]);

  // Pending matches counter
  const pendingCount = useMemo(() => {
    return currentTournament.matches.filter((m) => !m.isCompleted).length;
  }, [currentTournament.matches]);

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

  // Match & Config Handlers for Active Tournament
  const handleSaveMatch = (updatedMatch: Match, andShare: boolean = false) => {
    updateCurrentTournament((prev) => ({
      ...prev,
      matches: prev.matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)),
      lastUpdated: new Date().toISOString(),
    }));
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

  const handleRegenerateFixture = () => {
    const newMatches = generateFixture(
      currentTournament.teams,
      currentTournament.config.format,
      currentTournament.config.courtsCount,
      currentTournament.config.isDoubleRound || false
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
        courtsCount={currentTournament.config.courtsCount}
        onOpenTournamentSwitcher={() => setShowSwitcherModal(true)}
      />

      {/* Main Tab Views */}
      <main className="flex-1 p-4">
        {activeTab === 'posiciones' && (
          <StandingsView
            standings={standings}
            format={currentTournament.config.format}
            onShareStandings={() => handleOpenShareModal('standings')}
          />
        )}

        {activeTab === 'fixture' && (
          <FixtureView
            matches={currentTournament.matches}
            teams={currentTournament.teams}
            onSelectMatch={(m) => setSelectedMatch(m)}
            onShareResults={(roundLabel) => handleOpenShareModal('results', roundLabel || 'all')}
            onShareSingleMatch={(m) => setMatchToShare(m)}
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
            onOpenCreateTournamentModal={() => setShowSwitcherModal(true)}
            onDuplicateTournament={handleDuplicateTournament}
            onDeleteTournament={handleDeleteTournament}
            onUpdateConfig={handleUpdateConfig}
            onUpdateTeams={handleUpdateTeams}
            onRegenerateFixture={handleRegenerateFixture}
            onLoadDemoData={handleLoadDemo}
            onOpenStandaloneModal={() => setShowStandaloneModal(true)}
            onImportJson={handleImportJson}
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
          onClose={() => setShowWhatsAppModal(false)}
          onSaveMatchPhoto={handleSaveMatchPhoto}
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
      />
    </div>
  );
}
