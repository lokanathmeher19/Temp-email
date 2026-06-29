import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader2, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

const EmailViewer = ({ messageId, token, onBack }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmail = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmail(response.data);
      } catch (err) {
        console.error('Failed to fetch email:', err);
        setError('Failed to load email content.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [messageId, token]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-full max-w-4xl mx-auto mt-8 h-[600px] flex items-center justify-center flex-col gap-4">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-gray-400">Loading email...</p>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-full max-w-4xl mx-auto mt-8 h-[600px] flex items-center justify-center flex-col gap-4">
        <p className="text-red-400">{error}</p>
        <button onClick={onBack} className="text-blue-400 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-full max-w-4xl mx-auto mt-8 flex flex-col h-[600px]">
      {/* Header / Actions */}
      <div className="bg-gray-850 p-4 border-b border-gray-700 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-300 hover:text-white"
          title="Back to inbox"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold truncate flex-1">{email.subject || '(No Subject)'}</h3>
      </div>

      {/* Meta Info */}
      <div className="p-4 border-b border-gray-700 bg-gray-900 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <User size={16} className="text-gray-400" />
          <span className="text-gray-400">From:</span>
          <span className="font-medium text-gray-200">{email.from.name} {`<${email.from.address}>`}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-400">Date:</span>
          <span className="text-gray-300">{format(new Date(email.createdAt), 'PPpp')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white text-gray-900 rounded-b-xl">
        {email.html ? (
          <iframe 
            srcDoc={email.html.map(h => h).join('')} 
            title="Email Content"
            className="w-full h-full border-none"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          />
        ) : (
          <div className="p-6 whitespace-pre-wrap font-sans text-sm">
            {email.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailViewer;
