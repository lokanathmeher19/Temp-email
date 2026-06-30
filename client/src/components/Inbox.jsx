import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Inbox as InboxIcon, Sparkles, Pause, Play, RefreshCw, Trash2 } from 'lucide-react';

const Inbox = ({ messages, loading, onSelectMessage, autoSync, setAutoSync, countdown, onSyncNow, onDeleteMessage }) => {
  return (
    <div className="glass-panel rounded-2xl w-full max-w-4xl mx-auto overflow-hidden flex flex-col h-[600px] animate-fade-in relative">
      
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-md p-5 border-b border-slate-700/50 flex items-center justify-between sticky top-0 z-10">
        <h3 className="text-lg font-semibold flex items-center gap-3 text-slate-100">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <InboxIcon size={20} className="text-indigo-400" />
          </div>
          Inbox
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Sync Status */}
          {loading ? (
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium animate-pulse">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="ml-2 hidden sm:inline">Syncing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              {autoSync ? `Syncing in ${countdown}s` : 'Auto-sync paused'}
            </div>
          )}

          {/* Sync Controls */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/50">
            <button 
              onClick={() => setAutoSync(!autoSync)}
              className={`p-1.5 rounded-md transition-colors ${autoSync ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'}`}
              title={autoSync ? "Pause auto-sync" : "Enable auto-sync"}
            >
              {autoSync ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <button 
              onClick={onSyncNow}
              disabled={loading}
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              title="Sync now"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse-slow" />
              <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-xl relative z-10">
                <Sparkles size={48} className="text-indigo-400" />
              </div>
            </div>
            <p className="text-xl font-semibold text-slate-200">Your inbox is empty</p>
            <p className="text-sm mt-3 text-slate-400 max-w-xs">
              Waiting for incoming emails. 
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900 border-b border-slate-700/50 text-xs font-bold text-slate-300 uppercase tracking-widest">
              <div className="col-span-4 pl-2">Sender</div>
              <div className="col-span-6">Subject</div>
              <div className="col-span-2 text-right pr-2">View</div>
            </div>
            
            <ul className="divide-y divide-slate-800/50">
              {messages.map((msg, idx) => (
                <li 
                  key={msg.id} 
                  className="group cursor-pointer px-4 sm:px-6 py-4 hover:bg-slate-800/40 transition-all duration-300 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-4 relative animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                  onClick={() => onSelectMessage(msg.id)}
                >
                  {!msg.seen && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded-r-md" />
                  )}

                  {/* Sender Column */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 ${
                      msg.seen 
                        ? 'bg-slate-800 border border-slate-700/50' 
                        : 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30'
                    }`}>
                      <Mail size={18} className={msg.seen ? 'text-slate-500' : 'text-indigo-400'} />
                    </div>
                    <p className={`text-sm truncate ${msg.seen ? 'text-slate-400' : 'text-slate-200 font-semibold'}`} title={msg.from.address}>
                      {msg.from.address}
                    </p>
                  </div>
                  
                  {/* Subject Column */}
                  <div className="col-span-6 min-w-0 py-1 sm:py-0">
                    <p className={`text-sm truncate ${msg.seen ? 'text-slate-500' : 'text-slate-300 font-medium'}`} title={msg.subject || '(No Subject)'}>
                      {msg.subject || '(No Subject)'}
                    </p>
                  </div>
                  
                  {/* View/Time/Action Column */}
                  <div className="col-span-2 flex items-center sm:justify-end gap-2 mt-2 sm:mt-0">
                    <div className="text-xs text-slate-500 whitespace-nowrap font-medium">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMessage(msg.id);
                      }}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete message"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
