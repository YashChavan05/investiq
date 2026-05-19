import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TrendingUp, TrendingDown, RefreshCw, Plus, X, Search, AlertCircle } from 'lucide-react';
import { getTopMovers, getMarketData } from '../services/api';
import { Skeleton, Badge, PriceChange, SectionHeader } from '../components/ui';

const TradingViewWidget = ({ symbol }) => {
  const container = useRef();

  useEffect(() => {
    container.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol.includes(':') ? symbol : `NASDAQ:${symbol}`,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
};

export default function Markets() {
  const location = useLocation();
  const [movers, setMovers] = useState({ top_gainers: [], top_losers: [], all_movers: [] });
  const [watchlist, setWatchlist] = useState(['AAPL', 'MSFT', 'NVDA', 'TSLA']);
  const [watchlistData, setWatchlistData] = useState({});
  const [inputTicker, setInputTicker] = useState('');
  const [activeSymbol, setActiveSymbol] = useState('NASDAQ:AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('gainers');

  // Listen for global search param (?s=TICKER)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchSymbol = params.get('s');
    if (searchSymbol) {
      setActiveSymbol(searchSymbol.toUpperCase());
    }
  }, [location.search]);

  const fetchMovers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopMovers();
      setMovers(data);
    } catch (e) {
      setError('Backend unavailable. Please start the FastAPI server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    if (!watchlist.length) return;
    try {
      const data = await getMarketData(watchlist, '1mo');
      setWatchlistData(data.data || {});
    } catch (e) {}
  };

  useEffect(() => { fetchMovers(); }, []);
  useEffect(() => { fetchWatchlist(); }, [watchlist]);

  const addToWatchlist = () => {
    const t = inputTicker.trim().toUpperCase();
    if (t && !watchlist.includes(t)) {
      setWatchlist(prev => [...prev, t]);
      setInputTicker('');
    }
  };

  const removeFromWatchlist = (ticker) => setWatchlist(prev => prev.filter(t => t !== ticker));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSymbol(searchQuery.trim().toUpperCase());
      setSearchQuery('');
    }
  };

  const displayMovers = tab === 'gainers' ? movers.top_gainers : movers.top_losers;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Chart Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Trading <span className="text-[#00C2A8]">Terminal</span>
            </h1>
            <p className="text-sm font-medium" style={{ color: '#64748B' }}>Professional Real-Time Market Intelligence</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white shadow-sm border border-slate-200">
              <div className="pl-3 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol (e.g. BTCUSD, AAPL)..."
                className="flex-1 bg-transparent py-2 outline-none text-sm font-semibold text-[#0F172A]"
              />
              <button type="submit" 
                className="px-5 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold transition-all hover:bg-slate-800">
                Launch Chart
              </button>
            </div>
          </form>
        </div>

        {/* The Main Chart */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white" 
          style={{ height: '550px', background: 'white' }}>
          <TradingViewWidget symbol={activeSymbol} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top movers */}
        <div className="lg:col-span-2 rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#0F172A]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Market <span style={{ color: '#00C2A8' }}>Momentum</span>
            </h2>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {['gainers', 'losers'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={tab === t ? { background: '#00C2A8', color: '#FFFFFF' } : { color: '#64748B' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} height="h-14" className="rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {displayMovers.map((stock, i) => {
                const isPos = stock.change_pct >= 0;
                return (
                  <div key={stock.ticker}
                    onClick={() => setActiveSymbol(stock.ticker)}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-slate-50 cursor-pointer group"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all group-hover:scale-110"
                      style={{ background: isPos ? '#10B98120' : '#EF444420', color: isPos ? '#10B981' : '#EF4444' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: '#00C2A8' }}>
                          {stock.ticker}
                        </span>
                        {stock.sector && <Badge label={stock.sector} color="#64748B" />}
                      </div>
                      <div className="text-xs truncate" style={{ color: '#64748B' }}>{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#0F172A] text-sm">${stock.current_price}</div>
                      <PriceChange value={stock.change_pct} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Watchlist */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <SectionHeader title="Portfolio Watch" subtitle={`${watchlist.length} Active symbols`} />

          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200"
              style={{ background: 'var(--surface)' }}>
              <input
                type="text"
                value={inputTicker}
                onChange={e => setInputTicker(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && addToWatchlist()}
                placeholder="Add symbol..."
                className="bg-transparent outline-none text-sm text-[#0F172A] flex-1"
                maxLength={6}
              />
            </div>
            <button onClick={addToWatchlist}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-[#00A891]"
              style={{ background: '#00C2A8', color: '#FFFFFF' }}>
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {watchlist.map(ticker => {
              const d = watchlistData[ticker];
              return (
                <div key={ticker}
                  onClick={() => setActiveSymbol(ticker)}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-slate-50 cursor-pointer border border-slate-100 shadow-sm"
                  style={{ background: 'var(--card)' }}>
                  <div className="flex-1">
                    <span className="font-bold text-sm" style={{ color: '#00C2A8' }}>{ticker}</span>
                    {d ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold">${d.current_price}</span>
                        <PriceChange value={d.price_change_pct_1d} />
                      </div>
                    ) : <div className="text-[10px] text-slate-400">Loading...</div>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFromWatchlist(ticker); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 text-slate-400">
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
