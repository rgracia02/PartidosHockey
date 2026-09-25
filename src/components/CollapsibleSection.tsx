import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type IconColor = 'sky' | 'emerald' | 'amber' | 'slate' | 'violet';

const ICON_BADGE_CLASSES: Record<IconColor, string> = {
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

interface CollapsibleSectionProps {
  icon: ReactNode;
  /** Tint of the little badge behind the icon. Defaults to sky, the app's main accent. */
  iconColor?: IconColor;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  icon,
  iconColor = 'sky',
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-4 min-h-[52px] active:bg-slate-50 dark:active:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={`p-1.5 rounded-xl inline-flex items-center justify-center shrink-0 ${ICON_BADGE_CLASSES[iconColor]}`}>
            {icon}
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white text-left">{title}</h3>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}
