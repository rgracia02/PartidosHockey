import { useEffect, useMemo, useRef, useState } from 'react';
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
import { ActivityLogEntry, Match, Team, TournamentConfig, TournamentData, TournamentFormat, TournamentStatus } from './types';
import {
  addAuthorizedCreator,
  fetchAuthorizedCreators,
  fetchSharedTournament,
  grantEditorAccess,
  publishTournament,
  pushTournamentUpdate,
  removeAuthorizedCreator,
  revokeEditorAccess,
  subscribeToSharedTournament,
} from './utils/cloudSync';
import { doc, getDoc } from 'firebase/firestore';
import { getEditorName } from './utils/editorIdentity';
import { getDb, isFirebaseConfigured } from './utils/firebase';
import { GoogleUser, signInWithGoogle, signOutOfGoogle, subscribeToGoogleUser } from './utils/googleAuth';
import {
  calculatePlayerCards,
  calculateStandings,
  calculateTopScorers,
  clearScheduleForStage,
  createNewTournament,
  DEFAULT_TOURNAMENTS,
  fillScheduleGap,
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

// Builds a new activity-log entry attributed to whoever is editing on THIS device, and prepends it
// to the tournament's existing log (most recent first, capped so the document doesn't grow forever).
function appendActivityLog(prev: TournamentData, message: string, by: string): ActivityLogEntry[] {
  const entry: ActivityLogEntry = {
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    by: by.trim() || 'Alguien',
    message,
  };
  return [entry, ...(prev.activityLog || [])].slice(0, 30);
}

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
    shareCode: t.config?.shareCode || undefined,
    shareOwnerUid: t.config?.shareOwnerUid || undefined,
    shareOwnerEmail: t.config?.shareOwnerEmail || undefined,
    shareEditorEmails: Array.isArray(t.config?.shareEditorEmails) ? t.config.shareEditorEmails : undefined,
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
    activityLog: Array.isArray(t.activityLog) ? t.activityLog.slice(0, 30) : [],
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

  // ---------------------------------------------------------------------------------------------
  // Cloud sync ("Compartir Torneo"): if the app was opened with ?t=CODE in the URL, this device is
  // viewing/editing a tournament that lives in Firebase instead of (or in addition to) its own
  // localStorage copy. Reading is open to anyone with the link; editing needs a Google account the
  // tournament's owner has approved (or being that owner).
  // ---------------------------------------------------------------------------------------------
  const [cloudLinkCode] = useState<string | null>(() => {
    try {
      return new URLSearchParams(window.location.search).get('t');
    } catch {
      return null;
    }
  });
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'loading' | 'synced' | 'error'>('idle');
  const [cloudBootstrapped, setCloudBootstrapped] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authorizedCreators, setAuthorizedCreators] = useState<string[]>([]);
  const [creatorsLoaded, setCreatorsLoaded] = useState(false);
  // While true, an incoming update from Firestore is being applied locally, so the "push local
  // changes back up" effect below should skip this cycle (otherwise every remote update would
  // immediately get echoed straight back up as if it were a new local edit).
  const suppressCloudPushRef = useRef(false);

  const activeShareCode = currentTournament?.config.shareCode || null;
  const activeOwnerUid = currentTournament?.config.shareOwnerUid || '';
  const activeEditorEmails = currentTournament?.config.shareEditorEmails || [];
  const isCloudOwner = !!googleUser && googleUser.uid === activeOwnerUid;
  const isCloudEditor = !!googleUser && (isCloudOwner || activeEditorEmails.includes(googleUser.email));
  // Whichever name should label this device's edits in the activity log: prefer the signed-in
  // Google name, fall back to a manually-typed local name, then a generic placeholder.
  const editorLabel = googleUser?.displayName || getEditorName().trim() || 'Alguien';

  const canPublish = !!googleUser && authorizedCreators.includes(googleUser.email);
  const canManageCreators = canPublish; // anyone already on the list can add/remove others

  // Keep track of the signed-in Google account across the whole app.
  useEffect(() => {
    const unsubscribe = subscribeToGoogleUser((u) => {
      setGoogleUser(u);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Keep the list of accounts allowed to publish new tournaments in sync. Re-fetches whenever
  // sign-in state changes (a plain one-time read, not a live listener - simpler and avoids some
  // Firestore onSnapshot caching edge cases we hit while building this).
  const reloadAuthorizedCreators = () => {
    if (!isFirebaseConfigured()) {
      setCreatorsLoaded(true);
      return;
    }
    fetchAuthorizedCreators().then((emails) => {
      setAuthorizedCreators(emails);
      setCreatorsLoaded(true);
    });
  };

  useEffect(() => {
    setCreatorsLoaded(false);
    reloadAuthorizedCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!googleUser]);

  // The bare app (no ?t=CODE, i.e. not just opening someone's shared tournament link) is only for
  // authorized organizers once Firebase is configured: this is what actually stops a random person
  // who found the app's URL from poking around and publishing junk to the shared project. A
  // specific tournament's own share link still works for anyone, unaffected by this gate.
  const needsAppGate = !cloudLinkCode && isFirebaseConfigured();
  const appGateReady = !needsAppGate || (authChecked && creatorsLoaded);
  const appGateBlocked = needsAppGate && appGateReady && !canPublish;

  // First load via a shared link (?t=CODE): pull that tournament in once and make it the active
  // one, even if this device never had it locally before. Live updates from then on are handled
  // by the subscription effect below, since the tournament now carries that same shareCode.
  useEffect(() => {
    if (!cloudLinkCode || cloudBootstrapped) return;
    if (!isFirebaseConfigured()) {
      showToast('⚠️ Este link necesita que la app tenga Firebase configurado (ver .env.example).');
      setCloudBootstrapped(true);
      return;
    }
    setCloudStatus('loading');
    fetchSharedTournament(cloudLinkCode).then((data) => {
      if (!data) {
        setCloudStatus('error');
        setCloudBootstrapped(true);
        return;
      }
      const tagged: TournamentData = { ...data, config: { ...data.config, shareCode: cloudLinkCode } };
      setTournaments((prev) => {
        const exists = prev.some((t) => t.config.id === tagged.config.id);
        return exists ? prev.map((t) => (t.config.id === tagged.config.id ? tagged : t)) : [tagged, ...prev];
      });
      setActiveTournamentId(tagged.config.id);
      setCloudStatus('synced');
      setCloudBootstrapped(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudLinkCode, cloudBootstrapped]);

  // While the currently open tournament has a shareCode (whether we got here via a link, or it's
  // just this device's own tournament that was published earlier), keep it live: apply whatever
  // change comes down from Firestore, from ANY device, and keep the owner/editors list in sync too.
  useEffect(() => {
    if (!activeShareCode || !isFirebaseConfigured()) return;
    const thisId = currentTournament.config.id;
    const unsubscribe = subscribeToSharedTournament(activeShareCode, (snapshot) => {
      if (!snapshot) return;
      suppressCloudPushRef.current = true;
      const tagged: TournamentData = {
        ...snapshot.data,
        config: {
          ...snapshot.data.config,
          shareCode: activeShareCode,
          shareOwnerUid: snapshot.ownerUid,
          shareOwnerEmail: snapshot.ownerEmail,
          shareEditorEmails: snapshot.editorEmails,
        },
      };
      setTournaments((prev) => prev.map((t) => (t.config.id === thisId ? tagged : t)));
      setCloudStatus('synced');
      setTimeout(() => {
        suppressCloudPushRef.current = false;
      }, 50);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeShareCode]);

  // Push local edits up to the cloud whenever the active shared tournament changes, as long as
  // this account is allowed to edit it and the change didn't just come FROM the cloud itself.
  // Firestore rules are the real gatekeeper - this is just so we don't bother trying when we
  // already know it'll be rejected.
  useEffect(() => {
    if (!activeShareCode || !isCloudEditor) return;
    if (suppressCloudPushRef.current) return;

    const timer = setTimeout(() => {
      pushTournamentUpdate(activeShareCode, currentTournament).then((ok) => {
        setCloudStatus(ok ? 'synced' : 'error');
      });
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTournament?.lastUpdated]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      showToast('⚠️ No se pudo iniciar sesión (¿está activado el proveedor Google en Firebase?).');
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutOfGoogle();
    showToast('Sesión cerrada.');
  };

  // Publishes the CURRENT tournament to the cloud for the first time, owned by the signed-in
  // Google account, generating its share link.
  const handlePublishTournament = async () => {
    if (!googleUser) {
      showToast('⚠️ Iniciá sesión con Google primero para poder publicar.');
      return;
    }
    if (!canPublish) {
      showToast('⚠️ Tu cuenta no está autorizada para publicar torneos en la nube.');
      return;
    }
    try {
      const result = await publishTournament(currentTournament, googleUser.uid, googleUser.email);
      if (!result) {
        showToast('⚠️ Falta configurar Firebase para poder compartir (mirá .env.example).');
        return;
      }
      updateCurrentTournament((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          shareCode: result.shareCode,
          shareOwnerUid: result.ownerUid,
          shareOwnerEmail: result.ownerEmail,
          shareEditorEmails: [],
        },
        activityLog: appendActivityLog(prev, 'publicó el torneo en la nube', editorLabel),
      }));
      setCloudStatus('synced');
      showToast('✓ Torneo publicado. Ya podés compartir el link.');
    } catch (err) {
      console.error('Error al publicar el torneo en la nube:', err);
      showToast('⚠️ No se pudo publicar (revisá la consola del navegador con F12 para ver el detalle).');
    }
  };

  // Owner-only: grants/revokes edit access to another Google account by email.
  const handleGrantEditor = async (email: string) => {
    if (!activeShareCode || !email.trim()) return;
    const ok = await grantEditorAccess(activeShareCode, email);
    showToast(ok ? `✓ ${email.trim()} ya puede cargar resultados.` : '⚠️ No se pudo dar el permiso.');
  };

  const handleRevokeEditor = async (email: string) => {
    if (!activeShareCode) return;
    const ok = await revokeEditorAccess(activeShareCode, email);
    showToast(ok ? `✓ Se le quitó el permiso a ${email}.` : '⚠️ No se pudo quitar el permiso.');
  };

  // Owner-of-the-app-level actions: who is allowed to publish NEW tournaments to the cloud at all.
  const handleAddAuthorizedCreator = async (email: string) => {
    const ok = await addAuthorizedCreator(email);
    if (ok) reloadAuthorizedCreators();
    showToast(ok ? `✓ ${email.trim()} ya puede publicar torneos.` : '⚠️ No se pudo agregar (¿tenés vos permiso?).');
  };

  const handleRemoveAuthorizedCreator = async (email: string) => {
    const ok = await removeAuthorizedCreator(email);
    if (ok) reloadAuthorizedCreators();
    showToast(ok ? `✓ Se le quitó el permiso de publicar a ${email}.` : '⚠️ No se pudo quitar el permiso.');
  };

  const isReadOnlyCloud = !!activeShareCode && !isCloudEditor;

  const handleSelectMatchGuarded = (m: Match) => {
    if (isReadOnlyCloud) {
      showToast('👁 Estás en modo solo lectura: no tenés permiso para cargar resultados en este torneo.');
      return;
    }
    setSelectedMatch(m);
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
    updateCurrentTournament((prev) => {
      const m = prev.matches.find((x) => x.id === matchId);
      const teamA = prev.teams.find((t) => t.id === m?.teamAId)?.name || 'Equipo';
      const teamB = prev.teams.find((t) => t.id === m?.teamBId)?.name || 'Equipo';
      return {
        ...prev,
        matches: prev.matches.map((mm) =>
          mm.id === matchId
            ? { ...mm, round: newRound, stageLabel: mm.stage === 'group' ? `Fecha ${newRound}` : mm.stageLabel, court: newCourt }
            : mm
        ),
        activityLog: appendActivityLog(prev, `reprogramó ${teamA} vs ${teamB} a Fecha ${newRound}, ${newCourt}`, editorLabel),
        lastUpdated: new Date().toISOString(),
      };
    });
    showToast('✓ Partido reprogramado');
  };

  // Manually move a single match to a different day/time (e.g. a team can't travel that day),
  // without touching the rest of that Fecha's schedule. Empty strings clear the match's schedule.
  // If the match was actually occupying a real slot before, that slot is automatically offered to
  // the next available not-yet-scheduled match (same date, same court/time) so the court doesn't
  // sit empty - as long as both of that match's teams are free that day.
  const handleSetMatchDateTime = (matchId: string, date: string, time: string) => {
    let filledMatch: Match | undefined;
    updateCurrentTournament((prev) => {
      const original = prev.matches.find((m) => m.id === matchId);
      let updatedMatches = prev.matches.map((m) =>
        m.id === matchId ? { ...m, date: date || undefined, time: time || undefined } : m
      );

      const isLeavingItsSlot = original?.date && original?.time && (original.date !== date || original.time !== time);
      if (isLeavingItsSlot) {
        const result = fillScheduleGap(
          updatedMatches,
          { date: original!.date!, time: original!.time!, court: original!.court },
          matchId
        );
        updatedMatches = result.matches;
        filledMatch = result.filledMatch;
      }

      const teamA = prev.teams.find((t) => t.id === original?.teamAId)?.name || 'Equipo';
      const teamB = prev.teams.find((t) => t.id === original?.teamBId)?.name || 'Equipo';
      const logMsg = date
        ? `movió ${teamA} vs ${teamB} a ${date} ${time || ''}`.trim()
        : `quitó el horario de ${teamA} vs ${teamB}`;

      return {
        ...prev,
        matches: updatedMatches,
        activityLog: appendActivityLog(prev, logMsg, editorLabel),
        lastUpdated: new Date().toISOString(),
      };
    });

    if (filledMatch) {
      const teamA = currentTournament.teams.find((t) => t.id === filledMatch!.teamAId)?.name || 'Equipo';
      const teamB = currentTournament.teams.find((t) => t.id === filledMatch!.teamBId)?.name || 'Equipo';
      showToast(`✓ Horario actualizado. Ese lugar libre se completó con ${teamA} vs ${teamB} (${filledMatch.stageLabel}).`);
    } else {
      showToast(date ? '✓ Horario del partido actualizado' : '✓ Se quitó el horario del partido');
    }
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
        activityLog:
          result.scheduledStageLabels.length > 0
            ? appendActivityLog(prev, `armó el horario del ${date} para ${result.scheduledStageLabels.join(', ')}`, editorLabel)
            : prev.activityLog,
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
      activityLog: appendActivityLog(prev, `quitó el horario de ${stageLabel}`, editorLabel),
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
      const teamA = prev.teams.find((t) => t.id === updatedMatch.teamAId)?.name || updatedMatch.placeholderA || 'Equipo';
      const teamB = prev.teams.find((t) => t.id === updatedMatch.teamBId)?.name || updatedMatch.placeholderB || 'Equipo';
      const logMsg =
        updatedMatch.scoreA !== null && updatedMatch.scoreB !== null
          ? `cargó el resultado de ${teamA} ${updatedMatch.scoreA}-${updatedMatch.scoreB} ${teamB} (${updatedMatch.court})`
          : `editó el partido ${teamA} vs ${teamB} (${updatedMatch.court})`;
      return {
        ...prev,
        matches: syncedMatches,
        activityLog: appendActivityLog(prev, logMsg, editorLabel),
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

  // App-wide access gate (see needsAppGate/appGateReady/appGateBlocked above).
  if (needsAppGate && !appGateReady) {
    return (
      <div className="max-w-lg mx-auto min-h-screen bg-[#F2F2F7] dark:bg-slate-950 flex items-center justify-center px-6">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cargando…</p>
      </div>
    );
  }

  if (appGateBlocked) {
    return (
      <div className="max-w-lg mx-auto min-h-screen bg-[#F2F2F7] dark:bg-slate-950 flex items-center justify-center px-6">
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
          <div className="text-3xl">🔒</div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Esta app es privada</h1>
          {!googleUser ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Iniciá sesión con una cuenta de Google autorizada para usarla. Si alguien te compartió el link
                de un torneo puntual, abrilo directamente en vez de entrar por acá.
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs"
              >
                Iniciar sesión con Google
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tu cuenta ({googleUser.email}) no está autorizada para usar esta app. Pedile a un organizador
                que agregue tu mail en "Compartir Torneo → Quién puede publicar torneos nuevos".
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono break-all border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-2">
                DEBUG · authChecked={String(authChecked)} · creatorsLoaded={String(creatorsLoaded)} · lista=[
                {authorizedCreators.join(' | ')}] · canPublish={String(canPublish)}
              </p>
              <button
                onClick={async () => {
                  const db = getDb();
                  if (!db) {
                    alert('getDb() devolvió null - Firebase no está configurado.');
                    return;
                  }
                  try {
                    const snap = await getDoc(doc(db, 'appConfig', 'authorizedCreators'));
                    alert(
                      `exists: ${snap.exists()}\ndata: ${JSON.stringify(snap.exists() ? snap.data() : null)}\npath: ${snap.ref.path}\nprojectId: ${db.app.options.projectId}`
                    );
                  } catch (err: any) {
                    alert(`ERROR: ${err?.code || ''} ${err?.message || err}`);
                  }
                }}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-[10px]"
              >
                🔍 Diagnóstico directo (leer Firestore ahora)
              </button>
              <button
                onClick={handleGoogleSignOut}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs"
              >
                Probar con otra cuenta
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-[#F2F2F7] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative pb-safe-tabbar transition-colors">
      {/* iOS App Navigation Header */}
      <Header
        tournamentName={currentTournament.config.name}
        category={currentTournament.config.category}
        season={currentTournament.config.season}
        status={currentTournament.config.status}
        cloudStatus={activeShareCode ? cloudStatus : 'idle'}
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
            onSelectMatch={handleSelectMatchGuarded}
            onShareResults={(roundLabel) => handleOpenShareModal('results', roundLabel || 'all')}
            onShareFixtureImage={() => handleOpenImageShareModal('fixture')}
            onShareSingleMatch={(m) => setMatchToShare(m)}
            linkedTournaments={linkedTournaments}
            currentTournamentId={currentTournament.config.id}
            currentCategory={currentTournament.config.category || currentTournament.config.name}
            onSelectForeignMatch={(tournamentId, match) => {
              const foreign = tournaments.find((t) => t.config.id === tournamentId);
              const foreignReadOnly =
                !!foreign?.config.shareCode &&
                !(
                  googleUser &&
                  (googleUser.uid === foreign.config.shareOwnerUid ||
                    (foreign.config.shareEditorEmails || []).includes(googleUser.email))
                );
              if (foreignReadOnly) {
                showToast('👁 No tenés permiso para cargar resultados en esa categoría.');
                return;
              }
              setActiveTournamentId(tournamentId);
              setSelectedMatch(match);
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
            cloudConfigured={isFirebaseConfigured()}
            cloudStatus={activeShareCode ? cloudStatus : 'idle'}
            googleUser={googleUser}
            isCloudOwner={isCloudOwner}
            isCloudEditor={isCloudEditor}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onPublishTournament={handlePublishTournament}
            onGrantEditor={handleGrantEditor}
            onRevokeEditor={handleRevokeEditor}
            canPublish={canPublish}
            authorizedCreators={authorizedCreators}
            canManageCreators={canManageCreators}
            onAddAuthorizedCreator={handleAddAuthorizedCreator}
            onRemoveAuthorizedCreator={handleRemoveAuthorizedCreator}
            readOnly={isReadOnlyCloud}
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
