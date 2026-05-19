import React, { useState } from 'react';
import axios from 'axios';
import { 
  Zap, Shield, TrendingUp, Globe, Database, 
  Brain, BarChart3, Wallet, FileSearch, 
  Loader2, CheckCircle2, AlertCircle, Play, Plus, X
} from 'lucide-react';

const AGENTS = [
  { id: 'risk', name: 'Risk Analyzer', icon: Shield, color: 'text-red-500', bg: 'bg-red-50', desc: 'Calculates VaR, volatility, and risk levels.' },
  { id: 'forecast', name: 'Market Forecast', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'ML-based 30-day return predictions.' },
  { id: 'news', name: 'Market Knowledge', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Real-time sentiment analysis from news.' },
  { id: 'finance', name: 'Finance Auditor', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Fundamental health and valuation audit.' },
  { id: 'sustainability', name: 'Sustainability', icon: Zap, color: 'text-teal-500', bg: 'bg-teal-50', desc: 'ESG scores and carbon intensity auditing.' },
  { id: 'learning', name: 'Self-Learning', icon: Database, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Memory-based adaptation using past data.' },
  { id: 'optimization', name: 'ROI Optimizer', icon: Brain, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'SciPy-driven mathematical ROI optimization.' },
  { id: 'budget', name: 'Budget Allocator', icon: Wallet, color: 'text-cyan-500', bg: 'bg-cyan-50', desc: 'Dynamic capital distribution across assets.' },
  { id: 'xai', name: 'XAI Attribution', icon: FileSearch, color: 'text-pink-500', bg: 'bg-pink-50', desc: 'SHAP-based explainable AI reasoning.' },
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PrettyOutput = ({ data }) => {
  if (!data || !data.output) return null;
  const out = data.output;
  const agent = data.agent;

  const InfoRow = ({ label, value, color }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`font-bold ${color || 'text-slate-200'}`}>{value}</span>
    </div>
  );

  // Extract the actual data payload based on agent type
  const payload = 
    agent === 'risk' ? out.risk_data :
    agent === 'forecast' ? out.forecast_data :
    agent === 'news' ? out.news_data :
    agent === 'finance' ? out.finance_data :
    agent === 'sustainability' ? out.sustainability_data :
    agent === 'learning' ? out.learning_data :
    agent === 'optimization' ? out.optimization_results :
    agent === 'budget' ? out.budget_data :
    agent === 'xai' ? out.xai_results : out;

  if (!payload) {
    return <div className="p-8 text-center text-slate-500 italic">No data returned for this agent.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {agent === 'risk' && Object.entries(payload).map(([t, d]) => (
        <div key={t} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-black text-[#00C2A8]">{t}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              d.risk_level === 'High' ? 'bg-red-500/20 text-red-400' : 
              d.risk_level === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : 
              'bg-amber-500/20 text-amber-400'
            }`}>{d.risk_level} RISK</span>
          </div>
          {d.error ? (
             <div className="text-xs text-red-400 py-2 italic">{d.error}</div>
          ) : (
            <>
              <InfoRow label="Risk Score" value={`${(d.risk_score * 100).toFixed(1)}%`} />
              <InfoRow label="Volatility" value={`${(d.volatility * 100).toFixed(1)}%`} />
              <InfoRow label="Max Drawdown" value={`${(d.max_drawdown * 100).toFixed(1)}%`} />
              <div className="mt-3">
                <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Risk Factors</div>
                <div className="flex flex-wrap gap-2">
                  {d.risk_factors?.map(f => (
                    <span key={f} className="px-2 py-1 rounded-lg bg-slate-900/50 text-[9px] text-slate-400 border border-slate-800">{f}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {agent === 'forecast' && Object.entries(payload).map(([t, d]) => (
        <div key={t} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-black text-blue-400">{t}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              d.trend === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>{d.trend}</span>
          </div>
          <InfoRow label="Predicted Return" value={`${(d.predicted_return * 100).toFixed(2)}%`} color="text-emerald-400" />
          <InfoRow label="Confidence" value={`${(d.confidence * 100).toFixed(0)}%`} />
          <div className="mt-3">
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Price Forecast</div>
            <div className="flex gap-2">
              {d.price_forecast?.slice(0, 3).map((p, i) => (
                <div key={i} className="flex-1 text-center p-1.5 rounded bg-slate-900/50 text-[10px] font-mono text-slate-300 border border-slate-800">${p}</div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {agent === 'news' && Object.entries(payload).map(([t, d]) => (
        <div key={t} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-black text-purple-400">{t}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              d.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 
              d.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 
              'bg-slate-500/20 text-slate-400'
            }`}>{d.sentiment} Sentiment</span>
          </div>
          <InfoRow label="Positive Signals" value={d.pos_signals} color="text-emerald-400" />
          <InfoRow label="Negative Signals" value={d.neg_signals} color="text-red-400" />
        </div>
      ))}

      {agent === 'finance' && Object.entries(payload).map(([t, d]) => (
        <div key={t} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-black text-emerald-400">{t}</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">Fundamental Audit</span>
          </div>
          <InfoRow label="P/E Ratio" value={d.pe_ratio || 'N/A'} />
          <InfoRow label="EPS (TTM)" value={`$${d.eps || '0.00'}`} />
          <InfoRow label="Profit Margin" value={`${((d.profit_margin || 0) * 100).toFixed(1)}%`} />
          <InfoRow label="Debt to Equity" value={d.debt_to_equity || '0.00'} />
        </div>
      ))}

      {agent === 'optimization' && (
        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-black text-indigo-400 uppercase tracking-tighter">Optimization Result</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">+{payload.roi_improvement_pct}% Improvement</span>
          </div>
          <div className="space-y-2">
            {payload.allocations?.map(a => (
              <div key={a.ticker} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white w-12">{a.ticker}</span>
                  <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${a.optimal_weight * 100}%` }} />
                  </div>
                </div>
                <span className="font-mono text-indigo-300 text-xs">{(a.optimal_weight * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-500">Expected ROI</span>
            <span className="text-emerald-400 font-bold">{(payload.roi_after_optimization * 100).toFixed(2)}%</span>
          </div>
        </div>
      )}

      {agent === 'budget' && (
        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-black text-cyan-400 uppercase tracking-tighter">Budget Allocation</span>
            <span className="text-[10px] font-bold text-slate-400">TOTAL: ${payload.total_budget?.toLocaleString()}</span>
          </div>
          <div className="space-y-2">
            {Object.entries(payload.allocated_budget || {}).map(([t, val]) => (
              <div key={t} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-white">{t}</span>
                <span className="font-mono text-cyan-400 font-black">${val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {agent === 'xai' && (
        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-sm font-bold text-pink-400 uppercase tracking-widest">Explainable AI Logic</span>
            </div>
            <div className="px-2 py-1 rounded bg-pink-500/10 text-[9px] font-bold text-pink-400">
              {payload.explanation_confidence * 100}% CONFIDENCE
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
            {payload.decision_explanation}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-2">
              <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Positive Drivers</div>
              {payload.top_positive_factors?.map(f => (
                <div key={f} className="text-[10px] text-emerald-400/80 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 flex items-center gap-1">
                  <CheckCircle2 size={10} /> {f}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Risk Factors</div>
              {payload.top_negative_factors?.map(f => (
                <div key={f} className="text-[10px] text-red-400/80 bg-red-500/5 px-2 py-1 rounded border border-red-500/10 flex items-center gap-1">
                  <AlertCircle size={10} /> {f}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Agent Contributions</div>
            <div className="grid grid-cols-1 gap-1">
              {Object.entries(payload.agent_contribution || {}).map(([agent, impact]) => (
                <div key={agent} className="flex justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px]">
                  <span className="text-slate-400 capitalize">{agent.replace('_', ' ')}</span>
                  <span className="text-pink-300 font-bold">{impact}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-4">
            <div className="text-[9px] font-bold text-orange-400 uppercase tracking-wider mb-2">What-If Scenarios</div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">If Risk Reduced:</span>
                <span className="text-emerald-400">{payload.what_if_analysis?.if_risk_reduced}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">If Trend Drops:</span>
                <span className="text-red-400">{payload.what_if_analysis?.if_trend_negative}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Ticker Rationale</div>
            {payload.shap_explanations?.map(e => (
              <div key={e.ticker} className="text-[10px] text-slate-400 border-l-2 border-pink-500/30 pl-3 py-1 bg-slate-900/20">
                <span className="text-pink-400 font-bold">{e.ticker}:</span> {e.rationale}
              </div>
            ))}
          </div>
        </div>
      )}

      {agent === 'sustainability' && Object.entries(payload || {}).map(([t, d]) => (
        <div key={t} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-black text-teal-400">{t}</span>
            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase">ESG Audit</span>
          </div>
          <InfoRow label="ESG Score" value={`${d.esg_score || 0}/100`} color="text-teal-400" />
          <InfoRow label="Carbon Intensity" value={d.carbon_intensity || 'Low'} />
          <InfoRow label="Social Score" value={d.social_score || 'N/A'} />
        </div>
      ))}

      {agent === 'learning' && (
        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">Knowledge Adaptation</span>
          </div>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 italic">
              Status: <span className="text-orange-400 font-bold">{payload.global_learning_status || 'Active'}</span>
            </div>
            
            {payload.ticker_insights && Object.entries(payload.ticker_insights).map(([t, d]) => (
              <div key={t} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white">{t}</span>
                  <span className="text-[10px] text-slate-500">{d.memory_source}</span>
                </div>
                <InfoRow label="Learned Success Rate" value={`${(d.learned_success_rate * 100).toFixed(1)}%`} color="text-orange-300" />
                <InfoRow label="Adaptation Factor" value={d.adaptation_factor || 0} />
                <InfoRow label="Past Analyses" value={d.total_past_analyses || 0} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!['risk', 'forecast', 'news', 'finance', 'optimization', 'budget', 'xai', 'sustainability', 'learning'].includes(agent) && (
        <div className="p-8 text-center bg-slate-900/30 rounded-2xl border border-slate-800/50">
          <div className="text-slate-500 italic text-xs mb-2">Simplified view for {agent} is being optimized.</div>
          <div className="text-[#00C2A8] text-[10px] font-bold uppercase tracking-widest">Please use RAW JSON mode</div>
        </div>
      )}
    </div>
  );
};

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [tickers, setTickers] = useState(['AAPL', 'TSLA']);
  const [suggestions, setSuggestions] = useState({ index: -1, list: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [viewMode, setViewMode] = useState('simplified'); // 'simplified' or 'raw'
  const [error, setError] = useState(null);

  const addTickerField = () => setTickers([...tickers, '']);
  const removeTickerField = (index) => {
    if (tickers.length > 1) {
      setTickers(tickers.filter((_, i) => i !== index));
      setSuggestions({ index: -1, list: [] });
    }
  };
  
  const updateTicker = (index, val) => {
    const newTickers = [...tickers];
    const text = val.toUpperCase();
    newTickers[index] = text;
    setTickers(newTickers);

    if (text.length > 0) {
      const filtered = COMMON_STOCKS.filter(s => 
        s.symbol.startsWith(text) || s.name.toUpperCase().includes(text)
      ).slice(0, 5);
      setSuggestions({ index, list: filtered });
    } else {
      setSuggestions({ index: -1, list: [] });
    }
  };

  const selectSuggestion = (index, symbol) => {
    const newTickers = [...tickers];
    newTickers[index] = symbol;
    setTickers(newTickers);
    setSuggestions({ index: -1, list: [] });
  };

  const runAgent = async () => {
    if (!selectedAgent) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const tickerList = tickers.filter(t => t.length > 0);

    if (tickerList.length === 0) {
      setError('Please enter at least one ticker');
      setLoading(false);
      return;
    }

    if (['xai', 'optimization'].includes(selectedAgent.id) && tickerList.length < 2) {
      setError(`${selectedAgent.name} requires at least 2 tickers for comparison.`);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/analyze/agent`, {
        agent_id: selectedAgent.id,
        tickers: tickerList
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to execute agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Selection List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
              Select Agent to Run
            </label>
            <div className="space-y-2">
              {AGENTS.map((agent) => {
                const Icon = agent.icon;
                const isSelected = selectedAgent?.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                      isSelected 
                        ? 'bg-[#00C2A8] text-white shadow-lg shadow-[#00C2A8]/20' 
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20' : agent.bg
                    }`}>
                      <Icon size={16} className={isSelected ? 'text-white' : agent.color} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{agent.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                        {agent.id}.node
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Execution & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C2A8]/5 rounded-bl-[100px] -z-0" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#00C2A8]">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">Runner Terminal</h2>
                    <p className="text-xs text-slate-400">Specify input and trigger node</p>
                  </div>
                </div>

                <button 
                  onClick={runAgent}
                  disabled={loading || !selectedAgent}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-[#0F172A]/20"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                  Run {selectedAgent ? selectedAgent.name : 'Agent'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Ticker(s) Input {['xai', 'optimization'].includes(selectedAgent?.id) && '(Min 2 required)'}
                    </label>
                    <button 
                      onClick={addTickerField}
                      className="p-1 rounded-lg bg-[#00C2A8]/10 text-[#00C2A8] hover:bg-[#00C2A8]/20 transition-all"
                      title="Add Ticker"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {tickers.map((t, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex gap-2">
                          <input 
                            value={t}
                            onChange={(e) => updateTicker(idx, e.target.value)}
                            onBlur={() => setTimeout(() => setSuggestions({ index: -1, list: [] }), 200)}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#0F172A] outline-none focus:ring-2 focus:ring-[#00C2A8]/20 transition-all"
                            placeholder="e.g. NVDA"
                          />
                          {tickers.length > 1 && (
                            <button 
                              onClick={() => removeTickerField(idx)}
                              className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {suggestions.index === idx && suggestions.list.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl shadow-2xl border border-slate-100 overflow-hidden bg-white">
                            {suggestions.list.map(s => (
                              <button
                                key={s.symbol}
                                onClick={() => selectSuggestion(idx, s.symbol)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#00C2A8] text-[11px]">{s.symbol}</span>
                                  <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{s.name}</span>
                                </div>
                                <Plus size={12} className="text-slate-300" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agent Description</label>
                  <div className="px-4 py-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed italic h-[calc(100%-24px)]">
                    {selectedAgent ? selectedAgent.desc : 'Select an agent from the left to see details.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Result Output */}
          <div className="p-6 rounded-3xl bg-[#0F172A] shadow-2xl min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              {/* Toggle Switch */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
                <button 
                  onClick={() => setViewMode('simplified')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                    viewMode === 'simplified' ? 'bg-[#00C2A8] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  SIMPLIFIED
                </button>
                <button 
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                    viewMode === 'raw' ? 'bg-[#00C2A8] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  RAW JSON
                </button>
              </div>
            </div>

            <div className="flex-1 font-mono text-[12px] overflow-auto custom-scrollbar">
              {loading && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <Loader2 size={32} className="animate-spin text-[#00C2A8]" />
                  <div className="animate-pulse">Agent processing request...</div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold mb-1 uppercase text-[10px]">Execution Error</div>
                    <div className="opacity-80 leading-relaxed">{error}</div>
                  </div>
                </div>
              )}

              {!loading && !result && !error && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600 opacity-40 italic">
                  <Zap size={40} strokeWidth={1} />
                  <div>Awaiting execution signal...</div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-emerald-400 font-bold mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      <span>AGENT_SUCCESS: {result.agent.toUpperCase()}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">TRACING: LANGSMITH</div>
                  </div>
                  
                  <div className="p-1">
                    {viewMode === 'raw' ? (
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <pre className="text-blue-300 leading-relaxed whitespace-pre-wrap">
                          {JSON.stringify(result.output, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <PrettyOutput data={result} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
