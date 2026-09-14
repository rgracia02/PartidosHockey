import { forwardRef } from 'react';
import { Match, Team } from '../types';
import { getSortedRoundLabels } from '../utils/tournamentEngine';

interface ExportableFixtureImageProps {
  tournamentName: string;
  category?: string;
  matches: Match[];
  teams: Team[];
  roundFilter: string; // 'all' or a specific stageLabel
}

const WIDTH = 340;
const CENTER = WIDTH / 2;
const HEADER_HEIGHT = 96;
const DATE_LABEL_HEIGHT = 22;
const MATCH_BLOCK_HEIGHT = 44;
const GROUP_GAP = 14;

function truncate(name: string, max: number): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

interface LayoutItem {
  y: number;
  kind: 'dateHeader' | 'match';
  label?: string;
  match?: Match;
  teamAName?: string;
  teamBName?: string;
  showDivider?: boolean;
}

export const ExportableFixtureImage = forwardRef<SVGSVGElement, ExportableFixtureImageProps>(
  ({ tournamentName, category, matches, teams, roundFilter }, ref) => {
    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const filteredMatches = matches.filter((m) => {
      if (roundFilter === 'all') return true;
      return (m.stageLabel || `Fecha ${m.round}`) === roundFilter;
    });
    const roundLabels = getSortedRoundLabels(filteredMatches);

    const items: LayoutItem[] = [];
    let y = HEADER_HEIGHT;

    roundLabels.forEach((label, idx) => {
      if (idx > 0) y += GROUP_GAP;
      items.push({ y, kind: 'dateHeader', label, showDivider: idx > 0 });
      y += DATE_LABEL_HEIGHT;

      const roundMatches = filteredMatches
        .filter((m) => (m.stageLabel || `Fecha ${m.round}`) === label)
        .sort((a, b) => a.court.localeCompare(b.court));

      roundMatches.forEach((m) => {
        const teamAName = teamMap.get(m.teamAId)?.name || m.placeholderA || 'Por definir';
        const teamBName = teamMap.get(m.teamBId)?.name || m.placeholderB || 'Por definir';
        items.push({ y, kind: 'match', match: m, teamAName, teamBName });
        y += MATCH_BLOCK_HEIGHT;
      });
    });

    const totalHeight = roundLabels.length === 0 ? HEADER_HEIGHT + 40 : y + 10;
    const subtitle = [roundFilter === 'all' ? 'Fixture general' : roundFilter, category].filter(Boolean).join(' · ');

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${WIDTH} ${totalHeight}`}
        width={WIDTH}
        height={totalHeight}
        xmlns="http://www.w3.org/2000/svg"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        <rect x={0} y={0} width={WIDTH} height={totalHeight} fill="#ffffff" />

        <text x={CENTER} y={32} fontSize={22} textAnchor="middle">
          🏑
        </text>
        <text x={CENTER} y={54} fontSize={17} fontWeight={700} fill="#0f172a" textAnchor="middle">
          {tournamentName}
        </text>
        <text x={CENTER} y={70} fontSize={12} fill="#64748b" textAnchor="middle">
          {subtitle}
        </text>

        {roundLabels.length === 0 && (
          <text x={CENTER} y={HEADER_HEIGHT + 20} fontSize={12} fill="#94a3b8" textAnchor="middle">
            No hay partidos programados.
          </text>
        )}

        {items.map((item, i) => {
          if (item.kind === 'dateHeader') {
            return (
              <g key={`h-${i}`}>
                {item.showDivider && (
                  <line x1={0} y1={item.y - GROUP_GAP / 2} x2={WIDTH} y2={item.y - GROUP_GAP / 2} stroke="#e2e8f0" strokeWidth={1} />
                )}
                <text x={18} y={item.y + 12} fontSize={11} fontWeight={700} fill="#0284c7">
                  {item.label?.toUpperCase()}
                </text>
              </g>
            );
          }

          const m = item.match!;
          const rowY = item.y + 16;
          const pillLabel = m.isCompleted ? `${m.scoreA} - ${m.scoreB}` : 'vs';

          return (
            <g key={m.id}>
              <text x={CENTER - 32} y={rowY} fontSize={13} fill="#0f172a" textAnchor="end">
                {truncate(item.teamAName!, 18)}
              </text>
              <rect
                x={CENTER - 26}
                y={rowY - 12}
                width={52}
                height={18}
                rx={5}
                fill={m.isCompleted ? '#f1f5f9' : '#f8fafc'}
              />
              <text
                x={CENTER}
                y={rowY + 1}
                fontSize={12}
                fontWeight={m.isCompleted ? 700 : 400}
                fill={m.isCompleted ? '#0f172a' : '#94a3b8'}
                textAnchor="middle"
              >
                {pillLabel}
              </text>
              <text x={CENTER + 32} y={rowY} fontSize={13} fill="#0f172a">
                {truncate(item.teamBName!, 18)}
              </text>
              <text x={CENTER} y={rowY + 20} fontSize={10} fill="#94a3b8" textAnchor="middle">
                {m.court}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
);

ExportableFixtureImage.displayName = 'ExportableFixtureImage';
