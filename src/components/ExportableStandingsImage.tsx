import { forwardRef } from 'react';
import { StandingsRow, TournamentFormat } from '../types';

const QUALIFY_CUTOFF_BY_FORMAT: Partial<Record<TournamentFormat, number>> = {
  groups_playoffs_final: 2,
  groups_playoffs_semis: 4,
  groups_playoffs_quarters: 8,
};

interface ExportableStandingsImageProps {
  tournamentName: string;
  category?: string;
  roundLabel?: string;
  standings: StandingsRow[];
  format: TournamentFormat;
}

const MEDAL = ['🥇', '🥈', '🥉'];
const WIDTH = 340;
const PAD = 18;
const ROW_HEIGHT = 40;
const COL_PJ_X = 240;
const COL_DG_X = 280;
const COL_PTS_X = 322;
const NAME_X = 68;

function truncate(name: string, max: number): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export const ExportableStandingsImage = forwardRef<SVGSVGElement, ExportableStandingsImageProps>(
  ({ tournamentName, category, roundLabel, standings, format }, ref) => {
    const qualifyCutoff = QUALIFY_CUTOFF_BY_FORMAT[format] || 0;

    const headerHeight = 100;
    const rowsHeight = standings.length * ROW_HEIGHT;
    const legendHeight = qualifyCutoff > 0 ? 36 : 12;
    const totalHeight = headerHeight + rowsHeight + legendHeight;

    const subtitle = [category, roundLabel].filter(Boolean).length
      ? `Tabla de posiciones · ${[category, roundLabel].filter(Boolean).join(' · ')}`
      : 'Tabla de posiciones';

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

        <text x={WIDTH / 2} y={32} fontSize={22} textAnchor="middle">
          🏑
        </text>
        <text x={WIDTH / 2} y={54} fontSize={17} fontWeight={700} fill="#0f172a" textAnchor="middle">
          {tournamentName}
        </text>
        <text x={WIDTH / 2} y={70} fontSize={12} fill="#64748b" textAnchor="middle">
          {subtitle}
        </text>

        {/* Column headers */}
        <text x={NAME_X} y={92} fontSize={10} fontWeight={700} fill="#94a3b8">
          EQUIPO
        </text>
        <text x={COL_PJ_X} y={92} fontSize={10} fontWeight={700} fill="#94a3b8" textAnchor="end">
          PJ
        </text>
        <text x={COL_DG_X} y={92} fontSize={10} fontWeight={700} fill="#94a3b8" textAnchor="end">
          DG
        </text>
        <text x={COL_PTS_X} y={92} fontSize={10} fontWeight={700} fill="#94a3b8" textAnchor="end">
          PTS
        </text>
        <line x1={0} y1={headerHeight} x2={WIDTH} y2={headerHeight} stroke="#e2e8f0" strokeWidth={1} />

        {standings.map((row, i) => {
          const y = headerHeight + i * ROW_HEIGHT;
          const qualifies = qualifyCutoff > 0 && i < qualifyCutoff;
          const isLastQualifier = qualifyCutoff > 0 && i === qualifyCutoff - 1;
          const midY = y + ROW_HEIGHT / 2;

          return (
            <g key={row.teamId}>
              {qualifies && <rect x={0} y={y} width={WIDTH} height={ROW_HEIGHT} fill="#f0f9ff" />}
              <line
                x1={0}
                y1={y + ROW_HEIGHT}
                x2={WIDTH}
                y2={y + ROW_HEIGHT}
                stroke={isLastQualifier ? '#0284c7' : '#f1f5f9'}
                strokeWidth={isLastQualifier ? 2 : 1}
              />
              <text x={PAD} y={midY + 5} fontSize={i < 3 ? 15 : 12} fill="#94a3b8">
                {i < 3 ? MEDAL[i] : `${i + 1}.`}
              </text>
              <circle cx={PAD + 32} cy={midY} r={4} fill={row.teamColor} />
              <text x={NAME_X} y={midY + 4} fontSize={13} fontWeight={700} fill="#0f172a">
                {truncate(row.teamName, 20)}
              </text>
              <text x={COL_PJ_X} y={midY + 4} fontSize={12} fill="#64748b" textAnchor="end">
                {row.played}
              </text>
              <text x={COL_DG_X} y={midY + 4} fontSize={12} fill="#64748b" textAnchor="end">
                {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
              </text>
              <text x={COL_PTS_X} y={midY + 4} fontSize={13} fontWeight={700} fill="#0f172a" textAnchor="end">
                {row.points}
              </text>
            </g>
          );
        })}

        {qualifyCutoff > 0 && (
          <g>
            <rect
              x={PAD}
              y={headerHeight + rowsHeight + 12}
              width={10}
              height={10}
              rx={2}
              fill="#f0f9ff"
              stroke="#bae6fd"
            />
            <text x={PAD + 16} y={headerHeight + rowsHeight + 21} fontSize={10} fill="#94a3b8">
              {format === 'groups_playoffs_final' ? 'Clasifican a la final' : 'Clasifican a playoffs'}
            </text>
          </g>
        )}
      </svg>
    );
  }
);

ExportableStandingsImage.displayName = 'ExportableStandingsImage';
