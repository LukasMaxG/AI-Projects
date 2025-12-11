
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScanButton } from './components/ScanButton';
import { WineDisplay } from './components/WineDisplay';
import { CellarDashboard } from './components/CellarDashboard';
import { analyzeWineLabel, searchWineByName } from './services/geminiService';
import { AnalysisState, WineData, CellarItem } from './types';
import { Loader2, AlertCircle, Search, ArrowRight, Sparkles, Clock, ChevronDown, ChevronUp, Heart, Package } from 'lucide-react';

// Custom Modern Wine Bottle Icon for Fallbacks
const WineBottleIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 2h6" />
    <path d="M12 2v5" />
    <path d="M8 9h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
    <path d="M8 14h8" opacity="0.3" />
  </svg>
);

// Thumbnail component to handle image loading errors in the list
const WineListItemThumbnail = ({ src }: { src?: string }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <WineBottleIcon className="w-5 h-5 text-wine-300" />;
  }

  return (
    <img 
      src={src} 
      alt="" 
      className="w-full h-full object-cover" 
      onError={() => setError(true)}
    />
  );
};

const App: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'idle' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // History State
  const [history, setHistory] = useState<WineData[]>([]);
  
  // Cellar State (Phase 3.0)
  const [cellar, setCellar] = useState<CellarItem[]>([]);
  
  // UI State for Lists
  const [activeTab, setActiveTab] = useState<'recent' | 'cellar'>('recent');
  const [isListExpanded, setIsListExpanded] = useState(false);

  // Load data on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('wineHistory');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedCellar = localStorage.getItem('wineCellar');
      if (savedCellar) setCellar(JSON.parse(savedCellar));
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
  }, []);

  const saveToHistory = (data: WineData) => {
    setHistory(prev => {
      // Remove if duplicate exists (by name and vintage) to push to top
      const filtered = prev.filter(item => !(item.name === data.name && item.vintage === data.vintage));
      const newHistory = [data, ...filtered].slice(0, 10); // Keep last 10
      localStorage.setItem('wineHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Centralized Data Update Logic
  const handleWineUpdate = (updatedData: WineData) => {
    // 1. Update current view if active
    if (analysis.status === 'success' && analysis.data?.id === updatedData.id) {
        setAnalysis(prev => ({ ...prev, data: updatedData }));
    }

    // 2. Update History List
    setHistory(prev => {
        const newHist = prev.map(item => (item.id === updatedData.id ? updatedData : item));
        localStorage.setItem('wineHistory', JSON.stringify(newHist));
        return newHist;
    });

    // 3. Update Cellar List (Sync updated wine data to cellar items)
    setCellar(prev => {
        const newCellar = prev.map(item => 
            item.wine.id === updatedData.id 
            ? { ...item, wine: updatedData }
            : item
        );
        localStorage.setItem('wineCellar', JSON.stringify(newCellar));
        return newCellar;
    });
  };

  const handleAddToCellar = (wine: WineData, quantity: number, price?: number) => {
      setCellar(prev => {
          // Check if already exists to update quantity
          const existingIndex = prev.findIndex(i => i.wine.name === wine.name && i.wine.vintage === wine.vintage);
          let newCellar;
          
          if (existingIndex >= 0) {
              newCellar = [...prev];
              newCellar[existingIndex].quantity += quantity;
              // If price is provided, update it (or average it? For simple MVP, assume latest price)
              if (price) newCellar[existingIndex].purchasePrice = price;
          } else {
              const newItem: CellarItem = {
                  id: `${Date.now()}-${Math.random()}`,
                  wine: wine,
                  quantity,
                  purchasePrice: price,
                  addedAt: Date.now()
              };
              newCellar = [newItem, ...prev];
          }
          
          localStorage.setItem('wineCellar', JSON.stringify(newCellar));
          // Provide feedback? For now, switch to cellar view
          alert(`Added ${quantity} bottles to your cellar!`);
          return newCellar;
      });
  };

  const updateCellarQuantity = (id: string, delta: number) => {
      setCellar(prev => {
          const newCellar = prev.map(item => {
              if (item.id === id) {
                  return { ...item, quantity: Math.max(0, item.quantity + delta) };
              }
              return item;
          }).filter(item => item.quantity > 0); // Remove if 0
          
          localStorage.setItem('wineCellar', JSON.stringify(newCellar));
          return newCellar;
      });
  };

  const removeCellarItem = (id: string) => {
      setCellar(prev => {
          const newCellar = prev.filter(item => item.id !== id);
          localStorage.setItem('wineCellar', JSON.stringify(newCellar));
          return newCellar;
      });
  };

  const handleImageSelect = async (file: File) => {
    // 1. Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 2. Start Analysis
    setAnalysis({ status: 'analyzing' });

    try {
      // Convert file to base64 string for API (remove data URL prefix)
      const base64Data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.readAsDataURL(file);
        r.onload = () => {
          const result = r.result as string;
          // Split to get just the base64 part
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        r.onerror = error => reject(error);
      });

      const data = await analyzeWineLabel(base64Data, file.type);
      setAnalysis({ status: 'success', data });
      saveToHistory(data);

    } catch (error) {
      setAnalysis({ 
        status: 'error', 
        error: error instanceof Error ? error.message : "Failed to analyze image" 
      });
    }
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setImagePreview(null); // Clear previous image if any
    setAnalysis({ status: 'analyzing' });

    try {
      const data = await searchWineByName(searchQuery);
      setAnalysis({ status: 'success', data });
      saveToHistory(data);
    } catch (error) {
       setAnalysis({ 
        status: 'error', 
        error: error instanceof Error ? error.message : "Failed to find wine details" 
      });
    }
  };

  const loadFromHistory = (item: WineData) => {
      setAnalysis({ status: 'success', data: item });
      setImagePreview(item.onlineImage || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-safe-area bg-wine-50 font-sans selection:bg-wine-200 flex flex-col">
      <Header />

      <main className="max-w-md mx-auto relative z-10 w-full flex-grow">
        
        {/* Main Navigation Tabs - Switch between Search (Home) and Cellar */}
        <div className="px-6 mb-6 flex gap-4 justify-center">
            {analysis.status === 'idle' && (
                <>
                   <button 
                      onClick={() => setActiveTab('recent')} 
                      className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'recent' ? 'bg-wine-900 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-200'}`}
                   >
                      Search
                   </button>
                   <button 
                      onClick={() => setActiveTab('cellar')} 
                      className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'cellar' ? 'bg-wine-900 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-200'}`}
                   >
                      My Cellar
                   </button>
                </>
            )}
        </div>

        {/* View 1: Cellar Dashboard */}
        {analysis.status === 'idle' && activeTab === 'cellar' && (
            <div className="px-4">
               <CellarDashboard 
                 items={cellar} 
                 onUpdateQuantity={updateCellarQuantity} 
                 onRemoveItem={removeCellarItem}
                 onViewWine={loadFromHistory}
               />
            </div>
        )}
        
        {/* View 2: Search & Recent History */}
        {analysis.status === 'idle' && activeTab === 'recent' && (
          <div className="px-6 py-2 animate-fade-in space-y-8">
            {/* Search Box */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-wine-900/5 border border-wine-100">
              <h2 className="text-2xl font-serif font-bold text-wine-900 mb-4 tracking-tight">Find a wine</h2>
              <form onSubmit={handleTextSearch} className="relative group z-10">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-wine-300 w-6 h-6 group-focus-within:text-wine-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Type a wine name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-wine-50/50 border border-wine-100 rounded-full py-4 pl-14 pr-16 text-lg text-wine-900 placeholder:text-wine-300/80 focus:outline-none focus:ring-2 focus:ring-wine-200 focus:bg-white transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="absolute right-2 top-2 bottom-2 bg-wine-900 text-white rounded-full w-11 h-11 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-wine-800 transition-colors shadow-md active:scale-95"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Vintage Tip */}
              <div className="mt-4 flex items-start gap-3 text-sm text-wine-800/80 bg-wine-50 p-4 rounded-xl border border-wine-100/60 leading-relaxed">
                <Sparkles className="w-4 h-4 text-wine-400 shrink-0 mt-0.5 fill-wine-100" />
                <p>
                  <span className="font-bold uppercase text-[10px] tracking-widest text-wine-400 block mb-1">Pro Tip</span>
                  Include the <span className="text-wine-900 font-bold">Vintage Year</span> (e.g. 2018) for the most accurate pricing and rating.
                </p>
              </div>
            </div>

            {/* Recent History List */}
            <div className="bg-white rounded-2xl border border-wine-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-wine-50 bg-wine-50/30 flex justify-between items-center">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-wine-900">Recent Searches</h3>
                </div>
                
                {/* Always Expanded for Simplicity in this View */}
                <div className="divide-y divide-wine-50 max-h-72 overflow-y-auto">
                    {history.length > 0 ? history.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => loadFromHistory(item)}
                            className="p-4 flex items-center gap-4 hover:bg-wine-50 cursor-pointer transition-colors"
                        >
                            <div className="w-12 h-12 bg-wine-50 rounded-xl overflow-hidden shrink-0 border border-wine-100 flex items-center justify-center">
                                <WineListItemThumbnail src={item.onlineImage} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-wine-900 text-base truncate tracking-tight">{item.name}</p>
                                <p className="text-xs text-stone-500 font-medium truncate uppercase tracking-wide mt-0.5">{item.region} • {item.vintage}</p>
                            </div>
                            <div className="bg-wine-50 px-2.5 py-1 rounded-md text-xs font-bold text-wine-800 tabular-nums">
                                {item.criticScores?.[0]?.score || '-'}
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-stone-400 text-sm">
                           No recent searches.
                        </div>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center opacity-60 py-2">
               <div className="h-px bg-wine-200 w-full absolute"></div>
               <span className="bg-wine-50 px-4 text-[10px] font-bold text-wine-400 uppercase tracking-widest relative z-10">or scan label</span>
            </div>

            {/* Scan Prompt */}
            <div className="text-center">
              <p className="text-wine-900 font-serif text-2xl font-medium tracking-tight mb-2">Have the bottle?</p>
              <p className="text-stone-600 max-w-[240px] mx-auto leading-relaxed">
                Tap the camera button below to instantly analyze a label.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {analysis.status === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-wine-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white p-5 rounded-full shadow-xl">
                <Loader2 className="w-12 h-12 text-wine-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-bold text-wine-900 tracking-tight">Consulting the Sommelier...</h3>
            <p className="text-stone-500 mt-3 font-medium">Researching vintage, price, and tasting notes.</p>
            {imagePreview && (
               <div className="mt-8 w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-2xl mx-auto rotate-3">
                 <img src={imagePreview} className="w-full h-full object-cover" alt="Scanning" />
               </div>
            )}
            {!imagePreview && searchQuery && (
               <div className="mt-8 bg-white px-6 py-3 rounded-full border border-wine-100 shadow-md text-wine-800 font-serif font-medium italic">
                 "{searchQuery}"
               </div>
            )}
          </div>
        )}

        {/* Error State */}
        {analysis.status === 'error' && (
          <div className="mx-6 mt-10 bg-white border border-red-100 rounded-[2rem] p-8 text-center animate-fade-in shadow-xl shadow-red-500/5">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Could not identify wine</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{analysis.error}</p>
            <button 
              onClick={() => setAnalysis({ status: 'idle' })}
              className="px-8 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full text-red-700 font-semibold shadow-sm transition-colors active:scale-95"
            >
              Try again
            </button>
          </div>
        )}

        {/* Success State */}
        {analysis.status === 'success' && analysis.data && (
          <div className="animate-slide-up">
            <button 
              onClick={() => {
                setAnalysis({ status: 'idle' });
                setSearchQuery('');
                setImagePreview(null);
                setActiveTab('recent'); // Go back to default tab
              }}
              className="mx-6 mb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-wine-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowRight className="w-3 h-3 rotate-180" /> Back to Search
            </button>
            <WineDisplay 
                data={analysis.data} 
                imagePreview={imagePreview} 
                isFavorite={false} // Deprecated favoring in WineDisplay for direct AddToCellar
                onToggleFavorite={() => {}} 
                onUpdateWine={handleWineUpdate}
                onAddToCellar={handleAddToCellar}
            />
          </div>
        )}

      </main>

      <ScanButton 
        onImageSelect={handleImageSelect} 
        disabled={analysis.status === 'analyzing'} 
      />

      {/* Footer */}
      <footer className="w-full pt-8 pb-32 mt-8 text-center bg-wine-50 border-t border-wine-100/50">
        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Created By Manny Gutierrez</p>
        <p className="text-[10px] text-stone-400/80">copyright www.MagmaTek.com</p>
      </footer>
    </div>
  );
};

export default App;
