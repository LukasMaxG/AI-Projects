import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScanButton } from './components/ScanButton';
import { WineDisplay } from './components/WineDisplay';
import { analyzeWineLabel, searchWineByName } from './services/geminiService';
import { AnalysisState, WineData } from './types';
import { Loader2, AlertCircle, Search, ArrowRight, Sparkles, Clock, ChevronDown, ChevronUp, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'idle' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // History State
  const [history, setHistory] = useState<WineData[]>([]);
  
  // Favorites State
  const [favorites, setFavorites] = useState<WineData[]>([]);
  
  // UI State for Lists
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [isListExpanded, setIsListExpanded] = useState(false);

  // Load data on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('wineHistory');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedFavorites = localStorage.getItem('wineFavorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
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

  const toggleFavorite = (wine: WineData) => {
    setFavorites(prev => {
      const isFav = prev.some(w => w.name === wine.name && w.vintage === wine.vintage);
      let newFavs;
      if (isFav) {
        newFavs = prev.filter(w => !(w.name === wine.name && w.vintage === wine.vintage));
      } else {
        newFavs = [wine, ...prev];
      }
      localStorage.setItem('wineFavorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const isFavorite = (wine: WineData) => {
      return favorites.some(w => w.name === wine.name && w.vintage === wine.vintage);
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

  const displayList = activeTab === 'recent' ? history : favorites;

  return (
    <div className="min-h-screen pb-safe-area bg-wine-50 font-sans selection:bg-wine-200 flex flex-col">
      <Header />

      <main className="max-w-md mx-auto relative z-10 w-full flex-grow">
        
        {/* Idle State - Welcome Message & Search */}
        {analysis.status === 'idle' && (
          <div className="px-6 py-6 animate-fade-in space-y-8">
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

            {/* List Section (Favorites / History) */}
            <div className="bg-white rounded-2xl border border-wine-100 overflow-hidden shadow-sm">
                
                {/* Tabs Header */}
                <div className="flex border-b border-wine-50">
                    <button 
                        onClick={() => { setActiveTab('recent'); setIsListExpanded(true); }}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'recent' ? 'text-wine-900 bg-wine-50/50' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <Clock className="w-4 h-4" />
                        Recent
                    </button>
                    <div className="w-px bg-wine-50"></div>
                    <button 
                         onClick={() => { setActiveTab('favorites'); setIsListExpanded(true); }}
                         className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'favorites' ? 'text-wine-900 bg-wine-50/50' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <Heart className="w-4 h-4" />
                        Favorites
                    </button>
                </div>
                
                {/* Collapsible Toggle (Only if list has items) */}
                {displayList.length > 0 ? (
                    <>
                         <button 
                            onClick={() => setIsListExpanded(!isListExpanded)}
                            className="w-full flex items-center justify-center py-2 bg-white hover:bg-stone-50 transition-colors"
                        >
                            {isListExpanded ? <ChevronUp className="w-4 h-4 text-stone-300" /> : <ChevronDown className="w-4 h-4 text-stone-300" />}
                        </button>
                        
                        {isListExpanded && (
                            <div className="divide-y divide-wine-50 max-h-72 overflow-y-auto">
                                {displayList.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => loadFromHistory(item)}
                                        className="p-4 flex items-center gap-4 hover:bg-wine-50 cursor-pointer transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-wine-100 rounded-xl overflow-hidden shrink-0 border border-wine-200">
                                            {item.onlineImage ? (
                                                <img src={item.onlineImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-wine-400 font-serif font-bold text-xs">
                                                    {item.vintage}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-wine-900 text-base truncate tracking-tight">{item.name}</p>
                                            <p className="text-xs text-stone-500 font-medium truncate uppercase tracking-wide mt-0.5">{item.region} • {item.vintage}</p>
                                        </div>
                                        <div className="bg-wine-50 px-2.5 py-1 rounded-md text-xs font-bold text-wine-800 tabular-nums">
                                            {item.criticScores?.[0]?.score || '-'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-8 text-center text-stone-400 text-sm">
                        {activeTab === 'recent' ? 'No recent searches.' : 'No favorites saved yet.'}
                    </div>
                )}
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
              }}
              className="mx-6 mb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-wine-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowRight className="w-3 h-3 rotate-180" /> Back to Search
            </button>
            <WineDisplay 
                data={analysis.data} 
                imagePreview={imagePreview} 
                isFavorite={isFavorite(analysis.data)}
                onToggleFavorite={() => toggleFavorite(analysis.data!)}
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