
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveMessage } from '../store';
import { generateId, parseSongUrl } from '../utils/helpers';
import { SongData } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [sender, setSender] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [songData, setSongData] = useState<SongData | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);

  const identifySongMetadata = async (url: string, baseData: SongData) => {
    setIsIdentifying(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analisis lagu dari link ini: "${url}". Berikan hasil JSON: { "title": string, "artist": string, "chorus_start_second": number }. "chorus_start_second" adalah detik bagian REFF/Chorus dimulai. Jika tidak yakin, berikan angka 45.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              chorus_start_second: { type: Type.NUMBER }
            },
            required: ["title", "artist", "chorus_start_second"]
          }
        }
      });

      const metadata = JSON.parse(response.text);
      if (metadata.title && metadata.artist) {
        setSongData({
          ...baseData,
          title: metadata.title,
          artist: metadata.artist,
          startTime: metadata.chorus_start_second
        });
      }
    } catch (error) {
      console.error("Link identification failed:", error);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setSongUrl(url);
    if (url) {
      const parsed = parseSongUrl(url);
      if (parsed) {
        setSongData(parsed);
        if (url.length > 15) {
          identifySongMetadata(url, parsed);
        }
      } else {
        setSongData(null);
      }
    } else {
      setSongData(null);
    }
  };

  const handleSend = () => {
    if (!content.trim() || !username) return;

    setIsSending(true);
    
    // Simulate a brief delay for animation feedback
    setTimeout(() => {
      const newMessage = {
        id: generateId(),
        targetUsername: username,
        receiver: username,
        sender: sender.trim() || undefined,
        content: content.trim(),
        timestamp: Date.now(),
        song: songData || undefined,
        replies: []
      };

      saveMessage(newMessage);
      setIsSent(true);
      setIsSending(false);
    }, 800);
  };

  if (isSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 fade-in text-center p-6">
        <div className="text-9xl drop-shadow-2xl">🎉</div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-950">Pesan Terkirim!</h2>
          <p className="text-lg text-slate-700 font-bold max-w-xs mx-auto">
            Rahasiamu sudah sampai ke tangan <span className="text-rose-600">@{username}</span>. 🧸✨
          </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="w-full max-w-xs py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl active:scale-95 transition-all text-xl border-b-8 border-slate-700"
        >
          Buat Link Sendiri 🧸
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 fade-in pb-12">
      <header className="text-center space-y-4">
        <div className="w-28 h-28 bg-white rounded-full mx-auto flex items-center justify-center text-5xl shadow-2xl border-4 border-rose-100 ring-8 ring-rose-50/50">🧸</div>
        <div className="space-y-1">
          <p className="text-[10px] text-rose-500 font-black uppercase tracking-[0.3em]">Confession Untuk</p>
          <h2 className="text-4xl font-pacifico text-slate-950 mt-2">@{username}</h2>
        </div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest bg-slate-100 py-2 px-6 rounded-full inline-block">🔒 Identitasmu 100% Anonim</p>
      </header>

      <div className="space-y-8 bg-white p-10 rounded-[4rem] border-2 border-slate-100 shadow-2xl shadow-rose-100/30">
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Isi Pesanmu:</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis pesan rahasiamu di sini... ❤️"
            className="w-full h-56 p-8 bg-slate-50 border-2 border-slate-200 rounded-[3rem] focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 text-slate-950 font-black text-xl leading-relaxed shadow-inner placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Namamu (Opsional):</label>
            <input 
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Anonim / Inisial..."
              className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:outline-none focus:border-rose-400 text-lg font-black text-slate-950 placeholder:text-slate-300"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Lagu YouTube/Spotify (Link):</label>
            <input 
              type="text"
              value={songUrl}
              onChange={handleUrlChange}
              placeholder="Tempel link lagu pengiring..."
              className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:outline-none focus:border-rose-400 text-lg font-black text-slate-950 placeholder:text-slate-300"
            />
            
            {isIdentifying && (
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 animate-pulse">
                <span className="text-xl">🔍</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mengenali Lagu...</p>
              </div>
            )}

            {!isIdentifying && songData && (
              <div className={`p-6 text-white rounded-[2.5rem] shadow-xl fade-in flex items-center gap-4 relative overflow-hidden group border-b-4 ${songData.platform === 'YouTube' ? 'bg-rose-500 border-rose-800' : 'bg-emerald-500 border-emerald-800'}`}>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
                  {songData.platform === 'YouTube' ? '🎬' : '🎧'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-black truncate leading-tight tracking-tight">{songData.title || 'Lagu Terdeteksi'}</p>
                  <p className="text-[10px] opacity-90 font-black truncate uppercase tracking-widest">{songData.artist || 'Artis'}</p>
                </div>
                <button onClick={() => {setSongData(null); setSongUrl('');}} className="p-3 bg-white/20 hover:bg-white/40 rounded-full transition-all text-sm font-black">✕</button>
              </div>
            )}
          </div>
        </div>

        <button 
          disabled={!content.trim() || isSending || isIdentifying}
          onClick={handleSend}
          className={`w-full py-8 ${isSending ? 'bg-rose-400' : 'bg-rose-500'} text-white font-black rounded-[3rem] shadow-2xl shadow-rose-200 disabled:opacity-50 active:scale-95 hover:scale-[1.01] transition-all mt-6 text-2xl border-b-8 border-rose-800 flex items-center justify-center gap-4 relative overflow-hidden group`}
        >
          <span className={`${isSending ? 'animate-ping' : ''}`}>{isSending ? '🚀' : '📩'}</span>
          <span>{isSending ? 'Mengirim...' : 'Kirim Anonim'}</span>
          
          <div 
            className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 pointer-events-none group-hover:animate-shine" 
            style={{ animation: isSending ? 'none' : '' }}
          />
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;