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

export const ExportableFixtureImage = forwardRef<HTMLDivElement, ExportableFixtureImageProps>(
  ({ tournamentName, category, matches, teams, roundFilter }, ref) => {
    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const filteredMatches = matches.filter((m) => {
      if (roundFilter === 'all') return true;
      return (m.stageLabel || `Fecha ${m.round}`) === roundFilter;
    });
    const roundLabels = getSortedRoundLabels(filteredMatches);

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
            {roundFilter === 'all' ? 'Fixture general' : roundFilter}
            {category ? ` · ${category}` : ''}
          </div>
        </div>

        {roundLabels.map((label, idx) => {
          const roundMatches = filteredMatches
            .filter((m) => (m.stageLabel || `Fecha ${m.round}`) === label)
            .sort((a, b) => a.court.localeCompare(b.court));

          return (
            <div key={label} style={{ marginTop: 14, paddingTop: idx > 0 ? 12 : 0, borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
                {label}
              </div>
              {roundMatches.map((m) => {
                const teamA = teamMap.get(m.teamAId)?.name || m.placeholderA || 'Por definir';
                const teamB = teamMap.get(m.teamBId)?.name || m.placeholderB || 'Por definir';
                return (
                  <div key={m.id} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
                      <span style={{ flex: 1, fontSize: 13, color: '#0f172a', textAlign: 'right' }}>{teamA}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: m.isCompleted ? 600 : 400,
                          color: m.isCompleted ? '#0f172a' : '#94a3b8',
                          background: m.isCompleted ? '#f1f5f9' : '#f8fafc',
                          borderRadius: 6,
                          padding: '2px 8px',
                          minWidth: 40,
                          textAlign: 'center',
                        }}
                      >
                        {m.isCompleted ? `${m.scoreA} - ${m.scoreB}` : 'vs'}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, color: '#0f172a' }}>{teamB}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>{m.court}</div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {roundLabels.length === 0 && (
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 16 }}>No hay partidos programados.</p>
        )}
      </div>
    );
  }
);

ExportableFixtureImage.displayName = 'ExportableFixtureImage';
