import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import MiniChart from '@/components/MiniChart';
import { ASSETS, EXCHANGES, generatePriceHistory, formatPrice, formatVolume } from '@/data/mockData';
import Icon from '@/components/ui/icon';

function generateSparkline(base: number) {
  let p = base * 0.96;
  return Array.from({ length: 20 }, () => {
    p = p * (1 + (Math.random() - 0.48) * 0.025);
    return p;
  });
}

interface TooltipProps { active?: boolean; payload?: { value: number }[]; label?: string; }
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div className="text-foreground">${formatPrice(payload[0].value)}</div>
    </div>
  );
};

export default function Dashboard() {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [chartData, setChartData] = useState(generatePriceHistory(ASSETS[0].price));
  const [sparklines] = useState(() => ASSETS.map(a => generateSparkline(a.price)));
  const [prices, setPrices] = useState(ASSETS.map(a => a.price));
  const onlineExchanges = EXCHANGES.filter(e => e.status === 'online').length;

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map((p, i) => {
        const drift = (Math.random() - 0.49) * 0.001;
        return Math.round(p * (1 + drift) * 100) / 100;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectAsset = (asset: typeof ASSETS[0]) => {
    setSelectedAsset(asset);
    setChartData(generatePriceHistory(asset.price));
  };

  const totalVolume = ASSETS.reduce((s, a) => s + a.volume, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Объём 24ч', value: formatVolume(totalVolume), icon: 'BarChart2', sub: '+12.4% к вчера' },
          { label: 'Пар отслеживается', value: '6', icon: 'Layers', sub: 'Активных активов' },
          { label: 'Бирж онлайн', value: `${onlineExchanges}/${EXCHANGES.length}`, icon: 'Wifi', sub: 'Подключено' },
          { label: 'Обновлений/мин', value: '1,440', icon: 'Zap', sub: 'Live поток данных' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <Icon name={kpi.icon} size={14} className="text-muted-foreground" />
            </div>
            <div className="text-xl font-mono font-medium text-foreground">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main chart */}
        <div className="col-span-2 bg-card border border-border rounded p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">{selectedAsset.symbol}</div>
              <div className="text-2xl font-mono font-medium text-foreground">
                ${formatPrice(prices[ASSETS.indexOf(selectedAsset)])}
              </div>
              <div className={`text-xs font-mono mt-0.5 ${selectedAsset.change24h >= 0 ? 'text-green' : 'text-red'}`}>
                {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h}% за 24ч
              </div>
            </div>
            <div className="flex gap-2">
              {['1H', '24H', '7D'].map(t => (
                <button key={t} className={`text-xs px-2 py-1 rounded font-mono ${t === '24H' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(162 72% 50%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(162 72% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 11% 14%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215 14% 45%)' }} axisLine={false} tickLine={false} interval={7} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215 14% 45%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${formatPrice(v)}`} width={72} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="price" stroke="hsl(162 72% 50%)" strokeWidth={1.5} fill="url(#priceGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asset list */}
        <div className="bg-card border border-border rounded p-4">
          <div className="text-xs text-muted-foreground mb-3">Активы</div>
          <div className="flex flex-col gap-1">
            {ASSETS.map((asset, i) => (
              <button
                key={asset.symbol}
                onClick={() => handleSelectAsset(asset)}
                className={`flex items-center gap-3 p-2 rounded transition-all text-left w-full ${selectedAsset.symbol === asset.symbol ? 'bg-primary/10' : 'hover:bg-secondary'}`}
              >
                <MiniChart
                  data={sparklines[i]}
                  color={asset.change24h >= 0 ? 'hsl(162 72% 50%)' : 'hsl(0 72% 58%)'}
                  width={50}
                  height={28}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-medium text-foreground truncate">{asset.symbol}</div>
                  <div className="text-xs text-muted-foreground">{asset.name}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-mono ${asset.change24h >= 0 ? 'text-green' : 'text-red'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live tape */}
      <div className="bg-card border border-border rounded p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          <span className="text-xs text-muted-foreground">Текущие цены</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {ASSETS.map((asset, i) => (
            <div key={asset.symbol} className="text-center">
              <div className="text-xs text-muted-foreground font-mono mb-1">{asset.symbol}</div>
              <div className="text-sm font-mono font-medium text-foreground">${formatPrice(prices[i])}</div>
              <div className={`text-xs font-mono mt-0.5 ${asset.change24h >= 0 ? 'text-green' : 'text-red'}`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}