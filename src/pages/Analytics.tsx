import { useState, useEffect, useRef } from 'react';
import { ASSETS, generatePriceHistory, formatPrice } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const PERIODS = ['1ч', '4ч', '24ч', '7д', '30д'];

export default function Analytics() {
  const [asset, setAsset] = useState('BTC/USDT');
  const [period, setPeriod] = useState('24ч');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selected = ASSETS.find(a => a.symbol === asset) || ASSETS[0];
  const history = generatePriceHistory(selected.price, period === '7д' ? 168 : period === '30д' ? 720 : period === '4ч' ? 16 : 48);

  useEffect(() => {
    drawChart();
  }, [asset, period]);

  function drawChart() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const prices = history.map(d => d.price);
    const volumes = history.map(d => d.volume);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const maxVol = Math.max(...volumes);

    const pad = { top: 16, right: 16, bottom: 56, left: 72 };
    const volH = 40;
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom - volH - 8;

    const toX = (i: number) => pad.left + (i / (prices.length - 1)) * cw;
    const toY = (v: number) => pad.top + ch - ((v - min) / range) * ch;

    const isUp = prices[prices.length - 1] >= prices[0];
    const lineColor = isUp ? '#34d399' : '#f87171';

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (ch / 5) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      const val = max - (range / 5) * i;
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.font = '10px IBM Plex Mono';
      ctx.textAlign = 'right';
      ctx.fillText(formatPrice(val), pad.left - 8, y + 3.5);
    }

    // Volume bars
    const volY = pad.top + ch + 8;
    prices.forEach((_, i) => {
      const x = toX(i);
      const barH = (volumes[i] / maxVol) * volH;
      ctx.fillStyle = i % 2 === 0 ? lineColor + '50' : lineColor + '30';
      ctx.fillRect(x - 1.5, volY + volH - barH, 3, barH);
    });

    // Fill
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(prices[0]));
    for (let i = 1; i < prices.length; i++) {
      const cpx = (toX(i - 1) + toX(i)) / 2;
      ctx.bezierCurveTo(cpx, toY(prices[i-1]), cpx, toY(prices[i]), toX(i), toY(prices[i]));
    }
    ctx.lineTo(toX(prices.length - 1), pad.top + ch);
    ctx.lineTo(toX(0), pad.top + ch);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grad.addColorStop(0, lineColor + '28');
    grad.addColorStop(1, lineColor + '00');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(prices[0]));
    for (let i = 1; i < prices.length; i++) {
      const cpx = (toX(i - 1) + toX(i)) / 2;
      ctx.bezierCurveTo(cpx, toY(prices[i-1]), cpx, toY(prices[i]), toX(i), toY(prices[i]));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Time labels
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = '10px IBM Plex Mono';
    ctx.textAlign = 'center';
    const step = Math.floor(prices.length / 8);
    for (let i = 0; i < prices.length; i += step) {
      ctx.fillText(history[i].time, toX(i), H - pad.bottom + 16);
    }

    // Dot at end
    ctx.beginPath();
    ctx.arc(toX(prices.length - 1), toY(prices[prices.length - 1]), 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
  }

  const priceMin = Math.min(...history.map(d => d.price));
  const priceMax = Math.max(...history.map(d => d.price));
  const priceStart = history[0]?.price ?? 0;
  const priceEnd = history[history.length - 1]?.price ?? 0;
  const totalChange = ((priceEnd - priceStart) / priceStart * 100).toFixed(2);
  const isUp = parseFloat(totalChange) >= 0;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-card border border-border rounded p-1">
          {ASSETS.map(a => (
            <button
              key={a.symbol}
              onClick={() => setAsset(a.symbol)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                asset === a.symbol ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {a.symbol.split('/')[0]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-card border border-border rounded p-1 ml-auto">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Текущая цена', value: `$${formatPrice(priceEnd)}`, color: isUp ? 'text-green' : 'text-red' },
          { label: 'Изменение', value: `${isUp ? '+' : ''}${totalChange}%`, color: isUp ? 'text-green' : 'text-red' },
          { label: 'Минимум', value: `$${formatPrice(priceMin)}`, color: 'text-foreground' },
          { label: 'Максимум', value: `$${formatPrice(priceMax)}`, color: 'text-foreground' },
        ].map((m, i) => (
          <div key={i} className="bg-card border border-border rounded p-4">
            <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
            <p className={`text-lg font-mono font-medium ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="bg-card border border-border rounded" style={{ height: '380px' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="text-sm font-medium">{asset} · {period}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Info" size={12} />
            <span>Включая объёмы торгов</span>
          </div>
        </div>
        <div className="p-3" style={{ height: 'calc(100% - 49px)' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      </div>

      {/* Trend analysis */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Тренд', value: isUp ? 'Восходящий' : 'Нисходящий', icon: isUp ? 'TrendingUp' : 'TrendingDown', color: isUp ? 'text-green' : 'text-red' },
          { label: 'Волатильность', value: Math.abs(parseFloat(totalChange)) > 3 ? 'Высокая' : 'Средняя', icon: 'Activity', color: 'text-yellow' },
          { label: 'Сигнал', value: isUp ? 'Покупка' : 'Наблюдение', icon: isUp ? 'ArrowUpCircle' : 'Eye', color: isUp ? 'text-green' : 'text-muted-foreground' },
        ].map((t, i) => (
          <div key={i} className="bg-card border border-border rounded p-4 flex items-center gap-4">
            <Icon name={t.icon} size={20} className={t.color} />
            <div>
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <p className={`text-sm font-medium ${t.color}`}>{t.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
