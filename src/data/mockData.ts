export const EXCHANGES = [
  { id: 'binance', name: 'Binance', status: 'online', latency: 12, pairs: 1847, volume24h: 28400000000 },
  { id: 'bybit', name: 'Bybit', status: 'online', latency: 18, pairs: 623, volume24h: 9800000000 },
  { id: 'okx', name: 'OKX', status: 'online', latency: 24, pairs: 941, volume24h: 12100000000 },
  { id: 'kraken', name: 'Kraken', status: 'warning', latency: 87, pairs: 312, volume24h: 1400000000 },
  { id: 'coinbase', name: 'Coinbase', status: 'online', latency: 31, pairs: 248, volume24h: 3200000000 },
  { id: 'htx', name: 'HTX', status: 'offline', latency: 0, pairs: 756, volume24h: 0 },
];

export const ASSETS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: 68420.50, change24h: 2.34, volume: 4820000000 },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: 3812.20, change24h: -0.87, volume: 2140000000 },
  { symbol: 'SOL/USDT', name: 'Solana', price: 182.44, change24h: 5.12, volume: 890000000 },
  { symbol: 'BNB/USDT', name: 'BNB', price: 612.80, change24h: 1.05, volume: 430000000 },
  { symbol: 'XRP/USDT', name: 'XRP', price: 0.6234, change24h: -2.11, volume: 1200000000 },
  { symbol: 'ADA/USDT', name: 'Cardano', price: 0.4512, change24h: 3.44, volume: 380000000 },
];

export const COMPARISON_DATA = [
  {
    symbol: 'BTC/USDT',
    prices: {
      binance: 68420.50,
      bybit: 68418.20,
      okx: 68425.10,
      kraken: 68430.00,
      coinbase: 68415.80,
    }
  },
  {
    symbol: 'ETH/USDT',
    prices: {
      binance: 3812.20,
      bybit: 3811.60,
      okx: 3813.40,
      kraken: 3814.10,
      coinbase: 3810.90,
    }
  },
  {
    symbol: 'SOL/USDT',
    prices: {
      binance: 182.44,
      bybit: 182.38,
      okx: 182.51,
      kraken: 182.60,
      coinbase: 182.30,
    }
  },
];

export function generatePriceHistory(basePrice: number, points = 48) {
  const data = [];
  let price = basePrice * 0.95;
  for (let i = 0; i < points; i++) {
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    const hour = i < 24 ? `${i}:00` : `${i - 24}:00`;
    data.push({
      time: hour,
      price: Math.round(price * 100) / 100,
      volume: Math.round(Math.random() * 1000000 + 200000),
    });
  }
  data[data.length - 1].price = basePrice;
  return data;
}

export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

export function formatVolume(vol: number): string {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`;
  return `$${vol.toLocaleString()}`;
}
