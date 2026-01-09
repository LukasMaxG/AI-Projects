import React, { useMemo } from 'react';
import { CellarItem, WineData } from '../types';
import { Package, DollarSign, Calendar, Minus, Plus, Trash2, PieChart, Map, Award } from 'lucide-react';

interface CellarDashboardProps {
  items: CellarItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onViewWine: (wine: WineData) => void;
}

const estimatePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  const clean = priceStr.replace(/[^\d.-]/g, '');
  if (clean.includes('-')) {
    const [min, max] = clean.split('-').map(Number);
    return (min + max) / 2;
  }
  return Number(clean) || 0;
};

export const CellarDashboard: React.FC<CellarDashboardProps> = ({ items, onUpdateQuantity, onRemoveItem, onViewWine }) => {
  
  const stats = useMemo(() => {
    let totalBottles = 0;
    let totalValue = 0;
    let readyToDrink = 0;
    const regionCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const currentYear = new Date().getFullYear();

    items.forEach(item => {
      totalBottles += item.quantity;
      const unitValue = item.purchasePrice || estimatePrice(item.wine.marketPrice);
      totalValue += unitValue * item.quantity;

      if (item.wine.aging?.peakYears) {
        const peak = item.wine.aging.peakYears.split('-').map(y => parseInt(y.trim()));
        if (currentYear >= peak[0] && currentYear <= (peak[1] || peak[0])) {
          readyToDrink += item.quantity;
        }
      }

      const region = item.wine.region || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + item.quantity;
      
      const type = item.wine.type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + item.quantity;
    });

    const topRegions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const diversity = Object.keys(typeCounts).length;

    return { totalBottles, totalValue, readyToDrink, topRegions, diversity };
  }, [items]);

  return (
    <div className="animate-fade-in pb-24">
      
      {/* 1. Dashboard Summary Card */}
      <div className="bg-gradient-to-br from-wine-950 to-wine-900 text-white p-6 rounded-[2.5rem] shadow-2xl mb-8 relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-wine-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-wine-200 mb-1">Portfolio Value</h2>
                <p className="text-4xl font-serif font-black text-white tracking-tighter drop-shadow-sm">
                  ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
             </div>
             <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                <Award className="w-6 h-6 text-gold-400" />
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] text-wine-300 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                <Package className="w-3 h-3" /> Inventory
              </p>
              <p className="text-xl font-bold">{stats.totalBottles} <span className="text-[10px] font-normal text-wine-300">Bottles</span></p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] text-wine-300 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Readiness
              </p>
              <p className="text-xl font-bold text-gold-400">{stats.readyToDrink} <span className="text-[10px] font-normal text-wine-300">Ready</span></p>
            </div>
          </div>

          {/* New Analytics Row */}
          <div className="mt-4 bg-black/20 p-4 rounded-2xl flex justify-between items-center backdrop-blur-md">
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-wine-400 mb-1 flex items-center gap-1">
                  <Map className="w-3 h-3" /> Core Region
                </span>
                <span className="text-sm font-bold truncate max-w-[120px]">
                  {stats.topRegions[0]?.[0] || 'TBD'}
                </span>
             </div>
             <div className="h-8 w-px bg-white/10"></div>
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-wine-400 mb-1 flex items-center gap-1">
                   Diversity <PieChart className="w-3 h-3" />
                </span>
                <span className="text-sm font-bold">
                  {stats.diversity} Styles
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Inventory List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-4">
           <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Curated Collection</h3>
           <span className="text-[10px] font-bold text-wine-400">{items.length} Entr{items.length === 1 ? 'y' : 'ies'}</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 px-8 bg-white rounded-[2rem] border-2 border-dashed border-stone-100 mx-4">
            <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Package className="w-8 h-8 text-stone-200" />
            </div>
            <p className="text-wine-900 font-bold">Your cellar is empty.</p>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">Start scanning labels to build your personal digital archive.</p>
          </div>
        ) : (
          <div className="px-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-stone-100 shadow-xl shadow-wine-950/5 flex flex-col gap-4 animate-fade-in">
                <div className="flex gap-4 cursor-pointer" onClick={() => onViewWine(item.wine)}>
                  <div className="w-20 h-24 bg-stone-50 rounded-2xl overflow-hidden shrink-0 border border-stone-100 shadow-inner p-1">
                    <img src={item.wine.onlineImage || 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover rounded-xl" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="font-sans font-bold text-wine-950 text-lg leading-tight line-clamp-2">{item.wine.name}</h4>
                     <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1.5">{item.wine.vintage} • {item.wine.region}</p>
                     
                     <div className="mt-3 flex gap-2">
                        <span className="text-[9px] font-bold bg-wine-50 text-wine-900 px-2 py-1 rounded-lg border border-wine-100">
                          {item.wine.type}
                        </span>
                        {item.wine.aging && (
                           <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-50 border border-stone-100">
                              <div className={`w-1 h-1 rounded-full ${
                                 parseInt(item.wine.aging.peakYears.split('-')[0]) <= new Date().getFullYear() 
                                 ? 'bg-emerald-500' 
                                 : 'bg-amber-400'
                              }`}></div>
                              <span className="text-[9px] font-black text-stone-500 uppercase tracking-tighter">
                                Peak: {item.wine.aging.peakYears}
                              </span>
                           </div>
                        )}
                     </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-50 pt-4">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Acquisition</span>
                      <span className="text-sm font-bold text-wine-900 tabular-nums">
                        {item.purchasePrice ? `$${item.purchasePrice}` : 'Mkt Est'}
                      </span>
                   </div>

                   <div className="flex items-center gap-4 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); item.quantity === 1 ? onRemoveItem(item.id) : onUpdateQuantity(item.id, -1); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-stone-200 text-stone-400 hover:text-red-500 active:scale-90 transition-all shadow-sm"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      
                      <span className="w-4 text-center font-black text-wine-950 tabular-nums text-base">{item.quantity}</span>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, 1); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-wine-900 text-white active:scale-90 transition-all shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
