import { useState } from 'react';
import { Flame, Share2, ShieldAlert, Trophy } from 'lucide-react';
import { PlayerCardStat, ScorerStat } from '../types';

interface ScorersViewProps {
  scorers: ScorerStat[];
  cardStats: PlayerCardStat[];
  onShareScorers?: () => void;
}

export function ScorersView({ scorers, cardStats, onShareScorers }: ScorersViewProps) {
  const [subTab, setSubTab] = useState<'scorers' | 'cards'>('scorers');

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* iOS Segmented Control */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1">
        <button
          onClick={() => setSubTab('scorers')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
            subTab === 'scorers'
              ? 'bg-white text-slate-900 shadow-xs scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Goleadores/as ({scorers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('cards')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
            subTab === 'cards'
              ? 'bg-white text-slate-900 shadow-xs scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>Fair Play & Tarjetas ({cardStats.length})</span>
        </button>
      </div>

      {/* Scorers Leaderboard Tab */}
      {subTab === 'scorers' && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Tabla de Goleadores/as</h3>
              <p className="text-[10px] text-slate-400">Goles convertidos en el torneo</p>
            </div>
            
            <div className="flex items-center gap-2">
              {onShareScorers && scorers.length > 0 && (
                <button
                  id="btn-share-scorers-whatsapp"
                  onClick={onShareScorers}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95"
                  title="Compartir goleadores en WhatsApp"
                >
                  <Share2 className="w-3 h-3 stroke-[2.5]" />
                  <span>Compartir</span>
                </button>
              )}
              <span className="text-[11px] font-semibold text-slate-400">Total Goles</span>
            </div>
          </div>

          {scorers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aún no se han anotado goles en los partidos disputados.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {scorers.map((scorer, idx) => (
                <div
                  key={`${scorer.playerId}-${idx}`}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-black ${
                        idx === 0
                          ? 'text-amber-500 text-sm'
                          : idx === 1
                          ? 'text-slate-500 text-sm'
                          : idx === 2
                          ? 'text-amber-700 text-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                        style={{ backgroundColor: scorer.teamColor }}
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{scorer.playerName}</span>
                          <span className="text-slate-400 text-xs font-normal">
                            #{scorer.playerNumber}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500">{scorer.teamName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 font-black rounded-xl text-sm border border-sky-100">
                      {scorer.goals} {scorer.goals === 1 ? 'gol' : 'goles'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cards Leaderboard Tab */}
      {subTab === 'cards' && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sanciones Acumuladas</h3>
              <p className="text-[11px] text-slate-400">Verde (2m) • Amarilla (5/10m) • Roja</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Tarjetas</span>
          </div>

          {cardStats.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Excelente conducta: ¡Sin tarjetas ni sanciones registradas!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cardStats.map((cardItem) => (
                <div
                  key={cardItem.playerId}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                      style={{ backgroundColor: cardItem.teamColor }}
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {cardItem.playerName}{' '}
                        <span className="text-slate-400 text-xs font-normal">
                          #{cardItem.playerNumber}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500">{cardItem.teamName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cardItem.green > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-black text-xs border border-emerald-200">
                        🟢 {cardItem.green}
                      </span>
                    )}
                    {cardItem.yellow > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-black text-xs border border-amber-200">
                        🟡 {cardItem.yellow}
                      </span>
                    )}
                    {cardItem.red > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 font-black text-xs border border-rose-200">
                        🔴 {cardItem.red}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
