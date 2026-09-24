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

export type TournamentStage = 'group' | 'quarter' | 'semi' | 'third_place' | 'final';

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
  // Identifies a match inside the fixed 5-team bracket (groups_playoffs_top5) so it can be wired to the right teams
  bracketKey?: 'B' | 'C' | 'D' | 'SF1' | 'SF2';
  isManualCross?: boolean; // true if the user manually picked the teams for this playoff match, so auto-sync from standings should leave it alone
}

export type TournamentFormat = 
  | 'groups_only'
  | 'groups_playoffs_final'
  | 'groups_playoffs_semis'
  | 'groups_playoffs_top5'
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
  includeThirdPlace?: boolean; // adds a match for 3rd/4th place between the semifinal losers (only applies to groups_playoffs_semis)
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  whatsappHeader?: string;
  whatsappFooter?: string;
  eventGroupId?: string; // shared id linking two or more tournaments (e.g. Damas + Varones) as the same event/jornada
  eventLabel?: string; // optional display name for the combined event, e.g. "Jornada Interclubes"
  courtLabelOffset?: number; // shifts generated court numbers (e.g. offset=2 -> "Cancha 3", "Cancha 4"...) so linked tournaments don't collide on the same physical courts
  matchDurationMinutes?: number; // default duration used to auto-stack kickoff times when assigning a schedule to a Fecha
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
