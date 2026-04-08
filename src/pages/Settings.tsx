import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function Settings() {
  const [interval, setInterval] = useState('1000');
  const [notifications, setNotifications] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState('2.0');
  const [apiKey, setApiKey] = useState('');
  const [pairs, setPairs] = useState('BTC/USDT, ETH/USDT, SOL/USDT');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 max-w-2xl space-y-5 animate-fade-in">
      {/* Parsing settings */}
      <div className="bg-card border border-border rounded">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium">Параметры парсинга</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Частота обновления и торговые пары</p>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Интервал обновления</label>
            <div className="flex gap-2">
              {['500', '1000', '2000', '5000'].map(v => (
                <button
                  key={v}
                  onClick={() => setInterval(v)}
                  className={`px-4 py-2 rounded text-xs font-mono transition-colors ${
                    interval === v ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  {parseInt(v) < 1000 ? `${v}ms` : `${parseInt(v) / 1000}с`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Торговые пары (через запятую)</label>
            <textarea
              value={pairs}
              onChange={e => setPairs(e.target.value)}
              rows={3}
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium">Оповещения</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Условия срабатывания сигналов</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Push-уведомления</p>
              <p className="text-xs text-muted-foreground mt-0.5">При значительных изменениях цены</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-10 h-5 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-secondary border border-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Порог срабатывания (%)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={alertThreshold}
                onChange={e => setAlertThreshold(e.target.value)}
                className="w-24 bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                step="0.1"
                min="0.1"
                max="50"
              />
              <span className="text-xs text-muted-foreground">процентов изменения цены</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Webhook URL (опционально)</label>
            <input
              type="text"
              placeholder="https://hooks.example.com/..."
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-card border border-border rounded">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium">API ключи</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Для доступа к биржевым данным</p>
        </div>
        <div className="p-5 space-y-4">
          {['Binance', 'Bybit', 'OKX'].map(ex => (
            <div key={ex}>
              <label className="block text-xs text-muted-foreground mb-2">{ex} API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
                <button className="px-3 py-2 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Icon name="Eye" size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className={`px-5 py-2.5 rounded text-sm font-medium transition-all ${
            saved ? 'bg-primary/20 text-primary' : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {saved ? (
            <span className="flex items-center gap-2">
              <Icon name="Check" size={14} />
              Сохранено
            </span>
          ) : 'Сохранить настройки'}
        </button>
        <button className="px-5 py-2.5 rounded text-sm text-muted-foreground hover:text-foreground transition-colors">
          Сбросить
        </button>
      </div>
    </div>
  );
}
