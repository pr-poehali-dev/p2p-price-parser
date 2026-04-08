import { useState } from 'react';
import { EXCHANGES, formatVolume } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const STATUS_CONFIG = {
  online: { label: 'Онлайн', color: 'text-green', dot: 'bg-primary' },
  warning: { label: 'Задержка', color: 'text-yellow', dot: 'bg-yellow-400' },
  offline: { label: 'Офлайн', color: 'text-red', dot: 'bg-destructive' },
};

export default function Exchanges() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedEx = EXCHANGES.find(e => e.id === selected);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Онлайн', value: EXCHANGES.filter(e => e.status === 'online').length, icon: 'CheckCircle', color: 'text-green' },
          { label: 'Предупреждение', value: EXCHANGES.filter(e => e.status === 'warning').length, icon: 'AlertCircle', color: 'text-yellow' },
          { label: 'Офлайн', value: EXCHANGES.filter(e => e.status === 'offline').length, icon: 'XCircle', color: 'text-red' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded p-4 flex items-center gap-4">
            <Icon name={s.icon} size={20} className={s.color} />
            <div>
              <div className="text-2xl font-mono font-medium text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Exchange list */}
        <div className="col-span-2 space-y-2">
          <div className="text-xs text-muted-foreground mb-3">Подключённые биржи</div>
          {EXCHANGES.map(ex => {
            const cfg = STATUS_CONFIG[ex.status as keyof typeof STATUS_CONFIG];
            return (
              <button
                key={ex.id}
                onClick={() => setSelected(ex.id === selected ? null : ex.id)}
                className={`w-full bg-card border rounded p-4 flex items-center gap-4 text-left transition-all ${selected === ex.id ? 'border-primary/50' : 'border-border hover:border-border/80'}`}
              >
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-mono font-medium text-foreground">
                    {ex.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{ex.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${ex.status === 'online' ? 'pulse-dot' : ''}`} />
                    <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {ex.pairs} пар · {formatVolume(ex.volume24h)} объём 24ч
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {ex.status !== 'offline' ? (
                    <>
                      <div className="text-sm font-mono font-medium text-foreground">{ex.latency}ms</div>
                      <div className="text-xs text-muted-foreground">задержка</div>
                    </>
                  ) : (
                    <span className="text-xs text-red font-mono">—</span>
                  )}
                </div>
                <Icon name="ChevronRight" size={14} className={`text-muted-foreground transition-transform ${selected === ex.id ? 'rotate-90' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="bg-card border border-border rounded p-4">
          {selectedEx ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                  <span className="text-sm font-mono font-medium text-foreground">
                    {selectedEx.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{selectedEx.name}</div>
                  <div className={`text-xs ${STATUS_CONFIG[selectedEx.status as keyof typeof STATUS_CONFIG].color}`}>
                    {STATUS_CONFIG[selectedEx.status as keyof typeof STATUS_CONFIG].label}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                {[
                  { label: 'Торговых пар', value: selectedEx.pairs.toLocaleString() },
                  { label: 'Объём 24ч', value: formatVolume(selectedEx.volume24h) },
                  { label: 'Задержка API', value: selectedEx.status !== 'offline' ? `${selectedEx.latency}ms` : '—' },
                  { label: 'Протокол', value: 'WebSocket + REST' },
                  { label: 'Обновления', value: selectedEx.status === 'online' ? '100ms' : '—' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-mono text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="text-xs text-muted-foreground mb-2">Статус подключения</div>
                <div className="space-y-1.5">
                  {['REST API', 'WebSocket', 'Market Data', 'Order Book'].map(ch => (
                    <div key={ch} className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{ch}</span>
                      <div className={`flex items-center gap-1.5 text-xs ${selectedEx.status === 'online' ? 'text-green' : selectedEx.status === 'warning' && ch === 'WebSocket' ? 'text-yellow' : 'text-red'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedEx.status === 'online' ? 'bg-primary' : selectedEx.status === 'warning' && ch === 'WebSocket' ? 'bg-yellow-400' : 'bg-destructive'}`} />
                        {selectedEx.status === 'online' ? 'OK' : selectedEx.status === 'warning' && ch === 'WebSocket' ? 'Lag' : 'Err'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <Icon name="Layers" size={32} className="text-muted-foreground/40 mb-3" />
              <div className="text-sm text-muted-foreground">Выберите биржу</div>
              <div className="text-xs text-muted-foreground/60 mt-1">для просмотра деталей</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
