import {
  GoalRecord,
  Match,
  PlayerCardStat,
  SanctionRecord,
  ScorerStat,
  StandingsRow,
  Team,
  TournamentConfig,
  TournamentData,
  TournamentFormat,
} from '../types';

export const INITIAL_DEMO_DATA: TournamentData = {
  config: {
    id: 'demo-tournament-2026',
    name: 'Torneo Apertura 2026',
    category: 'Primera Damas',
    season: '2026',
    status: 'active',
    courtsCount: 2,
    format: 'groups_playoffs_semis',
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
  },
  teams: [
    {
      id: 'team-1',
      name: 'Las Leonas HC',
      color: '#0284C7', // Sky Blue
      players: [
        { id: 'p1-1', name: 'Agustina Albertario', number: 7, teamId: 'team-1' },
        { id: 'p1-2', name: 'Delfina Merino', number: 12, teamId: 'team-1' },
        { id: 'p1-3', name: 'Rocío Sánchez', number: 5, teamId: 'team-1' },
        { id: 'p1-4', name: 'Belén Succi', number: 1, teamId: 'team-1' },
        { id: 'p1-5', name: 'Majo Granatto', number: 11, teamId: 'team-1' },
        { id: 'p1-6', name: 'Valentina Raposo', number: 2, teamId: 'team-1' },
      ],
    },
    {
      id: 'team-2',
      name: 'San Fernando Hockey',
      color: '#059669', // Emerald Green
      players: [
        { id: 'p2-1', name: 'Sol Pagella', number: 10, teamId: 'team-2' },
        { id: 'p2-2', name: 'Micaela Retegui', number: 8, teamId: 'team-2' },
        { id: 'p2-3', name: 'Lucía Sanguinetti', number: 4, teamId: 'team-2' },
        { id: 'p2-4', name: 'Camila Bustos', number: 9, teamId: 'team-2' },
        { id: 'p2-5', name: 'Julieta Jankunas', number: 28, teamId: 'team-2' },
      ],
    },
    {
      id: 'team-3',
      name: 'Belgrano Athletic',
      color: '#DC2626', // Crimson Red
      players: [
        { id: 'p3-1', name: 'Carla Dupuy', number: 14, teamId: 'team-3' },
        { id: 'p3-2', name: 'Rosario Luchetti', number: 6, teamId: 'team-3' },
        { id: 'p3-3', name: 'Magdalena Aicega', number: 3, teamId: 'team-3' },
        { id: 'p3-4', name: 'Victoria Zuloaga', number: 15, teamId: 'team-3' },
        { id: 'p3-5', name: 'Pilar Campoy', number: 23, teamId: 'team-3' },
      ],
    },
    {
      id: 'team-4',
      name: 'Mitre Hockey',
      color: '#D97706', // Amber
      players: [
        { id: 'p4-1', name: 'Clara Barberi', number: 13, teamId: 'team-4' },
        { id: 'p4-2', name: 'Eugenia Trinchinetti', number: 22, teamId: 'team-4' },
        { id: 'p4-3', name: 'Sofía Toccalino', number: 16, teamId: 'team-4' },
        { id: 'p4-4', name: 'Agostina Alonso', number: 18, teamId: 'team-4' },
      ],
    },
    {
      id: 'team-5',
      name: 'Lomas Athletic',
      color: '#7C3AED', // Violet
      players: [
        { id: 'p5-1', name: 'Celina Di Santo', number: 19, teamId: 'team-5' },
        { id: 'p5-2', name: 'Valentina Costa', number: 24, teamId: 'team-5' },
        { id: 'p5-3', name: 'Martina Cavallero', number: 27, teamId: 'team-5' },
        { id: 'p5-4', name: 'Victoria Sauze', number: 25, teamId: 'team-5' },
      ],
    },
    {
      id: 'team-6',
      name: 'San Isidro Club (SIC)',
      color: '#2563EB', // Blue
      players: [
        { id: 'p6-1', name: 'Florencia Habif', number: 21, teamId: 'team-6' },
        { id: 'p6-2', name: 'Noel Barrionuevo', number: 17, teamId: 'team-6' },
        { id: 'p6-3', name: 'Giselle Kañevsky', number: 26, teamId: 'team-6' },
        { id: 'p6-4', name: 'Macarena Rodríguez', number: 30, teamId: 'team-6' },
      ],
    },
  ],
  matches: [
    // Fecha 1 (Completada)
    {
      id: 'm-1-1',
      round: 1,
      stage: 'group',
      stageLabel: 'Fecha 1',
      court: 'Cancha 1',
      teamAId: 'team-1',
      teamBId: 'team-2',
      scoreA: 3,
      scoreB: 1,
      isCompleted: true,
      isShootout: false,
      goals: [
        { id: 'g-1', playerId: 'p1-1', playerName: 'Agustina Albertario', teamId: 'team-1', count: 2 },
        { id: 'g-2', playerId: 'p1-5', playerName: 'Majo Granatto', teamId: 'team-1', count: 1 },
        { id: 'g-3', playerId: 'p2-5', playerName: 'Julieta Jankunas', teamId: 'team-2', count: 1 },
      ],
      sanctions: [
        { id: 's-1', playerId: 'p2-2', playerName: 'Micaela Retegui', teamId: 'team-2', cardType: 'green', minute: 14 },
        { id: 's-2', playerId: 'p1-3', playerName: 'Rocío Sánchez', teamId: 'team-1', cardType: 'yellow', minute: 32 },
      ],
    },
    {
      id: 'm-1-2',
      round: 1,
      stage: 'group',
      stageLabel: 'Fecha 1',
      court: 'Cancha 2',
      teamAId: 'team-3',
      teamBId: 'team-4',
      scoreA: 2,
      scoreB: 2,
      isCompleted: true,
      isShootout: false,
      goals: [
        { id: 'g-4', playerId: 'p3-1', playerName: 'Carla Dupuy', teamId: 'team-3', count: 1 },
        { id: 'g-5', playerId: 'p3-5', playerName: 'Pilar Campoy', teamId: 'team-3', count: 1 },
        { id: 'g-6', playerId: 'p4-2', playerName: 'Eugenia Trinchinetti', teamId: 'team-4', count: 2 },
      ],
      sanctions: [
        { id: 's-3', playerId: 'p3-3', playerName: 'Magdalena Aicega', teamId: 'team-3', cardType: 'green', minute: 20 },
      ],
    },
    {
      id: 'm-1-3',
      round: 1,
      stage: 'group',
      stageLabel: 'Fecha 1',
      court: 'Cancha 1',
      teamAId: 'team-5',
      teamBId: 'team-6',
      scoreA: 1,
      scoreB: 0,
      isCompleted: true,
      isShootout: false,
      goals: [
        { id: 'g-7', playerId: 'p5-1', playerName: 'Celina Di Santo', teamId: 'team-5', count: 1 },
      ],
      sanctions: [],
    },
    // Fecha 2 (Completada parcialmente)
    {
      id: 'm-2-1',
      round: 2,
      stage: 'group',
      stageLabel: 'Fecha 2',
      court: 'Cancha 1',
      teamAId: 'team-1',
      teamBId: 'team-3',
      scoreA: 4,
      scoreB: 2,
      isCompleted: true,
      isShootout: false,
      goals: [
        { id: 'g-8', playerId: 'p1-1', playerName: 'Agustina Albertario', teamId: 'team-1', count: 1 },
        { id: 'g-9', playerId: 'p1-2', playerName: 'Delfina Merino', teamId: 'team-1', count: 2 },
        { id: 'g-10', playerId: 'p1-5', playerName: 'Majo Granatto', teamId: 'team-1', count: 1 },
        { id: 'g-11', playerId: 'p3-1', playerName: 'Carla Dupuy', teamId: 'team-3', count: 2 },
      ],
      sanctions: [
        { id: 's-4', playerId: 'p3-4', playerName: 'Victoria Zuloaga', teamId: 'team-3', cardType: 'yellow', minute: 28 },
      ],
    },
    {
      id: 'm-2-2',
      round: 2,
      stage: 'group',
      stageLabel: 'Fecha 2',
      court: 'Cancha 2',
      teamAId: 'team-2',
      teamBId: 'team-6',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'm-2-3',
      round: 2,
      stage: 'group',
      stageLabel: 'Fecha 2',
      court: 'Cancha 1',
      teamAId: 'team-4',
      teamBId: 'team-5',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    // Fecha 3 (Pendiente)
    {
      id: 'm-3-1',
      round: 3,
      stage: 'group',
      stageLabel: 'Fecha 3',
      court: 'Cancha 1',
      teamAId: 'team-1',
      teamBId: 'team-4',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'm-3-2',
      round: 3,
      stage: 'group',
      stageLabel: 'Fecha 3',
      court: 'Cancha 2',
      teamAId: 'team-2',
      teamBId: 'team-5',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'm-3-3',
      round: 3,
      stage: 'group',
      stageLabel: 'Fecha 3',
      court: 'Cancha 1',
      teamAId: 'team-3',
      teamBId: 'team-6',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    // Fecha 4 (Pendiente)
    {
      id: 'm-4-1',
      round: 4,
      stage: 'group',
      stageLabel: 'Fecha 4',
      court: 'Cancha 1',
      teamAId: 'team-1',
      teamBId: 'team-5',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'm-4-2',
      round: 4,
      stage: 'group',
      stageLabel: 'Fecha 4',
      court: 'Cancha 2',
      teamAId: 'team-2',
      teamBId: 'team-3',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'm-4-3',
      round: 4,
      stage: 'group',
      stageLabel: 'Fecha 4',
      court: 'Cancha 1',
      teamAId: 'team-4',
      teamBId: 'team-6',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    // Fecha 5 (Pendiente)
    {
      id: 'm-5-1',
      round: 5,
      stage: 'group',
      stageLabel: 'Fecha 5',
      court: 'Cancha 1',
      teamAId: 'team-1',
      teamBId: 'team-6',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'm-5-2',
      round: 5,
      stage: 'group',
      stageLabel: 'Fecha 5',
      court: 'Cancha 2',
      teamAId: 'team-2',
      teamBId: 'team-4',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'm-5-3',
      round: 5,
      stage: 'group',
      stageLabel: 'Fecha 5',
      court: 'Cancha 1',
      teamAId: 'team-3',
      teamBId: 'team-5',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    // Playoff Semis
    {
      id: 'po-semi-1',
      round: 6,
      stage: 'semi',
      stageLabel: 'Semifinal 1',
      court: 'Cancha 1',
      teamAId: '',
      teamBId: '',
      placeholderA: '1° Posición Fase Regular',
      placeholderB: '4° Posición Fase Regular',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'po-semi-2',
      round: 6,
      stage: 'semi',
      stageLabel: 'Semifinal 2',
      court: 'Cancha 2',
      teamAId: '',
      teamBId: '',
      placeholderA: '2° Posición Fase Regular',
      placeholderB: '3° Posición Fase Regular',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    // Playoff Final
    {
      id: 'po-final',
      round: 7,
      stage: 'final',
      stageLabel: 'Gran Final',
      court: 'Cancha 1',
      teamAId: '',
      teamBId: '',
      placeholderA: 'Ganador Semifinal 1',
      placeholderB: 'Ganador Semifinal 2',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export const DEMO_PAST_TOURNAMENT: TournamentData = {
  config: {
    id: 'demo-tournament-2025',
    name: 'Torneo Clausura 2025',
    category: 'Primera Damas',
    season: '2025',
    status: 'completed',
    courtsCount: 1,
    format: 'groups_playoffs_final',
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
  },
  teams: [
    {
      id: 'past-t1',
      name: 'Las Leonas HC',
      color: '#0284C7',
      players: [
        { id: 'pp-1', name: 'Agustina Albertario', number: 7, teamId: 'past-t1' },
        { id: 'pp-2', name: 'Delfina Merino', number: 12, teamId: 'past-t1' },
      ],
    },
    {
      id: 'past-t2',
      name: 'San Fernando Hockey',
      color: '#059669',
      players: [
        { id: 'pp-3', name: 'Sol Pagella', number: 10, teamId: 'past-t2' },
        { id: 'pp-4', name: 'Micaela Retegui', number: 8, teamId: 'past-t2' },
      ],
    },
    {
      id: 'past-t3',
      name: 'Belgrano Athletic',
      color: '#DC2626',
      players: [
        { id: 'pp-5', name: 'Carla Dupuy', number: 14, teamId: 'past-t3' },
      ],
    },
    {
      id: 'past-t4',
      name: 'Mitre Hockey',
      color: '#D97706',
      players: [
        { id: 'pp-6', name: 'Eugenia Trinchinetti', number: 22, teamId: 'past-t4' },
      ],
    },
  ],
  matches: [
    {
      id: 'pm-1',
      round: 1,
      stage: 'group',
      stageLabel: 'Fecha 1',
      court: 'Cancha 1',
      teamAId: 'past-t1',
      teamBId: 'past-t2',
      scoreA: 2,
      scoreB: 1,
      isCompleted: true,
      isShootout: false,
      goals: [{ id: 'pg-1', playerId: 'pp-1', playerName: 'Agustina Albertario', teamId: 'past-t1', count: 2 }],
      sanctions: [],
    },
    {
      id: 'pm-2',
      round: 1,
      stage: 'group',
      stageLabel: 'Fecha 1',
      court: 'Cancha 1',
      teamAId: 'past-t3',
      teamBId: 'past-t4',
      scoreA: 1,
      scoreB: 1,
      isCompleted: true,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'pm-3',
      round: 2,
      stage: 'group',
      stageLabel: 'Fecha 2',
      court: 'Cancha 1',
      teamAId: 'past-t1',
      teamBId: 'past-t3',
      scoreA: 3,
      scoreB: 0,
      isCompleted: true,
      isShootout: false,
      goals: [{ id: 'pg-2', playerId: 'pp-2', playerName: 'Delfina Merino', teamId: 'past-t1', count: 3 }],
      sanctions: [],
    },
    {
      id: 'pm-4',
      round: 2,
      stage: 'group',
      stageLabel: 'Fecha 2',
      court: 'Cancha 1',
      teamAId: 'past-t2',
      teamBId: 'past-t4',
      scoreA: 2,
      scoreB: 0,
      isCompleted: true,
      isShootout: false,
      goals: [{ id: 'pg-3', playerId: 'pp-3', playerName: 'Sol Pagella', teamId: 'past-t2', count: 2 }],
      sanctions: [],
    },
    {
      id: 'pm-5',
      round: 3,
      stage: 'group',
      stageLabel: 'Fecha 3',
      court: 'Cancha 1',
      teamAId: 'past-t1',
      teamBId: 'past-t4',
      scoreA: 4,
      scoreB: 1,
      isCompleted: true,
      isShootout: false,
      goals: [{ id: 'pg-4', playerId: 'pp-1', playerName: 'Agustina Albertario', teamId: 'past-t1', count: 3 }],
      sanctions: [],
    },
    {
      id: 'pm-6',
      round: 3,
      stage: 'group',
      stageLabel: 'Fecha 3',
      court: 'Cancha 1',
      teamAId: 'past-t2',
      teamBId: 'past-t3',
      scoreA: 2,
      scoreB: 1,
      isCompleted: true,
      isShootout: false,
      goals: [{ id: 'pg-5', playerId: 'pp-4', playerName: 'Micaela Retegui', teamId: 'past-t2', count: 2 }],
      sanctions: [],
    },
    // Final
    {
      id: 'pm-final',
      round: 4,
      stage: 'final',
      stageLabel: 'Gran Final',
      court: 'Cancha 1',
      teamAId: 'past-t1',
      teamBId: 'past-t2',
      scoreA: 3,
      scoreB: 2,
      isCompleted: true,
      isShootout: false,
      goals: [
        { id: 'pg-6', playerId: 'pp-1', playerName: 'Agustina Albertario', teamId: 'past-t1', count: 2 },
        { id: 'pg-7', playerId: 'pp-3', playerName: 'Sol Pagella', teamId: 'past-t2', count: 2 },
      ],
      sanctions: [],
    },
  ],
  lastUpdated: '2025-11-20T18:00:00.000Z',
};

export const DEMO_UPCOMING_TOURNAMENT: TournamentData = {
  config: {
    id: 'demo-tournament-seven',
    name: 'Seven Nocturno de Hockey 2026',
    category: 'Mami Hockey / Libres',
    season: '2026',
    status: 'upcoming',
    courtsCount: 2,
    format: 'groups_only',
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
  },
  teams: [
    {
      id: 'sev-t1',
      name: 'Pumas Hockey 7',
      color: '#EA580C',
      players: [
        { id: 'sp-1', name: 'Mariana Rossi', number: 9, teamId: 'sev-t1' },
        { id: 'sp-2', name: 'Laura Fernández', number: 10, teamId: 'sev-t1' },
      ],
    },
    {
      id: 'sev-t2',
      name: 'Valkirias HC',
      color: '#DB2777',
      players: [
        { id: 'sp-3', name: 'Catalina Gómez', number: 7, teamId: 'sev-t2' },
        { id: 'sp-4', name: 'Paula Méndez', number: 11, teamId: 'sev-t2' },
      ],
    },
    {
      id: 'sev-t3',
      name: 'Amazonas Seven',
      color: '#059669',
      players: [
        { id: 'sp-5', name: 'Sofía Carrizo', number: 5, teamId: 'sev-t3' },
      ],
    },
    {
      id: 'sev-t4',
      name: 'Gladiadoras Hockey',
      color: '#7C3AED',
      players: [
        { id: 'sp-6', name: 'Martina Benítez', number: 8, teamId: 'sev-t4' },
      ],
    },
  ],
  matches: [
    {
      id: 'sm-1',
      round: 1,
      stage: 'group',
      stageLabel: 'Fecha 1',
      court: 'Cancha 1',
      teamAId: 'sev-t1',
      teamBId: 'sev-t2',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'sm-2',
      round: 1,
      stage: 'group',
      stageLabel: 'Fecha 1',
      court: 'Cancha 2',
      teamAId: 'sev-t3',
      teamBId: 'sev-t4',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'sm-3',
      round: 2,
      stage: 'group',
      stageLabel: 'Fecha 2',
      court: 'Cancha 1',
      teamAId: 'sev-t1',
      teamBId: 'sev-t3',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'sm-4',
      round: 2,
      stage: 'group',
      stageLabel: 'Fecha 2',
      court: 'Cancha 2',
      teamAId: 'sev-t2',
      teamBId: 'sev-t4',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'sm-5',
      round: 3,
      stage: 'group',
      stageLabel: 'Fecha 3',
      court: 'Cancha 1',
      teamAId: 'sev-t1',
      teamBId: 'sev-t4',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
    {
      id: 'sm-6',
      round: 3,
      stage: 'group',
      stageLabel: 'Fecha 3',
      court: 'Cancha 2',
      teamAId: 'sev-t2',
      teamBId: 'sev-t3',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_TOURNAMENTS: TournamentData[] = [
  INITIAL_DEMO_DATA,
  DEMO_PAST_TOURNAMENT,
  DEMO_UPCOMING_TOURNAMENT,
];

export function createNewTournament(
  name: string,
  category: string,
  season: string,
  format: TournamentFormat,
  courtsCount: number,
  baseTeams?: Team[],
  isDoubleRound: boolean = false
): TournamentData {
  const id = `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  // If base teams provided, clone them with new IDs
  const teams: Team[] = (baseTeams || []).map((t, idx) => ({
    id: `team-${id}-${idx + 1}`,
    name: t.name,
    color: t.color,
    players: t.players.map((p, pIdx) => ({
      id: `p-${id}-${idx + 1}-${pIdx + 1}`,
      name: p.name,
      number: p.number,
      teamId: `team-${id}-${idx + 1}`,
    })),
  }));

  const matches = generateFixture(teams, format, courtsCount, isDoubleRound);

  return {
    config: {
      id,
      name: name.trim() || 'Nuevo Torneo de Hockey',
      category: category.trim() || 'General',
      season: season.trim() || `${new Date().getFullYear()}`,
      status: 'upcoming',
      courtsCount: Math.max(1, courtsCount),
      format,
      isDoubleRound,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
    },
    teams,
    matches,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generates Round-Robin matches for a list of teams and distributes across available courts.
 * Supports single round (Solo Ida) or double round (Ida y Vuelta).
 */
export function generateFixture(
  teams: Team[],
  format: TournamentFormat,
  courtsCount: number,
  isDoubleRound: boolean = false
): Match[] {
  if (teams.length < 2) return [];

  const teamList = [...teams];
  const isOdd = teamList.length % 2 !== 0;
  if (isOdd) {
    // Add dummy bye team
    teamList.push({
      id: 'BYE',
      name: 'Fecha Libre',
      color: '#94a3b8',
      players: [],
    });
  }

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const matches: Match[] = [];
  const courts = Array.from({ length: Math.max(1, courtsCount) }, (_, i) => `Cancha ${i + 1}`);

  let globalCourtIdx = 0;

  // Round robin rotation - First Leg (Ida)
  for (let round = 0; round < numRounds; round++) {
    const roundNumber = round + 1;
    const stageLabel = isDoubleRound ? `Fecha ${roundNumber} (Ida)` : `Fecha ${roundNumber}`;

    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      const homeIdx = (round + matchIdx) % (numTeams - 1);
      let awayIdx = (numTeams - 1 - matchIdx + round) % (numTeams - 1);
      if (matchIdx === 0) {
        awayIdx = numTeams - 1;
      }

      const teamA = teamList[homeIdx];
      const teamB = teamList[awayIdx];

      // Skip bye match
      if (teamA.id === 'BYE' || teamB.id === 'BYE') {
        continue;
      }

      const court = courts[globalCourtIdx % courts.length];
      globalCourtIdx++;

      matches.push({
        id: `match-r${roundNumber}-${matchIdx}-${Date.now().toString(36)}`,
        round: roundNumber,
        stage: 'group',
        stageLabel,
        court,
        teamAId: teamA.id,
        teamBId: teamB.id,
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      });
    }
  }

  // Second Leg (Vuelta) if double round is enabled
  if (isDoubleRound) {
    for (let round = 0; round < numRounds; round++) {
      const returnRoundNumber = numRounds + round + 1;
      const stageLabel = `Fecha ${returnRoundNumber} (Vuelta)`;

      for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
        const homeIdx = (round + matchIdx) % (numTeams - 1);
        let awayIdx = (numTeams - 1 - matchIdx + round) % (numTeams - 1);
        if (matchIdx === 0) {
          awayIdx = numTeams - 1;
        }

        // Invert home and away for return leg
        const teamA = teamList[awayIdx];
        const teamB = teamList[homeIdx];

        // Skip bye match
        if (teamA.id === 'BYE' || teamB.id === 'BYE') {
          continue;
        }

        const court = courts[globalCourtIdx % courts.length];
        globalCourtIdx++;

        matches.push({
          id: `match-r${returnRoundNumber}-${matchIdx}-${Date.now().toString(36)}`,
          round: returnRoundNumber,
          stage: 'group',
          stageLabel,
          court,
          teamAId: teamA.id,
          teamBId: teamB.id,
          scoreA: null,
          scoreB: null,
          isCompleted: false,
          isShootout: false,
          goals: [],
          sanctions: [],
        });
      }
    }
  }

  const totalGroupRounds = isDoubleRound ? numRounds * 2 : numRounds;

  // Generate Playoff Matches if format requires it
  if (format === 'groups_playoffs_final') {
    matches.push({
      id: `po-final-${Date.now().toString(36)}`,
      round: totalGroupRounds + 1,
      stage: 'final',
      stageLabel: 'Gran Final',
      court: courts[0],
      teamAId: '',
      teamBId: '',
      placeholderA: '1° Posición Fase Regular',
      placeholderB: '2° Posición Fase Regular',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      isShootout: false,
      goals: [],
      sanctions: [],
    });
  } else if (format === 'groups_playoffs_semis') {
    const semiRound = totalGroupRounds + 1;
    matches.push(
      {
        id: `po-semi-1-${Date.now().toString(36)}`,
        round: semiRound,
        stage: 'semi',
        stageLabel: 'Semifinal 1',
        court: courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: '1° Posición Fase Regular',
        placeholderB: '4° Posición Fase Regular',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      },
      {
        id: `po-semi-2-${Date.now().toString(36)}`,
        round: semiRound,
        stage: 'semi',
        stageLabel: 'Semifinal 2',
        court: courts[1] || courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: '2° Posición Fase Regular',
        placeholderB: '3° Posición Fase Regular',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      },
      {
        id: `po-final-${Date.now().toString(36)}`,
        round: semiRound + 1,
        stage: 'final',
        stageLabel: 'Gran Final',
        court: courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: 'Ganador Semifinal 1',
        placeholderB: 'Ganador Semifinal 2',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      }
    );
  } else if (format === 'groups_playoffs_quarters') {
    const qRound = totalGroupRounds + 1;
    matches.push(
      {
        id: `po-q-1-${Date.now().toString(36)}`,
        round: qRound,
        stage: 'quarter',
        stageLabel: 'Cuartos 1',
        court: courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: '1° Fase Regular',
        placeholderB: '8° Fase Regular',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      },
      {
        id: `po-q-2-${Date.now().toString(36)}`,
        round: qRound,
        stage: 'quarter',
        stageLabel: 'Cuartos 2',
        court: courts[1] || courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: '4° Fase Regular',
        placeholderB: '5° Fase Regular',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      },
      {
        id: `po-q-3-${Date.now().toString(36)}`,
        round: qRound,
        stage: 'quarter',
        stageLabel: 'Cuartos 3',
        court: courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: '2° Fase Regular',
        placeholderB: '7° Fase Regular',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      },
      {
        id: `po-q-4-${Date.now().toString(36)}`,
        round: qRound,
        stage: 'quarter',
        stageLabel: 'Cuartos 4',
        court: courts[1] || courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: '3° Fase Regular',
        placeholderB: '6° Fase Regular',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      },
      {
        id: `po-semi-1-${Date.now().toString(36)}`,
        round: qRound + 1,
        stage: 'semi',
        stageLabel: 'Semifinal 1',
        court: courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: 'Ganador Cuartos 1',
        placeholderB: 'Ganador Cuartos 2',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      },
      {
        id: `po-semi-2-${Date.now().toString(36)}`,
        round: qRound + 1,
        stage: 'semi',
        stageLabel: 'Semifinal 2',
        court: courts[1] || courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: 'Ganador Cuartos 3',
        placeholderB: 'Ganador Cuartos 4',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      },
      {
        id: `po-final-${Date.now().toString(36)}`,
        round: qRound + 2,
        stage: 'final',
        stageLabel: 'Gran Final',
        court: courts[0],
        teamAId: '',
        teamBId: '',
        placeholderA: 'Ganador Semifinal 1',
        placeholderB: 'Ganador Semifinal 2',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
        isShootout: false,
        goals: [],
        sanctions: [],
      }
    );
  } else if (format === 'knockout_only') {
    // Pure knockout
    const count = teams.length;
    let roundNum = 1;
    if (count <= 4) {
      matches.push(
        {
          id: `ko-semi-1-${Date.now().toString(36)}`,
          round: roundNum,
          stage: 'semi',
          stageLabel: 'Semifinal 1',
          court: courts[0],
          teamAId: teams[0]?.id || '',
          teamBId: teams[3]?.id || teams[1]?.id || '',
          scoreA: null,
          scoreB: null,
          isCompleted: false,
          isShootout: false,
          goals: [],
          sanctions: [],
        },
        {
          id: `ko-semi-2-${Date.now().toString(36)}`,
          round: roundNum,
          stage: 'semi',
          stageLabel: 'Semifinal 2',
          court: courts[1] || courts[0],
          teamAId: teams[1]?.id || '',
          teamBId: teams[2]?.id || '',
          scoreA: null,
          scoreB: null,
          isCompleted: false,
          isShootout: false,
          goals: [],
          sanctions: [],
        },
        {
          id: `ko-final-${Date.now().toString(36)}`,
          round: roundNum + 1,
          stage: 'final',
          stageLabel: 'Gran Final',
          court: courts[0],
          teamAId: '',
          teamBId: '',
          placeholderA: 'Ganador Semifinal 1',
          placeholderB: 'Ganador Semifinal 2',
          scoreA: null,
          scoreB: null,
          isCompleted: false,
          isShootout: false,
          goals: [],
          sanctions: [],
        }
      );
    }
  }

  return matches;
}

/**
 * Calculates standings table for regular phase matches with hockey tie-breakers:
 * 1. Points (3 for win, 1 for draw, 0 for loss)
 * 2. Goal Difference (GF - GC)
 * 3. Goals For (GF)
 * 4. Fair Play
 */
export function calculateStandings(
  teams: Team[],
  matches: Match[],
  config: TournamentConfig
): StandingsRow[] {
  const statsMap: Record<string, {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    greenCards: number;
    yellowCards: number;
    redCards: number;
  }> = {};

  teams.forEach((team) => {
    statsMap[team.id] = {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      greenCards: 0,
      yellowCards: 0,
      redCards: 0,
    };
  });

  // Calculate card counts from ALL completed matches
  matches.forEach((m) => {
    m.sanctions?.forEach((s) => {
      if (statsMap[s.teamId]) {
        if (s.cardType === 'green') statsMap[s.teamId].greenCards += 1;
        if (s.cardType === 'yellow') statsMap[s.teamId].yellowCards += 1;
        if (s.cardType === 'red') statsMap[s.teamId].redCards += 1;
      }
    });
  });

  // Calculate regular group stage matches only for league standings
  matches
    .filter((m) => m.stage === 'group' && m.isCompleted && m.scoreA !== null && m.scoreB !== null)
    .forEach((m) => {
      const aStats = statsMap[m.teamAId];
      const bStats = statsMap[m.teamBId];

      if (!aStats || !bStats) return;

      const scoreA = m.scoreA!;
      const scoreB = m.scoreB!;

      aStats.played += 1;
      bStats.played += 1;
      aStats.goalsFor += scoreA;
      aStats.goalsAgainst += scoreB;
      bStats.goalsFor += scoreB;
      bStats.goalsAgainst += scoreA;

      if (scoreA > scoreB) {
        aStats.won += 1;
        aStats.points += config.pointsWin;
        bStats.lost += 1;
        bStats.points += config.pointsLoss;
      } else if (scoreA < scoreB) {
        bStats.won += 1;
        bStats.points += config.pointsWin;
        aStats.lost += 1;
        aStats.points += config.pointsLoss;
      } else {
        aStats.drawn += 1;
        bStats.drawn += 1;
        aStats.points += config.pointsDraw;
        bStats.points += config.pointsDraw;
      }
    });

  const rows: StandingsRow[] = teams.map((team) => {
    const s = statsMap[team.id] || {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      greenCards: 0,
      yellowCards: 0,
      redCards: 0,
    };
    return {
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      rank: 0,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDiff: s.goalsFor - s.goalsAgainst,
      points: s.points,
      greenCards: s.greenCards,
      yellowCards: s.yellowCards,
      redCards: s.redCards,
    };
  });

  // Sort by Points DESC -> Goal Difference DESC -> Goals For DESC
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  // Assign ranks
  rows.forEach((row, idx) => {
    row.rank = idx + 1;
  });

  return rows;
}

/**
 * Updates dynamic playoff match teams based on group stage standings and previous playoff winners
 */
export function syncPlayoffMatches(
  matches: Match[],
  standings: StandingsRow[],
  teams: Team[]
): Match[] {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const updated = [...matches];

  // Map of match winners
  const matchWinners: Record<string, string> = {};
  updated.forEach((m) => {
    if (m.isCompleted && m.scoreA !== null && m.scoreB !== null) {
      if (m.isShootout && m.shootoutWinnerTeamId) {
        matchWinners[m.id] = m.shootoutWinnerTeamId;
      } else if (m.scoreA > m.scoreB) {
        matchWinners[m.id] = m.teamAId;
      } else if (m.scoreB > m.scoreA) {
        matchWinners[m.id] = m.teamBId;
      }
    }
  });

  updated.forEach((m) => {
    if (m.stage === 'semi') {
      if (m.stageLabel.includes('1') && standings.length >= 4) {
        if (!m.teamAId || m.teamAId !== standings[0]?.teamId) {
          m.teamAId = standings[0]?.teamId || '';
        }
        if (!m.teamBId || m.teamBId !== standings[3]?.teamId) {
          m.teamBId = standings[3]?.teamId || '';
        }
      } else if (m.stageLabel.includes('2') && standings.length >= 3) {
        if (!m.teamAId || m.teamAId !== standings[1]?.teamId) {
          m.teamAId = standings[1]?.teamId || '';
        }
        if (!m.teamBId || m.teamBId !== standings[2]?.teamId) {
          m.teamBId = standings[2]?.teamId || '';
        }
      }
    } else if (m.stage === 'final') {
      // If final is straight from standings (groups_playoffs_final)
      const semi1 = updated.find((x) => x.stage === 'semi' && x.stageLabel.includes('1'));
      const semi2 = updated.find((x) => x.stage === 'semi' && x.stageLabel.includes('2'));

      if (semi1 && semi2) {
        // Winners from semis
        const winner1 = matchWinners[semi1.id];
        const winner2 = matchWinners[semi2.id];
        if (winner1 && m.teamAId !== winner1) m.teamAId = winner1;
        if (winner2 && m.teamBId !== winner2) m.teamBId = winner2;
      } else if (standings.length >= 2) {
        // 1st vs 2nd direct final
        if (!m.teamAId || m.teamAId !== standings[0]?.teamId) {
          m.teamAId = standings[0]?.teamId || '';
        }
        if (!m.teamBId || m.teamBId !== standings[1]?.teamId) {
          m.teamBId = standings[1]?.teamId || '';
        }
      }
    }
  });

  return updated;
}

/**
 * Computes top scorers from all completed matches
 */
export function calculateTopScorers(teams: Team[], matches: Match[]): ScorerStat[] {
  const scorersMap: Record<string, {
    playerName: string;
    playerId: string;
    teamId: string;
    goals: number;
  }> = {};

  matches.forEach((m) => {
    m.goals?.forEach((g) => {
      if (!g.playerId) return;
      if (!scorersMap[g.playerId]) {
        scorersMap[g.playerId] = {
          playerId: g.playerId,
          playerName: g.playerName,
          teamId: g.teamId,
          goals: 0,
        };
      }
      scorersMap[g.playerId].goals += g.count || 1;
    });
  });

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map<string, { number: number; name: string }>();
  teams.forEach((t) => {
    t.players.forEach((p) => {
      playerMap.set(p.id, { number: p.number, name: p.name });
    });
  });

  const list: ScorerStat[] = Object.values(scorersMap).map((item) => {
    const team = teamMap.get(item.teamId);
    const pInfo = playerMap.get(item.playerId);
    return {
      playerId: item.playerId,
      playerName: pInfo?.name || item.playerName,
      playerNumber: pInfo?.number || 0,
      teamId: item.teamId,
      teamName: team?.name || 'Equipo',
      teamColor: team?.color || '#0284c7',
      goals: item.goals,
    };
  });

  return list.sort((a, b) => b.goals - a.goals);
}

/**
 * Computes player fair play card stats
 */
export function calculatePlayerCards(teams: Team[], matches: Match[]): PlayerCardStat[] {
  const cardsMap: Record<string, {
    playerId: string;
    playerName: string;
    teamId: string;
    green: number;
    yellow: number;
    red: number;
  }> = {};

  matches.forEach((m) => {
    m.sanctions?.forEach((s) => {
      if (!s.playerId) return;
      if (!cardsMap[s.playerId]) {
        cardsMap[s.playerId] = {
          playerId: s.playerId,
          playerName: s.playerName,
          teamId: s.teamId,
          green: 0,
          yellow: 0,
          red: 0,
        };
      }
      if (s.cardType === 'green') cardsMap[s.playerId].green += 1;
      if (s.cardType === 'yellow') cardsMap[s.playerId].yellow += 1;
      if (s.cardType === 'red') cardsMap[s.playerId].red += 1;
    });
  });

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map<string, { number: number; name: string }>();
  teams.forEach((t) => {
    t.players.forEach((p) => {
      playerMap.set(p.id, { number: p.number, name: p.name });
    });
  });

  const list: PlayerCardStat[] = Object.values(cardsMap).map((c) => {
    const team = teamMap.get(c.teamId);
    const pInfo = playerMap.get(c.playerId);
    const total = c.green + c.yellow * 2 + c.red * 3;
    return {
      playerId: c.playerId,
      playerName: pInfo?.name || c.playerName,
      playerNumber: pInfo?.number || 0,
      teamId: c.teamId,
      teamName: team?.name || 'Equipo',
      teamColor: team?.color || '#64748b',
      green: c.green,
      yellow: c.yellow,
      red: c.red,
      totalCards: total,
    };
  });

  return list.sort((a, b) => b.totalCards - a.totalCards);
}

/**
 * Formats a Single Match Result / Match Sheet specifically for WhatsApp
 */
export function formatWhatsAppSingleMatch(
  match: Match,
  teams: Team[],
  tournamentName: string,
  category?: string,
  season?: string,
  whatsappHeader?: string,
  whatsappFooter?: string
): string {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const teamA = teamMap.get(match.teamAId);
  const teamB = teamMap.get(match.teamBId);
  const nameA = teamA?.name || match.placeholderA || 'Equipo A';
  const nameB = teamB?.name || match.placeholderB || 'Equipo B';

  const cat = category ? ` - ${category}` : '';
  const yr = season ? ` (${season})` : '';

  const headerLine = whatsappHeader && whatsappHeader.trim()
    ? `${whatsappHeader.trim()}\n`
    : `🏑 *${tournamentName.toUpperCase()}*${cat}${yr}\n`;

  let text = headerLine;
  text += `📍 *${match.stageLabel || `Fecha ${match.round}`}* • ${match.court}\n`;
  text += `───────────────────────\n`;

  if (match.isCompleted) {
    text += `🏁 *RESULTADO FINAL*\n\n`;
    text += `🏆 *${nameA}  ${match.scoreA ?? 0}  -  ${match.scoreB ?? 0}  ${nameB}*\n`;

    if (match.isShootout) {
      const winnerName = match.shootoutWinnerTeamId === match.teamAId ? nameA : nameB;
      text += `⚡ _Penales australianos:_ *${match.shootoutScoreA ?? 0} - ${match.shootoutScoreB ?? 0}* (Gana ${winnerName})\n`;
    }

    // Goals breakdown
    if (match.goals && match.goals.length > 0) {
      const goalsA = match.goals.filter((g) => g.teamId === match.teamAId);
      const goalsB = match.goals.filter((g) => g.teamId === match.teamBId);

      text += `\n⚽ *Goles:* \n`;
      if (goalsA.length > 0) {
        text += ` • *${nameA}:* ${goalsA.map((g) => `${g.playerName}${g.count > 1 ? ` (${g.count})` : ''}`).join(', ')}\n`;
      }
      if (goalsB.length > 0) {
        text += ` • *${nameB}:* ${goalsB.map((g) => `${g.playerName}${g.count > 1 ? ` (${g.count})` : ''}`).join(', ')}\n`;
      }
    }

    // Sanctions breakdown
    if (match.sanctions && match.sanctions.length > 0) {
      text += `\n🛡️ *Tarjetas y Sanciones:* \n`;
      match.sanctions.forEach((s) => {
        const cardIcon = s.cardType === 'green' ? '🟢 Verde' : s.cardType === 'yellow' ? '🟡 Amarilla' : '🔴 Roja';
        const teamName = s.teamId === match.teamAId ? nameA : nameB;
        text += ` • ${cardIcon}: ${s.playerName} (${teamName})\n`;
      });
    }
  } else {
    text += `⏳ *PRÓXIMO PARTIDO*\n\n`;
    text += `🏑 *${nameA}*  vs  *${nameB}*\n`;
    text += `🏟️ ${match.court}\n`;
    if (match.date || match.time) {
      text += `🕒 ${match.date || ''} ${match.time || ''}\n`;
    }
  }

  const footerText = whatsappFooter && whatsappFooter.trim()
    ? `\n${whatsappFooter.trim()}`
    : `\n_Generado con Hockey Torneos PWA_ 🏑`;

  text += footerText;
  return text;
}

/**
 * Formats Standings Table specifically for WhatsApp
 */
export function formatWhatsAppStandings(
  tournamentName: string,
  standings: StandingsRow[],
  category?: string,
  season?: string,
  whatsappHeader?: string,
  whatsappFooter?: string
): string {
  const cat = category ? ` - ${category}` : '';
  const yr = season ? ` (${season})` : '';

  const headerLine = whatsappHeader && whatsappHeader.trim()
    ? `${whatsappHeader.trim()}\n`
    : `🏑 *${tournamentName.toUpperCase()}*${cat}${yr}\n`;

  let text = headerLine;
  text += `🏆 *TABLA DE POSICIONES*\n`;
  text += `📅 Actualización: ${new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })}\n\n`;

  text += `Pos | Equipo | PTS | PJ | PG | PE | PP | DG | GF\n`;
  text += `-----------------------------------------------\n`;

  standings.forEach((row, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    text += `${medal} *${row.teamName}*\n`;
    text += `     👉 *${row.points} pts* | PJ: ${row.played} | PG: ${row.won} | PE: ${row.drawn} | PP: ${row.lost} | DG: ${row.goalDiff > 0 ? '+' : ''}${row.goalDiff} | GF: ${row.goalsFor} (GC: ${row.goalsAgainst})\n`;
  });

  const footerText = whatsappFooter && whatsappFooter.trim()
    ? `\n${whatsappFooter.trim()}`
    : `\n_Generado con Hockey Torneos PWA_ 🏑`;

  text += footerText;
  return text;
}

/**
 * Formats Match Results / Fixture specifically for WhatsApp
 */
export function formatWhatsAppResults(
  tournamentName: string,
  matches: Match[],
  teams: Team[],
  roundFilter: string = 'all',
  category?: string,
  season?: string,
  whatsappHeader?: string,
  whatsappFooter?: string
): string {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const cat = category ? ` - ${category}` : '';
  const yr = season ? ` (${season})` : '';

  const headerLine = whatsappHeader && whatsappHeader.trim()
    ? `${whatsappHeader.trim()}\n`
    : `🏑 *${tournamentName.toUpperCase()}*${cat}${yr}\n`;

  let text = headerLine;
  text += `📅 *RESULTADOS Y FIXTURE*\n\n`;

  const filteredMatches = matches.filter((m) => {
    if (roundFilter === 'all') return true;
    return (m.stageLabel || `Fecha ${m.round}`) === roundFilter;
  });

  const rounds = Array.from(
    new Set(filteredMatches.map((m) => m.stageLabel || `Fecha ${m.round}`))
  );

  if (rounds.length === 0) {
    text += `_No hay partidos programados para esta fecha._\n`;
  } else {
    rounds.forEach((roundLabel) => {
      const roundMatches = filteredMatches.filter(
        (m) => (m.stageLabel || `Fecha ${m.round}`) === roundLabel
      );
      text += `📍 *${roundLabel.toUpperCase()}*\n`;

      roundMatches.forEach((m) => {
        const teamA = teamMap.get(m.teamAId)?.name || m.placeholderA || 'TBD';
        const teamB = teamMap.get(m.teamBId)?.name || m.placeholderB || 'TBD';

        if (m.isCompleted) {
          const shoot = m.isShootout
            ? `\n    └─ Penales australianos: ${m.shootoutScoreA ?? 0} - ${m.shootoutScoreB ?? 0}`
            : '';
          const goalDetails = m.goals && m.goals.length > 0
            ? `\n    └─ Goles: ${m.goals.map((g) => `${g.playerName} (${g.count})`).join(', ')}`
            : '';

          text += ` ✅ *${teamA} ${m.scoreA} - ${m.scoreB} ${teamB}* [${m.court}]${shoot}${goalDetails}\n`;
        } else {
          text += ` ⏳ ${teamA} vs ${teamB} [${m.court}] - Pendiente\n`;
        }
      });
      text += `\n`;
    });
  }

  const footerText = whatsappFooter && whatsappFooter.trim()
    ? `\n${whatsappFooter.trim()}`
    : `\n_Generado con Hockey Torneos PWA_ 🏑`;

  text += footerText;
  return text;
}

/**
 * Formats Top Scorers and Sanctions for WhatsApp
 */
export function formatWhatsAppScorers(
  tournamentName: string,
  topScorers: ScorerStat[],
  cardStats?: PlayerCardStat[],
  category?: string,
  whatsappHeader?: string,
  whatsappFooter?: string
): string {
  const cat = category ? ` - ${category}` : '';
  const headerLine = whatsappHeader && whatsappHeader.trim()
    ? `${whatsappHeader.trim()}\n`
    : `🏑 *${tournamentName.toUpperCase()}*${cat}\n`;

  let text = headerLine;
  text += `🎯 *TABLA DE GOLEADORES/AS*\n\n`;

  if (topScorers.length === 0) {
    text += `_Aún no se han registrado goles._\n`;
  } else {
    topScorers.slice(0, 10).forEach((sc, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      text += `${medal} *${sc.playerName}* (#${sc.playerNumber}) - *${sc.goals}* ${sc.goals === 1 ? 'gol' : 'goles'} (${sc.teamName})\n`;
    });
  }

  if (cardStats && cardStats.length > 0) {
    text += `\n🛡️ *FAIR PLAY & SANCIONES*\n`;
    cardStats.slice(0, 5).forEach((cs, idx) => {
      const cardsText = [
        cs.green > 0 ? `🟢 ${cs.green}` : '',
        cs.yellow > 0 ? `🟡 ${cs.yellow}` : '',
        cs.red > 0 ? `🔴 ${cs.red}` : '',
      ].filter(Boolean).join(' | ');

      text += `${idx + 1}. ${cs.playerName} (${cs.teamName}): ${cardsText}\n`;
    });
  }

  const footerText = whatsappFooter && whatsappFooter.trim()
    ? `\n${whatsappFooter.trim()}`
    : `\n_Generado con Hockey Torneos PWA_ 🏑`;

  text += footerText;
  return text;
}

/**
 * Formats tournament status for instant sharing via WhatsApp
 */
export function formatWhatsAppSummary(
  tournamentName: string,
  standings: StandingsRow[],
  matches: Match[],
  teams: Team[],
  topScorers: ScorerStat[],
  category?: string,
  season?: string,
  whatsappHeader?: string,
  whatsappFooter?: string
): string {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const cat = category ? ` - ${category}` : '';
  const yr = season ? ` (${season})` : '';

  const headerLine = whatsappHeader && whatsappHeader.trim()
    ? `${whatsappHeader.trim()}\n`
    : `🏑 *${tournamentName.toUpperCase()}*${cat}${yr}\n`;

  let text = headerLine;
  text += `📅 Actualización: ${new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })}\n\n`;

  text += `🏆 *TABLA DE POSICIONES*\n`;
  text += `Pos | Equipo | PTS | PJ | DG | GF\n`;
  text += `--------------------------------\n`;

  standings.forEach((row, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    text += `${medal} *${row.teamName}*\n     ${row.points} pts | PJ: ${row.played} | DG: ${row.goalDiff > 0 ? '+' : ''}${row.goalDiff} | GF: ${row.goalsFor}\n`;
  });

  text += `\n📌 *RESULTADOS Y PRÓXIMOS ENCUENTROS*\n`;
  const rounds = Array.from(new Set(matches.map((m) => m.stageLabel || `Fecha ${m.round}`)));

  rounds.forEach((roundLabel) => {
    const roundMatches = matches.filter(
      (m) => (m.stageLabel || `Fecha ${m.round}`) === roundLabel
    );
    text += `\n🔹 *${roundLabel}*\n`;
    roundMatches.forEach((m) => {
      const teamA = teamMap.get(m.teamAId)?.name || m.placeholderA || 'TBD';
      const teamB = teamMap.get(m.teamBId)?.name || m.placeholderB || 'TBD';
      if (m.isCompleted) {
        const shoot = m.isShootout ? ` (SO: ${m.shootoutScoreA ?? 0}-${m.shootoutScoreB ?? 0})` : '';
        text += ` • ${teamA} ${m.scoreA} - ${m.scoreB} ${teamB}${shoot} [${m.court}]\n`;
      } else {
        text += ` • ${teamA} vs ${teamB} [${m.court}] - Pendiente\n`;
      }
    });
  });

  if (topScorers.length > 0) {
    text += `\n🎯 *GOLEADORES/AS*\n`;
    topScorers.slice(0, 5).forEach((sc, idx) => {
      text += `${idx + 1}. ${sc.playerName} (#${sc.playerNumber}) - ${sc.goals} goles (${sc.teamName})\n`;
    });
  }

  const footerText = whatsappFooter && whatsappFooter.trim()
    ? `\n${whatsappFooter.trim()}`
    : `\n_Generado con Hockey Torneos PWA_ 🏑`;

  text += footerText;
  return text;
}
