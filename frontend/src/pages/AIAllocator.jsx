import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Brain, Plus, X, Loader2, AlertCircle, CheckCircle2,
  TrendingUp, Shield, Zap, DollarSign, ChevronRight, Info
} from 'lucide-react';
import { analyzePortfolio } from '../services/api';
import { RiskBadge, PriceChange, SectionHeader } from '../components/ui';

const PIE_COLORS = ['#00C2A8', '#4ADE80', '#60A5FA', '#F59E0B', '#A78BFA', '#FB7185'];

const PRESET_PORTFOLIOS = [
  { name: 'Tech Growth', tickers: ['AAPL', 'NVDA', 'MSFT', 'META'] },
  { name: 'Diversified', tickers: ['AAPL', 'JPM', 'JNJ', 'XOM', 'WMT'] },
  { name: 'High Beta', tickers: ['TSLA', 'NVDA', 'AMD', 'COIN'] },
];

const COMMON_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'UNH', name: 'UnitedHealth Group' },
  { symbol: 'MA', name: 'Mastercard Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'PG', name: 'Procter & Gamble' },
  { symbol: 'ORCL', name: 'Oracle Corp.' },
  { symbol: 'COST', name: 'Costco Wholesale' },
  { symbol: 'HD', name: 'Home Depot' },
  { symbol: 'ABBV', name: 'AbbVie Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'PEP', name: 'PepsiCo Inc.' },
  { symbol: 'KO', name: 'Coca-Cola Co.' },
  { symbol: 'BAC', name: 'Bank of America' },
  { symbol: 'XOM', name: 'Exxon Mobil' },
  { symbol: 'CVX', name: 'Chevron Corp.' },
  { symbol: 'NKE', name: 'Nike Inc.' },
  { symbol: 'DIS', name: 'Walt Disney' },
  { symbol: 'SHOP', name: 'Shopify Inc.' },
  { symbol: 'PLTR', name: 'Palantir Technologies' },
  { symbol: 'SNOW', name: 'Snowflake Inc.' },
  { symbol: 'PYPL', name: 'PayPal Holdings' },
  { symbol: 'SQ', name: 'Block Inc.' },
];

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < current ? 'bg-emerald-500 text-white' : i === current ? 'text-gray-900' : 'text-gray-500'}`}
              style={i === current ? { background: '#00C2A8' } : i < current ? {} : { background: '#1F2937' }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-xs font-medium hidden md:block"
              style={{ color: i === current ? '#00C2A8' : i < current ? '#10B981' : '#4B5563' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px" style={{ background: i < current ? '#10B981' : '#1F2937' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function AIAllocator() {
  const [tickers, setTickers] = useState(['AAPL', 'TSLA', 'NVDA']);
  const [budget, setBudget] = useState('10000');
  const [riskLevel, setRiskLevel] = useState('moderate');
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const RISK_MAP = { conservative: 0.3, moderate: 0.5, aggressive: 0.75 };

  const handleInputChange = (val) => {
    const text = val.toUpperCase();
    setInput(text);
    if (text.length > 0) {
      const filtered = COMMON_STOCKS.filter(s => 
        s.symbol.startsWith(text) || s.name.toUpperCase().includes(text)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addTicker = (tickerSymbol) => {
    const t = (tickerSymbol || input).trim().toUpperCase();
    if (t && !tickers.includes(t)) { 
      setTickers(prev => [...prev, t]); 
      setInput(''); 
      setSuggestions([]);
    }
  };

  const removeTicker = (t) => setTickers(prev => prev.filter(x => x !== t));
  const applyPreset = (p) => setTickers(p.tickers);

  const runAnalysis = async () => {
    if (tickers.length === 0 || !budget) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(1);

    try {
      const riskThreshold = RISK_MAP[riskLevel] || 0.5;
      const data = await analyzePortfolio({
        tickers,
        total_budget: parseFloat(budget),
        risk_threshold: riskThreshold,
      });
      setResult(data);
      setCurrentStep(3);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Analysis failed. Check backend connection.');
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  // Parse structured output or tool calls
  const structured = result?.structured_output;
  const toolCalls = result?.tool_calls || [];
  const rawOutput = result?.raw_output || '';

  // Build allocation table from tool_calls or structured
  const allocations = structured?.allocation ||
    structured?.allocations ||
    toolCalls.filter(t => t.tool === 'optimization_tool' && t.output_summary)
      .map(t => { try { return JSON.parse(t.output_summary); } catch { return null; } })
      .filter(Boolean)[0]?.allocations || [];

  const pieData = allocations.map((a, i) => ({
    name: a.ticker,
    value: Math.round((a.optimal_weight || a.weight || 0) * 100 * 100) / 100,
  })).filter(d => d.value > 0);

  const roiBefore = structured?.roi_before_optimization ?? result?.structured_output?.roi_before ?? null;
  const roiAfter = structured?.roi_after_optimization ?? result?.structured_output?.roi_after ?? null;
  const improvement = structured?.roi_improvement_pct ?? null;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          AI Portfolio Allocator
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          LangGraph ReAct agent — risk → forecast → news → optimize → explain
        </p>
      </div>

      {!loading && !result && (
        <StepIndicator steps={['Configure', 'Analyzing', 'Results']} current={currentStep} />
      )}
      {loading && (
        <StepIndicator steps={['Configure', 'Analyzing', 'Results']} current={1} />
      )}
      {result && (
        <StepIndicator steps={['Configure', 'Analyzing', 'Results']} current={3} />
      )}

      {/* Config panel */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: tickers + presets */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <SectionHeader title="Select Stocks" subtitle="Add tickers to analyze" />

            {/* Presets */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>QUICK PRESETS</div>
              <div className="flex flex-wrap gap-2">
                {PRESET_PORTFOLIOS.map(p => (
                  <button key={p.name} onClick={() => applyPreset(p)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.2)', color: '#00C2A8' }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Add ticker input */}
            <div className="relative mb-4">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <input
                    type="text"
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTicker()}
                    placeholder="Search stock ticker or name..."
                    className="bg-transparent outline-none text-sm text-[#0F172A] flex-1"
                    maxLength={20}
                  />
                </div>
                <button onClick={() => addTicker()}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: '#00C2A8', color: '#FFFFFF' }}>
                  <Plus size={16} />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
                  style={{ background: '#FFFFFF' }}>
                  {suggestions.map(s => (
                    <button
                      key={s.symbol}
                      onClick={() => addTicker(s.symbol)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#00C2A8] text-sm">{s.symbol}</span>
                        <span className="text-xs text-slate-500">{s.name}</span>
                      </div>
                      <Plus size={14} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected tickers */}
            <div className="flex flex-wrap gap-2">
              {tickers.map(t => (
                <div key={t}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.3)', color: '#00C2A8' }}>
                  {t}
                  <button onClick={() => removeTicker(t)} className="opacity-60 hover:opacity-100">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {tickers.length === 0 && (
                <div className="text-sm" style={{ color: '#6B7280' }}>No stocks selected</div>
              )}
            </div>
          </div>

          {/* Right: budget + risk */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <SectionHeader title="Investment Parameters" />

            {/* Budget */}
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-2" style={{ color: '#9CA3AF' }}>
                TOTAL BUDGET (USD)
              </label>
              <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <DollarSign size={16} style={{ color: '#6B7280' }} />
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="10000"
                  className="bg-transparent outline-none text-[#0F172A] font-semibold flex-1"
                  min="100"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {['5000', '10000', '50000', '100000'].map(v => (
                  <button key={v} onClick={() => setBudget(v)}
                    className="px-2 py-1 rounded-lg text-xs transition-all"
                    style={budget === v
                      ? { background: '#00C2A8', color: '#FFFFFF' }
                      : { background: 'var(--border)', color: '#64748B' }}>
                    ${parseInt(v).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk level */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2" style={{ color: '#9CA3AF' }}>
                RISK TOLERANCE
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'conservative', label: 'Conservative', desc: 'Max 30%', color: '#10B981' },
                  { key: 'moderate', label: 'Moderate', desc: 'Max 50%', color: '#F59E0B' },
                  { key: 'aggressive', label: 'Aggressive', desc: 'Max 75%', color: '#EF4444' },
                ].map(({ key, label, desc, color }) => (
                  <button key={key} onClick={() => setRiskLevel(key)}
                    className="p-3 rounded-xl text-center transition-all"
                    style={riskLevel === key
                      ? { background: `${color}20`, border: `1px solid ${color}60`, color }
                      : { background: 'var(--surface)', border: '1px solid var(--border)', color: '#64748B' }}>
                    <div className="text-sm font-bold text-[#0F172A]">{label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={runAnalysis}
              disabled={loading || tickers.length === 0 || !budget}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #00C2A8, #00E5C9)', color: '#FFFFFF' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              {loading ? 'Agent Running…' : 'Run AI Analysis'}
              {!loading && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.2)' }}>
            <Brain size={28} style={{ color: '#00C2A8' }} className="animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            LangGraph ReAct Agent Running
          </h3>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            The agent is sequentially calling: Risk → Forecast → News → Budget → Optimization → XAI tools
          </p>
          <div className="flex justify-center gap-6">
            {['Risk', 'Forecast', 'News', 'Optimize', 'XAI'].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold animate-pulse"
                  style={{ background: 'rgba(0,194,168,0.15)', border: '1px solid rgba(0,194,168,0.3)', color: '#00C2A8' }}>
                  {i + 1}
                </div>
                <span className="text-xs" style={{ color: '#6B7280' }}>{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: '#4B5563' }}>
            <Loader2 size={12} className="animate-spin" style={{ color: '#00C2A8' }} />
            This may take 30–120 seconds depending on number of stocks
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={18} style={{ color: '#EF4444' }} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm text-red-700 mb-1">Analysis Failed</div>
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
          <button onClick={() => { setError(null); setCurrentStep(0); }}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all hover:bg-slate-100"
            style={{ background: 'white', border: '1px solid var(--border)', color: '#64748B' }}>
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Success banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.2)' }}>
            <CheckCircle2 size={18} style={{ color: '#00C2A8' }} />
            <span className="text-sm font-medium" style={{ color: '#00E5C9' }}>
              Analysis complete — {result.steps_taken} agent steps executed across {tickers.length} stocks
            </span>
            <button onClick={() => { setResult(null); setCurrentStep(0); }}
              className="ml-auto px-3 py-1 rounded-lg text-xs font-medium hover:bg-slate-200"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#64748B' }}>
              New Analysis
            </button>
          </div>

          {/* ROI comparison */}
          {(roiBefore !== null || roiAfter !== null) && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'ROI Before', value: roiBefore, color: '#6B7280' },
                { label: 'ROI After', value: roiAfter, color: '#00C2A8' },
                { label: 'Improvement', value: improvement, suffix: '%', color: '#10B981' },
              ].map(({ label, value, color, suffix }) => (
                <div key={label} className="rounded-2xl p-5 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="text-xs mb-2" style={{ color: '#64748B' }}>{label}</div>
                  <div className="text-2xl font-bold" style={{ color, fontFamily: 'Plus Jakarta Sans' }}>
                    {value !== null ? `${(value * (suffix ? 1 : 100)).toFixed(2)}${suffix || '%'}` : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allocation table */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <SectionHeader title="Optimized Allocation" subtitle={`Budget: $${parseFloat(budget).toLocaleString()}`} />
              {allocations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Ticker', 'Weight', 'Amount', 'Risk', 'Return', 'Confidence'].map(h => (
                          <th key={h} className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wide"
                            style={{ color: '#64748B' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.map(a => (
                        <tr key={a.ticker} style={{ borderBottom: '1px solid #1F2937' }}>
                          <td className="py-3 px-2 font-bold" style={{ color: '#00C2A8', fontFamily: 'JetBrains Mono' }}>
                            {a.ticker}
                          </td>
                          <td className="py-3 px-2 font-semibold text-[#0F172A]">
                             {((a.optimal_weight || a.weight || 0) * 100).toFixed(1)}%
                          </td>
                          <td className="py-3 px-2 text-[#0F172A] font-mono">
                            ${(a.allocated_amount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 px-2"><RiskBadge score={a.risk_score || 0} /></td>
                          <td className="py-3 px-2">
                            <PriceChange value={((a.expected_return || a.predicted_return || 0) * 100).toFixed(1)} />
                          </td>
                          <td className="py-3 px-2">
                             <div className="flex items-center gap-2">
                               <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden min-w-[40px]">
                                 <div className="h-full bg-[#00C2A8]" style={{ width: `${(a.confidence || 0.7) * 100}%` }}></div>
                               </div>
                               <span className="text-[10px] font-bold" style={{ color: '#64748B' }}>
                                 {((a.confidence || 0.7) * 100).toFixed(0)}%
                               </span>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--surface)', color: '#64748B' }}>
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0" style={{ color: '#00C2A8' }} />
                    <div>Allocation data from agent output. Check raw output below for details.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pie chart */}
            {pieData.length > 0 && (
              <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <SectionHeader title="Portfolio Distribution" />
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Allocation']}
                      contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: '#0F172A' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Agent steps */}
          {toolCalls.length > 0 && (
            <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <SectionHeader title="Agent Tool Calls" subtitle={`${toolCalls.length} tools executed`} />
              <div className="space-y-2">
                {toolCalls.map((call, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'rgba(0,194,168,0.15)', color: '#00C2A8' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,194,168,0.15)', color: '#00C2A8' }}>
                          {call.tool}
                        </span>
                        <span className="text-xs" style={{ color: '#6B7280' }}>input: {JSON.stringify(call.input)?.slice(0, 60)}…</span>
                      </div>
                      <div className="text-xs font-mono truncate" style={{ color: '#4B5563' }}>
                        {call.output_summary?.slice(0, 120)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw agent output */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <SectionHeader title="Agent Final Output" subtitle="Raw LLM response" />
            <pre className="text-xs leading-relaxed whitespace-pre-wrap overflow-auto max-h-64 p-4 rounded-xl"
              style={{ background: 'var(--surface)', color: '#64748B', fontFamily: 'JetBrains Mono', border: '1px solid var(--border)' }}>
              {rawOutput || 'No output captured'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
