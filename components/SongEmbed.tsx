
import React from 'react';
import { SongData } from '../types';

const SongEmbed: React.FC<{ song: SongData }> = ({ song }) => {
  if (!song || !song.id) return null;

  const isYouTube = song.platform === 'YouTube';
  
  // Jika YouTube ID tidak valid (bukan 11 karakter), jangan render
  if (isYouTube && song.id.length !== 11) return (
    <div className="p-4 bg-rose-50 rounded-2xl text-[10px] text-rose-400 font-bold border border-rose-100">
      ⚠️ Link video tidak valid
    </div>
  );

  // YouTube start time parameter
  const startParam = isYouTube && song.startTime ? `&start=${song.startTime}` : '';

  return (
    <div className="mt-4 space-y-3 fade-in">
      <div className="rounded-[2rem] overflow-hidden aspect-video bg-slate-900 shadow-2xl shadow-rose-200/20 border-2 border-white relative">
        {isYouTube ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${song.id}?autoplay=0&rel=0&modestbranding=1${startParam}`}
            title="YouTube Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        ) : (
          <iframe
            src={`https://open.spotify.com/embed/track/${song.id}?utm_source=generator&theme=0`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full h-full"
          ></iframe>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        {song.title && (
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sedang Diputar:</p>
            <p className="text-xs font-bold text-slate-800 truncate">{song.title} - {song.artist}</p>
          </div>
        )}
        <a 
          href={song.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-2.5 ${isYouTube ? 'bg-rose-500' : 'bg-emerald-500'} text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-100/50`}
        >
          <span>{isYouTube ? '🎬' : '🎧'}</span> Putar Lengkap di {song.platform}
        </a>
      </div>
    </div>
  );
};

export default SongEmbed;