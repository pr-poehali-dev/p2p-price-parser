import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { EXCHANGES } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];

export default function Settings() {
  const [enabledExchanges, setEnabledExchanges] = useState<Record<string, boolean>>(
    Object.fromEntries(EXCHANGES.map(e => [e.id, e.status !== 'offline']))
  );
  const [interval, setInterval] = useState('5с');
  const [depth, setDepth] = useState('7д');
  const [pairs, setPairs] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);
  const [alerts, setAlerts] = useState({ price: true, arbitrage: true, offline: false });
  const [saved, setSaved] = useState(false);

  const togglePair = (p: string) =>
    setPairs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-3xl">
      {/* Exchange connections */}
      <div className="bg-card border border-border rounded p-5">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Подключение бирж</div>
        <div className="space-y-3">
          {EXCHANGES.map(ex => (
            <div key={ex.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <Switch
                  checked={enabledExchanges[ex.id]}
                  onCheckedChange={v => setEnabledExchanges(prev => ({ ...prev, [ex.id]: v }))}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{ex.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      ex.status === 'online' ? 'bg-primary/10 text-primary' :
                      ex.status === 'warning' ? 'bg-yellow/10 text-yellow' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {ex.status === 'online' ? 'онлайн' : ex.status === 'warning' ? 'нестабильно' : 'оффлайн'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {ex.pairs} пар · {ex.latency > 0 ? `${ex.latency}ms` : '—'}
                  </div>
                </div>
              </div>
              <button className="text-xs px-3 py-1.5 border border-border rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                API ключ
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Parsing params */}
      <div className="bg-card border border-border rounded p-5">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Параметры парсинга</div>
        <div className="space-y-5">
          <div>
            <div className="text-xs text-muted-foreground mb-2">Интервал обновления</div>
            <div className="flex gap-2">
              {['1с', '5с', '15с', '30с'].map(v => (
                <button
                  key={v}
                  onClick={() => setInterval(v)}
                  className={`px-4 py-2 text-xs rounded font-mono transition-all ${
                    interval === v
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Глубина истории</div>
            <div className="flex gap-2">
              {['24ч', '7д', '30д', '90д'].map(v => (
                <button
                  key={v}
                  onClick={() => setDepth(v)}
                  className={`px-4 py-2 text-xs rounded font-mono transition-all ${
                    depth === v
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Торговые пары</div>
            <div className="flex flex-wrap gap-2">
              {PAIRS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePair(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded font-mono transition-all border ${
                    pairs.includes(p)
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {pairs.includes(p) && <Icon name="Check" size={11} />}
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded p-5">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Уведомления</div>
        <div className="space-y-3">
          {[
            { key: 'price' as const, label: 'Ценовые алерты', desc: 'Уведомление при достижении установленной цены' },
            { key: 'arbitrage' as const, label: 'Арбитраж-сигналы', desc: 'Оповещение о выгодных возможностях' },
            { key: 'offline' as const, label: 'Оффлайн биржи', desc: 'Уведомление при отключении биржи' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
              <Switch
                checked={alerts[item.key]}
                onCheckedChange={v => setAlerts(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-medium transition-all ${
            saved
              ? 'bg-primary/20 text-primary'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {saved && <Icon name="Check" size={14} />}
          {saved ? 'Сохранено' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
}
