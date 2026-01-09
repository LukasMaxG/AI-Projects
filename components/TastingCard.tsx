import React from 'react';
import { WineData } from '../types';
import { Wine, MapPin, Award, Star, Share2, X, Download } from 'lucide-react';

interface TastingCardProps {
  wine: WineData;
  onClose: () => void;
}

export const TastingCard: React.FC<TastingCardProps> = ({ wine, onClose }) => {
  const score = wine.criticScores?.[0]?.score || 'N/A';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tasting: ${wine.name}`,
          text: `Just discovered this ${wine.vintage} ${wine.name} from ${wine.region}. Analysis by Sommelier AI.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(`Tasting: ${wine.name} (${wine.vintage}). Region: ${wine.region}. Rating: ${score}. Checked via Sommelier AI.`);
      alert('Tasting summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-wine-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xs animate-scale-up">
        {/* Card Header Actions */}
        <div className="absolute -top-12 left-0 right-0 flex justify-between px-2">
           <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
             <X className="w-5 h-5" />
           </button>
           <div className="flex gap-2">
             <button onClick={handleShare} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
               <Share2 className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* The Digital Card UI */}
        <div id="tasting-card" className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5 flex flex-col">
          {/* Top visual section */}
          <div className="h-48 bg-wine-900 relative flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gold-400 rounded-full blur-3xl"></div>
             </div>
             <img 
               src={wine.onlineImage || 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&q=80&w=400'} 
               className="h-full w-full object-cover mix-blend-overlay opacity-40 grayscale" 
               alt="" 
             />
             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl mb-3 border border-white/20">
                   <Wine className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-sans font-black text-xl leading-tight drop-shadow-lg line-clamp-2 uppercase tracking-tight">
                  {wine.name}
                </h3>
                <p className="text-wine-200 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                  Dossier Curated By Sommelier AI
                </p>
             </div>
          </div>

          {/* Bottom Info section */}
          <div className="p-6 space-y-4">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Provenance</p>
                   <div className="flex items-center gap-1.5 text-wine-900">
                      <MapPin className="w-3 h-3 text-wine-400" />
                      <span className="text-sm font-bold">{wine.vintage} {wine.region}, {wine.country}</span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Somm Rating</p>
                   <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-xl font-black text-wine-900 leading-none">{score}</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-wine-50/50 p-3 rounded-2xl border border-wine-100/50">
                   <p className="text-[8px] font-bold text-wine-400 uppercase tracking-widest mb-1">Body</p>
                   <p className="text-xs font-bold text-wine-900">{wine.styleProfile?.body || 'Medium'}</p>
                </div>
                <div className="bg-wine-50/50 p-3 rounded-2xl border border-wine-100/50">
                   <p className="text-[8px] font-bold text-wine-400 uppercase tracking-widest mb-1">ABV</p>
                   <p className="text-xs font-bold text-wine-900">{wine.abv}</p>
                </div>
             </div>

             <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Primary Tasting Notes</p>
                <div className="flex flex-wrap gap-1.5">
                   {wine.nose.split(',').slice(0, 3).map((note, i) => (
                      <span key={i} className="px-2.5 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold text-stone-600 lowercase italic">
                         {note.trim()}
                      </span>
                   ))}
                </div>
             </div>

             <div className="pt-4 border-t border-stone-100 flex justify-center">
                <div className="bg-wine-900 px-4 py-1 rounded-full flex items-center gap-2">
                   <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">Premium Selection</span>
                </div>
             </div>
          </div>
        </div>
        <p className="text-center text-wine-200/50 text-[10px] mt-6 font-medium">Screenshot this card to share with friends</p>
      </div>
    </div>
  );
};
