
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMessagesForUser, getCurrentUser, logout, toggleBookmark, deleteMessage } from '../store';
import { ConfessMessage, UserAccount } from '../types';
import { formatTimestamp } from '../utils/helpers';

const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserAccount | null>(getCurrentUser());
  const [messages, setMessages] = useState<ConfessMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'bookmarks'>('all');

  const loadMessages = () => {
    if (user) {
      setMessages(getMessagesForUser(user.username));
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadMessages();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleToggleBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(id);
    loadMessages();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Yakin ingin menghapus pesan ini selamanya?')) {
      deleteMessage(id);
      loadMessages();
    }
  };

  if (!user) return null;

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => m.isBookmarked);

  return (
    <div className="space-y-10 fade-in">
      <header className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-slate-950 tracking-tighter">Inbox 📖</h2>
            <p className="text-sm text-rose-600 font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              {messages.length} Pesan Masuk
            </p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-900 hover:bg-slate-200 uppercase tracking-widest transition-all">Logout</button>
        </div>

        <div className="flex bg-slate-200 p-2 rounded-[2rem] border-2 border-slate-300 shadow-inner">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${filter === 'all' ? 'bg-white text-slate-900 shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Semua
          </button>
          <button 
            onClick={() => setFilter('bookmarks')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${filter === 'bookmarks' ? 'bg-white text-rose-600 shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            ⭐ Tersimpan
          </button>
        </div>
      </header>

      {filteredMessages.length === 0 ? (
        <div className="py-24 text-center space-y-8 bg-white rounded-[3rem] border-2 border-slate-100 shadow-inner">
          <div className="text-8xl float grayscale opacity-50">{filter === 'all' ? '📭' : '⭐'}</div>
          <div className="space-y-2 px-6">
            <p className="text-slate-900 font-black text-xl">
              {filter === 'all' ? 'Kosong melompong...' : 'Belum ada simpanan.'}
            </p>
            <p className="text-slate-500 font-bold text-sm">
              {filter === 'all' ? 'Bagikan linkmu ke Story biar makin rame!' : 'Tekan bintang pada pesan untuk menyimpannya.'}
            </p>
          </div>
          <button 
            onClick={() => {
              const link = `${window.location.origin}/#/u/${user.username}`;
              navigator.clipboard.writeText(link);
              alert('Link disalin! 🧸');
            }}
            className="px-8 py-5 bg-rose-500 text-white text-sm font-black rounded-3xl shadow-xl shadow-rose-200 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-rose-700"
          >
            Salin Link 🧸✨
          </button>
        </div>
      ) : (
        <div className="grid gap-8">
          {filteredMessages.map((msg) => (
            <Link 
              key={msg.id} 
              to={`/detail/${msg.id}`}
              className="p-8 bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 hover:translate-y-[-6px] hover:border-rose-100 transition-all flex flex-col gap-5 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-3 h-full bg-rose-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{formatTimestamp(msg.timestamp)}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => handleToggleBookmark(e, msg.id)}
                    className={`p-3 rounded-2xl transition-all border-2 ${msg.isBookmarked ? 'bg-amber-50 border-amber-200 text-amber-500 scale-110 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-300 hover:text-amber-300 hover:border-amber-100'}`}
                  >
                    <span className="text-2xl leading-none">{msg.isBookmarked ? '⭐' : '☆'}</span>
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, msg.id)}
                    className="p-3 rounded-2xl transition-all bg-slate-50 border-2 border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 shadow-sm"
                  >
                    <span className="text-xl leading-none">🗑️</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                {msg.song && (
                  <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg shadow-rose-100 animate-pulse">
                    🎵
                  </div>
                )}
                <p className="text-slate-950 text-xl font-black leading-tight line-clamp-3">
                  "{msg.content}"
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t-2 border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Pengirim:</span>
                  <span className="text-xs font-black text-rose-600 tracking-tight">{msg.sender || 'Anonim 🧸'}</span>
                </div>
                <div className="bg-slate-900 text-white px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                  {msg.replies.length} Balasan
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxPage;
