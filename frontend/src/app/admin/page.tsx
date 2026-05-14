'use client';

import Navbar from '@/components/Navbar';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Users, Mail, MessageSquare, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.stats;
    },
    retry: false
  });

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center text-red-400">
          Access Denied. You are not an administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <Navbar />

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Platform-wide statistics and monitoring.</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-20">Loading statistics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers || 0} 
            icon={<Users className="w-6 h-6 text-blue-400" />} 
          />
          <StatCard 
            title="Active Mailboxes" 
            value={stats?.activeMailboxes || 0} 
            icon={<Mail className="w-6 h-6 text-green-400" />} 
          />
          <StatCard 
            title="Total SMS Sent/Recv" 
            value={stats?.totalSMS || 0} 
            icon={<MessageSquare className="w-6 h-6 text-indigo-400" />} 
          />
          <StatCard 
            title="Active Subscriptions" 
            value={stats?.activeSubscriptions || 0} 
            icon={<DollarSign className="w-6 h-6 text-purple-400" />} 
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="glass-card p-6 flex items-center gap-4">
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
