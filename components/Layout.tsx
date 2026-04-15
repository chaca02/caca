
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/read', label: 'Baca', icon: '📖' },
    { path: '/send', label: 'Kirim', icon: '📩' },
    { path: '/replies', label: 'Balasan', icon: '💬' },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-x-hidden border-x border-slate-50">
      {/* Navbar Minimalis */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-center items-center border-b border-rose-50">
        <Link to="/" className="text-xl font-bold text-rose-400 tracking-tight flex items-center gap-2">
          <span className="text-2xl">🧸</span>
          <span>Confession</span>
        </Link>
      </nav>

      {/* Floating Navigation Dock (Tengah-Bawah) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-fit min-w-[280px]">
        <div className="bg-white/90 backdrop-blur-xl border border-rose-100/50 shadow-[0_20px_50px_-15px_rgba(251,113,133,0.3)] rounded-[2.5rem] p-1.5 flex justify-center items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex flex-col items-center gap-1 px-5 py-2.5 rounded-[1.8rem] transition-all duration-500 ease-out ${
                  isActive 
                  ? 'bg-rose-500 text-white scale-105 shadow-lg shadow-rose-200' 
                  : 'text-slate-400 hover:text-rose-300 hover:bg-rose-50/50'
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${isActive ? 'block' : 'hidden'} transition-all`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-8 pb-32 relative">
        {/* Subtle background hearts */}
        <div className="absolute top-10 right-5 text-rose-100/50 text-4xl rotate-12 -z-10">❤️</div>
        <div className="absolute bottom-40 left-5 text-rose-100/50 text-5xl -rotate-12 -z-10">💖</div>
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 pb-12 text-center border-t border-rose-50 bg-rose-50/20">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          🧸 Made with Love ❤️
        </p>
      </footer>
    </div>
  );
};

export default Layout;
