import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';
import {
  TrendingUp, TrendingDown, DollarSign, Activity,
  RefreshCw, AlertCircle, BarChart2
} from 'lucide-react';
import { getMarketData, getMarketIndices } from '../services/api';
import { StatCard, Skeleton, SectionHeader, PriceChange } from '../components/ui';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL'];
const PIE_COLORS = ['#00C2A8', '#4ADE80', '#60A5FA', '#F59E0B', '#A78BFA'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: 'white', border: '1px solid var(--border)' }}>
        <div className="text-[#64748B] mb-1">{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.color }}>
            {p.name}: ${p.value?.toFixed(2)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [marketData, setMarketData] = useState({});
  const [indices, setIndices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [portfolioMeta, setPortfolioMeta] = useState({ tickers: DEFAULT_TICKERS, allocation: {}, total_budget: 0 });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get latest AI portfolio from history
      const { data: latestRes } = await axios.get(`${API_BASE}/portfolio/latest`);
      let currentTickers = DEFAULT_TICKERS;
      let currentAlloc = {};
      let totalBudget = 0;

      if (latestRes.success && latestRes.tickers && latestRes.tickers.length > 0) {
        currentTickers = latestRes.tickers;
        currentAlloc = latestRes.allocation;
        totalBudget = latestRes.total_budget;
        setPortfolioMeta({ tickers: currentTickers, allocation: currentAlloc, total_budget: totalBudget });
      } else {
        // Fallback if history missing or invalid
        setPortfolioMeta({ tickers: DEFAULT_TICKERS, allocation: {}, total_budget: 10000 });
      }

      // 2. Get market data and indices
      const [mkt, idx] = await Promise.all([
        getMarketData(currentTickers, '3mo'),
        getMarketIndices(),
      ]);
      
      setMarketData(mkt.data || {});
      setIndices(idx || {});
      if (currentTickers.length > 0) setActiveTicker(currentTickers[0]);
      setLastRefresh(new Date());
    } catch (e) {
      if (e?.code === 'ECONNREFUSED' || e?.message?.includes('Network Error')) {
        setError('Cannot reach backend. Make sure the FastAPI server is running on port 8000.');
      } else {
        setError('Failed to load market data. Check the backend logs for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Compute live portfolio value based on allocations
  const portfolioStats = Object.values(marketData).filter(d => d && !d.error);
  
  // Logic: Current Value = Allocated Amount * (1 + 1D % Change)
  // Protected calculation with robust fallbacks
  const liveTotalValue = React.useMemo(() => {
    if (portfolioStats.length === 0) return 0;
    
    return portfolioStats.reduce((sum, d) => {
      // Find allocation by ticker (case insensitive)
      const tickerKey = Object.keys(portfolioMeta.allocation).find(k => k.toUpperCase() === d.ticker.toUpperCase());
      const allocData = tickerKey ? portfolioMeta.allocation[tickerKey] : null;
      
      // Amount Fallback: 1. Exact amount -> 2. Even split of budget -> 3. Asset Price
      const allocAmount = allocData?.amount || 
                         (portfolioMeta.total_budget > 0 ? (portfolioMeta.total_budget / portfolioStats.length) : d.current_price);
      
      const changePct = typeof d.price_change_pct_1d === 'number' ? d.price_change_pct_1d : 0;
      const changeFactor = 1 + (changePct / 100);
      
      return sum + (allocAmount * changeFactor);
    }, 0);
  }, [marketData, portfolioMeta]);

  const avgChange = portfolioStats.length
    ? portfolioStats.reduce((s, d) => s + (parseFloat(d.price_change_pct_1d) || 0), 0) / portfolioStats.length
    : 0;

  const pieData = portfolioStats.map((d, i) => {
    const tickerKey = Object.keys(portfolioMeta.allocation).find(k => k.toUpperCase() === d.ticker.toUpperCase());
    return {
      name: d.ticker,
      value: portfolioMeta.allocation[tickerKey]?.weight * 100 || (100 / portfolioStats.length),
    };
  });

  // Build chart data for active ticker
  const activeData = marketData[activeTicker];
  const chartData = activeData?.chart_data?.slice(-60) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Portfolio Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
          style={{ border: '1px solid var(--border)', color: '#64748B' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#EF4444' }} />
          <span className="text-sm" style={{ color: '#FCA5A5' }}>{error}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-2xl p-5 h-28 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Skeleton className="w-24 mb-3" />
            <Skeleton className="w-32 h-6 mb-2" />
            <Skeleton className="w-16" />
          </div>
        )) : (
          <>
            <StatCard title="Portfolio Value" value={`$${liveTotalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`} change={avgChange.toFixed(2)} icon={DollarSign} />
            <StatCard title="Avg Daily Gain" value={`${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`} icon={TrendingUp} color={avgChange >= 0 ? '#10B981' : '#EF4444'} />
            <StatCard title="Stocks Tracked" value={portfolioStats.length} icon={BarChart2} color="#60A5FA" />
            <StatCard title="Volatility (Avg)" value={`${(portfolioStats.reduce((s, d) => s + (d.volatility_30d || 0), 0) / Math.max(portfolioStats.length, 1) * 100).toFixed(1)}%`} icon={Activity} color="#F59E0B" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price chart */}
        <div className="lg:col-span-2 rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <SectionHeader
            title="Price History"
            subtitle={activeData ? `${activeData.company_name} — ${activeTicker}` : ''}
            action={
              <div className="flex gap-1 overflow-x-auto pb-1 max-w-[200px] md:max-w-none">
                {portfolioMeta.tickers.map(t => (
                  <button key={t} onClick={() => setActiveTicker(t)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm shrink-0"
                    style={activeTicker === t
                      ? { background: '#00C2A8', color: '#FFFFFF' }
                      : { background: 'var(--surface)', border: '1px solid var(--border)', color: '#64748B' }}>
                    {t}
                  </button>
                ))}
              </div>
            }
          />
          {loading ? (
            <div className="h-48 shimmer rounded-xl" style={{ background: 'var(--surface)' }} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C2A8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00C2A8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }}
                  domain={['auto', 'auto']} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="close" name={activeTicker}
                  stroke="#00C2A8" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#6B7280' }}>
              No chart data available
            </div>
          )}
        </div>

        {/* Portfolio allocation pie */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <SectionHeader title="Holdings" subtitle="Equal weight demo" />
          {loading ? (
            <div className="h-48 shimmer rounded-xl" style={{ background: 'var(--surface)' }} />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#64748B', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stocks table */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <SectionHeader title="Stock Overview" subtitle="Live data from yfinance" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Ticker', 'Company', 'Price', '1D Change', 'Sector', 'Market Cap', 'Volatility'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(4).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-3"><Skeleton /></td></tr>
              )) : portfolioStats.map(stock => (
                <tr key={stock.ticker}
                  className="transition-colors hover:bg-slate-50 cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onClick={() => setActiveTicker(stock.ticker)}>
                  <td className="py-3 px-3 font-bold" style={{ color: '#00C2A8', fontFamily: 'JetBrains Mono' }}>
                    {stock.ticker}
                  </td>
                  <td className="py-3 px-3 text-[#334155]">{stock.company_name?.slice(0, 20)}</td>
                  <td className="py-3 px-3 font-semibold text-[#0F172A] font-mono">${stock.current_price}</td>
                  <td className="py-3 px-3">
                    <PriceChange value={stock.price_change_pct_1d?.toFixed(2)} />
                  </td>
                  <td className="py-3 px-3 text-[#64748B]">{stock.sector || '—'}</td>
                  <td className="py-3 px-3 text-[#64748B]">
                    {stock.market_cap ? `$${(stock.market_cap / 1e9).toFixed(1)}B` : '—'}
                  </td>
                  <td className="py-3 px-3 text-[#64748B]">
                    {stock.volatility_30d ? `${(stock.volatility_30d * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(indices).map(([name, d]) => (
          <div key={name} className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{name}</div>
            <div className="text-lg font-bold text-[#0F172A] font-mono">{d.value?.toLocaleString()}</div>
            <PriceChange value={d.change_pct?.toFixed(2)} />
          </div>
        ))}
      </div>
    </div>
  );
}
