'use client';

import Navbar from '@/components/Navbar';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { useState } from 'react';

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setLoadingPlan(plan);
      const res = await api.post('/subscriptions/checkout', { plan });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      alert('Error initiating checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <Navbar />

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-400">Upgrade to Premium for maximum privacy and features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <PricingCard 
          name="Free"
          price="$0"
          description="Basic disposable features."
          features={['Random email generation', '1 Active Inbox', 'Emails deleted after 24h', 'Standard SMS numbers']}
          buttonText="Current Plan"
          onAction={() => router.push('/mail')}
        />

        {/* Pro Plan */}
        <PricingCard 
          name="Pro"
          price="$9"
          period="/month"
          description="For power users needing custom domains."
          features={['Custom usernames', 'Up to 10 Active Inboxes', 'Emails kept for 30 days', 'Premium SMS routes (Faster)', 'Priority Support']}
          buttonText={loadingPlan === 'PRO' ? 'Processing...' : 'Upgrade to Pro'}
          highlight
          onAction={() => handleUpgrade('PRO')}
        />

        {/* Enterprise Plan */}
        <PricingCard 
          name="Enterprise"
          price="$29"
          period="/month"
          description="For businesses and developers."
          features={['Unlimited Active Inboxes', 'Unlimited SMS generations', 'API Access', 'Webhook integrations', 'Custom Domain linking']}
          buttonText={loadingPlan === 'ENTERPRISE' ? 'Processing...' : 'Upgrade to Enterprise'}
          onAction={() => handleUpgrade('ENTERPRISE')}
        />
      </div>
    </div>
  );
}

function PricingCard({ name, price, period = '', description, features, buttonText, highlight = false, onAction }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`glass-card p-8 flex flex-col relative ${highlight ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}`}
    >
      {highlight && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <Star className="w-3 h-3" /> Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <p className="text-gray-400 text-sm mb-6 h-10">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-extrabold text-white">{price}</span>
        <span className="text-gray-400">{period}</span>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 shrink-0" />
            <span className="text-sm text-gray-300">{f}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={onAction}
        className={`w-full py-4 rounded-xl font-bold transition-colors ${
          highlight 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        {buttonText}
      </button>
    </motion.div>
  );
}
