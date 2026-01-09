import React from 'react';
import { Wine, Sparkles, WifiOff } from 'lucide-react';

interface HeaderProps {
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isOnline = true }) => {
  return (
    <header className="bg-gradient-to-br from-wine-950 to-wine-900 text-wine-50 py-2.5 px-6 rounded-b-3xl shadow-xl mb-3 relative overflow-hidden">
      {/* Decorative background element - subtle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-wine-800/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="relative flex items-center justify-between z-10">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-wine-50 to-wine-200 drop-shadow-sm leading-tight">
              Sommelier AI
            </h1>
            {!isOnline && (
              <span className="bg-stone-500/40 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-white/10">
                <WifiOff className="w-2.5 h-2.5" /> Offline
              </span>
            )}
          </div>
          <p className="text-wine-200/80 text-[10px] font-bold tracking-[0.2em] uppercase leading-none mt-0.5">
            Intelligent Wine Analysis
          </p>
        </div>
        
        {/* Sleek Compact Logo */}
        <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-wine-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            {/* Icon Container */}
            <div className="relative bg-gradient-to-br from-wine-800/90 to-wine-950/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/10 flex items-center justify-center ring-1 ring-black/20">
                <Wine className="w-4 h-4 text-wine-100" strokeWidth={1.5} />
                
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 bg-gold-500 rounded-full p-0.5 border-2 border-wine-900 shadow-sm flex items-center justify-center">
                    <Sparkles className="w-1.5 h-1.5 text-white fill-white" />
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};