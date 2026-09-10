export type HockeyCardType = 'green' | 'yellow' | 'red';

export interface Player {
  id: string;
  name: string;
  number: number;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
}

export interface GoalRecord {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  count: number;
}

export interface SanctionRecord {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  cardType: HockeyCardType;
  minute?: number;
}

export type TournamentStage = 'group' | 'quarter' | 'semi' | 'final';

export interface Match {
  id: string;
  round: number; // 1, 2, 3...
  stage: TournamentStage;
  stageLabel: string; // e.g. "Fecha 1", "Semifinal 1", "Final"
  court: string; // e.g. "Cancha 1", "Cancha 2"
  teamAId: string;
  teamBId: string;
  // Fallback names for dynamic playoff bracket display if team is not yet decided
  placeholderA?: string;
  placeholderB?: string;
  scoreA: number | null;
  scoreB: number | null;
  isCompleted: boolean;
  isShootout: boolean;
  shootoutScoreA?: number;
  shootoutScoreB?: number;
  shootoutWinnerTeamId?: string;
  goals: GoalRecord[];
  sanctions: SanctionRecord[];
  photoUrl?: string; // Optional match photo (base64 data URL or uploaded image)
  date?: string;
  time?: string;
}

export type TournamentFormat = 
  | 'groups_only'
  | 'groups_playoffs_final'
  | 'groups_playoffs_semis'
  | 'groups_playoffs_quarters'
  | 'knockout_only';

export type TournamentStatus = 'active' | 'completed' | 'upcoming';

export interface TournamentConfig {
  id: string;
  name: string;
  category?: string;
  season?: string;
  status?: TournamentStatus;
  courtsCount: number;
  format: TournamentFormat;
  isDoubleRound?: boolean; // false / undefined = Solo Ida (1 rueda), true = Ida y Vuelta (2 ruedas)
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  whatsappHeader?: string;
  whatsappFooter?: string;
}

export interface StandingsRow {
  teamId: string;
  teamName: string;
  teamColor: string;
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  greenCards: number;
  yellowCards: number;
  redCards: number;
}

export interface ScorerStat {
  playerId: string;
  playerName: string;
  playerNumber: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  goals: number;
}

export interface PlayerCardStat {
  playerId: string;
  playerName: string;
  playerNumber: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  green: number;
  yellow: number;
  red: number;
  totalCards: number;
}

export interface TournamentData {
  config: TournamentConfig;
  teams: Team[];
  matches: Match[];
  lastUpdated: string;
}
