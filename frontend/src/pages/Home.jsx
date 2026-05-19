import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Brain, Zap, ArrowRight, BarChart2, Globe, DollarSign } from 'lucide-react';
import { getMarketIndices, getSystemMetrics } from '../services/api';

const FEATURES = [
  { icon: Brain, title: 'LangGraph ReAct Agent', desc: 'Multi-step AI reasoning that dynamically selects and sequences analytical tools for each query.' },
  { icon: Shield, title: 'Risk Analysis & VaR', desc: 'Real-time volatility, beta, and Value at Risk calculations powered by live market data.' },
  { icon: TrendingUp, title: 'ML Return Forecast', desc: 'Scikit-learn regression models predict future returns with confidence scoring.' },
  { icon: BarChart2, title: 'Scipy Optimization', desc: 'Mathematical portfolio optimization maximizes ROI under risk and budget constraints.' },
  { icon: Globe, title: 'Live News Sentiment', desc: 'Real-time news aggregation with NLP-based sentiment analysis influences allocations.' },
  { icon: Zap, title: 'Explainable AI (SHAP)', desc: 'SHAP values explain exactly which factors drove each allocation decision.' },
];

export default function Home() {
  const [indices, setIndices] = useState({});
  const [loadingIndices, setLoadingIndices] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getMarketIndices()
      .then(setIndices)
      .catch(() => {})
      .finally(() => setLoadingIndices(false));
      
    getSystemMetrics()
      .then(setMetrics)
      .catch((err) => console.error('Failed to fetch system metrics:', err));
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden p-8 md:p-12 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)',
          border: '1px solid var(--border)'
        }}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00C2A8, transparent)' }} />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #4ADE80, transparent)' }} />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00C2A8" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm"
            style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.2)', color: '#009E88' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Powered by LangGraph × Groq LLaMA 3
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4 leading-tight"
            style={{ fontFamily: 'Plus Jakarta Sans' }}>
            AI-Powered
            <span className="block" style={{
              background: 'linear-gradient(135deg, #00C2A8, #00E5C9, #4ADE80)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Portfolio Intelligence
            </span>
          </h1>

          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            InvestIQ uses a LangGraph ReAct agentic AI to analyze risk, forecast returns,
            optimize allocations, and explain every decision — all with live market data.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/allocator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 shadow-md shadow-teal-600/20"
              style={{ background: 'linear-gradient(135deg, #00C2A8, #00E5C9)', color: '#FFFFFF' }}>
              Launch AI Allocator <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-slate-100"
              style={{ background: '#FFFFFF', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Market indices */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#6B7280', fontFamily: 'Plus Jakarta Sans' }}>
          MARKET OVERVIEW
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loadingIndices
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 h-24 shimmer"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
              ))
            : Object.entries(indices).map(([name, data]) => {
                const isPos = data.change_pct >= 0;
                return (
                  <div key={name} className="rounded-2xl p-4 shadow-sm"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{name}</div>
                    <div className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      {data.value?.toLocaleString()}
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPos ? '+' : ''}{data.change_pct}%
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Features grid */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#6B7280', fontFamily: 'Plus Jakarta Sans' }}>
          SYSTEM CAPABILITIES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-5 group hover:border-teal-500/30 transition-all shadow-sm"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.2)' }}>
                <Icon size={18} style={{ color: '#00C2A8' }} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#6B7280', fontFamily: 'Plus Jakarta Sans' }}>
          SYSTEM EFFICIENCY METRICS
        </h2>
        <div className="rounded-2xl overflow-hidden shadow-sm"
          style={{ background: '#FFFFFF', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', borderBottom: '1px solid var(--border)' }}>
                  <th className="py-4 px-6 font-semibold text-xs tracking-wider uppercase" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>Metric</th>
                  <th className="py-4 px-6 font-semibold text-xs tracking-wider uppercase" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>Value</th>
                  <th className="py-4 px-6 font-semibold text-xs tracking-wider uppercase" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { label: 'Precision', value: metrics?.precision || '...' },
                  { label: 'Recall', value: metrics?.recall || '...' },
                  { label: 'F1 Score', value: metrics?.f1_score || '...' },
                  { label: 'MRR', value: metrics?.mrr || '...' },
                  { label: 'NDCG', value: metrics?.ndcg || '...' },
                  { label: 'Hallucination', value: metrics?.hallucination || '...' },
                  { label: 'Files', value: metrics?.files || '...' },
                  { label: 'Dataset', value: metrics?.dataset || '...' },
                  { label: 'Detection', value: metrics?.detection || '...' },
                  { label: 'Workflow Time', value: metrics?.workflow_time || '...' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium" style={{ color: '#334155' }}>{row.label}</td>
                    <td className="py-3.5 px-6 font-bold" style={{ color: '#0F172A', fontFamily: 'Plus Jakarta Sans' }}>{row.value}</td>
                    <td className="py-3.5 px-6">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #00C2A8, #00E5C9)', color: '#FFFFFF' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-8 text-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, rgba(0,194,168,0.1), rgba(0,194,168,0.05))', border: '1px solid rgba(0,194,168,0.2)' }}>
        <DollarSign size={32} className="mx-auto mb-4" style={{ color: '#00C2A8' }} />
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Ready to optimize your portfolio?
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Input your budget and let the ReAct agent do the thinking.
        </p>
        <Link to="/allocator"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 shadow-xl shadow-teal-600/20"
          style={{ background: 'linear-gradient(135deg, #00C2A8, #00E5C9)', color: '#FFFFFF' }}>
          Start Analysis <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
