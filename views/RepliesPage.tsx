
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMessages } from '../store';
import { formatTimestamp } from '../utils/helpers';

const RepliesPage: React.FC = () => {
  const [allReplies, setAllReplies] = useState<any[]>([]);

  useEffect(() => {
    const msgs = getMessages();
    const flattened = msgs.flatMap(m => 
      m.replies.map(r => ({
        ...r,
        originalMessageId: m.id,
        originalContent: m.content
      }))
    ).sort((a, b) => b.timestamp - a.timestamp);
    setAllReplies(flattened);
  }, []);

  return (
    <div className="space-y-8 fade-in">
      <header className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          Balasan Baru 💖
        </h2>
        <p className="text-sm text-slate-400">Kata-kata yang membalas sebuah kejujuran. 🧸</p>
      </header>

      {allReplies.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="text-6xl float">💬</div>
          <p className="text-slate-400 font-bold italic">Belum ada balasan cinta...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {allReplies.map((reply) => (
            <Link 
              key={reply.id} 
              to={`/detail/${reply.originalMessageId}`}
              className="p-6 bg-white border border-rose-50 rounded-[2.5rem] shadow-lg shadow-rose-100/20 hover:bg-rose-50/30 transition-all flex flex-col gap-3 group"
            >
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{formatTimestamp(reply.timestamp)}</span>
                  <span className="text-rose-200 group-hover:text-rose-400 transition-colors">🧸</span>
                </div>
                <p className="text-slate-700 text-sm font-bold leading-relaxed">"{reply.content}"</p>
              </div>
              <div className="border-t border-rose-50 pt-3">
                <p className="text-[10px] text-slate-400 italic line-clamp-1 font-medium">
                  Membalas: <span className="text-slate-500">"{reply.originalContent}"</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepliesPage;
