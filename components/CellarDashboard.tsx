
import React, { useMemo } from 'react';
import { CellarItem, WineData } from '../types';
import { Package, DollarSign, Calendar, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

interface CellarDashboardProps {
  items: CellarItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onViewWine: (wine: WineData) => void;
}

// Helper to parse price string "$50 - $80" -> 65
const estimatePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  // Remove non-numeric chars except dash and dot
  const clean = priceStr.replace(/[^\d.-]/g, '');
  if (clean.includes('-')) {
    const [min, max] = clean.split('-').map(Number);
    return (min + max) / 2;
  }
  return Number(clean) || 0;
};

export const CellarDashboard: React.FC<CellarDashboardProps> = ({ items, onUpdateQuantity, onRemoveItem, onViewWine }) => {
  
  // Analytics
  const stats = useMemo(() => {
    let totalBottles = 0;
    let totalValue = 0;
    let readyToDrink = 0;
    const currentYear = new Date().getFullYear();

    items.forEach(item => {
      totalBottles += item.quantity;
      
      // Value Calculation: Use purchase price if set, otherwise estimated market price
      const unitValue = item.purchasePrice || estimatePrice(item.wine.marketPrice);
      totalValue += unitValue * item.quantity;

      // Readiness Calculation
      if (item.wine.aging?.peakYears) {
        const [start, end] = item.wine.aging.peakYears.split('-').map(y => parseInt(y.trim()));
        if (currentYear >= start && currentYear <= end) {
          readyToDrink += item.quantity;
        }
      }
    });

    return { totalBottles, totalValue, readyToDrink };
  }, [items]);

  return (
    <div className="animate-fade-in pb-24">
      
      {/* 1. Dashboard Summary Card */}
      <div className="bg-gradient-to-br from-wine-900 to-wine-800 text-white p-6 rounded-[2rem] shadow-xl shadow-wine-900/20 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-wine-200 mb-6">Cellar Analytics</h2>
          
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            {/* Total Value */}
            <div className="col-span-2">
              <p className="text-xs text-wine-300 font-medium mb-1">Total Asset Value</p>
              <p className="text-4xl font-serif font-bold text-white tracking-tight">
                ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Bottle Count */}
            <div>
              <p className="text-xs text-wine-300 font-medium mb-1 flex items-center gap-1">
                <Package className="w-3 h-3" /> Inventory
              </p>
              <p className="text-2xl font-bold">{stats.totalBottles} <span className="text-sm font-normal text-wine-300">bottles</span></p>
            </div>

            {/* Ready to Drink */}
            <div>
              <p className="text-xs text-wine-300 font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Peak Window
              </p>
              <p className="text-2xl font-bold text-gold-400">{stats.readyToDrink} <span className="text-sm font-normal text-wine-300">ready</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Inventory List */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-2">
           <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Your Collection</h3>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-2xl border border-dashed border-stone-200">
            <Package className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">Your cellar is empty.</p>
            <p className="text-xs text-stone-400 mt-1">Scan a bottle and tap "Add to Cellar" to start tracking.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex flex-col gap-4">
              
              {/* Header: Image & Info */}
              <div className="flex gap-4 cursor-pointer" onClick={() => onViewWine(item.wine)}>
                <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                  <img src={item.wine.onlineImage || 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-wine-900 text-lg leading-tight line-clamp-2">{item.wine.name}</h4>
                   </div>
                   <p className="text-xs text-stone-500 font-bold uppercase tracking-wide mt-1">{item.wine.vintage} • {item.wine.region}</p>
                   
                   {/* Drinking Window Indicator */}
                   {item.wine.aging && (
                     <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-50 border border-stone-100">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                           parseInt(item.wine.aging.peakYears.split('-')[0]) <= new Date().getFullYear() 
                           ? 'bg-emerald-500' 
                           : 'bg-amber-400'
                        }`}></div>
                        <span className="text-[10px] font-bold text-stone-500">
                          Peak: {item.wine.aging.peakYears}
                        </span>
                     </div>
                   )}
                </div>
              </div>

              {/* Controls: Quantity & Value */}
              <div className="flex items-center justify-between border-t border-stone-50 pt-3">
                 <div className="flex items-center gap-1 text-xs text-stone-400 font-medium">
                    <DollarSign className="w-3 h-3" />
                    <span>Paid: {item.purchasePrice ? `$${item.purchasePrice}` : '-'}</span>
                 </div>

                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => item.quantity === 1 ? onRemoveItem(item.id) : onUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 active:scale-90 transition-transform"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    
                    <span className="w-6 text-center font-bold text-wine-900 tabular-nums">{item.quantity}</span>
                    
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-wine-50 border border-wine-100 text-wine-800 hover:bg-wine-100 active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
