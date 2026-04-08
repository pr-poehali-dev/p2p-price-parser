import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ASSETS, generatePriceHistory, formatPrice, formatVolume } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const TOP_ASSETS = ['BTC', 'ETH', 'SOL'];
const ASSET_COLORS: Record<string, string> = {
  BTC: 'hsl(43,96%,56%)',
  ETH: 'hsl(210,80%,60%)',
  SOL: 'hsl(162,72%,50%)',
};

export default function Analytics() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['BTC', 'ETH', 'SOL']);
  const [period, setPeriod] = useState<7 | 14 | 30>(30);

  const historyData = useMemo(() => {
    const pts: Record<string, number | string>[] = [];
    const now = new Date();
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const point: Record<string, number | string> = {
        date: d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
      };
      TOP_ASSETS.forEach(sym => {
        const asset = ASSETS.find(a => a.symbol === sym + '/USDT');
        if (asset) {
          point[sym] = +(asset.price * (1 + (Math.random() - 0.5) * 0.12 * (i / period))).toFixed(2);
        }
      });
      pts.push(point);
    }
    return pts;
  }, [period]);

  const volumeData = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return {
        date: d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
        vol: +(40 + Math.random() * 30).toFixed(1),
      };
    }), []);

  const statCards = TOP_ASSETS.map(sym => {
    const asset = ASSETS.find(a => a.symbol === sym + '/USDT');
    const price = asset?.price ?? 100;
    const h = generatePriceHistory(price, 30).map(d => d.price);
    return {
      symbol: sym,
      price,
      change30d: ((price - h[0]) / h[0]) * 100,
      max: Math.max(...h),
      min: Math.min(...h),
    };
  });

  const toggleAsset = (sym: string) =>
    setSelectedAssets(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(card => (
          <div key={card.symbol} className="bg-card border border-border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase">{card.symbol}/USDT</span>
              <Icon name={card.change30d >= 0 ? 'TrendingUp' : 'TrendingDown'} size={14} className={card.change30d >= 0 ? 'text-green' : 'text-red'} />
            </div>
            <p className="text-xl font-mono font-medium mb-2">${formatPrice(card.price)}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">30д</p>
                <p className={`font-mono font-medium ${card.change30d >= 0 ? 'text-green' : 'text-red'}`}>
                  {card.change30d >= 0 ? '+' : ''}{card.change30d.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Макс</p>
                <p className="font-mono text-green">${formatPrice(card.max)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Мин</p>
                <p className="font-mono text-red">${formatPrice(card.min)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">История цен</span>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {TOP_ASSETS.map(sym => (
                <button
                  key={sym}
                  onClick={() => toggleAsset(sym)}
                  className={`px-2.5 py-1 text-xs rounded font-mono transition-all border ${
                    selectedAssets.includes(sym) ? 'border-transparent' : 'border-border opacity-40'
                  }`}
                  style={selectedAssets.includes(sym) ? {
                    background: ASSET_COLORS[sym] + '20',
                    color: ASSET_COLORS[sym],
                    borderColor: ASSET_COLORS[sym] + '40',
                  } : {}}
                >
                  {sym}
                </button>
              ))}
            </div>
            <div className="flex border border-border rounded overflow-hidden">
              {([7, 14, 30] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-mono transition-colors ${
                    period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}д
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={historyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 2, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            {selectedAssets.includes('BTC') && <Line type="monotone" dataKey="BTC" stroke={ASSET_COLORS.BTC} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />}
            {selectedAssets.includes('ETH') && <Line type="monotone" dataKey="ETH" stroke={ASSET_COLORS.ETH} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />}
            {selectedAssets.includes('SOL') && <Line type="monotone" dataKey="SOL" stroke={ASSET_COLORS.SOL} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-4">Объём ($B) · 14 дней</span>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={volumeData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}B`} width={42} />
              <Tooltip
                formatter={(v: number) => [`$${v.toFixed(1)}B`, 'Объём']}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 2, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
              />
              <Bar dataKey="vol" fill="hsl(var(--primary))" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-3">Все активы</span>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Пара</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Цена</th>
                <th className="text-right py-2 text-muted-foreground font-medium">24ч</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Объём</th>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map(a => (
                <tr key={a.symbol} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="py-2.5 font-medium">{a.symbol}</td>
                  <td className="py-2.5 text-right font-mono">${formatPrice(a.price)}</td>
                  <td className={`py-2.5 text-right font-mono ${a.change24h >= 0 ? 'text-green' : 'text-red'}`}>
                    {a.change24h >= 0 ? '+' : ''}{a.change24h.toFixed(2)}%
                  </td>
                  <td className="py-2.5 text-right font-mono text-muted-foreground">{formatVolume(a.volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}