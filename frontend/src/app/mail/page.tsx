'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { io } from 'socket.io-client';
import { Copy, RefreshCw, Trash2, Mail as MailIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function TempMailPage() {
  const queryClient = useQueryClient();
  const [activeMailboxId, setActiveMailboxId] = useState<string | null>(null);

  // Auto-generate mailbox on mount if none exists
  const createMailboxMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/mailboxes');
      return res.data.mailbox;
    },
    onSuccess: (data) => {
      setActiveMailboxId(data.id);
      localStorage.setItem('last_mailbox', data.id);
    }
  });

  useEffect(() => {
    const savedId = localStorage.getItem('last_mailbox');
    if (savedId) {
      setActiveMailboxId(savedId);
    } else {
      createMailboxMutation.mutate();
    }
  }, []);

  // Fetch Mailbox Details (includes emails)
  const { data: mailbox, isLoading } = useQuery({
    queryKey: ['mailbox', activeMailboxId],
    queryFn: async () => {
      if (!activeMailboxId) return null;
      const res = await api.get(`/mailboxes/${activeMailboxId}`);
      return res.data.mailbox;
    },
    enabled: !!activeMailboxId,
  });

  // Socket.io Realtime Connection
  useEffect(() => {
    if (!activeMailboxId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    
    socket.on('connect', () => {
      socket.emit('join_inbox', activeMailboxId);
    });

    socket.on('new_email', (data) => {
      // Instantly update the cache with the new email
      queryClient.setQueryData(['mailbox', activeMailboxId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          emails: [data.email, ...oldData.emails]
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [activeMailboxId, queryClient]);

  const copyToClipboard = () => {
    if (mailbox?.address) {
      navigator.clipboard.writeText(mailbox.address);
      // In a real app, trigger a Toast notification here
      alert('Copied to clipboard!');
    }
  };

  const handleNewAddress = () => {
    createMailboxMutation.mutate();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <Navbar />
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Your Temporary Inbox</h1>
        <p className="text-gray-400">Emails will self-destruct after 24 hours.</p>
      </div>

      {/* Address Bar Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center gap-4"
      >
        <div className="flex-1 w-full relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MailIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            readOnly 
            value={mailbox?.address || 'Generating...'} 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <button 
            onClick={copyToClipboard}
            disabled={!mailbox}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <Copy className="w-5 h-5" /> Copy
          </button>
          
          <button 
            onClick={handleNewAddress}
            disabled={createMailboxMutation.isPending}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {createMailboxMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            New
          </button>
        </div>
      </motion.div>

      {/* Inbox Display */}
      <div className="glass-card overflow-hidden">
        <div className="bg-white/5 border-b border-white/10 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Inbox
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({mailbox?.emails?.length || 0})
            </span>
          </h2>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['mailbox', activeMailboxId] })}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-white/5 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : !mailbox?.emails || mailbox.emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MailIcon className="w-12 h-12 mb-4 opacity-50" />
              <p>Waiting for incoming emails...</p>
            </div>
          ) : (
            <AnimatePresence>
              {mailbox.emails.map((email: any) => (
                <motion.div 
                  key={email.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-white truncate max-w-[70%]">
                      {email.fromName || email.fromAddress}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 font-medium mb-1 truncate">
                    {email.subject || 'No Subject'}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {email.bodyText?.substring(0, 100) || 'No content...'}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
