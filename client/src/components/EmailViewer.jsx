import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader2, User, Clock, ChevronLeft, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const EmailViewer = ({ messageId, token, onBack, onDelete }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/messages/${messageId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${email?.subject || 'message'}.eml`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download email:', err);
      alert('Failed to download the email file.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl w-full max-w-4xl mx-auto h-[600px] flex flex-col items-center justify-center gap-6 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
        <Loader2 size={40} className="animate-spin text-indigo-400 relative z-10" />
        <p className="text-slate-300 font-medium text-lg relative z-10 animate-pulse">Decrypting secure message...</p>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="glass-panel rounded-2xl w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center flex-col gap-6 animate-fade-in">
        <p className="text-rose-400 font-semibold text-lg">{error}</p>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl transition-all active:scale-95 border border-slate-700/50 shadow-lg"
        >
          <ArrowLeft size={18} /> Return to Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl w-full max-w-4xl mx-auto flex flex-col h-[600px] animate-fade-in overflow-hidden shadow-2xl">
      {/* Top Action Bar */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-700/50 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
          <button 
            onClick={onBack}
            className="p-2 shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white group shadow-sm active:scale-95"
            title="Back to inbox"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h3 className="text-lg font-bold text-slate-100 truncate">{email.subject || '(No Subject)'}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="flex items-center shrink-0 p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition-all shadow-sm active:scale-95"
            title="Delete email"
          >
            <Trash2 size={16} />
          </button>
          
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center shrink-0 gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium border border-slate-700/50 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Download original email (.eml)"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span className="hidden sm:inline">Download EML</span>
          </button>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="p-5 border-b border-slate-700/50 bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shrink-0">
            <User size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-200 text-base truncate">{email.from.name || 'Unknown Sender'}</span>
            <span className="text-slate-400 truncate">{email.from.address}</span>
          </div>
        </div>
        <div className="flex items-center shrink-0 gap-2 text-sm bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700/50 self-start sm:self-auto">
          <Clock size={16} className="text-slate-400" />
          <span className="text-slate-300 font-medium">{format(new Date(email.createdAt), 'PPp')}</span>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-auto bg-slate-50 text-slate-900 custom-scrollbar relative">
        {email.html ? (
          <iframe 
            srcDoc={email.html.map(h => h).join('')} 
            title="Email Content"
            className="w-full h-full border-none"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          />
        ) : (
          <div className="p-8 whitespace-pre-wrap font-sans text-base leading-relaxed text-slate-700">
            {email.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailViewer;
