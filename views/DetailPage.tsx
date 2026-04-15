
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessages, addReply, toggleBookmark } from '../store';
import { ConfessMessage, SongData } from '../types';
import { formatTimestamp, parseSongUrl } from '../utils/helpers';
import SongEmbed from '../components/SongEmbed';

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<ConfessMessage | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);

  const loadMessage = () => {
    const msgs = getMessages();
    const found = msgs.find(m => m.id === id);
    if (found) setMessage(found);
  };

  useEffect(() => {
    loadMessage();
  }, [id]);

  const handleReply = () => {
    if (!replyContent.trim() || !id) return;
    addReply(id, replyContent.trim());
    setReplyContent('');
    setShowForm(false);
    loadMessage();
  };

  const handleToggleBookmarkInDetail = () => {
    if (id) {
      toggleBookmark(id);
      loadMessage();
    }
  };

  const handleShare = async () => {
    if (!message) return;
    
    let shareText = `Confession Anonim untuk @${message.targetUsername}:\n\n"${message.content}"`;
    
    if (message.song) {
      shareText += `\n\n🎵 Mendengarkan: ${message.song.title} - ${message.song.artist}`;
    }
    
    shareText += `\n\nLihat & balas di sini: ${window.location.href}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Confession Rahasia 🧸',
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareStatus(true);
        setTimeout(() => setShareStatus(false), 2000);
        alert('Teks berhasil disalin! Silakan tempel di Story atau Sosmed-mu. 🧸✨');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (!message) return <div className="p-20 text-center animate-pulse text-rose-500 font-black uppercase tracking-[0.5em] text-sm">Loading Rahasia... 🧸</div>;

  return (
    <div className="space-y-10 fade-in pb-28">
      <header className="flex items-center justify-between px-2">
        <Link to="/read" className="text-xs text-slate-900 font-black border-b-4 border-rose-400 pb-1 hover:text-rose-600 transition-all">← KEMBALI</Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleToggleBookmarkInDetail}
            className={`p-3 rounded-2xl border-2 transition-all ${message.isBookmarked ? 'bg-amber-50 border-amber-200 text-amber-500 scale-110 shadow-md' : 'bg-white border-slate-100 text-slate-200'}`}
          >
            <span className="text-2xl leading-none">{message.isBookmarked ? '⭐' : '☆'}</span>
          </button>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border-2 border-slate-100">{formatTimestamp(message.timestamp)}</span>
        </div>
      </header>

      <div className="p-10 bg-white rounded-[4rem] border-2 border-slate-100 space-y-10 relative overflow-hidden shadow-2xl shadow-rose-100/40">
        <div className="absolute top-6 right-10 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] italic bg-rose-50 px-4 py-1.5 rounded-full">
          DARI: {message.sender || 'ANONIM'} 🧸
        </div>
        
        <p className="text-3xl text-slate-950 leading-tight font-black pt-12">
          "{message.content}"
        </p>

        {message.song && (
          <div className="pt-8 border-t-4 border-rose-50">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center text-xl shadow-lg animate-bounce">🎵</span>
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Lagu Pengiring</span>
            </div>
            <SongEmbed song={message.song} />
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Balasan ({message.replies.length})</h3>
        </div>

        {!showForm ? (
          <div className="flex flex-col gap-4 px-2">
            <div className="flex gap-4">
              <button 
                onClick={() => setShowForm(true)} 
                className="flex-1 py-7 bg-slate-900 text-white text-sm font-black rounded-3xl hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 border-b-8 border-slate-700 active:scale-95"
              >
                <span className="text-2xl">🧸</span>
                <span>Balas Pesan</span>
              </button>
              
              <button 
                onClick={handleShare}
                className={`w-20 h-20 flex-shrink-0 ${shareStatus ? 'bg-emerald-500' : 'bg-rose-500'} text-white rounded-3xl shadow-xl shadow-rose-200 flex items-center justify-center transition-all active:scale-90 border-b-8 ${shareStatus ? 'border-emerald-700' : 'border-rose-700'}`}
                title="Bagikan"
              >
                <span className="text-3xl">{shareStatus ? '✅' : '📤'}</span>
              </button>
            </div>
            
            <button 
              onClick={handleShare}
              className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <span>Bagikan ke Story / Sosmed</span>
              <span className="text-base">📱</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 bg-white p-8 rounded-[3rem] shadow-2xl border-2 border-rose-100 fade-in">
            <textarea 
              value={replyContent} 
              onChange={(e) => setReplyContent(e.target.value)} 
              placeholder="Tulis balasan jujurmu... ❤️" 
              className="w-full p-8 bg-slate-50 border-2 border-slate-200 rounded-[2rem] resize-none focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 text-base font-black text-slate-900 shadow-inner" 
              rows={4}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowForm(false)} className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-rose-600">BATAL</button>
              <button onClick={handleReply} disabled={!replyContent.trim()} className="flex-1 py-7 bg-rose-500 text-white text-sm font-black rounded-3xl shadow-xl border-b-8 border-rose-700">KIRIM BALASAN ❤️</button>
            </div>
          </div>
        )}

        <div className="space-y-6 px-2">
          {message.replies.map((reply) => (
            <div key={reply.id} className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-lg fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-slate-100"></div>
              <p className="text-slate-900 text-lg font-bold leading-relaxed">"{reply.content}"</p>
              <div className="flex justify-between items-center mt-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{formatTimestamp(reply.timestamp)}</span>
                <span className="text-xl">🤍</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
