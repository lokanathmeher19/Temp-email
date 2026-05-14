'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { io } from 'socket.io-client';
import { Copy, Smartphone, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
];

const SERVICES = [
  { id: 'telegram', name: 'Telegram' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'google', name: 'Google' },
  { id: 'discord', name: 'Discord' },
];

export default function TempSMSPage() {
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedService, setSelectedService] = useState('telegram');
  const [activePhoneId, setActivePhoneId] = useState<string | null>(null);

  const requestNumberMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/sms/request', {
        country: selectedCountry,
        service: selectedService
      });
      return res.data.phoneNumber;
    },
    onSuccess: (data) => {
      setActivePhoneId(data.id);
    }
  });

  const { data: phoneData, isLoading } = useQuery({
    queryKey: ['phone', activePhoneId],
    queryFn: async () => {
      if (!activePhoneId) return null;
      const res = await api.get(`/sms/${activePhoneId}`);
      return res.data.phoneNumber;
    },
    enabled: !!activePhoneId,
  });

  // Socket.io Realtime Connection
  useEffect(() => {
    if (!activePhoneId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    
    socket.on('connect', () => {
      socket.emit('join_phone', activePhoneId);
    });

    socket.on('new_sms', (data) => {
      queryClient.setQueryData(['phone', activePhoneId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: [data.message, ...oldData.messages]
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [activePhoneId, queryClient]);

  const copyToClipboard = () => {
    if (phoneData?.number) {
      navigator.clipboard.writeText(phoneData.number);
      alert('Number copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <Navbar />
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Temporary Phone Number</h1>
        <p className="text-gray-400">Receive OTPs instantly without exposing your real number.</p>
      </div>

      {!activePhoneId ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8 max-w-2xl mx-auto"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Country</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                    selectedCountry === c.code 
                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="font-medium">{c.code}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Service</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`p-3 rounded-xl border text-sm transition-colors ${
                    selectedService === s.id 
                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => requestNumberMutation.mutate()}
            disabled={requestNumberMutation.isPending}
            className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {requestNumberMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
            Generate Number
          </button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Number Display Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-blue-500/30 bg-blue-900/10"
          >
            <div>
              <p className="text-sm text-blue-400 font-medium mb-1 uppercase tracking-wider">
                {COUNTRIES.find(c => c.code === phoneData?.country)?.name} • {SERVICES.find(s => s.id === selectedService)?.name}
              </p>
              <h2 className="text-3xl md:text-4xl font-mono font-bold tracking-wider text-white">
                {phoneData?.number || 'Loading...'}
              </h2>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={copyToClipboard}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Copy className="w-5 h-5" /> Copy
              </button>
              <button 
                onClick={() => setActivePhoneId(null)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Release
              </button>
            </div>
          </motion.div>

          {/* SMS Messages List */}
          <div className="glass-card overflow-hidden">
            <div className="bg-white/5 border-b border-white/10 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Incoming Messages
              </h2>
              <button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['phone', activePhoneId] })}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-white/5 min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : !phoneData?.messages || phoneData.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <MessageSquare className="w-10 h-10 mb-4 opacity-50" />
                  <p>Waiting for SMS code...</p>
                  <p className="text-xs mt-2 text-gray-600">Messages usually arrive within 10-30 seconds</p>
                </div>
              ) : (
                <AnimatePresence>
                  {phoneData.messages.map((msg: any) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-blue-400">{msg.sender}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(msg.receivedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-lg text-white font-medium bg-black/30 p-3 rounded-lg border border-white/5">
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
