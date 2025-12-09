import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScanButton } from './components/ScanButton';
import { WineDisplay } from './components/WineDisplay';
import { analyzeWineLabel, searchWineByName } from './services/geminiService';
import { AnalysisState } from './types';
import { Loader2, AlertCircle, Search, ArrowRight, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'idle' });
  const [searchQuery, setSearchQuery] = useState('');

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
    } catch (error) {
       setAnalysis({ 
        status: 'error', 
        error: error instanceof Error ? error.message : "Failed to find wine details" 
      });
    }
  };

  return (
    <div className="min-h-screen pb-safe-area bg-wine-50 font-sans selection:bg-wine-200">
      <Header />

      <main className="max-w-md mx-auto relative z-10 pb-24">
        
        {/* Idle State - Welcome Message & Search */}
        {analysis.status === 'idle' && (
          <div className="px-6 py-6 animate-fade-in">
            {/* Search Box */}
            <div className="mb-10 bg-white p-6 rounded-[2rem] shadow-xl shadow-wine-900/5 border border-wine-100">
              <h2 className="text-xl font-serif font-bold text-wine-900 mb-4">Find a wine</h2>
              <form onSubmit={handleTextSearch} className="relative group z-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-wine-300 w-5 h-5 group-focus-within:text-wine-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Type a wine name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-wine-50/50 border border-wine-100 rounded-full py-4 pl-12 pr-14 text-wine-900 placeholder:text-wine-300/80 focus:outline-none focus:ring-2 focus:ring-wine-200 focus:bg-white transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="absolute right-2 top-2 bottom-2 bg-wine-900 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-wine-800 transition-colors shadow-md"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Vintage Tip */}
              <div className="mt-4 flex items-start gap-3 text-sm text-wine-700/80 bg-wine-50 p-4 rounded-xl border border-wine-100/60">
                <Sparkles className="w-4 h-4 text-wine-400 shrink-0 mt-0.5 fill-wine-100" />
                <p className="leading-snug">
                  <strong>Pro Tip:</strong> Include the <span className="text-wine-900 font-semibold">Vintage Year</span> (e.g. 2018) for the most accurate pricing and rating.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-10 opacity-60">
               <div className="h-px bg-wine-200 w-full absolute"></div>
               <span className="bg-wine-50 px-3 text-xs font-bold text-wine-400 uppercase tracking-widest relative z-10">or scan label</span>
            </div>

            {/* Scan Prompt */}
            <div className="text-center opacity-90">
              <p className="text-wine-800 font-serif text-lg mb-2">Have the bottle?</p>
              <p className="text-sm text-wine-600 max-w-[200px] mx-auto leading-relaxed">
                Tap the camera button below to instantly analyze a label.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {analysis.status === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-wine-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white p-4 rounded-full shadow-lg">
                <Loader2 className="w-10 h-10 text-wine-600 animate-spin" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-serif font-bold text-wine-900">Consulting the Sommelier...</h3>
            <p className="text-wine-600 mt-2">Researching vintage, price, and tasting notes.</p>
            {imagePreview && (
               <div className="mt-8 w-32 h-32 rounded-lg overflow-hidden border-2 border-white shadow-md mx-auto">
                 <img src={imagePreview} className="w-full h-full object-cover opacity-50" alt="Scanning" />
               </div>
            )}
            {!imagePreview && searchQuery && (
               <div className="mt-6 bg-white px-6 py-3 rounded-full border border-wine-100 shadow-sm text-wine-800 font-medium">
                 "{searchQuery}"
               </div>
            )}
          </div>
        )}

        {/* Error State */}
        {analysis.status === 'error' && (
          <div className="mx-4 mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-fade-in">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-800 mb-1">Could not identify wine</h3>
            <p className="text-red-600 text-sm mb-4">{analysis.error}</p>
            <button 
              onClick={() => setAnalysis({ status: 'idle' })}
              className="px-6 py-2 bg-white border border-red-200 rounded-full text-red-700 font-semibold shadow-sm hover:bg-red-50 transition-colors"
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
              className="mx-6 mb-4 text-xs font-bold text-wine-400 uppercase tracking-widest hover:text-wine-600 flex items-center gap-1"
            >
              ← Back to Search
            </button>
            <WineDisplay data={analysis.data} imagePreview={imagePreview || 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&q=80&w=600'} />
          </div>
        )}

      </main>

      <ScanButton 
        onImageSelect={handleImageSelect} 
        disabled={analysis.status === 'analyzing'} 
      />
    </div>
  );
};

export default App;