'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold tracking-tighter">
              <span className="text-white">Temp</span>
              <span className="text-gradient">Email</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/mail" className="text-sm text-gray-300 hover:text-white transition-colors">Temporary Email</Link>
            <Link href="/sms" className="text-sm text-gray-300 hover:text-white transition-colors">Temporary SMS</Link>
            <Link href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Premium</Link>
            <Link href="/api-docs" className="text-sm text-gray-300 hover:text-white transition-colors">API</Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">Dashboard</Link>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-white">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-300 hover:text-white">Login</Link>
                <Link href="/register">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
