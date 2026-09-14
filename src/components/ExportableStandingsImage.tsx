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

export const ExportableStandingsImage = forwardRef<HTMLDivElement, ExportableStandingsImageProps>(
  ({ tournamentName, category, roundLabel, standings, format }, ref) => {
    const qualifyCutoff = QUALIFY_CUTOFF_BY_FORMAT[format] || 0;

    return (
      <div
        ref={ref}
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '20px 18px',
          width: 340,
          fontFamily: '-apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 22 }}>🏑</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>{tournamentName}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Tabla de posiciones{category ? ` · ${category}` : ''}
            {roundLabel ? ` · ${roundLabel}` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0 6px', marginTop: 8 }}>
          <span style={{ width: 22 }} />
          <span style={{ width: 8 }} />
          <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Equipo
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>PJ</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', width: 34, textAlign: 'right' }}>
            DG
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', width: 30, textAlign: 'right' }}>
            PTS
          </span>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0' }}>
          {standings.map((row, i) => {
            const qualifies = qualifyCutoff > 0 && i < qualifyCutoff;
            const isLastQualifier = qualifyCutoff > 0 && i === qualifyCutoff - 1;
            return (
              <div
                key={row.teamId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 18px',
                  margin: '0 -18px',
                  borderBottom: isLastQualifier ? '2px solid #0284c7' : '1px solid #f1f5f9',
                  background: qualifies ? '#f0f9ff' : 'transparent',
                }}
              >
                <span style={{ fontSize: 14, width: 22 }}>{i < 3 ? MEDAL[i] : <span style={{ fontSize: 12, color: '#94a3b8' }}>{i + 1}.</span>}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.teamColor, display: 'inline-block' }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{row.teamName}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{row.played}</span>
                <span style={{ fontSize: 12, color: '#64748b', width: 34, textAlign: 'right' }}>
                  {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', width: 30, textAlign: 'right' }}>{row.points}</span>
              </div>
            );
          })}
        </div>

        {qualifyCutoff > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: '#f0f9ff', border: '1px solid #bae6fd', display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: '#94a3b8' }}>
              {format === 'groups_playoffs_final' ? 'Clasifican a la final' : 'Clasifican a playoffs'}
            </span>
          </div>
        )}
      </div>
    );
  }
);

ExportableStandingsImage.displayName = 'ExportableStandingsImage';
