import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import { SectionHeader, Skeleton } from '../components/ui';
import { History as HistoryIcon, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory();
        setHistory(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const renderDecision = (decision) => {
    if (!decision) return "Optimization strategy successfully stored.";
    if (typeof decision === 'string') return decision;
    if (typeof decision === 'object') {
      // Try to find a 'reasoning', 'final_decision', or 'advice' key
      return decision.reasoning || decision.final_decision || decision.advice || JSON.stringify(decision).substring(0, 150) + "...";
    }
    return String(decision);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
          style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.2)' }}>
          <HistoryIcon size={20} style={{ color: '#00C2A8' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Agent Memory
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Review past multi-agent optimization sessions saved in MongoDB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 h-32 shimmer" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
          ))
        ) : history.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
             <p className="text-[#64748B]">No history found. Run an AI Analysis to start learning!</p>
          </div>
        ) : (
          history.map((record, i) => (
            <div key={i} className="rounded-2xl p-6 shadow-sm transition-all hover:shadow-md" 
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} style={{ color: '#6B7280' }} />
                  <span className="text-xs font-medium" style={{ color: '#64748B' }}>
                    {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'Recent Analysis'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 border-r border-slate-100 pr-4">
                  <div className="text-xs mb-1 uppercase font-bold tracking-tight" style={{ color: '#94A3B8' }}>Analyzed Assets</div>
                  <div className="flex flex-wrap gap-1">
                    {(record.tickers || []).map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-[#475569]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-1 text-center border-r border-slate-100 pr-4">
                   <div className="text-xs mb-1 uppercase font-bold tracking-tight" style={{ color: '#94A3B8' }}>ROI After</div>
                   <div className="text-xl font-bold text-[#0F172A]">
                     {((record.results?.roi_after_optimization || record.results?.expected_roi || 0) * 100).toFixed(2)}%
                   </div>
                </div>

                <div className="col-span-1 text-center">
                   <div className="text-xs mb-1 uppercase font-bold tracking-tight" style={{ color: '#94A3B8' }}>Improvement</div>
                   <div className="text-xl font-bold text-[#00C2A8]">
                     +{(record.results?.roi_improvement_pct || record.results?.improvement_over_baseline || 0).toFixed(2)}%
                   </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50">
                 <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
                   <strong className="text-[#334155]">AI Strategy:</strong> {renderDecision(record.results?.final_decision || record.results?.summary)}
                 </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
