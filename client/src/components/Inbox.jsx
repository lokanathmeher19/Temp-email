import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Loader2, Inbox as InboxIcon } from 'lucide-react';

const Inbox = ({ messages, loading, onSelectMessage }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 w-full max-w-4xl mx-auto mt-8 overflow-hidden flex flex-col h-[600px]">
      <div className="bg-gray-850 p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <InboxIcon size={20} className="text-blue-400" />
          Inbox
        </h3>
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Checking for emails...
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <Mail size={48} className="mb-4 text-gray-600 opacity-50" />
            <p className="text-lg font-medium">Your inbox is empty</p>
            <p className="text-sm mt-2">Waiting for incoming emails. This page auto-refreshes every 10 seconds.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {messages.map((msg) => (
              <li 
                key={msg.id} 
                className="hover:bg-gray-750 cursor-pointer transition-colors p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                onClick={() => onSelectMessage(msg.id)}
              >
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.seen ? 'bg-gray-700' : 'bg-blue-600'}`}>
                    <Mail size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${msg.seen ? 'text-gray-400' : 'text-gray-200 font-semibold'}`}>
                    {msg.from.address}
                  </p>
                  <p className={`text-base truncate ${msg.seen ? 'text-gray-300' : 'text-white font-medium'}`}>
                    {msg.subject || '(No Subject)'}
                  </p>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Inbox;
