import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Mail, Shield, Sparkles } from 'lucide-react';
import EmailBox from './components/EmailBox';
import Inbox from './components/Inbox';
import EmailViewer from './components/EmailViewer';
import InfoSection from './components/InfoSection';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [accountHistory, setAccountHistory] = useState(() => {
    const saved = localStorage.getItem('tempmail_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expiryTime, setExpiryTime] = useState(() => {
    const saved = localStorage.getItem('tempmail_expiry');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const [account, setAccount] = useState(() => {
    const saved = localStorage.getItem('tempmail_account');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [domains, setDomains] = useState([]);
  const [loadingAccount, setLoadingAccount] = useState(!account);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [autoSync, setAutoSync] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [deleting, setDeleting] = useState(false);
  
  const previousMessageCount = useRef(0);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch domains on mount
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await axios.get(`${API_BASE}/domains`);
        setDomains(response.data);
      } catch (error) {
        console.error('Failed to fetch domains:', error);
      }
    };
    fetchDomains();
  }, []);

  const generateAccount = useCallback(async (selectedDomain, customUsername, durationMinutes = 10) => {
    setLoadingAccount(true);
    setSelectedMessageId(null);
    setMessages([]);
    try {
      const response = await axios.post(`${API_BASE}/create`, { 
        domain: selectedDomain,
        username: customUsername
      });
      const newAccount = response.data;
      
      setAccount(newAccount);
      localStorage.setItem('tempmail_account', JSON.stringify(newAccount));
      
      const newExpiry = Date.now() + durationMinutes * 60 * 1000;
      setExpiryTime(newExpiry);
      localStorage.setItem('tempmail_expiry', newExpiry.toString());
      
      setAccountHistory(prev => {
        const updated = [newAccount, ...prev.filter(a => a.id !== newAccount.id)].slice(0, 10);
        localStorage.setItem('tempmail_history', JSON.stringify(updated));
        return updated;
      });
      
    } catch (error) {
      console.error('Failed to generate account:', error);
      alert(error.response?.data?.error || 'Failed to generate email. Make sure backend is running.');
    } finally {
      setLoadingAccount(false);
    }
  }, []);

  const extendExpiry = useCallback((extraMinutes = 10) => {
    if (!expiryTime) return;
    const newExpiry = Math.max(Date.now(), expiryTime) + extraMinutes * 60 * 1000;
    setExpiryTime(newExpiry);
    localStorage.setItem('tempmail_expiry', newExpiry.toString());
  }, [expiryTime]);

  const deleteAccount = useCallback(async () => {
    if (!account) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/account/${account.id}`, {
        headers: { Authorization: `Bearer ${account.token}` }
      });
      setAccount(null);
      localStorage.removeItem('tempmail_account');
      localStorage.removeItem('tempmail_expiry');
      setExpiryTime(null);
      setAccountHistory(prev => {
        const updated = prev.filter(a => a.id !== account.id);
        localStorage.setItem('tempmail_history', JSON.stringify(updated));
        return updated;
      });
      setMessages([]);
      setSelectedMessageId(null);
      
      // Auto-generate new after delete
      generateAccount();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  }, [account, generateAccount]);

  const switchAccount = (acc) => {
    setAccount(acc);
    localStorage.setItem('tempmail_account', JSON.stringify(acc));
    
    // reset expiry when switching to history (default 10 min for old accounts)
    const newExpiry = Date.now() + 10 * 60 * 1000;
    setExpiryTime(newExpiry);
    localStorage.setItem('tempmail_expiry', newExpiry.toString());
    
    setSelectedMessageId(null);
    setMessages([]);
  };

  const deleteMessage = useCallback(async (msgId) => {
    if (!account) return;
    try {
      await axios.delete(`${API_BASE}/messages/${msgId}`, {
        headers: { Authorization: `Bearer ${account.token}` }
      });
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (selectedMessageId === msgId) {
        setSelectedMessageId(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message.');
    }
  }, [account, selectedMessageId]);

  const fetchMessages = useCallback(async (isManual = false) => {
    if (!account) return;
    
    if (messages.length === 0 || isManual) {
      setLoadingMessages(true);
    }

    try {
      const response = await axios.get(`${API_BASE}/messages`, {
        headers: { Authorization: `Bearer ${account.token}` }
      });
      const msgs = response.data['hydra:member'] || [];
      
      // Check for new messages
      if (msgs.length > previousMessageCount.current && previousMessageCount.current !== 0) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Email Received', {
            body: `You have a new message from ${msgs[0]?.from?.address}`,
            icon: '/favicon.ico'
          });
        }
      }
      previousMessageCount.current = msgs.length;
      
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
      setCountdown(10);
    }
  }, [account, messages.length]);

  useEffect(() => {
    if (!account && domains.length > 0) {
      generateAccount(domains[0].domain);
    }
  }, [account, domains, generateAccount]);

  useEffect(() => {
    if (!account) return;
    
    fetchMessages(); // initial fetch
    
    let timer;
    if (autoSync) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchMessages();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [account, autoSync, fetchMessages]);

  useEffect(() => {
    if (!account || !expiryTime) return;
    
    const interval = setInterval(() => {
      if (Date.now() > expiryTime) {
        clearInterval(interval);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Temp Email Expired', { body: 'Your temporary email address has expired.' });
        }
        deleteAccount();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [account, expiryTime, deleteAccount]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/15 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Mail size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                TempMail <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Pro</span>
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700/50">
                <Shield size={14} className="text-indigo-400" />
                <span>Temp Number</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-full transition-colors font-bold shadow-lg shadow-amber-400/20">
                <Sparkles size={14} />
                <span>Premium</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
          
          <div className="w-full animate-slide-up">
            <EmailBox 
              email={account?.address} 
              loading={loadingAccount} 
              domains={domains}
              onGenerateNew={generateAccount} 
              onDelete={deleteAccount}
              deleting={deleting}
              history={accountHistory}
              onSwitchAccount={switchAccount}
              expiryTime={expiryTime}
              onExtendExpiry={extendExpiry}
            />
          </div>

          <div className="w-full mt-10 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            {selectedMessageId ? (
              <EmailViewer 
                messageId={selectedMessageId} 
                token={account?.token}
                onBack={() => setSelectedMessageId(null)} 
                onDelete={() => deleteMessage(selectedMessageId)}
              />
            ) : (
              <Inbox 
                messages={messages} 
                loading={loadingMessages}
                onSelectMessage={setSelectedMessageId}
                autoSync={autoSync}
                setAutoSync={setAutoSync}
                countdown={countdown}
                onSyncNow={() => fetchMessages(true)}
                onDeleteMessage={deleteMessage}
              />
            )}
          </div>

          <InfoSection />
        </main>

        <footer className="border-t border-white/5 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <p>Built with React, Tailwind CSS, Node.js, Express, and Mail.tm</p>
            <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} TempMail Pro. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
