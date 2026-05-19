import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, User, Loader2, Trash2, RefreshCw, Lightbulb } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SUGGESTED_PROMPTS = [
  'Analyze AAPL and MSFT with a $5,000 budget and low risk',
  'What are the top market movers today?',
  'Compare risk levels of TSLA vs NVDA',
  'Suggest an aggressive tech portfolio with $20,000',
  'What is the current market sentiment for AI stocks?',
];

function AnalysisReport({ data }) {
  if (!data) return null;
  const { 
    risk_scores = {}, 
    predicted_returns = {}, 
    allocation = {}, 
    roi_before_optimization, 
    roi_after_optimization, 
    roi_improvement_pct, 
    news_sentiment = {}, 
    xai_explanation = '', 
    final_decision = '' 
  } = data;

  const tickers = Object.keys(risk_scores);

  return (
    <div className="mt-2 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Summary Card */}
      <div className="p-4 rounded-2xl border border-[#00C2A8]/20 bg-[#00C2A8]/5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Portfolio Optimization Result</h3>
            <p className="text-xs text-[#64748B]">Strategy based on highest Sharpe ratio</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#00C2A8] text-white text-[10px] font-bold">
            +{roi_improvement_pct}% Improvement
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-xl bg-white border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Base ROI</p>
            <p className="text-sm font-bold text-slate-700">{roi_before_optimization}%</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Optimized ROI</p>
            <p className="text-sm font-bold text-[#00C2A8]">{roi_after_optimization}%</p>
          </div>
        </div>
      </div>

      {/* Decision Text */}
      <div className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 italic">
        "{typeof final_decision === 'object' ? JSON.stringify(final_decision) : final_decision}"
      </div>

      {/* Allocation Table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Ticker</th>
              <th className="px-3 py-2 font-semibold">Weight</th>
              <th className="px-3 py-2 font-semibold text-right">Amount</th>
              <th className="px-3 py-2 font-semibold text-center">Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tickers.map(t => {
              const tickerAlloc = (Array.isArray(allocation) ? allocation.find(a => a.ticker === t) : allocation[t]) || {};
              const weightValue = tickerAlloc.weight || 0;
              const amountValue = tickerAlloc.allocated_amount || tickerAlloc.amount || 0;

              return (
                <tr key={t} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-2.5">
                    <span className="font-bold text-[#0F172A]">{t}</span>
                    <div className="text-[10px] text-slate-400">Risk: {risk_scores[t]}</div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {Math.round(weightValue * 100)}%
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                    ${parseFloat(amountValue).toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {(() => {
                      const sentimentObj = news_sentiment[t];
                      let sentimentStr = (typeof sentimentObj === 'object' ? (sentimentObj?.sentiment || sentimentObj?.text) : sentimentObj) || 'Neutral';
                      if (typeof sentimentStr === 'object') sentimentStr = JSON.stringify(sentimentStr);
                      const s = String(sentimentStr).toLowerCase();
                      
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          s === 'positive' ? 'bg-green-100 text-green-700' :
                          s === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {sentimentStr}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* XAI Explanation */}
      <div className="p-3 rounded-xl bg-slate-900 text-slate-300 text-[11px] leading-relaxed relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Brain size={40} />
        </div>
        <div className="relative z-10 font-mono">
          <span className="text-[#00C2A8] font-bold">EXPLAINABLE AI INSIGHT:</span><br/>
          {typeof xai_explanation === 'object' ? JSON.stringify(xai_explanation) : xai_explanation}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  
  // Try to parse content as JSON
  let structuredData = null;
  if (!isUser && !msg.loading) {
    try {
      // Find JSON block if it exists
      const jsonMatch = msg.content.match(/\{[\s\S]+\}/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      structuredData = null;
    }
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
        style={isUser
          ? { background: 'white', border: '1px solid var(--border)' }
          : { background: 'linear-gradient(135deg, #00C2A8, #00E5C9)' }}>
        {isUser
          ? <User size={14} style={{ color: 'var(--text-muted)' }} />
          : <Brain size={14} style={{ color: '#FFFFFF' }} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${
        isUser ? 'rounded-tr-sm bg-white border-slate-200 text-slate-800' : 'rounded-tl-sm bg-slate-50/50 border-[#00C2A8]/10 text-slate-700'
      }`}>
        {msg.loading ? (
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" style={{ color: '#00C2A8' }} />
            <span style={{ color: 'var(--text-muted)' }}>InvestIQ is thinking…</span>
          </div>
        ) : (
          <>
            {structuredData ? (
              <AnalysisReport data={structuredData} />
            ) : (
              <div className="whitespace-pre-wrap font-sans text-slate-700">{msg.content}</div>
            )}
          </>
        )}
        {msg.steps && (
          <div className="mt-3 pt-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="w-1 h-1 rounded-full bg-[#00C2A8]" />
            {msg.steps} agent reasoning steps completed
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm InvestIQ's AI assistant, powered by LangGraph + Groq LLaMA 3.\n\nI can help you:\n• Analyze stocks and portfolio risk\n• Forecast returns using ML models\n• Optimize portfolio allocation (scipy)\n• Explain decisions with SHAP\n• Fetch live news sentiment\n\nTry asking me to analyze a portfolio or check market conditions!`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: userText };
    const placeholderMsg = { role: 'assistant', content: '', loading: true, id: Date.now() };

    setMessages(prev => [...prev, userMsg, placeholderMsg]);
    setLoading(true);

    try {
      // Check if this is a portfolio analysis request
      const tickerMatch = userText.match(/\b([A-Z]{2,5})\b/g);
      const budgetMatch = userText.match(/\$?(\d[\d,]*)/);
      const isPortfolioQuery = tickerMatch && tickerMatch.length >= 1 && budgetMatch;

      let responseText = '';
      let steps = 0;

      if (isPortfolioQuery && tickerMatch.length >= 1) {
        const tickers = [...new Set(tickerMatch.filter(t => t.length >= 2 && t.length <= 5))].slice(0, 5);
        const budget = parseFloat(budgetMatch[1].replace(/,/g, '')) || 10000;
        const isAggressive = /aggressive|high.?risk|risky/i.test(userText);
        const isConservative = /conservative|safe|low.?risk/i.test(userText);
        const riskThreshold = isAggressive ? 0.75 : isConservative ? 0.3 : 0.5;

        const { data } = await axios.post(`${API_BASE}/analyze`, {
          tickers,
          total_budget: budget,
          risk_threshold: riskThreshold,
        }, { timeout: 300000 });

        steps = data.steps_taken || 0;
        const structured = data.structured_output;

        if (structured) {
          responseText = JSON.stringify(structured, null, 2);
        } else {
          responseText = data.raw_output || 'Analysis complete. No structured output captured.';
        }
      } else {
        // General question — ask the agent with a minimal prompt wrapped in a fake analysis context
        // For general queries, use the news endpoint or return a helpful text response
        const lowerText = userText.toLowerCase();
        if (lowerText.includes('news') || lowerText.includes('market') || lowerText.includes('today')) {
          const query = tickerMatch?.[0] || 'stock market today';
          const { data } = await axios.post(`${API_BASE}/news`, { query, page_size: 5 });
          const articles = data.articles || [];
          if (articles.length > 0) {
            responseText = `📰 Latest news for "${query}":\n\n` +
              articles.map((a, i) => `${i + 1}. ${a.title}\n   ${a.source} • ${new Date(a.published_at).toLocaleDateString()}`).join('\n\n');
          } else {
            responseText = 'No recent news found. Try a more specific query like "AAPL stock" or "tech sector".';
          }
        } else if (lowerText.includes('movers') || lowerText.includes('gainer') || lowerText.includes('loser')) {
          const { data } = await axios.get(`${API_BASE}/market-data/top-movers`);
          const gainers = data.top_gainers || [];
          const losers = data.top_losers || [];
          responseText = `📈 Top Gainers:\n` +
            gainers.map(g => `• ${g.ticker}: +${g.change_pct}% ($${g.current_price})`).join('\n') +
            `\n\n📉 Top Losers:\n` +
            losers.map(l => `• ${l.ticker}: ${l.change_pct}% ($${l.current_price})`).join('\n');
        } else {
          // Casual chat — call the /chat endpoint
          const { data } = await axios.post(`${API_BASE}/chat`, { message: userText });
          responseText = data.response || "I'm here to help, but I couldn't process that thought right now.";
        }
      }

      setMessages(prev =>
        prev.map(m => m.id === placeholderMsg.id
          ? { role: 'assistant', content: responseText, steps: steps || undefined }
          : m
        )
      );
    } catch (e) {
      const errText = e.response?.data?.detail || e.message || 'Something went wrong.';
      setMessages(prev =>
        prev.map(m => m.id === placeholderMsg.id
          ? { role: 'assistant', content: `❌ Error: ${errText}\n\nMake sure the backend is running at ${API_BASE}` }
          : m
        )
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearMessages = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. How can I help with your portfolio today?',
    }]);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto animate-fade-in" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00C2A8, #00E5C9)' }}>
            <Brain size={18} style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Plus Jakarta Sans' }}>AI Assistant</h1>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00C2A8' }} />
              LangGraph × Groq LLaMA 3
            </div>
          </div>
        </div>
        <button onClick={clearMessages}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:bg-slate-50"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <Trash2 size={12} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && (
        <div className="mb-3 shrink-0">
          <div className="flex items-center gap-1.5 mb-2 text-xs" style={{ color: '#4B5563' }}>
            <Lightbulb size={12} />Suggested queries
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="px-3 py-1.5 rounded-xl text-xs transition-all hover:scale-105 text-left"
                style={{ background: 'rgba(0,194,168,0.08)', border: '1px solid rgba(0,194,168,0.2)', color: '#00C2A8' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0">
        <div className="flex items-end gap-2 p-3 rounded-2xl shadow-sm"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="Ask about stocks, portfolio analysis, market news… (Enter to send)"
            rows={2}
            className="flex-1 bg-transparent outline-none text-sm text-[#0F172A] resize-none"
            style={{ color: 'var(--text-main)' }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #00C2A8, #00E5C9)', color: '#FFFFFF' }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <div className="text-center text-xs mt-2" style={{ color: '#374151' }}>
          Portfolio queries with tickers + budget trigger the full ReAct agent pipeline
        </div>
      </div>
    </div>
  );
}
