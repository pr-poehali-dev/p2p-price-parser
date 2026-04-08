import { useState } from 'react';
import Icon from '@/components/ui/icon';

type Page = 'dashboard' | 'exchanges' | 'analytics' | 'compare' | 'settings';

interface LayoutProps {
  children: (page: Page, setPage: (p: Page) => void) => React.ReactNode;
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
  { id: 'exchanges', label: 'Биржи', icon: 'Layers' },
  { id: 'analytics', label: 'Аналитика', icon: 'TrendingUp' },
  { id: 'compare', label: 'Сравнение', icon: 'ArrowLeftRight' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

export default function Layout({ children }: LayoutProps) {
  const [page, setPage] = useState<Page>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border transition-all duration-300 ${collapsed ? 'w-14' : 'w-52'}`}
        style={{ background: 'hsl(var(--card))' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <div className="w-6 h-6 bg-primary rounded-sm flex-shrink-0 flex items-center justify-center">
            <span className="text-xs font-mono font-medium text-primary-foreground">P</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-medium tracking-wide text-foreground whitespace-nowrap">
              PriceParser
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-3 px-2 py-2.5 rounded transition-all text-sm ${
                page === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon name={item.icon} size={16} className="flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Status + collapse */}
        <div className="border-t border-border p-3 flex flex-col gap-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              <span className="text-xs text-muted-foreground">5 бирж онлайн</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-sm font-medium text-foreground">
              {NAV_ITEMS.find(n => n.id === page)?.label}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })}
              {' · '}
              {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              live
            </div>
            <button className="w-7 h-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="Bell" size={14} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children(page, setPage)}
        </div>
      </main>
    </div>
  );
}
