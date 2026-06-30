import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, Mail, Trash2, History, Clock, Plus } from 'lucide-react';

const EmailBox = ({ email, loading, domains, onGenerateNew, onDelete, deleting, history, onSwitchAccount, expiryTime, onExtendExpiry }) => {
  const [copied, setCopied] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [expiryDuration, setExpiryDuration] = useState('10'); // minutes
  const [showHistory, setShowHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiryTime) {
      setTimeLeft('');
      return;
    }
    
    const updateTimer = () => {
      const remaining = expiryTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft('00m 00s');
      } else {
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  const handleCopy = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = () => {
    onGenerateNew(
      selectedDomain || (domains.length > 0 ? domains[0].domain : null),
      customUsername,
      parseInt(expiryDuration, 10)
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 w-full max-w-4xl mx-auto relative overflow-visible group flex flex-col gap-6">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main Address Area */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 relative z-10">
        
        {/* Decorative Icon */}
        <div className="hidden lg:flex shrink-0 w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 items-center justify-center shadow-inner self-center">
          <Mail size={32} className="text-indigo-400" />
        </div>

        {/* Input Area */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
              Your Temporary Email Address
            </label>
            <div className="flex items-center gap-4">
              {expiryTime && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                  <Clock size={12} /> {timeLeft}
                </div>
              )}
              {history.length > 1 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <History size={14} /> History
                  </button>
                  
                  {showHistory && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      <div className="p-2 border-b border-slate-700 bg-slate-900/50 text-xs text-slate-400 uppercase font-semibold">Previous Accounts</div>
                      <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                        {history.map((acc, idx) => (
                          <li key={idx}>
                            <button
                              onClick={() => {
                                onSwitchAccount(acc);
                                setShowHistory(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-500/10 transition-colors ${acc.address === email ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-300'}`}
                            >
                              {acc.address}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="relative flex items-center w-full">
            <input
              type="text"
              readOnly
              value={loading ? 'Generating secure email...' : (deleting ? 'Deleting account...' : (email || 'No email generated'))}
              className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl py-4 pl-4 pr-14 text-slate-100 text-lg sm:text-xl font-mono focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner placeholder-slate-500"
            />
            <button
              onClick={handleCopy}
              disabled={loading || !email || deleting}
              className="absolute right-2 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-slate-800 disabled:active:scale-100"
              title="Copy to clipboard"
            >
              {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading || deleting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-4 px-6 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">New</span>
          </button>

          {expiryTime && (
            <button
              onClick={() => onExtendExpiry(10)}
              disabled={loading || !email || deleting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 py-4 px-4 rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100 border border-emerald-500/30"
              title="Add 10 minutes to expiry"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">10m</span>
            </button>
          )}

          <button
            onClick={onDelete}
            disabled={loading || !email || deleting}
            className="flex-none flex items-center justify-center p-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            title="Delete Account"
          >
            <Trash2 size={20} className={deleting ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>

      {/* Settings Area */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700/50">
        <div className="flex-1">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
            Custom Username (Optional)
          </label>
          <input
            type="text"
            placeholder="random"
            value={customUsername}
            onChange={(e) => setCustomUsername(e.target.value)}
            disabled={loading || deleting}
            className="w-full bg-slate-800 border border-slate-700/50 text-slate-200 py-2.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500/50 shadow-inner disabled:opacity-50 text-sm"
          />
        </div>

        <div className="flex-1">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
            Domain
          </label>
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              disabled={loading || domains.length === 0}
              className="w-full appearance-none bg-slate-800 border border-slate-700/50 text-slate-200 py-2.5 pl-3 pr-8 rounded-lg focus:outline-none focus:border-indigo-500/50 shadow-inner disabled:opacity-50 text-sm"
            >
              {domains.length === 0 && <option value="">Loading...</option>}
              {domains.map((d, i) => (
                <option key={i} value={d.domain}>@{d.domain}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
            Expiry
          </label>
          <div className="relative">
            <select
              value={expiryDuration}
              onChange={(e) => setExpiryDuration(e.target.value)}
              disabled={loading || deleting}
              className="w-full appearance-none bg-slate-800 border border-slate-700/50 text-slate-200 py-2.5 pl-3 pr-8 rounded-lg focus:outline-none focus:border-indigo-500/50 shadow-inner disabled:opacity-50 text-sm"
            >
              <option value="10">10 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="1440">24 Hours</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmailBox;
