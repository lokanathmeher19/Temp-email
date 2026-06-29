import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Mail } from 'lucide-react';
import EmailBox from './components/EmailBox';
import Inbox from './components/Inbox';
import EmailViewer from './components/EmailViewer';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [account, setAccount] = useState(() => {
    const saved = localStorage.getItem('tempmail_account');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loadingAccount, setLoadingAccount] = useState(!account);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const generateAccount = useCallback(async () => {
    setLoadingAccount(true);
    setSelectedMessageId(null);
    setMessages([]);
    try {
      const response = await axios.post(`${API_BASE}/create`);
      const newAccount = response.data;
      setAccount(newAccount);
      localStorage.setItem('tempmail_account', JSON.stringify(newAccount));
    } catch (error) {
      console.error('Failed to generate account:', error);
      alert('Failed to generate email. Make sure backend is running.');
    } finally {
      setLoadingAccount(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!account) return;
    
    // Don't show loading spinner for background polling if we already have messages
    if (messages.length === 0) {
      setLoadingMessages(true);
    }

    try {
      const response = await axios.get(`${API_BASE}/messages`, {
        headers: { Authorization: `Bearer ${account.token}` }
      });
      // Mail.tm returns hydra:member for the array of messages
      const msgs = response.data['hydra:member'] || [];
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [account, messages.length]);

  // Initial account generation if none exists
  useEffect(() => {
    if (!account) {
      generateAccount();
    }
  }, [account, generateAccount]);

  // Polling for messages
  useEffect(() => {
    if (account) {
      fetchMessages(); // initial fetch
      const intervalId = setInterval(fetchMessages, 10000); // 10s poll
      return () => clearInterval(intervalId);
    }
  }, [account, fetchMessages]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
            <Mail size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TempMail Pro</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <EmailBox 
          email={account?.address} 
          loading={loadingAccount} 
          onGenerateNew={generateAccount} 
        />

        {selectedMessageId ? (
          <EmailViewer 
            messageId={selectedMessageId} 
            token={account?.token}
            onBack={() => setSelectedMessageId(null)} 
          />
        ) : (
          <Inbox 
            messages={messages} 
            loading={loadingMessages}
            onSelectMessage={setSelectedMessageId}
          />
        )}
      </main>

      <footer className="max-w-6xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>Built with React, Tailwind CSS, Node.js, Express, and Mail.tm</p>
      </footer>
    </div>
  );
}

export default App;
