import React from 'react';
import { Wine, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-br from-wine-950 to-wine-900 text-wine-50 p-6 rounded-b-[2rem] shadow-xl mb-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-wine-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="relative flex items-center justify-between z-10">
        <div>
          <h1 className="text-3xl font-serif font-bold italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-wine-50 to-wine-200 drop-shadow-sm">
            Sommelier AI
          </h1>
          <p className="text-wine-200/90 text-sm font-medium mt-1 tracking-wide uppercase text-[0.65rem] letter-spacing-2">
            Intelligent Wine Analysis
          </p>
        </div>
        
        {/* Modern Logo Composite */}
        <div className="relative group">
            <div className="absolute inset-0 bg-wine-400 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-wine-800 to-wine-950 p-3 rounded-2xl shadow-lg border border-wine-700/50 flex items-center justify-center">
                <Wine className="w-8 h-8 text-wine-100" strokeWidth={1.5} />
                <div className="absolute -top-1 -right-1 bg-gold-500 rounded-full p-1 border-2 border-wine-900 shadow-sm">
                    <Sparkles className="w-3 h-3 text-white fill-white" />
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};