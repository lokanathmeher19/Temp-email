'use client';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mail, Smartphone, Key, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [apiKeyName, setApiKeyName] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data: mailboxes, refetch: refetchMailboxes } = useQuery({
    queryKey: ['my-mailboxes'],
    queryFn: async () => {
      const res = await api.get('/mailboxes');
      return res.data.mailboxes;
    },
    enabled: isAuthenticated,
  });

  const { data: numbers } = useQuery({
    queryKey: ['my-numbers'],
    queryFn: async () => {
      const res = await api.get('/sms');
      return res.data.numbers;
    },
    enabled: isAuthenticated,
  });

  const deleteMailboxMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/mailboxes/${id}`);
    },
    onSuccess: () => refetchMailboxes()
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/developer/keys', { name: apiKeyName || 'Default Key' });
      return res.data.apiKey;
    },
    onSuccess: (data) => {
      alert(`API Key Created: ${data.key}\nPlease save it, it won't be shown again.`);
      setApiKeyName('');
    }
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <Navbar />

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your active inboxes, numbers, and API keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mailboxes */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Mail className="text-blue-400 w-6 h-6" />
            <h2 className="text-xl font-semibold text-white">Active Inboxes</h2>
          </div>
          
          <div className="space-y-3">
            {mailboxes?.length === 0 ? (
              <p className="text-gray-500">No active mailboxes.</p>
            ) : (
              mailboxes?.map((m: any) => (
                <div key={m.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-white font-mono">{m.address}</p>
                    <p className="text-xs text-gray-500 mt-1">Expires {formatDistanceToNow(new Date(m.expiresAt), { addSuffix: true })}</p>
                  </div>
                  <button 
                    onClick={() => deleteMailboxMutation.mutate(m.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Smartphone className="text-indigo-400 w-6 h-6" />
            <h2 className="text-xl font-semibold text-white">Active Numbers</h2>
          </div>
          
          <div className="space-y-3">
            {numbers?.length === 0 ? (
              <p className="text-gray-500">No active numbers.</p>
            ) : (
              numbers?.map((n: any) => (
                <div key={n.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-white font-mono text-lg">{n.number}</p>
                    <p className="text-xs text-gray-500 mt-1">{n.country} • Expires {formatDistanceToNow(new Date(n.expiresAt), { addSuffix: true })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* API Keys (Developer) */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Key className="text-purple-400 w-6 h-6" />
            <h2 className="text-xl font-semibold text-white">Developer API</h2>
          </div>
          
          <div className="flex gap-4 max-w-md">
            <input 
              type="text" 
              placeholder="Key Name (e.g. Production)" 
              value={apiKeyName}
              onChange={(e) => setApiKeyName(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              onClick={() => createApiKeyMutation.mutate()}
              disabled={createApiKeyMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              Generate Key
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
