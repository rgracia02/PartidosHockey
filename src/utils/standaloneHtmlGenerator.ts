/**
 * Generates the complete, standalone, self-contained index.html file
 * ready to be deployed directly onto GitHub Pages without any compilation steps.
 */
export function generateStandaloneIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="es" class="h-full bg-[#F2F2F7]">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Hockey Torneos" />
  <meta name="theme-color" content="#F2F2F7" />
  <title>Hockey Torneos</title>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React 18 & ReactDOM CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- Babel Standalone for JSX transformation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Google Fonts for iOS Polish -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      --sat: env(safe-area-inset-top, 0px);
      --sab: env(safe-area-inset-bottom, 0px);
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Plus Jakarta Sans", system-ui, sans-serif;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .pt-safe { padding-top: max(16px, env(safe-area-inset-top)); }
    .pb-safe { padding-bottom: max(20px, env(safe-area-inset-bottom)); }
    .pb-safe-tabbar { padding-bottom: calc(76px + env(safe-area-inset-bottom, 16px)); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="h-full bg-[#F2F2F7] text-slate-900 antialiased overflow-x-hidden">
  <div id="root" class="h-full min-h-screen"></div>

  <script type="text/babel">
    const { useState, useEffect, useMemo, useRef } = React;

    // --- Hockey App Implementation (Direct Standalone Execution) ---
    const STORAGE_KEY = 'hockey_torneos_data_v2';

    const DEFAULT_DATA = {
      config: {
        id: 'demo-tournament',
        name: 'Torneo Apertura Hockey Césped',
        courtsCount: 2,
        format: 'groups_playoffs_semis',
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0
      },
      teams: [
        {
          id: 't-1',
          name: 'Las Leonas HC',
          color: '#0284C7',
          players: [
            { id: 'p-1', name: 'Agustina Albertario', number: 7, teamId: 't-1' },
            { id: 'p-2', name: 'Delfina Merino', number: 12, teamId: 't-1' },
            { id: 'p-3', name: 'Rocío Sánchez', number: 5, teamId: 't-1' },
            { id: 'p-4', name: 'Belén Succi', number: 1, teamId: 't-1' }
          ]
        },
        {
          id: 't-2',
          name: 'San Fernando Hockey',
          color: '#059669',
          players: [
            { id: 'p-5', name: 'Sol Pagella', number: 10, teamId: 't-2' },
            { id: 'p-6', name: 'Micaela Retegui', number: 8, teamId: 't-2' },
            { id: 'p-7', name: 'Lucía Sanguinetti', number: 4, teamId: 't-2' }
          ]
        },
        {
          id: 't-3',
          name: 'Belgrano Athletic',
          color: '#DC2626',
          players: [
            { id: 'p-8', name: 'Carla Dupuy', number: 14, teamId: 't-3' },
            { id: 'p-9', name: 'Rosario Luchetti', number: 6, teamId: 't-3' }
          ]
        },
        {
          id: 't-4',
          name: 'Mitre Hockey',
          color: '#D97706',
          players: [
            { id: 'p-10', name: 'Eugenia Trinchinetti', number: 22, teamId: 't-4' },
            { id: 'p-11', name: 'Sofía Toccalino', number: 16, teamId: 't-4' }
          ]
        }
      ],
      matches: [
        {
          id: 'm-1',
          round: 1,
          stage: 'group',
          stageLabel: 'Fecha 1',
          court: 'Cancha 1',
          teamAId: 't-1',
          teamBId: 't-2',
          scoreA: 3,
          scoreB: 1,
          isCompleted: true,
          isShootout: false,
          goals: [{ id: 'g-1', playerId: 'p-1', playerName: 'Agustina Albertario', teamId: 't-1', count: 2 }],
          sanctions: [{ id: 's-1', playerId: 'p-6', playerName: 'Micaela Retegui', teamId: 't-2', cardType: 'green', minute: 12 }]
        },
        {
          id: 'm-2',
          round: 1,
          stage: 'group',
          stageLabel: 'Fecha 1',
          court: 'Cancha 2',
          teamAId: 't-3',
          teamBId: 't-4',
          scoreA: 2,
          scoreB: 2,
          isCompleted: true,
          isShootout: false,
          goals: [{ id: 'g-2', playerId: 'p-8', playerName: 'Carla Dupuy', teamId: 't-3', count: 1 }],
          sanctions: []
        },
        {
          id: 'm-3',
          round: 2,
          stage: 'group',
          stageLabel: 'Fecha 2',
          court: 'Cancha 1',
          teamAId: 't-1',
          teamBId: 't-3',
          scoreA: null,
          scoreB: null,
          isCompleted: false,
          isShootout: false,
          goals: [],
          sanctions: []
        },
        {
          id: 'm-4',
          round: 2,
          stage: 'group',
          stageLabel: 'Fecha 2',
          court: 'Cancha 2',
          teamAId: 't-2',
          teamBId: 't-4',
          scoreA: null,
          scoreB: null,
          isCompleted: false,
          isShootout: false,
          goals: [],
          sanctions: []
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    function App() {
      const [activeTab, setActiveTab] = useState('posiciones'); // 'posiciones' | 'fixture' | 'goleadores' | 'config'
      const [data, setData] = useState(() => {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          return saved ? JSON.parse(saved) : DEFAULT_DATA;
        } catch (e) {
          return DEFAULT_DATA;
        }
      });

      const [selectedMatch, setSelectedMatch] = useState(null);
      const [showShareToast, setShowShareToast] = useState(false);
      const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');

      useEffect(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.error(e);
        }
      }, [data]);

      // Standings calculation
      const standings = useMemo(() => {
        const stats = {};
        data.teams.forEach(t => {
          stats[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0, green: 0, yellow: 0, red: 0 };
        });

        data.matches.forEach(m => {
          m.sanctions?.forEach(s => {
            if (stats[s.teamId]) {
              if (s.cardType === 'green') stats[s.teamId].green += 1;
              if (s.cardType === 'yellow') stats[s.teamId].yellow += 1;
              if (s.cardType === 'red') stats[s.teamId].red += 1;
            }
          });
        });

        data.matches.filter(m => m.stage === 'group' && m.isCompleted && m.scoreA !== null && m.scoreB !== null).forEach(m => {
          const a = stats[m.teamAId];
          const b = stats[m.teamBId];
          if (!a || !b) return;

          a.played++; b.played++;
          a.gf += m.scoreA; a.ga += m.scoreB;
          b.gf += m.scoreB; b.ga += m.scoreA;

          if (m.scoreA > m.scoreB) {
            a.won++; a.pts += 3; b.lost++;
          } else if (m.scoreA < m.scoreB) {
            b.won++; b.pts += 3; a.lost++;
          } else {
            a.drawn++; b.drawn++; a.pts += 1; b.pts += 1;
          }
        });

        const rows = data.teams.map(t => {
          const s = stats[t.id] || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0, green: 0, yellow: 0, red: 0 };
          return {
            team: t,
            ...s,
            gd: s.gf - s.ga
          };
        });

        rows.sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.gd !== a.gd ? b.gd - a.gd : b.gf - a.gf);
        return rows;
      }, [data]);

      // Scorers
      const scorers = useMemo(() => {
        const map = {};
        data.matches.forEach(m => {
          m.goals?.forEach(g => {
            if (!map[g.playerId]) {
              const team = data.teams.find(t => t.id === g.teamId);
              const player = team?.players.find(p => p.id === g.playerId);
              map[g.playerId] = {
                id: g.playerId,
                name: g.playerName,
                number: player?.number || 0,
                teamName: team?.name || '',
                teamColor: team?.color || '#3b82f6',
                goals: 0
              };
            }
            map[g.playerId].goals += (g.count || 1);
          });
        });
        return Object.values(map).sort((a, b) => b.goals - a.goals);
      }, [data]);

      // Sanctions
      const cardStats = useMemo(() => {
        const map = {};
        data.matches.forEach(m => {
          m.sanctions?.forEach(s => {
            if (!map[s.playerId]) {
              const team = data.teams.find(t => t.id === s.teamId);
              const player = team?.players.find(p => p.id === s.playerId);
              map[s.playerId] = {
                id: s.playerId,
                name: s.playerName,
                number: player?.number || 0,
                teamName: team?.name || '',
                teamColor: team?.color || '#3b82f6',
                green: 0,
                yellow: 0,
                red: 0
              };
            }
            if (s.cardType === 'green') map[s.playerId].green++;
            if (s.cardType === 'yellow') map[s.playerId].yellow++;
            if (s.cardType === 'red') map[s.playerId].red++;
          });
        });
        return Object.values(map).map(item => ({
          ...item,
          total: item.green + item.yellow * 2 + item.red * 3
        })).sort((a, b) => b.total - a.total);
      }, [data]);

      const copyWhatsApp = () => {
        let text = "🏑 *" + data.config.name.toUpperCase() + "*\\n\\n";
        text += "🏆 *TABLA DE POSICIONES*\\n";
        standings.forEach((s, idx) => {
          text += (idx + 1) + ". *" + s.team.name + "* - " + s.pts + " pts (PJ:" + s.played + " DIF:" + (s.gd > 0 ? "+" : "") + s.gd + " GF:" + s.gf + ")\\n";
        });
        text += "\\n📅 *PRÓXIMOS ENCUENTROS*\\n";
        data.matches.slice(0, 4).forEach(m => {
          const tA = data.teams.find(t => t.id === m.teamAId)?.name || 'TBD';
          const tB = data.teams.find(t => t.id === m.teamBId)?.name || 'TBD';
          text += "• " + tA + " " + (m.scoreA ?? '-') + " vs " + (m.scoreB ?? '-') + " " + tB + " [" + m.court + "]\\n";
        });
        navigator.clipboard.writeText(text);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      };

      const handleSaveMatch = (updatedMatch) => {
        setData(prev => ({
          ...prev,
          matches: prev.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m),
          lastUpdated: new Date().toISOString()
        }));
        setSelectedMatch(null);
      };

      return (
        <div className="max-w-md mx-auto min-h-screen bg-[#F2F2F7] flex flex-col relative pb-safe-tabbar">
          {/* Header iOS */}
          <header className="sticky top-0 z-30 bg-[#F2F2F7]/85 backdrop-blur-md border-b border-black/5 px-4 pt-safe pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-sky-600 uppercase">Hockey Césped • Planilla Rápida</p>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight truncate">{data.config.name}</h1>
              </div>
              <button onClick={copyWhatsApp} className="p-2 bg-emerald-500 text-white rounded-full shadow-sm active:scale-95 transition-transform" title="Compartir en WhatsApp">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.026 1.455 1.918.423.376.78.493.993.6.213.107.337.092.463-.054.126-.146.54-.63.684-.846.145-.217.289-.173.491-.101.202.072 1.284.606 1.501.714.217.108.361.163.414.254.053.091.053.527-.091.932z"/></svg>
              </button>
            </div>
          </header>

          {/* Body Tabs */}
          <main className="flex-1 p-4">
            {activeTab === 'posiciones' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Tabla General</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{standings.length} Equipos</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs mt-2">
                      <thead>
                        <tr className="text-slate-400 font-semibold border-b border-slate-100">
                          <th className="py-2 pl-1 w-6">#</th>
                          <th className="py-2">Equipo</th>
                          <th className="py-2 text-center font-bold text-slate-700">PTS</th>
                          <th className="py-2 text-center">PJ</th>
                          <th className="py-2 text-center">PG</th>
                          <th className="py-2 text-center">PE</th>
                          <th className="py-2 text-center">PP</th>
                          <th className="py-2 text-center">DG</th>
                          <th className="py-2 text-center">GF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {standings.map((s, idx) => (
                          <tr key={s.team.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 pl-1 font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 font-medium text-slate-900 flex items-center gap-1.5 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.team.color }}></span>
                              <span className="truncate">{s.team.name}</span>
                            </td>
                            <td className="py-2.5 text-center font-extrabold text-sky-600 bg-sky-50/50 rounded">{s.pts}</td>
                            <td className="py-2.5 text-center text-slate-600">{s.played}</td>
                            <td className="py-2.5 text-center text-slate-600">{s.won}</td>
                            <td className="py-2.5 text-center text-slate-600">{s.drawn}</td>
                            <td className="py-2.5 text-center text-slate-600">{s.lost}</td>
                            <td className="py-2.5 text-center font-semibold text-slate-700">{s.gd > 0 ? \`+\${s.gd}\` : s.gd}</td>
                            <td className="py-2.5 text-center text-slate-500">{s.gf}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fixture' && (
              <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button onClick={() => setSelectedRoundFilter('all')} className={\`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap \${selectedRoundFilter === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}\`}>
                    Todos los Partidos
                  </button>
                  {Array.from(new Set(data.matches.map(m => m.stageLabel))).map(label => (
                    <button key={label} onClick={() => setSelectedRoundFilter(label)} className={\`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap \${selectedRoundFilter === label ? 'bg-sky-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}\`}>
                      {label}
                    </button>
                  ))}
                </div>

                {data.matches
                  .filter(m => selectedRoundFilter === 'all' || m.stageLabel === selectedRoundFilter)
                  .map(match => {
                    const teamA = data.teams.find(t => t.id === match.teamAId);
                    const teamB = data.teams.find(t => t.id === match.teamBId);
                    return (
                      <div
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 active:scale-[0.99] transition-transform cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">{match.stageLabel} • {match.court}</span>
                          <span className={match.isCompleted ? 'text-emerald-600 font-bold' : 'text-amber-600 font-medium'}>
                            {match.isCompleted ? 'Finalizado ✓' : 'Toca para cargar planilla'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 py-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: teamA?.color || '#cbd5e1' }}></span>
                            <span className="font-semibold text-sm text-slate-900 truncate">{teamA?.name || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-xl font-black text-base text-slate-800 shrink-0">
                            <span>{match.scoreA !== null ? match.scoreA : '-'}</span>
                            <span className="text-slate-300">:</span>
                            <span>{match.scoreB !== null ? match.scoreB : '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                            <span className="font-semibold text-sm text-slate-900 truncate text-right">{teamB?.name || 'TBD'}</span>
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: teamB?.color || '#cbd5e1' }}></span>
                          </div>
                        </div>
                        {match.goals?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap gap-2">
                            <span>🏑 {match.goals.map(g => \`\${g.playerName} (\${g.count})\`).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {activeTab === 'goleadores' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
                  <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Tabla de Goleadores/as</h2>
                  {scorers.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Aún no hay goles registrados en los partidos.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {scorers.map((s, idx) => (
                        <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 w-4">{idx + 1}</span>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.teamColor }}></span>
                            <div>
                              <p className="font-bold text-slate-800">{s.name} <span className="text-slate-400 font-normal">#{s.number}</span></p>
                              <p className="text-[10px] text-slate-500">{s.teamName}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-black rounded-lg text-sm">{s.goals}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
                  <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Fair Play & Tarjetas</h2>
                  {cardStats.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Sin sanciones registradas.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {cardStats.map(c => (
                        <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.teamColor }}></span>
                            <div>
                              <p className="font-bold text-slate-800">{c.name}</p>
                              <p className="text-[10px] text-slate-500">{c.teamName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {c.green > 0 && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">🟢 {c.green}</span>}
                            {c.yellow > 0 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">🟡 {c.yellow}</span>}
                            {c.red > 0 && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">🔴 {c.red}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
                  <h2 className="text-base font-bold text-slate-900 mb-3">Configuración del Torneo</h2>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Nombre del Torneo</label>
                      <input
                        type="text"
                        value={data.config.name}
                        onChange={(e) => setData(p => ({ ...p, config: { ...p.config, name: e.target.value } }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Canchas Disponibles en Simultáneo</label>
                      <select
                        value={data.config.courtsCount}
                        onChange={(e) => setData(p => ({ ...p, config: { ...p.config, courtsCount: Number(e.target.value) } }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                      >
                        <option value="1">1 Cancha</option>
                        <option value="2">2 Canchas</option>
                        <option value="3">3 Canchas</option>
                        <option value="4">4 Canchas</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
                  <h2 className="text-base font-bold text-slate-900 mb-2">Equipos y Jugadores</h2>
                  <p className="text-xs text-slate-500 mb-3">Total: {data.teams.length} equipos inscriptos</p>
                  <div className="space-y-2">
                    {data.teams.map(team => (
                      <div key={team.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: team.color }}></span>
                          <div>
                            <p className="font-bold text-xs text-slate-900">{team.name}</p>
                            <p className="text-[10px] text-slate-400">{team.players.length} jugadoras/es</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
                  <h2 className="text-base font-bold text-slate-900 mb-2">Respaldo & Reinicio</h2>
                  <button
                    onClick={() => {
                      if (confirm("¿Deseas reiniciar los datos del torneo al estado de muestra?")) {
                        setData(DEFAULT_DATA);
                        localStorage.removeItem(STORAGE_KEY);
                      }
                    }}
                    className="w-full py-2.5 bg-rose-50 text-rose-600 font-semibold rounded-xl text-xs active:bg-rose-100"
                  >
                    Restablecer Torneo de Muestra
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Post-Match Modal (Bottom Sheet) */}
          {selectedMatch && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center p-0">
              <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-safe max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4"></div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-sky-600 uppercase">{selectedMatch.stageLabel} • {selectedMatch.court}</span>
                    <h3 className="text-lg font-bold text-slate-900">Planilla de Cierre</h3>
                  </div>
                  <button onClick={() => setSelectedMatch(null)} className="p-1.5 bg-slate-100 rounded-full text-slate-500 text-xs font-bold">✕</button>
                </div>

                {/* Score Controls */}
                <MatchEditor match={selectedMatch} teams={data.teams} onSave={handleSaveMatch} />
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {showShareToast && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm animate-fade-in">
              ✓ ¡Resumen copiado para WhatsApp!
            </div>
          )}

          {/* Fixed iOS Bottom Tab Bar */}
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-slate-200/80 px-4 pt-2 pb-safe flex items-center justify-around z-40">
            <button onClick={() => setActiveTab('posiciones')} className={\`flex flex-col items-center gap-1 flex-1 \${activeTab === 'posiciones' ? 'text-sky-600' : 'text-slate-400'}\`}>
              <span className="text-lg">🏆</span>
              <span className="text-[10px] font-bold">Posiciones</span>
            </button>
            <button onClick={() => setActiveTab('fixture')} className={\`flex flex-col items-center gap-1 flex-1 \${activeTab === 'fixture' ? 'text-sky-600' : 'text-slate-400'}\`}>
              <span className="text-lg">📅</span>
              <span className="text-[10px] font-bold">Fixture</span>
            </button>
            <button onClick={() => setActiveTab('goleadores')} className={\`flex flex-col items-center gap-1 flex-1 \${activeTab === 'goleadores' ? 'text-sky-600' : 'text-slate-400'}\`}>
              <span className="text-lg">🏑</span>
              <span className="text-[10px] font-bold">Goleadores</span>
            </button>
            <button onClick={() => setActiveTab('config')} className={\`flex flex-col items-center gap-1 flex-1 \${activeTab === 'config' ? 'text-sky-600' : 'text-slate-400'}\`}>
              <span className="text-lg">⚙️</span>
              <span className="text-[10px] font-bold">Configuración</span>
            </button>
          </nav>
        </div>
      );
    }

    function MatchEditor({ match, teams, onSave }) {
      const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
      const [scoreB, setScoreB] = useState(match.scoreB ?? 0);
      const [isShootout, setIsShootout] = useState(match.isShootout || false);
      const [shootoutWinner, setShootoutWinner] = useState(match.shootoutWinnerTeamId || '');
      const [goals, setGoals] = useState(match.goals || []);
      const [sanctions, setSanctions] = useState(match.sanctions || []);

      const teamA = teams.find(t => t.id === match.teamAId);
      const teamB = teams.find(t => t.id === match.teamBId);

      const addGoal = (player, teamId) => {
        setGoals(prev => {
          const existing = prev.find(g => g.playerId === player.id);
          if (existing) {
            return prev.map(g => g.playerId === player.id ? { ...g, count: g.count + 1 } : g);
          }
          return [...prev, { id: 'g-' + Date.now() + Math.random(), playerId: player.id, playerName: player.name, teamId, count: 1 }];
        });
      };

      const addSanction = (player, teamId, cardType) => {
        setSanctions(prev => [
          ...prev,
          { id: 's-' + Date.now() + Math.random(), playerId: player.id, playerName: player.name, teamId, cardType }
        ]);
      };

      const removeSanction = (id) => {
        setSanctions(prev => prev.filter(s => s.id !== id));
      };

      const handleSave = () => {
        onSave({
          ...match,
          scoreA: Number(scoreA),
          scoreB: Number(scoreB),
          isCompleted: true,
          isShootout,
          shootoutWinnerTeamId: isShootout ? shootoutWinner : undefined,
          goals,
          sanctions
        });
      };

      return (
        <div className="space-y-4">
          {/* Score Counter */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="font-bold text-xs text-slate-800 mb-1 truncate">{teamA?.name || 'Equipo A'}</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setScoreA(Math.max(0, scoreA - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 font-bold text-slate-600">-</button>
                <span className="text-2xl font-black text-slate-900 w-8">{scoreA}</span>
                <button onClick={() => setScoreA(scoreA + 1)} className="w-8 h-8 rounded-full bg-sky-600 font-bold text-white">+</button>
              </div>
            </div>
            <span className="text-slate-300 font-black text-xl px-2">VS</span>
            <div className="text-center flex-1">
              <p className="font-bold text-xs text-slate-800 mb-1 truncate">{teamB?.name || 'Equipo B'}</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setScoreB(Math.max(0, scoreB - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 font-bold text-slate-600">-</button>
                <span className="text-2xl font-black text-slate-900 w-8">{scoreB}</span>
                <button onClick={() => setScoreB(scoreB + 1)} className="w-8 h-8 rounded-full bg-sky-600 font-bold text-white">+</button>
              </div>
            </div>
          </div>

          {/* Goals Breakdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Anotar Gol por Jugador</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-[11px] text-slate-600 mb-1 truncate">{teamA?.name}</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {teamA?.players.map(p => (
                    <button key={p.id} onClick={() => addGoal(p, teamA.id)} className="w-full text-left py-1 px-2 bg-white rounded border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="truncate">{p.name} #{p.number}</span>
                      <span className="font-bold text-sky-600">+1</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-[11px] text-slate-600 mb-1 truncate">{teamB?.name}</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {teamB?.players.map(p => (
                    <button key={p.id} onClick={() => addGoal(p, teamB.id)} className="w-full text-left py-1 px-2 bg-white rounded border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="truncate">{p.name} #{p.number}</span>
                      <span className="font-bold text-sky-600">+1</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas Oficiales Hockey */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Sanciones Oficiales Hockey (🟢 Verde | 🟡 Amarilla | 🔴 Roja)</label>
            <div className="flex gap-2">
              <select id="sanctionPlayerSelect" className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2">
                <option value="">Seleccionar Jugador...</option>
                {[...(teamA?.players || []), ...(teamB?.players || [])].map(p => (
                  <option key={p.id} value={p.id}>{p.name} (#{p.number})</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const sel = document.getElementById('sanctionPlayerSelect');
                  const pId = sel.value;
                  if (!pId) return;
                  const p = [...(teamA?.players || []), ...(teamB?.players || [])].find(x => x.id === pId);
                  if (p) addSanction(p, p.teamId, 'green');
                }}
                className="px-2.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl"
              >
                🟢 Verde
              </button>
              <button
                onClick={() => {
                  const sel = document.getElementById('sanctionPlayerSelect');
                  const pId = sel.value;
                  if (!pId) return;
                  const p = [...(teamA?.players || []), ...(teamB?.players || [])].find(x => x.id === pId);
                  if (p) addSanction(p, p.teamId, 'yellow');
                }}
                className="px-2.5 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl"
              >
                🟡 Amarilla
              </button>
              <button
                onClick={() => {
                  const sel = document.getElementById('sanctionPlayerSelect');
                  const pId = sel.value;
                  if (!pId) return;
                  const p = [...(teamA?.players || []), ...(teamB?.players || [])].find(x => x.id === pId);
                  if (p) addSanction(p, p.teamId, 'red');
                }}
                className="px-2.5 py-1.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-xl"
              >
                🔴 Roja
              </button>
            </div>

            {sanctions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sanctions.map(s => (
                  <span key={s.id} onClick={() => removeSanction(s.id)} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-100 rounded-lg cursor-pointer hover:bg-rose-50 hover:text-rose-600">
                    {s.cardType === 'green' ? '🟢' : s.cardType === 'yellow' ? '🟡' : '🔴'} {s.playerName} ✕
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-sky-600 active:bg-sky-700 text-white font-bold rounded-2xl shadow-md text-sm mt-2 transition-transform active:scale-[0.99]"
          >
            Guardar y Finalizar Partido
          </button>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;
}
