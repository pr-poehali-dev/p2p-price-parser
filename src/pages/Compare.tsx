import { useState } from 'react';
import { COMPARISON_DATA, EXCHANGES, formatPrice } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const ACTIVE_EXCHANGES = EXCHANGES.filter(e => e.status !== 'offline');

export default function Compare() {
  const [selectedAsset, setSelectedAsset] = useState(COMPARISON_DATA[0]);

  const prices = Object.values(selectedAsset.prices);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const spread = ((maxPrice - minPrice) / minPrice * 100).toFixed(4);
  const bestBuy = Object.entries(selectedAsset.prices).reduce((a, b) => a[1] < b[1] ? a : b);
  const bestSell = Object.entries(selectedAsset.prices).reduce((a, b) => a[1] > b[1] ? a : b);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium mb-1">Сравнение цен в реальном времени</h2>
          <p className="text-xs text-muted-foreground">Найдите лучшую цену для покупки и продажи</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-mono bg-primary/10 px-3 py-1.5 rounded">
          <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          live update
        </div>
      </div>

      {/* Asset selector */}
      <div className="flex gap-2">
        {COMPARISON_DATA.map(asset => (
          <button
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset)}
            className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
              selectedAsset.symbol === asset.symbol
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {asset.symbol}
          </button>
        ))}
      </div>

      {/* Opportunity cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-primary/30 rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="ShoppingCart" size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Лучшая покупка</span>
          </div>
          <p className="text-xl font-mono font-medium text-primary">${formatPrice(bestBuy[1])}</p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{bestBuy[0]}</p>
        </div>
        <div className="bg-card border border-green/20 rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="DollarSign" size={14} className="text-green" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Лучшая продажа</span>
          </div>
          <p className="text-xl font-mono font-medium text-green">${formatPrice(bestSell[1])}</p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{bestSell[0]}</p>
        </div>
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="ArrowLeftRight" size={14} className="text-yellow" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Спред</span>
          </div>
          <p className="text-xl font-mono font-medium text-yellow">{spread}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            ${formatPrice(maxPrice - minPrice)} разница
          </p>
        </div>
      </div>

      {/* Price comparison table */}
      <div className="bg-card border border-border rounded">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {selectedAsset.symbol} — Цены по биржам
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Биржа</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Цена</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Отклонение</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Статус</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(selectedAsset.prices)
                .sort(([, a], [, b]) => a - b)
                .map(([exId, price]) => {
                  const ex = EXCHANGES.find(e => e.id === exId);
                  const diff = ((price - minPrice) / minPrice * 100).toFixed(4);
                  const isBest = price === minPrice;
                  const isWorst = price === maxPrice;
                  const barW = ((price - minPrice) / (maxPrice - minPrice + 0.001)) * 100;

                  return (
                    <tr key={exId} className={`border-b border-border last:border-0 transition-colors ${isBest ? 'bg-primary/3' : 'hover:bg-secondary/50'}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isBest && <Icon name="Star" size={12} className="text-primary" />}
                          {isWorst && <Icon name="ArrowUp" size={12} className="text-red" />}
                          <span className="font-medium capitalize">{ex?.name || exId}</span>
                        </div>
                      </td>
                      <td className={`px-5 py-4 text-right font-mono font-medium ${isBest ? 'text-primary' : ''}`}>
                        ${formatPrice(price)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-1 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isBest ? 'bg-primary' : 'bg-muted-foreground'}`}
                              style={{ width: `${barW}%` }}
                            />
                          </div>
                          <span className={`font-mono w-16 text-right ${isBest ? 'text-primary' : 'text-muted-foreground'}`}>
                            +{diff}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-mono text-xs ${
                          ex?.status === 'online' ? 'text-primary' :
                          ex?.status === 'warning' ? 'text-yellow' : 'text-red'
                        }`}>
                          {ex?.status === 'online' ? `${ex.latency}ms` : ex?.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className={`px-3 py-1 rounded text-xs transition-colors ${
                          isBest
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}>
                          {isBest ? 'Купить' : 'Открыть'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual price bar */}
      <div className="bg-card border border-border rounded p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Визуальное сравнение цен</p>
        <div className="space-y-3">
          {Object.entries(selectedAsset.prices)
            .sort(([, a], [, b]) => a - b)
            .map(([exId, price]) => {
              const ex = EXCHANGES.find(e => e.id === exId);
              const pct = ((price - minPrice) / (maxPrice - minPrice + 0.001)) * 100;
              const isBest = price === minPrice;
              return (
                <div key={exId} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 capitalize">{ex?.name || exId}</span>
                  <div className="flex-1 h-6 bg-secondary rounded overflow-hidden relative">
                    <div
                      className={`h-full rounded flex items-center px-2 transition-all ${isBest ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                      style={{ width: `${Math.max(pct, 8) + 8}%` }}
                    >
                      <span className={`text-xs font-mono whitespace-nowrap ${isBest ? 'text-primary-foreground' : 'text-foreground'}`}>
                        ${formatPrice(price)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
