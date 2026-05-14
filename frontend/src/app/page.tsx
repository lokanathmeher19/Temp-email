'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, MessageSquare, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-blue-400 font-medium tracking-wide uppercase mb-6 inline-block">
              Enterprise Grade Privacy
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Disposable Inboxes, <br />
              <span className="text-gradient">Permanent Privacy.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
              Generate secure temporary email addresses and phone numbers instantly. Protect your personal data from spam, hackers, and tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/mail">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Generate Email
                </motion.button>
              </Link>
              
              <Link href="/sms">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Get Temp Number
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-blue-400" />}
              title="Realtime Reception"
              description="Emails and SMS arrive instantly via WebSocket architecture. No manual refreshing required."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-indigo-400" />}
              title="Total Anonymity"
              description="No registration required for basic features. Your data is wiped automatically."
            />
            <FeatureCard 
              icon={<Mail className="w-6 h-6 text-purple-400" />}
              title="Developer API"
              description="Automate testing workflows with our robust RESTful API and Webhooks."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-8"
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
