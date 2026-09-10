import { ChevronDown, Share2, Trophy } from 'lucide-react';
import { TournamentStatus } from '../types';

interface HeaderProps {
  tournamentName: string;
  category?: string;
  season?: string;
  status?: TournamentStatus;
  onShareWhatsApp: () => void;
  courtsCount: number;
  onOpenTournamentSwitcher: () => void;
}

export function Header({
  tournamentName,
  category,
  season,
  status = 'active',
  onShareWhatsApp,
  courtsCount,
  onOpenTournamentSwitcher,
}: HeaderProps) {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-[#F2F2F7]/90 backdrop-blur-xl border-b border-slate-200/70 px-4 pt-safe pb-2 transition-all"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-open-tournament-switcher"
          onClick={onOpenTournamentSwitcher}
          className="min-w-0 flex-1 text-left group active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100/90 text-sky-800 text-[10px] font-bold tracking-wide uppercase">
              🏑 {category || 'Hockey Césped'}
            </span>

            {status === 'active' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En Vivo
              </span>
            )}
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                🏁 Finalizado
              </span>
            )}
            {status === 'upcoming' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                ⏳ Próximo
              </span>
            )}

            <span className="text-[10px] font-semibold text-slate-400">
              • {courtsCount} {courtsCount === 1 ? 'Cancha' : 'Canchas'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight truncate group-hover:text-sky-600 transition-colors">
              {tournamentName || 'Torneo de Hockey'}
            </h1>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 stroke-[2.5]" />
          </div>
        </button>

        <button
          id="btn-share-whatsapp"
          onClick={onShareWhatsApp}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl shadow-sm text-xs font-bold transition-all active:scale-95 shrink-0 min-h-[44px]"
          title="Compartir resumen en WhatsApp"
        >
          <Share2 className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>
      </div>
    </header>
  );
}
