import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Bot, PieChart,
  LineChart, Menu, X, Zap, Bell, Search,
  ChevronRight, History as HistoryIcon
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Zap },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/markets', label: 'Markets', icon: TrendingUp },
  { path: '/allocator', label: 'AI Allocator', icon: PieChart },
  { path: '/agents', label: 'Agent Lab', icon: Zap },
  { path: '/assistant', label: 'AI Assistant', icon: Bot },
  { path: '/history', label: 'History', icon: HistoryIcon },
];

const POPULAR_SYMBOLS = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.' },
  { ticker: 'MSFT', name: 'Microsoft Corp.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  { ticker: 'META', name: 'Meta Platforms' },
  { ticker: 'NFLX', name: 'Netflix, Inc.' },
  { ticker: 'BTCUSD', name: 'Bitcoin / US Dollar' },
  { ticker: 'ETHUSD', name: 'Ethereum / US Dollar' },
  { ticker: 'XAUUSD', name: 'Gold / US Dollar' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
  { ticker: 'BABA', name: 'Alibaba Group' },
  { ticker: 'COIN', name: 'Coinbase Global' },
  { ticker: 'SHOP', name: 'Shopify Inc.' },
  { ticker: 'PYPL', name: 'PayPal Holdings' },
  { ticker: 'DIS', name: 'Walt Disney Co.' },
  { ticker: 'NKE', name: 'Nike, Inc.' },
  { ticker: 'JPM', name: 'JPMorgan Chase' },
  { ticker: 'V', name: 'Visa Inc.' },
  { ticker: 'MA', name: 'Mastercard Inc.' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();

  const currentPage = NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'InvestIQ';

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [newsArticles, setNewsArticles] = useState([]);
    const [loadingNews, setLoadingNews] = useState(false);
    const [hasUnreadNews, setHasUnreadNews] = useState(true);

    React.useEffect(() => {
      // Fetch news immediately
      setLoadingNews(true);
      import('../services/api').then(({ getNews }) => {
        getNews('stock market', 5)
          .then(res => {
            setNewsArticles(res.articles || []);
            setHasUnreadNews((res.articles || []).length > 0);
          })
          .catch(err => console.error("Error fetching news:", err))
          .finally(() => setLoadingNews(false));
      });
    }, []);

    const handleOpenNotifications = () => {
      setNotificationsOpen(!notificationsOpen);
      if (!notificationsOpen) {
        setHasUnreadNews(false);
      }
    };

    const navigateToTicker = (ticker) => {
      window.location.href = `/markets?s=${ticker}`;
      setSearchValue('');
      setShowSuggestions(false);
    };

    const filteredSuggestions = searchValue.length > 0 
      ? POPULAR_SYMBOLS.filter(s => 
          s.ticker.includes(searchValue.toUpperCase()) || 
          s.name.toLowerCase().includes(searchValue.toLowerCase())
        ).slice(0, 6)
      : [];

    return (
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 shadow-xl lg:shadow-none`}
          style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-3" style={{ borderBottom: '1px solid var(--border)', minHeight: '88px' }}>
            <div className="flex-1 flex items-center justify-center min-w-0">
              <img 
                src="/logo.png" 
                alt="InvestIQ Logo" 
                className="w-full max-w-[200px] h-auto block"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="items-center gap-3" style={{ display: 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00C2A8, #00E5C9)' }}>
                  <LineChart size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[#0F172A] font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>InvestIQ</span>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Finance</div>
                </div>
              </div>
            </div>
            <button className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 shrink-0" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#4B5563' }}>
              Navigation
            </div>
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                   ${isActive
                     ? 'text-[#00C2A8]'
                     : 'text-slate-500 hover:text-[#00C2A8] hover:bg-slate-100'
                   }`
                }
                style={({ isActive }) => isActive ? {
                  background: 'linear-gradient(135deg, rgba(0,194,168,0.15), rgba(0,194,168,0.05))',
                  border: '1px solid rgba(0,194,168,0.2)',
                  color: '#00C2A8',
                } : {}}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
                {location.pathname === path && (
                  <ChevronRight size={14} className="ml-auto opacity-60" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom status */}
          <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00C2A8' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Markets Live</span>
              <span className="ml-auto text-xs font-mono" style={{ color: '#00C2A8' }}>●</span>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center gap-4 px-6 py-4 shrink-0 shadow-sm"
            style={{ borderBottom: '1px solid var(--border)', background: 'white' }}>
            <button
              className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {currentPage}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-3 relative">
              {/* Smart Search */}
              <div className="relative group">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchValue) navigateToTicker(searchValue.trim().toUpperCase());
                  }}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all focus-within:ring-2 focus-within:ring-[#00C2A8]/30"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <Search size={14} className="text-slate-400" />
                  <input 
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search symbol..."
                    className="bg-transparent outline-none text-xs font-semibold text-[#0F172A] w-32 focus:w-48 transition-all"
                  />
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setShowSuggestions(false)} />
                    <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2">
                        {filteredSuggestions.map((s) => (
                          <div
                            key={s.ticker}
                            onClick={() => navigateToTicker(s.ticker)}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer group transition-all"
                          >
                            <div>
                               <div className="text-xs font-bold text-[#0F172A]">{s.ticker}</div>
                               <div className="text-[10px] text-slate-400">{s.name}</div>
                            </div>
                            <ChevronRight size={12} className="text-slate-300 group-hover:text-[#00C2A8] transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={handleOpenNotifications}
                  className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all hover:bg-slate-100"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <Bell size={16} className={hasUnreadNews ? "text-[#00C2A8]" : "text-slate-400"} />
                  {hasUnreadNews && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full animate-bounce" style={{ background: '#00C2A8' }} />
                  )}
                </button>

                {/* Dropdown UI */}
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between p-5 border-b border-slate-50">
                        <h3 className="font-bold text-slate-800 tracking-tight">Live Market News</h3>
                        {loadingNews && <span className="w-4 h-4 rounded-full border-2 border-[#00C2A8] border-t-transparent animate-spin"></span>}
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {!loadingNews && newsArticles.length === 0 && (
                          <div className="p-6 text-center text-sm text-slate-500">No news available.</div>
                        )}
                        {newsArticles.map((article, idx) => (
                          <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 border-b border-slate-50 transition-colors hover:bg-slate-50/50 relative group">
                            <div className="flex gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#00C2A8]">{article.source}</span>
                                  <span className="text-[9px] text-slate-400">{new Date(article.published_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-snug font-medium group-hover:text-[#00C2A8] transition-colors line-clamp-2">{article.title}</p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                      <div className="p-3 bg-slate-50/50 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Powered by NewsAPI
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-md"
              style={{ background: 'linear-gradient(135deg, #00C2A8, #00E5C9)', color: '#FFFFFF' }}>
              IQ
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
