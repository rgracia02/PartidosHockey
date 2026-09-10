import { Calendar, Flame, Settings, Trophy } from 'lucide-react';

export type TabType = 'posiciones' | 'fixture' | 'goleadores' | 'config';

interface TabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingMatchesCount: number;
}

export function TabBar({ activeTab, onSelectTab, pendingMatchesCount }: TabBarProps) {
  const tabs = [
    { id: 'posiciones' as TabType, label: 'Posiciones', icon: Trophy },
    { id: 'fixture' as TabType, label: 'Fixture', icon: Calendar, badge: pendingMatchesCount > 0 ? pendingMatchesCount : undefined },
    { id: 'goleadores' as TabType, label: 'Goleadores', icon: Flame },
    { id: 'config' as TabType, label: 'Configuración', icon: Settings },
  ];

  return (
    <nav
      id="ios-tab-bar"
      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-40 bg-white/85 backdrop-blur-xl border-t border-slate-200/80 px-2 pt-1 pb-safe shadow-lg shadow-black/5"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[70px] min-h-[48px] rounded-xl transition-all duration-150 active:scale-95 ${
                isActive ? 'text-sky-600 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 min-w-[16px] h-4 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-sky-600' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
