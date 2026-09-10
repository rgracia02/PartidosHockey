import { ChevronDown, Moon, Share2, Sun, Trophy } from 'lucide-react';
import { TournamentStatus } from '../types';

interface HeaderProps {
  tournamentName: string;
  category?: string;
  season?: string;
  status?: TournamentStatus;
  isDark: boolean;
  onToggleTheme: () => void;
  onShareWhatsApp: () => void;
  courtsCount: number;
  onOpenTournamentSwitcher: () => void;
}

export function Header({
  tournamentName,
  category,
  season,
  status = 'active',
  isDark,
  onToggleTheme,
  onShareWhatsApp,
  courtsCount,
  onOpenTournamentSwitcher,
}: HeaderProps) {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-[#F2F2F7]/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 px-4 pt-safe pb-2 transition-colors"
    >
      <div className="flex items-center justify-between gap-2.5">
        <button
          id="btn-open-tournament-switcher"
          onClick={onOpenTournamentSwitcher}
          className="min-w-0 flex-1 text-left group active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100/90 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-[10px] font-bold tracking-wide uppercase">
              🏑 {category || 'Hockey Césped'}
            </span>

            {status === 'active' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En Vivo
              </span>
            )}
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                🏁 Finalizado
              </span>
            )}
            {status === 'upcoming' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                ⏳ Próximo
              </span>
            )}

            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              • {courtsCount} {courtsCount === 1 ? 'Cancha' : 'Canchas'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {tournamentName || 'Torneo de Hockey'}
            </h1>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 shrink-0 stroke-[2.5]" />
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-300 border border-slate-200/80 dark:border-slate-700 shadow-xs active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun className="w-4 h-4 stroke-[2.5]" /> : <Moon className="w-4 h-4 stroke-[2.5]" />}
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
      </div>
    </header>
  );
}
