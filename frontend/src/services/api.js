import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 600000, // 10 min for agent runs
  headers: { 'Content-Type': 'application/json' },
});

// ── Portfolio Analysis ──────────────────────────────────────────────
export const analyzePortfolio = async ({ tickers, total_budget, risk_threshold = 0.5 }) => {
  const { data } = await api.post('/analyze', { tickers, total_budget, risk_threshold });
  return data;
};

export const getHistory = async () => {
  const { data } = await api.get('/history');
  return data;
};

// ── Market Data ─────────────────────────────────────────────────────
export const getMarketData = async (tickers, period = '1mo') => {
  const { data } = await api.post('/market-data', { tickers, period });
  return data;
};

export const getTopMovers = async () => {
  const { data } = await api.get('/market-data/top-movers');
  return data;
};

export const getMarketIndices = async () => {
  const { data } = await api.get('/market-data/indices');
  return data;
};

// ── News ────────────────────────────────────────────────────────────
export const getNews = async (query, page_size = 10) => {
  const { data } = await api.post('/news', { query, page_size });
  return data;
};

// ── Health ──────────────────────────────────────────────────────────
export const getHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

export const getSystemMetrics = async () => {
  const { data } = await api.get('/system/metrics');
  return data;
};

export default api;
