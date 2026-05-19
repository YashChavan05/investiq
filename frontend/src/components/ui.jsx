import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ── Stat Card ──────────────────────────────────────────────────────
export function StatCard({ title, value, change, icon: Icon, prefix = '', suffix = '', color = '#00C2A8' }) {
  const isPositive = parseFloat(change) >= 0;
  return (
    <div className="card p-5 relative overflow-hidden shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16 }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5"
        style={{ background: color, transform: 'translate(30%, -30%)' }} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}20` }}>
            <Icon size={16} style={{ color }} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[#0F172A] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
        {prefix}{value}{suffix}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}{change}%
        </div>
      )}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────
export function Badge({ label, color = '#00C2A8' }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────
export function Skeleton({ className = '', height = 'h-4' }) {
  return (
    <div className={`shimmer rounded-lg ${height} ${className}`}
      style={{ background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%' }} />
  );
}

// ── Risk badge ─────────────────────────────────────────────────────
export function RiskBadge({ score }) {
  const pct = Math.round(score * 100);
  let color, label;
  if (pct < 30) { color = '#10B981'; label = 'Low'; }
  else if (pct < 60) { color = '#F59E0B'; label = 'Medium'; }
  else { color = '#EF4444'; label = 'High'; }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label} ({pct}%)
    </span>
  );
}

// ── Price change ───────────────────────────────────────────────────
export function PriceChange({ value, showArrow = true, suffix = '%' }) {
  const isPos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${isPos ? 'text-emerald-600' : 'text-red-600'}`}>
      {showArrow && (isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
      {isPos ? '+' : ''}{value}{suffix}
    </span>
  );
}

// ── Section header ─────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Plus Jakarta Sans' }}>{title}</h2>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.2)' }}>
          <Icon size={24} style={{ color: '#00C2A8' }} />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  );
}

// ── Pill tabs ──────────────────────────────────────────────────────
export function PillTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      {tabs.map(tab => (
        <button key={tab}
          onClick={() => onChange(tab)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={active === tab
            ? { background: '#00C2A8', color: '#FFFFFF' }
            : { color: 'var(--text-muted)' }}>
          {tab}
        </button>
      ))}
    </div>
  );
}
