import { useState, useMemo } from 'react';
import { COMPARISON_DATA, formatPrice } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const EXCHANGE_NAMES: Record<string, string> = {
  binance: 'Binance',
  bybit: 'Bybit',
  okx: 'OKX',
  kraken: 'Kraken',
  coinbase: 'Coinbase',
};

const EXCHANGE_STATUS: Record<string, string> = {
  binance: 'online',
  bybit: 'online',
  okx: 'online',
  kraken: 'warning',
  coinbase: 'online',
};

export default function Compare() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');

  const symbolOptions = COMPARISON_DATA.map(d => d.symbol);

  const rows = useMemo(() => {
    const data = COMPARISON_DATA.find(d => d.symbol === selectedSymbol);
    if (!data) return [];
    const entries = Object.entries(data.prices).map(([ex, price]) => ({ ex, price }));
    const prices = entries.map(e => e.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return entries.map(e => ({
      ...e,
      spread: e.price - minPrice,
      spreadPct: ((e.price - minPrice) / minPrice) * 100,
      isMin: e.price === minPrice,
      isMax: e.price === maxPrice,
    })).sort((a, b) => a.price - b.price);
  }, [selectedSymbol]);

  const stats = useMemo(() => {
    if (!rows.length) return { min: 0, max: 0, avg: 0, totalSpread: 0 };
    const prices = rows.map(r => r.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    return { min, max, avg, totalSpread: max - min, totalSpreadPct: ((max - min) / min) * 100 };
  }, [rows]);

  const bestBuy = rows[0];
  const bestSell = rows[rows.length - 1];
  const arbitrageProfit = bestBuy && bestSell
    ? ((bestSell.price - bestBuy.price) / bestBuy.price) * 10000
    : 0;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {symbolOptions.map(sym => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-4 py-2 text-sm rounded font-mono transition-all ${
                selectedSymbol === sym
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          live · обновление 1с
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Мин. цена', value: `$${formatPrice(stats.min)}`, color: 'text-green', icon: 'ArrowDown' },
          { label: 'Макс. цена', value: `$${formatPrice(stats.max)}`, color: 'text-red', icon: 'ArrowUp' },
          { label: 'Среднее', value: `$${formatPrice(stats.avg)}`, color: 'text-foreground', icon: 'Minus' },
          { label: 'Спред', value: `$${formatPrice(stats.totalSpread)} · ${stats.totalSpreadPct?.toFixed(3) ?? '0.000'}%`, color: 'text-yellow', icon: 'ArrowLeftRight' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <Icon name={s.icon} size={13} className={s.color} />
            </div>
            <div className={`text-sm font-mono font-medium ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Comparison table */}
        <div className="col-span-2 bg-card border border-border rounded overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Сравнение цен · {selectedSymbol}</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Биржа</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Цена</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Спред</th>
                <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Спред %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr
                  key={row.ex}
                  className={`border-b border-border last:border-0 transition-colors ${
                    row.isMin ? 'border-l-2 border-l-primary bg-primary/5' :
                    row.isMax ? 'border-l-2 border-l-destructive bg-destructive/5' :
                    'border-l-2 border-l-transparent hover:bg-secondary/30'
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        EXCHANGE_STATUS[row.ex] === 'online' ? 'bg-primary' :
                        EXCHANGE_STATUS[row.ex] === 'warning' ? 'bg-yellow' : 'bg-red'
                      }`} />
                      <span className="font-medium">{EXCHANGE_NAMES[row.ex]}</span>
                      {row.isMin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono">мин</span>}
                      {row.isMax && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-mono">макс</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">${formatPrice(row.price)}</td>
                  <td className={`px-4 py-3 text-right font-mono ${row.isMin ? 'text-muted-foreground' : 'text-yellow'}`}>
                    {row.isMin ? '—' : `+$${formatPrice(row.spread)}`}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono ${row.isMin ? 'text-muted-foreground' : 'text-yellow'}`}>
                    {row.isMin ? '—' : `+${row.spreadPct.toFixed(4)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Arbitrage card */}
        <div className="flex flex-col gap-3">
          <div className="bg-card border border-border rounded p-5 flex-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Арбитраж</div>
            {bestBuy && bestSell && bestBuy.ex !== bestSell.ex ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Icon name="ArrowDown" size={14} className="text-green" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Купить на</div>
                    <div className="text-sm font-medium">{EXCHANGE_NAMES[bestBuy.ex]}</div>
                    <div className="text-xs font-mono text-green">${formatPrice(bestBuy.price)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3">
                  <div className="flex-1 h-px bg-border" />
                  <Icon name="ArrowDown" size={12} className="text-muted-foreground" />
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-destructive/10 flex items-center justify-center">
                    <Icon name="ArrowUp" size={14} className="text-red" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Продать на</div>
                    <div className="text-sm font-medium">{EXCHANGE_NAMES[bestSell.ex]}</div>
                    <div className="text-xs font-mono text-red">${formatPrice(bestSell.price)}</div>
                  </div>
                </div>
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Спред</span>
                    <span className="font-mono text-yellow">${formatPrice(bestSell.price - bestBuy.price)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Спред %</span>
                    <span className="font-mono text-yellow">{((bestSell.price - bestBuy.price) / bestBuy.price * 100).toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Прибыль $10k</span>
                    <span className="font-mono text-primary">${arbitrageProfit.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Нет данных для арбитража</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
