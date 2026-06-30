import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, LogOut, Activity, Users, Shield, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api/admin';

const Admin = () => {
  const [token, setToken] = useState(() => localStorage.getItem('tempmail_admin_token'));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/login`, { password });
      setToken(res.data.token);
      localStorage.setItem('tempmail_admin_token', res.data.token);
    } catch (err) {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('tempmail_admin_token');
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setError('Failed to fetch stats');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
              <Shield size={32} className="text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">Enter your master password to access analytics and controls.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Master Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <p className="text-rose-400 text-sm font-medium bg-rose-500/10 p-3 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2"
            >
              {loading ? <RefreshCw size={20} className="animate-spin" /> : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900/50 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-indigo-400" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 mt-8 space-y-8">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold">Overview</h2>
            <p className="text-slate-400 mt-1">Real-time statistics for TempMail Pro.</p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform">
              <Users size={64} className="text-indigo-500" />
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Emails Generated</p>
            <p className="text-5xl font-bold text-slate-100 mt-4">{stats ? stats.totalEmailsGenerated : '--'}</p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform">
              <Activity size={64} className="text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Server Uptime (Hours)</p>
            <p className="text-5xl font-bold text-slate-100 mt-4">{stats ? (stats.uptime / 3600).toFixed(1) : '--'}</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Admin;
