import React, { useState } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';

const EmailBox = ({ email, loading, onGenerateNew }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 w-full max-w-2xl mx-auto mt-10">
      <h2 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Your Temporary Email Address</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            readOnly
            value={loading ? 'Generating...' : (email || 'No email generated')}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white text-lg font-mono focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleCopy}
            disabled={loading || !email}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
            title="Copy to clipboard"
          >
            {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-gray-300" />}
          </button>
        </div>
        
        <button
          onClick={onGenerateNew}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>New</span>
        </button>
      </div>
    </div>
  );
};

export default EmailBox;
