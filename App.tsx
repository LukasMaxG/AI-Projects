import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ScanButton } from './components/ScanButton';
import { WineDisplay } from './components/WineDisplay';
import { CellarDashboard } from './components/CellarDashboard';
import { analyzeWineLabel, searchWineByName } from './services/geminiService';
import { AnalysisState, WineData, CellarItem } from './types';
import { Loader2, AlertCircle, Search, ArrowRight, Sparkles, Wine as WineIcon, WifiOff } from 'lucide-react';
import { Toast, ToastMessage } from './components/Toast';

const WineBottleIcon = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center bg-wine-50/50 rounded-xl ${className}`}>
    <WineIcon className="w-1/2 h-1/2 text-wine-200" strokeWidth={1.5} />
  </div>
);

const WineListItemThumbnail = ({ wine }: { wine: WineData }) => {
  const [error, setError] = useState(false);
  const src = wine.localImage || wine.onlineImage;
  
  if (!src || error) return <WineBottleIcon className="w-12 h-12" />;
  return <img src={src} alt="" className="w-full h-full object-cover" onError={() => setError(true)} />;
};

const App: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'idle' });
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<WineData[]>([]);
  const [cellar, setCellar] = useState<CellarItem[]>([]);
  const [activeTab, setActiveTab] = useState<'recent' | 'cellar'>('recent');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const addToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Connection restored", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("You are offline. AI analysis is unavailable.", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    try {
      const savedHistory = localStorage.getItem('wineHistory');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      const savedCellar = localStorage.getItem('wineCellar');
      if (savedCellar) setCellar(JSON.parse(savedCellar));
    } catch (e) { console.error(e); }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  const saveToHistory = (data: WineData) => {
    setHistory(prev => {
      const filtered = prev.filter(item => !(item.name === data.name && item.vintage === data.vintage));
      const newHistory = [data, ...filtered].slice(0, 10);
      localStorage.setItem('wineHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleWineUpdate = (updatedData: WineData) => {
    if (analysis.status === 'success' && analysis.data?.id === updatedData.id) {
        setAnalysis(prev => ({ ...prev, data: updatedData }));
    }
    setHistory(prev => {
        const newHist = prev.map(item => (item.id === updatedData.id ? updatedData : item));
        localStorage.setItem('wineHistory', JSON.stringify(newHist));
        return newHist;
    });
    setCellar(prev => {
        const newCellar = prev.map(item => item.wine.id === updatedData.id ? { ...item, wine: updatedData } : item);
        localStorage.setItem('wineCellar', JSON.stringify(newCellar));
        return newCellar;
    });
  };

  const handleAddToCellar = (wine: WineData, quantity: number, price?: number) => {
      setCellar(prev => {
          const existingIndex = prev.findIndex(i => i.wine.name === wine.name && i.wine.vintage === wine.vintage);
          let newCellar;
          if (existingIndex >= 0) {
              newCellar = [...prev];
              newCellar[existingIndex].quantity += quantity;
              if (price) newCellar[existingIndex].purchasePrice = price;
          } else {
              const newItem: CellarItem = {
                  id: `${Date.now()}-${Math.random()}`, wine, quantity, purchasePrice: price, addedAt: Date.now()
              };
              newCellar = [newItem, ...prev];
          }
          localStorage.setItem('wineCellar', JSON.stringify(newCellar));
          addToast(`Added ${quantity} bottle${quantity > 1 ? 's' : ''} to cellar!`, 'success');
          return newCellar;
      });
  };

  const updateCellarQuantity = (id: string, delta: number) => {
      setCellar(prev => {
          const newCellar = prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0);
          localStorage.setItem('wineCellar', JSON.stringify(newCellar));
          return newCellar;
      });
  };

  const removeCellarItem = (id: string) => {
      setCellar(prev => {
          const newCellar = prev.filter(item => item.id !== id);
          localStorage.setItem('wineCellar', JSON.stringify(newCellar));
          addToast("Removed from cellar", "info");
          return newCellar;
      });
  };

  const handleImageSelect = async (file: File) => {
    if (!isOnline) {
      addToast("Network required for label analysis", "info");
      return;
    }

    const localBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    setImagePreview(localBase64);
    setAnalysis({ status: 'analyzing' });
    
    try {
      const base64Only = localBase64.split(',')[1];
      const data = await analyzeWineLabel(base64Only, file.type);
      
      const dataWithPhoto: WineData = { ...data, localImage: localBase64 };
      
      setAnalysis({ status: 'success', data: dataWithPhoto });
      saveToHistory(dataWithPhoto);
    } catch (error) {
      setAnalysis({ status: 'error', error: error instanceof Error ? error.message : "Failed to analyze image" });
    }
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      addToast("Network required for AI search", "info");
      return;
    }
    if (!searchQuery.trim()) return;
    setImagePreview(null);
    setAnalysis({ status: 'analyzing' });
    try {
      const data = await searchWineByName(searchQuery);
      setAnalysis({ status: 'success', data });
      saveToHistory(data);
    } catch (error) {
       setAnalysis({ status: 'error', error: error instanceof Error ? error.message : "Failed to find wine details" });
    }
  };

  const loadFromHistory = (item: WineData) => {
      setAnalysis({ status: 'success', data: item });
      setImagePreview(item.localImage || item.onlineImage || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSearch = () => {
    setAnalysis({ status: 'idle' });
    setSearchQuery('');
    setImagePreview(null);
    setActiveTab('recent');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCellar = () => {
    setAnalysis({ status: 'idle' });
    setActiveTab('cellar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-safe-area bg-wine-50 font-sans selection:bg-wine-200 flex flex-col">
      <Header isOnline={isOnline} />
      <Toast messages={toasts} onRemove={removeToast} />

      <main className="max-w-md mx-auto relative z-10 w-full flex-grow">
        <div className="px-6 mb-3 flex gap-4 justify-center">
            {analysis.status === 'idle' && (
                <>
                   <button onClick={() => setActiveTab('recent')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'recent' ? 'bg-wine-900 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-200'}`}>Search</button>
                   <button onClick={() => setActiveTab('cellar')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'cellar' ? 'bg-wine-900 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-200'}`}>My Cellar</button>
                </>
            )}
        </div>

        {analysis.status === 'idle' && activeTab === 'cellar' && (
            <div className="px-4">
               <CellarDashboard items={cellar} onUpdateQuantity={updateCellarQuantity} onRemoveItem={removeCellarItem} onViewWine={loadFromHistory} />
            </div>
        )}
        
        {analysis.status === 'idle' && activeTab === 'recent' && (
          <div className="px-6 py-2 animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-wine-900/5 border border-wine-100">
              <h2 className="text-2xl font-serif font-bold text-wine-900 mb-4 tracking-tight">Find a wine</h2>
              <form onSubmit={handleTextSearch} className="relative group z-10">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${isOnline ? 'text-wine-300 group-focus-within:text-wine-500' : 'text-stone-300'}`} />
                <input 
                  type="text" 
                  placeholder={isOnline ? "Type a wine name..." : "Offline mode..."} 
                  disabled={!isOnline}
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className={`w-full border rounded-full py-4 pl-14 pr-16 text-lg transition-all shadow-inner focus:outline-none ${isOnline ? 'bg-wine-50/50 border-wine-100 text-wine-900 placeholder:text-wine-300/80 focus:ring-2 focus:ring-wine-200 focus:bg-white' : 'bg-stone-50 border-stone-100 text-stone-400 cursor-not-allowed'}`} 
                />
                <button 
                  type="submit" 
                  disabled={!searchQuery.trim() || !isOnline} 
                  className={`absolute right-2 top-2 bottom-2 rounded-full w-11 h-11 flex items-center justify-center transition-all shadow-md active:scale-95 ${isOnline ? 'bg-wine-900 text-white hover:bg-wine-800' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              {!isOnline && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-stone-400 justify-center bg-stone-50 py-2 rounded-xl">
                  <WifiOff className="w-3 h-3" /> Connection required for new AI searches
                </div>
              )}
              <div className="mt-4 flex items-start gap-3 text-sm text-wine-800/80 bg-wine-50 p-4 rounded-xl border border-wine-100/60 leading-relaxed">
                <Sparkles className="w-4 h-4 text-wine-400 shrink-0 mt-0.5 fill-wine-100" /><p><span className="font-bold uppercase text-[10px] tracking-widest text-wine-400 block mb-1">Pro Tip</span>Include the <span className="text-wine-900 font-bold">Vintage Year</span> for the most accurate pricing.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-wine-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-wine-50 bg-wine-50/30 flex justify-between items-center"><h3 className="text-xs font-bold uppercase tracking-widest text-wine-900">Recent Searches</h3></div>
                <div className="divide-y divide-wine-50 max-h-72 overflow-y-auto">
                    {history.length > 0 ? history.map((item, idx) => (
                        <div key={idx} onClick={() => loadFromHistory(item)} className="p-4 flex items-center gap-4 hover:bg-wine-50 cursor-pointer transition-colors">
                            <div className="w-12 h-12 bg-wine-50 rounded-xl overflow-hidden shrink-0 border border-wine-100 flex items-center justify-center">
                              <WineListItemThumbnail wine={item} />
                            </div>
                            <div className="flex-1 min-w-0"><p className="font-semibold text-wine-900 text-base truncate tracking-tight">{item.name}</p><p className="text-xs text-stone-500 font-medium truncate uppercase tracking-wide mt-0.5">{item.region} • {item.vintage}</p></div>
                            <div className="bg-wine-50 px-2.5 py-1 rounded-md text-xs font-bold text-wine-800 tabular-nums">{item.criticScores?.[0]?.score || '-'}</div>
                        </div>
                    )) : <div className="p-8 text-center text-stone-400 text-sm">No recent searches.</div>}
                </div>
            </div>

            <div className="relative flex items-center justify-center opacity-60 py-2"><div className="h-px bg-wine-200 w-full absolute"></div><span className="bg-wine-50 px-4 text-[10px] font-bold text-wine-400 uppercase tracking-widest relative z-10">or scan label</span></div>
            <div className="text-center"><p className="text-wine-900 font-serif text-2xl font-medium tracking-tight mb-2">Have the bottle?</p><p className="text-stone-600 max-w-[240px] mx-auto leading-relaxed">Tap the camera button below to instantly analyze a label.</p></div>
          </div>
        )}

        {analysis.status === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
            <div className="relative mb-8"><div className="absolute inset-0 bg-wine-200 rounded-full animate-ping opacity-75"></div><div className="relative bg-white p-5 rounded-full shadow-xl"><Loader2 className="w-12 h-12 text-wine-600 animate-spin" /></div></div>
            <h3 className="text-2xl font-serif font-bold text-wine-900 tracking-tight">Consulting the Sommelier...</h3>
            <p className="text-stone-500 mt-3 font-medium">Researching vintage, price, and tasting notes.</p>
            {imagePreview && <div className="mt-8 w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-2xl mx-auto rotate-3"><img src={imagePreview} className="w-full h-full object-cover" alt="Scanning" /></div>}
          </div>
        )}

        {analysis.status === 'error' && (
          <div className="mx-6 mt-10 bg-white border border-red-100 rounded-[2rem] p-8 text-center animate-fade-in shadow-xl shadow-red-500/5">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Could not identify wine</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{analysis.error}</p>
            <button onClick={() => setAnalysis({ status: 'idle' })} className="px-8 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full text-red-700 font-semibold shadow-sm transition-colors active:scale-95">Try again</button>
          </div>
        )}

        {analysis.status === 'success' && analysis.data && (
          <div className="animate-slide-up">
            <button onClick={handleBackToSearch} className="mx-6 mb-2 text-[10px] font-extrabold text-stone-900 uppercase tracking-widest hover:text-wine-600 flex items-center gap-1.5 transition-colors">
              <ArrowRight className="w-3 h-3 rotate-180" /> Back to Search
            </button>
            <WineDisplay 
                data={analysis.data} 
                imagePreview={imagePreview} 
                onUpdateWine={handleWineUpdate} 
                onAddToCellar={handleAddToCellar} 
                onToast={addToast} 
                onBackToSearch={handleBackToSearch}
                onViewCellar={handleViewCellar}
            />
          </div>
        )}
      </main>

      <ScanButton onImageSelect={handleImageSelect} disabled={analysis.status === 'analyzing' || !isOnline} />

      <footer className="w-full pt-4 pb-32 mt-4 text-center bg-wine-50 border-t border-wine-100/50">
        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Created By Manny Gutierrez</p>
        <p className="text-[10px] text-stone-400/80">copyright www.MagmaTek.com</p>
      </footer>
    </div>
  );
};

export default App;