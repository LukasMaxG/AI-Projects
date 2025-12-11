import React from 'react';
import { Wine, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-br from-wine-950 to-wine-900 text-wine-50 py-4 px-6 rounded-b-3xl shadow-xl mb-6 relative overflow-hidden">
      {/* Decorative background element - subtle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-wine-800/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="relative flex items-center justify-between z-10">
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-serif font-bold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-wine-50 to-wine-200 drop-shadow-sm leading-tight">
            Sommelier AI
          </h1>
          <p className="text-wine-200/80 text-[10px] font-bold tracking-[0.2em] uppercase">
            Intelligent Wine Analysis
          </p>
        </div>
        
        {/* Sleek Compact Logo */}
        <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-wine-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            {/* Icon Container */}
            <div className="relative bg-gradient-to-br from-wine-800/90 to-wine-950/90 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-white/10 flex items-center justify-center ring-1 ring-black/20">
                <Wine className="w-5 h-5 text-wine-100" strokeWidth={1.5} />
                
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 bg-gold-500 rounded-full p-0.5 border-2 border-wine-900 shadow-sm flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white fill-white" />
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};