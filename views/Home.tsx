
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, registerUser, deleteAccount } from '../store';
import { UserAccount } from '../types';

const Home: React.FC = () => {
  const [user, setUser] = useState<UserAccount | null>(getCurrentUser());
  const [usernameInput, setUsernameInput] = useState('');

  const handleStart = () => {
    if (!usernameInput.trim()) return;
    const newUser = registerUser(usernameInput.trim());
    setUser(newUser);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ PERINGATAN: Menghapus akun akan membuatmu kehilangan akses ke inbox saat ini. Kamu harus membuat akun baru untuk mendapatkan link baru. Lanjutkan?')) {
      deleteAccount();
      setUser(null);
      setUsernameInput('');
    }
  };

  const copyMyLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/#/u/${user.username}`;
    navigator.clipboard.writeText(link);
    alert('Link Secreto-mu berhasil disalin! 🧸✨');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 py-8 fade-in">
      <div className="relative">
        <div className="text-9xl float mb-4 drop-shadow-xl">🧸</div>
        <div className="absolute -top-4 -right-4 text-4xl heart-beat drop-shadow-md">💖</div>
      </div>

      {!user ? (
        <div className="w-full space-y-8 px-4">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-slate-950 tracking-tight leading-tight">Mulai Rahasiamu 🧸</h1>
            <p className="text-base text-slate-700 font-bold px-4">
              Buat akun unikmu dan terima pesan anonim + lagu favorit dari teman-temanmu.
            </p>
          </div>
          
          <div className="space-y-5 bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-rose-100/30">
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Nama Panggilan / Username</label>
              <input 
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Contoh: BudiGemoy"
                className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-50 text-center font-black text-slate-900 placeholder:text-slate-300 transition-all"
              />
            </div>
            <button 
              onClick={handleStart}
              className="w-full py-6 bg-rose-500 text-white font-black rounded-[2rem] shadow-xl shadow-rose-200 active:scale-95 transition-all text-xl border-b-8 border-rose-700"
            >
              Buat Link Sekarang 📩
            </button>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Satu perangkat hanya diperbolehkan satu akun.</p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-10 px-4">
          <div className="space-y-2">
            <p className="text-xs text-rose-500 font-black uppercase tracking-[0.2em] mb-1">Akun Aktif</p>
            <h2 className="text-4xl font-black text-slate-950">Halo, {user.username}! 🧸</h2>
          </div>

          <div className="p-10 bg-white border-2 border-rose-100 rounded-[3.5rem] shadow-2xl shadow-rose-200/40 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">✨</div>
            
            <div className="space-y-3 text-left">
              <p className="text-[11px] text-slate-900 font-black uppercase tracking-widest ml-2">Link Rahasiamu:</p>
              <a 
                href={`${window.location.origin}/#/u/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-slate-900 rounded-3xl text-sm font-mono text-rose-100 break-all font-bold shadow-inner border-2 border-slate-800 hover:text-white transition-colors group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-slate-500 font-black uppercase">Klik untuk buka link</span>
                  <span className="text-lg">↗️</span>
                </div>
                {window.location.origin}/#/u/{user.username}
              </a>
            </div>

            <button 
              onClick={copyMyLink}
              className="w-full py-6 bg-rose-500 text-white font-black rounded-3xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-4 text-xl border-b-8 border-rose-700"
            >
              <span>Salin Link</span> 🔗
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Link to="/read" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-base font-black text-slate-900 shadow-md hover:bg-rose-50 hover:border-rose-300 transition-all flex flex-col items-center gap-2">
              <span className="text-2xl">📖</span>
              Inbox
            </Link>
            <Link to="/replies" className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-base font-black text-slate-900 shadow-md hover:bg-rose-50 hover:border-rose-300 transition-all flex flex-col items-center gap-2">
              <span className="text-2xl">💬</span>
              Balasan
            </Link>
          </div>

          <div className="pt-10 border-t-2 border-slate-50">
            <button 
              onClick={handleDeleteAccount}
              className="group flex items-center gap-3 mx-auto px-6 py-3 bg-slate-100 rounded-full text-xs font-black text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-widest"
            >
              <span>🗑️ Hapus Akun & Buat Baru</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
