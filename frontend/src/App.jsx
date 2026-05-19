import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import AIAllocator from './pages/AIAllocator';
import AIAssistant from './pages/AIAssistant';
import Agents from './pages/Agents';
import History from './pages/History';

export default function App() {
  return (
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
  );
}
