
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SongMode, SongData, SongPlatform } from '../types';
import { getGlobalSongMode, setGlobalSongMode, saveMessage } from '../store';
import { parseSongUrl, generateId, sanitizeId } from '../utils/helpers';
import { GoogleGenAI, Type } from "@google/genai";

const SendPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SongMode>(getGlobalSongMode());
  const [receiver, setReceiver] = useState('');
  const [sender, setSender] = useState('');
  const [content, setContent] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [songData, setSongData] = useState<SongData | null>(null);
  const [validationMsg, setValidationMsg] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPlatform, setSearchPlatform] = useState<SongPlatform>('YouTube');
  const [isSearching, setIsSearching] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setGlobalSongMode(mode);
  }, [mode]);

  const identifySongMetadata = async (url: string, baseData: SongData) => {
    setIsIdentifying(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analisis lagu dari link ini: "${url}". Berikan hasil JSON: { "title": string, "artist": string, "chorus_start_second": number }. "chorus_start_second" adalah detik bagian REFF dimulai. Jika tidak yakin, berikan angka 40.`,
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

  const handleSearchSongs = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const platformPrompt = searchPlatform === 'YouTube' 
        ? 'Gunakan youtube_id yang berupa 11 karakter string murni.' 
        : 'Gunakan spotify_id berupa string murni ID track.';

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Cari lagu "${searchQuery}" di ${searchPlatform}. ${platformPrompt} Berikan list 5 lagu JSON dengan field: title, artist, platform_id, chorus_start_second.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                platform_id: { type: Type.STRING },
                chorus_start_second: { type: Type.NUMBER }
              },
              required: ["title", "artist", "platform_id", "chorus_start_second"]
            }
          }
        }
      });
      const data = JSON.parse(response.text);
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setValidationMsg("Gagal mencari lagu. Coba lagi nanti.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectSong = (song: any) => {
    const cleanId = sanitizeId(song.platform_id, searchPlatform);
    const url = searchPlatform === 'YouTube' 
      ? `https://www.youtube.com/watch?v=${cleanId}`
      : `https://open.spotify.com/track/${cleanId}`;

    const data: SongData = {
      id: cleanId,
      platform: searchPlatform,
      url: url,
      title: song.title,
      artist: song.artist,
      startTime: song.chorus_start_second
    };
    setSongData(data);
    setSongUrl(data.url);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setValidationMsg('');
  };

  const clearSongSelection = () => {
    setSongData(null);
    setSongUrl('');
    setSearchQuery('');
    setValidationMsg('');
  };

  const isButtonDisabled = (mode === 'WAJIB' && !songData) || isIdentifying || content.trim().length === 0 || receiver.trim().length === 0;

  const handleSend = () => {
    if (!receiver.trim()) {
      setValidationMsg('Nama penerima wajib diisi ya! 🧸');
      return;
    }
    if (!content.trim()) {
      setValidationMsg('Isi pesannya dulu ya... ❤️');
      return;
    }
    if (mode === 'WAJIB' && !songData) {
      setValidationMsg('Pilih lagu dulu ya, karena mode WAJIB aktif! 🔒');
      return;
    }
    
    const newMessage = {
      id: generateId(),
      targetUsername: receiver.trim(),
      receiver: receiver.trim(),
      sender: sender.trim() || undefined,
      content,
      timestamp: Date.now(),
      song: songData || undefined,
      replies: []
    };
    saveMessage(newMessage);
    navigate('/read');
  };

  return (
    <div className="space-y-10 fade-in pb-12">
      <header className="space-y-2 text-center">
        <h2 className="text-5xl font-black text-slate-950 tracking-tight">Songfess 🧸</h2>
        <p className="text-sm text-slate-600 font-bold uppercase tracking-widest">Katakan lewat lagu, biarkan dia tahu.</p>
      </header>

      {/* Mode Toggle High Contrast */}
      <div className="bg-slate-200 p-2 rounded-[2.5rem] flex border-2 border-slate-300 shadow-inner relative overflow-hidden">
        <div 
          className={`absolute top-2 bottom-2 w-[calc(50%-4px)] bg-slate-900 rounded-[2rem] transition-all duration-500 ease-out shadow-xl ${mode === 'OPSIONAL' ? 'translate-x-[100%]' : 'translate-x-0'}`}
        ></div>
        <button 
          onClick={() => setMode('WAJIB')}
          className={`flex-1 py-4 text-xs font-black rounded-3xl transition-all duration-300 uppercase tracking-widest z-10 ${mode === 'WAJIB' ? 'text-white' : 'text-slate-500'}`}
        >
          🔒 Lagu Wajib
        </button>
        <button 
          onClick={() => setMode('OPSIONAL')}
          className={`flex-1 py-4 text-xs font-black rounded-3xl transition-all duration-300 uppercase tracking-widest z-10 ${mode === 'OPSIONAL' ? 'text-white' : 'text-slate-500'}`}
        >
          🧸 Lagu Bebas
        </button>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 shadow-2xl shadow-rose-100/30">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Untuk:</label>
            <input 
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Username Penerima..."
              className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all text-lg font-black text-slate-950 placeholder:text-slate-300 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Dari (Opsional):</label>
            <input 
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Namamu / Inisial..."
              className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all text-lg font-black text-slate-950 placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Pesan Rahasiamu:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan isi hatimu... ❤️"
            className="w-full h-56 p-8 bg-slate-50 border-2 border-slate-200 rounded-[3rem] resize-none focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all text-slate-950 placeholder:text-slate-300 font-black text-xl leading-relaxed shadow-inner"
          ></textarea>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎵</span>
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Pilih Lagu</label>
              {mode === 'WAJIB' && <span className="text-[9px] bg-rose-600 text-white px-3 py-1 rounded-full font-black">WAJIB</span>}
            </div>
            
            {!songData && !showSearch && (
              <button 
                onClick={() => setShowSearch(true)}
                className="text-[11px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 border-2 border-rose-100 px-6 py-3 rounded-2xl hover:bg-rose-100 transition-all active:scale-95"
              >
                Cari Judul 🔍
              </button>
            )}
          </div>
          
          {isIdentifying && (
            <div className="p-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 animate-pulse">
               <span className="text-3xl">🔍</span>
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Mengenali Lagu...</p>
            </div>
          )}

          {!isIdentifying && !songData && (
            showSearch ? (
              <div className="space-y-6 bg-slate-950 p-8 rounded-[3rem] shadow-2xl fade-in border-b-8 border-rose-500">
                <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                  <button onClick={() => setSearchPlatform('YouTube')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${searchPlatform === 'YouTube' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}>YouTube 🎬</button>
                  <button onClick={() => setSearchPlatform('Spotify')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${searchPlatform === 'Spotify' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>Spotify 🎧</button>
                </div>
                <div className="flex gap-3">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchSongs()} placeholder="Judul lagu..." className="flex-1 p-5 bg-slate-900 border-2 border-slate-700 rounded-2xl focus:outline-none focus:border-rose-400 transition-all text-base font-black text-white" />
                  <button onClick={handleSearchSongs} disabled={isSearching} className={`px-8 text-white rounded-2xl text-xs font-black transition-all active:scale-95 shadow-xl ${searchPlatform === 'YouTube' ? 'bg-rose-600' : 'bg-emerald-600'}`}>{isSearching ? '...' : 'CARI'}</button>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                  {!isSearching && searchResults.map((result, idx) => (
                    <button key={idx} onClick={() => selectSong(result)} className="w-full p-5 text-left hover:bg-slate-800 bg-slate-900/50 rounded-2xl transition-all flex items-center gap-5 border-2 border-transparent hover:border-slate-700 group">
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-700">{searchPlatform === 'YouTube' ? '🎬' : '🎧'}</div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-base font-black text-white truncate leading-tight">{result.title}</p>
                        <p className="text-[11px] text-slate-500 font-black truncate uppercase tracking-widest">{result.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowSearch(false)} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] py-2 hover:text-white transition-colors">Batal</button>
              </div>
            ) : (
              <input type="text" value={songUrl} onChange={handleUrlChange} placeholder="Tempel link YouTube/Spotify..." className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] focus:outline-none focus:border-rose-400 transition-all text-slate-950 text-base font-black shadow-sm placeholder:text-slate-300" />
            )
          )}

          {!isIdentifying && songData && (
            <div className="space-y-4">
              <div className={`p-8 text-white rounded-[3rem] shadow-2xl fade-in flex items-center gap-6 relative overflow-hidden group border-b-8 ${songData.platform === 'YouTube' ? 'bg-rose-600 shadow-rose-200 border-rose-800' : 'bg-emerald-600 shadow-emerald-200 border-emerald-800'}`}>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/20">{songData.platform === 'YouTube' ? '🎬' : '🎧'}</div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-2xl font-black truncate leading-tight tracking-tight">{songData.title || 'Lagu Terpilih'}</p>
                  <p className="text-xs opacity-90 font-black truncate uppercase tracking-widest">{songData.artist || 'Artis'}</p>
                </div>
                <button onClick={clearSongSelection} className="p-5 bg-white/20 hover:bg-white/40 rounded-full transition-all text-2xl font-black shadow-lg">✕</button>
              </div>
              
              {/* Prominent Metadata Confirmation */}
              <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] flex flex-col items-center text-center space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Konfirmasi Lagu:</p>
                 <h4 className="text-xl font-black text-slate-900 leading-tight">{songData.title}</h4>
                 <p className="text-sm font-bold text-rose-500 italic">{songData.artist}</p>
              </div>
            </div>
          )}
        </div>

        {validationMsg && (
          <div className="bg-rose-50 border-2 border-rose-200 py-6 px-8 rounded-[2.5rem] fade-in flex items-center justify-center gap-4 shadow-xl shadow-rose-100">
            <span className="text-3xl">🧸</span>
            <p className="text-sm text-rose-700 font-black uppercase tracking-tight">{validationMsg}</p>
          </div>
        )}

        <button 
          disabled={isButtonDisabled}
          onClick={handleSend}
          className={`w-full py-8 font-black text-3xl rounded-[3rem] transition-all shadow-2xl active:scale-[0.96] flex items-center justify-center gap-5 ${isButtonDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-b-0' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-300 border-b-8 border-rose-800'}`}
        >
          <span>Kirim Sekarang</span>
          <span className="text-4xl">📩</span>
        </button>
      </div>
    </div>
  );
};

export default SendPage;
