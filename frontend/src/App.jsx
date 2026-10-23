import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import AIAllocator from './pages/AIAllocator';
import AIAssistant from './pages/AIAssistant';
import Agents from './pages/Agents';
import History from './pages/History';
import { wakeBackend } from './services/api';

export default function App() {
  const [backendReady, setBackendReady] = useState(true);
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const check = async () => {
      setWaking(true);
      const up = await wakeBackend();
      setWaking(false);
      setBackendReady(up);

      // If it failed, retry once after 15 seconds (Render cold start can take up to 50s)
      if (!up) {
        setTimeout(async () => {
          const retry = await wakeBackend();
          setBackendReady(retry);
        }, 15000);
      }
    };
    check();
  }, []);

  return (
    <>
      {/* Wake-up banner — only shows during Render cold start */}
      {waking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#F59E0B', color: '#1C1C1C',
          padding: '10px 20px', textAlign: 'center',
          fontSize: '13px', fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
          Backend is waking up (free tier) — data will load in ~30 seconds...
        </div>
      )}
      {!waking && !backendReady && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#EF4444', color: '#fff',
          padding: '10px 20px', textAlign: 'center',
          fontSize: '13px', fontWeight: 500
        }}>
          ⚠️ Backend unreachable — retrying... Refresh in 30 seconds if this persists.
        </div>
      )}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/allocator" element={<AIAllocator />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </>
  );
}
