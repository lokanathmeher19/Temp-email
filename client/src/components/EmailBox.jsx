import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, Trash2, QrCode, PenSquare } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const EmailBox = ({ email, loading, domains, onGenerateNew, onDelete, deleting, onRefresh, history, onSwitchAccount, expiryTime, onExtendExpiry }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showHistory, setShowHistory] = useState(false);

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
  
  // States for generation settings (modal-like or inline, keeping it simple for now)
  const [customUsername, setCustomUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [expiryDuration, setExpiryDuration] = useState('10');
  const [showSettings, setShowSettings] = useState(false);

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
    setShowSettings(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 px-4">
      
      {/* Top Main Box Area */}
      <div className="w-full flex flex-col items-center gap-6 relative">
        
        <div className="w-full flex items-center justify-between max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide">
            Your Temporary Email Address
          </h2>
          <div className="flex items-center gap-3">
            {expiryTime && (
              <div className="text-sm font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full">
                {timeLeft}
              </div>
            )}
            {history?.length > 1 && (
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm font-semibold text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-full hover:bg-indigo-400/20"
              >
                History
              </button>
            )}
          </div>
        </div>

        {/* History Dropdown */}
        {showHistory && (
          <div className="absolute top-14 right-0 md:right-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in w-64 max-w-full">
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

        {/* Input Container */}
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            readOnly
            value={loading ? 'Generating...' : (deleting ? 'Deleting...' : (email || 'No email generated'))}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-full py-4 sm:py-5 pl-6 sm:pl-8 pr-28 sm:pr-32 text-slate-100 text-lg sm:text-xl font-mono focus:outline-none focus:border-indigo-500/50 transition-all shadow-xl placeholder-slate-500 text-center"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setShowQr(!showQr)}
              disabled={loading || !email || deleting}
              className="p-2 sm:p-2.5 bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white rounded-full transition-all disabled:opacity-50"
              title="Show QR Code"
            >
              <QrCode size={20} />
            </button>
            <button
              onClick={handleCopy}
              disabled={loading || !email || deleting}
              className="p-2 sm:p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-full transition-all disabled:opacity-50"
              title="Copy to clipboard"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          {/* QR Code Popover */}
          {showQr && email && (
            <div className="absolute right-0 top-full mt-4 bg-white p-4 rounded-2xl shadow-2xl z-50 animate-fade-in border border-slate-200 flex flex-col items-center gap-2">
              <QRCodeSVG value={`mailto:${email}`} size={160} />
              <span className="text-xs font-semibold text-slate-800 mt-1">Scan to send email</span>
              <button onClick={() => setShowQr(false)} className="text-xs text-indigo-600 hover:underline mt-1">Close</button>
            </div>
          )}
        </div>

        {/* Subtitle Description */}
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed text-center max-w-3xl">
          Forget about spam, advertising mailings, hacking and attacking robots. 
          Keep your real mailbox clean and secure. TempMail Pro provides temporary, 
          secure, anonymous, free, disposable email address.
        </p>
      </div>

      {/* Action Buttons Bar */}
      <div className="w-full bg-slate-900 border border-slate-800/80 rounded-[2rem] p-4 flex flex-wrap justify-center gap-4 sm:gap-6 shadow-lg shadow-black/20">
        <button
          onClick={handleCopy}
          disabled={loading || !email || deleting}
          className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Copy size={18} className="text-slate-400" />
          <span>Copy</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={loading || !email || deleting}
          className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={18} className="text-indigo-400" />
          <span>Refresh</span>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          disabled={loading || deleting}
          className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <PenSquare size={18} className="text-amber-400" />
          <span>Change</span>
        </button>

        <button
          onClick={onDelete}
          disabled={loading || !email || deleting}
          className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Trash2 size={18} className="text-rose-400" />
          <span>Delete</span>
        </button>
      </div>

      {/* Settings / Change Form (expandable) */}
      {showSettings && (
        <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl animate-slide-up flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
              Custom Username
            </label>
            <input
              type="text"
              placeholder="random"
              value={customUsername}
              onChange={(e) => setCustomUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 py-2.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500/50 text-sm"
            />
          </div>

          <div className="flex-1">
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
              Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 py-2.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500/50 text-sm"
            >
              {domains.length === 0 && <option value="">Loading...</option>}
              {domains.map((d, i) => (
                <option key={i} value={d.domain}>@{d.domain}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
              Expiry
            </label>
            <select
              value={expiryDuration}
              onChange={(e) => setExpiryDuration(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 py-2.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500/50 text-sm"
            >
              <option value="10">10 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="1440">24 Hours</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmailBox;
