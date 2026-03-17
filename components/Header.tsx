import React, { useState } from 'react';
import { Wine, Sparkles, WifiOff, LogIn, LogOut, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface HeaderProps {
  isOnline?: boolean;
  user?: any;
}

export const Header: React.FC<HeaderProps> = ({ isOnline = true, user }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuth = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      if (user) {
        await signOut(auth);
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log('Authentication cancelled by user.');
      } else {
        console.error("Auth error:", error);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <header className="bg-gradient-to-br from-wine-950 to-wine-900 text-wine-50 py-3 px-6 border-b border-white/10 mb-4 relative overflow-hidden">
      {/* Decorative background element - subtle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-wine-800/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="relative flex items-center justify-between z-10">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-light tracking-wide text-wine-50 leading-tight">
              Sommelier AI
            </h1>
            {!isOnline && (
              <span className="bg-stone-500/40 px-2 py-0.5 rounded text-[8px] font-medium uppercase tracking-widest flex items-center gap-1 border border-white/10">
                <WifiOff className="w-2.5 h-2.5" /> Offline
              </span>
            )}
          </div>
          <p className="text-wine-200/70 text-[9px] font-medium tracking-[0.25em] uppercase leading-none mt-1">
            Intelligent Wine Analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAuth}
            disabled={isAuthenticating}
            className={`text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 bg-gradient-to-br from-wine-800/80 to-wine-950/80 hover:from-wine-700/80 hover:to-wine-900/80 transition-all px-3 py-1.5 rounded-xl border border-white/10 shadow-sm ring-1 ring-black/20 text-wine-100 ${isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAuthenticating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : user ? (
              <>
                <img src={user.photoURL || ''} alt="" className="w-3.5 h-3.5 rounded-full ring-1 ring-white/20" />
                <span className="hidden sm:inline mt-0.5">Sign Out</span>
              </>
            ) : (
              <>
                <LogIn className="w-3 h-3" />
                <span className="mt-0.5">Sign In</span>
              </>
            )}
          </button>

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
      </div>
    </header>
  );
};