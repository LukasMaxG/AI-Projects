
import React, { useState, useEffect } from 'react';
import { WineData, LegendaryVintage } from '../types';
import { Download, MapPin, Droplet, TrendingUp, Utensils, Thermometer, Wine as WineIcon, Mountain, ExternalLink, Lightbulb, Clock, BookOpen, ChevronDown, ChevronUp, Activity, FileDown, Heart, Award, Star, PenLine, Sparkles, GraduationCap, Sun, Plus, Package } from 'lucide-react';
import { VintageChart } from './VintageChart';
import { CompositionChart } from './CompositionChart';

interface WineDisplayProps {
  data: WineData;
  imagePreview: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onUpdateWine: (updatedData: WineData) => void;
  onAddToCellar: (wine: WineData, quantity: number, price?: number) => void;
}

// Map common country names to ISO codes for FlagCDN
const countryCodeMap: Record<string, string> = {
  'italy': 'it', 'france': 'fr', 'spain': 'es', 'united states': 'us', 'usa': 'us',
  'argentina': 'ar', 'chile': 'cl', 'australia': 'au', 'germany': 'de', 'portugal': 'pt',
  'south africa': 'za', 'new zealand': 'nz', 'austria': 'at', 'hungary': 'hu', 'greece': 'gr',
  'china': 'cn', 'japan': 'jp', 'uruguay': 'uy', 'brazil': 'br', 'canada': 'ca', 'switzerland': 'ch',
  'united kingdom': 'gb', 'england': 'gb'
};

// Helper Component: Progress Bar for Style Profile
const StyleMeter = ({ label, value }: { label: string; value: string }) => {
  const getPercentage = (val: string) => {
    const v = val.toLowerCase();
    if (v.includes('high') || v.includes('full') || v.includes('intense')) return 95;
    if (v.includes('medium-plus') || v.includes('med+')) return 75;
    if (v.includes('medium') || v.includes('moderate')) return 50;
    if (v.includes('low') || v.includes('light')) return 25;
    if (v.includes('silky') || v.includes('smooth')) return 60;
    return 50;
  };

  const pct = getPercentage(value);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{label}</span>
        <span className="text-xs font-bold text-wine-900">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-wine-400 to-wine-600 rounded-full transition-all duration-1000" 
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
};

// Fix: Made children optional to resolve "missing children" type errors
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ElementType; 
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-stone-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-wine-50 rounded-lg text-wine-600 group-hover:bg-wine-100 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-wine-900 tracking-tight text-lg">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>
      
      {/* Grid transition allows animating height from 0 to 'auto' without fixed max-height */}
      <div 
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0 border-t border-dashed border-stone-100">
            <div className="pt-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WineDisplay: React.FC<WineDisplayProps> = ({ data, imagePreview, isFavorite, onToggleFavorite, onUpdateWine, onAddToCellar }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showCellarModal, setShowCellarModal] = useState(false);
  const [cellarQty, setCellarQty] = useState(1);
  const [cellarPrice, setCellarPrice] = useState('');

  // Local state for notes to handle debounce/focus
  const [noteText, setNoteText] = useState(data.userNotes || '');

  // Reset state when data changes (new search)
  useEffect(() => {
    setCurrentImageIndex(0);
    setUsingFallback(false);
    setNoteText(data.userNotes || '');
    setCellarQty(1);
    setCellarPrice('');
  }, [data]);
  
  const fallbackImage = 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&q=80&w=600';

  const getFlagUrl = () => {
      if (!data.country) return null;
      const key = data.country.toLowerCase().trim();
      if (countryCodeMap[key]) return `https://flagcdn.com/w640/${countryCodeMap[key]}.png`;
      return null;
  };
  
  const getDisplayImage = () => {
    if (imagePreview) return imagePreview;
    if (usingFallback) {
      // Priority: Flag -> Generic Fallback
      return getFlagUrl() || fallbackImage;
    }
    
    const candidates = data.imageCandidates || (data.onlineImage ? [data.onlineImage] : []);
    if (candidates.length > 0 && currentImageIndex < candidates.length) {
      return candidates[currentImageIndex];
    }
    return getFlagUrl() || fallbackImage;
  };

  const handleImageError = () => {
    const candidates = data.imageCandidates || (data.onlineImage ? [data.onlineImage] : []);
    if (currentImageIndex < candidates.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setUsingFallback(true);
    }
  };
  
  const displayImage = getDisplayImage();
  const mapQuery = encodeURIComponent(`${data.region}, ${data.country}`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const score = parseInt(data.criticScores?.[0]?.score || '0');
  const rating5Scale = score > 0 ? (score / 20).toFixed(1) : 'N/A';
  
  const getValueBadge = (score: number) => {
    if (score >= 95) return { label: "Iconic", color: "bg-purple-100 text-purple-700 border-purple-200" };
    if (score >= 90) return { label: "Excellent Value", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    if (score >= 85) return { label: "Good Value", color: "bg-amber-100 text-amber-700 border-amber-200" };
    return null;
  };
  
  const valueBadge = getValueBadge(score);

  // Handlers
  const handleRating = (rating: number) => {
    onUpdateWine({ ...data, userRating: rating });
  };

  const handleNoteBlur = () => {
    if (noteText !== data.userNotes) {
      onUpdateWine({ ...data, userNotes: noteText });
    }
  };

  const handleAddToCellarSubmit = () => {
    onAddToCellar(data, cellarQty, cellarPrice ? parseFloat(cellarPrice) : undefined);
    setShowCellarModal(false);
  };

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  // Fix: Made children optional to resolve "missing children" type errors
  const WebsiteWrapper = ({ children }: { children?: React.ReactNode }) => {
    if (data.websiteUrl) {
      const safeUrl = ensureAbsoluteUrl(data.websiteUrl);
      return (
        <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="group relative block cursor-pointer">
          {children}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl">
             <div className="bg-white/95 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all backdrop-blur-sm">
                <ExternalLink className="w-3 h-3 text-wine-900" />
                <span className="text-xs font-bold text-wine-900">Visit Winery</span>
             </div>
          </div>
        </a>
      );
    }
    return <div className="relative">{children}</div>;
  };

  const exportReport = () => {
      // Placeholder for export function
      const htmlContent = `
        <html>
          <head>
            <title>${data.name}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
              h1 { color: #882333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              h2 { color: #555; margin-top: 20px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
              .badge { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; }
              .stat { display: flex; justify-content: space-between; max-width: 300px; border-bottom: 1px dashed #ccc; padding: 4px 0; }
              .notes { background: #f9f9f9; padding: 15px; border-left: 4px solid #882333; font-style: italic; }
            </style>
          </head>
          <body>
            <h1>${data.name}</h1>
            <p><strong>Vintage:</strong> ${data.vintage} | <strong>Region:</strong> ${data.region}, ${data.country}</p>
            <p><strong>Market Price:</strong> ${data.marketPrice} | <strong>Score:</strong> ${data.criticScores?.[0]?.score || 'N/A'}</p>
            
            <h2>Sensory Profile</h2>
            <div class="notes">"${data.nose}. ${data.taste}"</div>
            
            <h2>Technical Details</h2>
            <div class="stat"><span>Type:</span> <span>${data.type}</span></div>
            <div class="stat"><span>ABV:</span> <span>${data.abv}</span></div>
            <div class="stat"><span>Grapes:</span> <span>${data.varietals.join(', ')}</span></div>
            
            <h2>Winery Info</h2>
            <p>${data.wineryInfo}</p>
          </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const item = new ClipboardItem({ "text/html": blob });
      navigator.clipboard.write([item]).then(() => {
          alert("Report copied to clipboard! You can paste it into Google Docs.");
      }).catch(err => {
          console.error("Copy failed", err);
          alert("Failed to copy. Please try again.");
      });
  };

  return (
    <div className="pb-24 space-y-6 relative">
      
      {/* Cellar Add Modal */}
      {showCellarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
              <h3 className="text-xl font-serif font-bold text-wine-900 mb-4">Add to Cellar</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Quantity</label>
                    <div className="flex items-center gap-4">
                       <button onClick={() => setCellarQty(Math.max(1, cellarQty - 1))} className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50"><span className="text-lg font-bold">-</span></button>
                       <span className="text-2xl font-bold text-wine-900 w-8 text-center">{cellarQty}</span>
                       <button onClick={() => setCellarQty(cellarQty + 1)} className="w-10 h-10 rounded-full bg-wine-50 border border-wine-100 flex items-center justify-center hover:bg-wine-100"><Plus className="w-5 h-5 text-wine-800" /></button>
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Purchase Price (Per Bottle)</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                       <input 
                         type="number" 
                         value={cellarPrice} 
                         onChange={e => setCellarPrice(e.target.value)}
                         placeholder="Optional" 
                         className="w-full pl-7 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-wine-900 focus:outline-none focus:ring-2 focus:ring-wine-200"
                       />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                 <button onClick={() => setShowCellarModal(false)} className="py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-50">Cancel</button>
                 <button onClick={handleAddToCellarSubmit} className="py-3 rounded-xl bg-wine-900 text-white font-bold shadow-lg shadow-wine-900/20 hover:bg-wine-800">Save to Cellar</button>
              </div>
           </div>
        </div>
      )}

      {/* ZONE 1: SNAPSHOT (Header) */}
      <div className="bg-white rounded-[2.5rem] p-4 shadow-xl border border-wine-100/50 relative overflow-hidden mx-4">
        {/* Decorative BG */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-wine-50 rounded-full blur-3xl"></div>

        <div className="relative z-10">
            <div className="flex gap-4 mb-4">
                {/* Left: Image (Winery, Bottle, or Flag) */}
                <div className="w-28 sm:w-1/3 shrink-0">
                   <WebsiteWrapper>
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-100 shadow-md relative flex items-center justify-center group">
                        <img 
                          src={displayImage} 
                          onError={handleImageError}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${displayImage?.includes('flagcdn') ? 'opacity-90' : ''}`} 
                          alt={data.name} 
                        />
                        {data.vintage && (
                            <div className="absolute top-2 left-2 bg-white/90 text-wine-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                                {data.vintage}
                            </div>
                        )}
                      </div>
                   </WebsiteWrapper>
                </div>

                {/* Right: Info */}
                <div className="flex-1 flex flex-col min-w-0">
                    <a 
                       href={mapUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-wine-600 hover:text-wine-800 text-[10px] font-bold uppercase tracking-widest mb-1 cursor-pointer transition-colors"
                    >
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1 underline decoration-dotted underline-offset-2">{data.country}</span>
                    </a>
                    <h2 className="text-lg sm:text-2xl font-serif font-bold text-wine-950 leading-tight tracking-tight mb-1.5 line-clamp-2">
                        {data.name}
                    </h2>
                    
                    {/* Region / Grape Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="px-2 py-0.5 bg-wine-50 text-wine-900 text-[9px] font-bold rounded-md uppercase tracking-wide border border-wine-100 truncate max-w-full">
                            {data.region}
                        </span>
                        {data.varietals.slice(0, 1).map(v => (
                             <span key={v} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[9px] font-bold rounded-md uppercase tracking-wide border border-stone-200">
                                {v}
                            </span>
                        ))}
                    </div>

                    {/* Wine Description */}
                    <div className="mb-2.5">
                       <p className="text-[10px] sm:text-xs text-stone-500 font-medium leading-relaxed line-clamp-3">
                         A {data.styleProfile?.body ? data.styleProfile.body.toLowerCase() : 'classic'} {data.type.toLowerCase()} with {data.abv}. 
                         Notes of {data.nose.split(',').slice(0, 2).join(', ')}.
                       </p>
                    </div>
                </div>
            </div>

            {/* Modern Value Indicator & Price Card - Full Width (Stretched Left) */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 flex items-center justify-between shadow-sm gap-4 relative overflow-hidden">
                
                {/* Decorative Gradient for high value */}
                {valueBadge?.label === 'Iconic' && (
                     <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
                )}

                {/* Price Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1">Market Price</p>
                     <p className="text-xl sm:text-2xl font-sans font-bold text-wine-950 tabular-nums tracking-tight leading-tight whitespace-normal break-words">{data.marketPrice}</p>
                </div>
                
                {/* Divider */}
                <div className="w-px h-10 bg-stone-200/80"></div>
                
                {/* Rating Column */}
                {score > 0 ? (
                    <div className="flex flex-col items-end shrink-0 z-10">
                        <div className="flex items-center gap-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-bold text-wine-900 leading-none tracking-tighter">{rating5Scale}</span>
                            </div>
                            <div className="bg-wine-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm min-w-[28px] text-center self-start mt-1">
                                {score}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex -space-x-0.5">
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`w-3 h-3 ${i <= Math.round(Number(rating5Scale)) ? 'fill-gold-500 text-gold-500' : 'text-stone-300'}`} />
                                ))}
                            </div>
                            {valueBadge && (
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border bg-white ${valueBadge.color.replace('bg-', 'text-').replace('text-', 'border-')}`}>
                                    {valueBadge.label}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-right py-1">
                        <span className="text-xs text-stone-400 italic">No rating</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* ZONE 2: SENSORY (The Experience) */}
      <div className="mx-4">
        <h3 className="ml-3 mb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3 h-3" /> Sensory Profile
        </h3>
        
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-stone-100">
            {/* Style Meters */}
            {data.styleProfile && (
                <div className="grid grid-cols-1 gap-1 mb-8">
                    <StyleMeter label="Body & Weight" value={data.styleProfile.body} />
                    <StyleMeter label="Acidity & Freshness" value={data.styleProfile.acidity} />
                    <StyleMeter label="Tannin Structure" value={data.styleProfile.tannins} />
                </div>
            )}

            {/* Flavor Tags */}
            <div className="space-y-5">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Droplet className="w-4 h-4 text-wine-400" />
                        <span className="text-xs font-bold text-wine-900 uppercase tracking-wide">Nose & Palate</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[...data.nose.split(','), ...data.taste.split(',')].slice(0, 8).map((note, i) => (
                            <span key={i} className="px-3.5 py-1.5 bg-wine-50/50 text-wine-900 text-sm font-medium rounded-full border border-wine-100/50 capitalize shadow-sm">
                                {note.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Service Row */}
            {data.pairing && (
                <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <Thermometer className="w-5 h-5 text-stone-400 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Temp</p>
                        <p className="text-sm font-bold text-stone-800 leading-tight mt-1 tabular-nums">{data.pairing.temperature.replace('°C', '°')}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <WineIcon className="w-5 h-5 text-stone-400 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Glass</p>
                        <p className="text-sm font-bold text-stone-800 leading-tight mt-1">{data.pairing.glassware.split(' ')[0]}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <Clock className="w-5 h-5 text-stone-400 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Decant</p>
                        <p className="text-sm font-bold text-stone-800 leading-tight mt-1 tabular-nums">{data.pairing.decanting.replace('minutes', 'min')}</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* ZONE 2.5: EDUCATION (New) */}
      {data.education && (
        <div className="mx-4 mb-6">
            <CollapsibleSection title="Wine Primer & Education" icon={GraduationCap}>
            
            {/* Pronunciation */}
            {data.education.pronunciation && (
                <div className="mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">How to say it</p>
                    <div className="flex flex-col">
                        <span className="text-xl font-serif font-bold text-wine-900">{data.education.pronunciation.native}</span>
                        <span className="text-sm text-stone-500 font-mono tracking-wide">{data.education.pronunciation.phonetic}</span>
                    </div>
                </div>
            )}

            {/* Terroir Snapshot */}
            <div className="mb-6">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Terroir Snapshot</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <Sun className="w-4 h-4 text-orange-400 mb-2" />
                        <p className="text-xs font-bold text-orange-800">{data.education.climate}</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <Mountain className="w-4 h-4 text-emerald-400 mb-2" />
                        <p className="text-xs font-bold text-emerald-800">{data.education.geography}</p>
                    </div>
                </div>
                <div className="mt-3 bg-stone-50 p-3 rounded-lg border border-stone-100 italic text-sm text-stone-600 font-medium leading-relaxed">
                    "{data.education.vibe}"
                </div>
            </div>

            {/* Label Decoder */}
            {data.education.labelTerms && data.education.labelTerms.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Label Decoder</p>
                    <div className="space-y-3">
                        {data.education.labelTerms.map((term, i) => (
                            <div key={i} className="pl-3 border-l-2 border-wine-100">
                                <span className="font-bold text-wine-900 text-sm block mb-0.5">{term.term}</span>
                                <span className="text-stone-600 text-xs leading-relaxed">{term.definition}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </CollapsibleSection>
        </div>
      )}

      {/* NEW: MY PALATE (Phase 2.6) */}
      <div className="mx-4">
        <h3 className="ml-3 mb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <PenLine className="w-3 h-3" /> My Palate
        </h3>
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-stone-100">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-wine-900 uppercase tracking-wide">Your Rating</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star}
                            onClick={() => handleRating(star)}
                            className="focus:outline-none transition-transform active:scale-90"
                        >
                            <Star 
                                className={`w-6 h-6 ${
                                    (data.userRating || 0) >= star 
                                    ? 'fill-wine-600 text-wine-600' 
                                    : 'text-stone-300'
                                }`} 
                            />
                        </button>
                    ))}
                </div>
            </div>
            
            <div>
                <span className="text-xs font-bold text-wine-900 uppercase tracking-wide block mb-2">Tasting Notes</span>
                <textarea 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onBlur={handleNoteBlur}
                    placeholder="E.g., Drank with steak, very dry finish. Better after 1 hour."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-700 focus:outline-none focus:border-wine-300 focus:ring-2 focus:ring-wine-50 min-h-[80px] resize-none placeholder:text-stone-400"
                />
            </div>
        </div>
      </div>

      {/* ZONE 3: ANALYSIS (The Investment) */}
      <div className="mx-4">
         <h3 className="ml-3 mb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> Value Analysis
        </h3>

        {data.aging && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Timeline Visual */}
                <div className="relative mb-8">
                     <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">
                        <span>Start</span>
                        <span className="text-gold-400">Peak Maturity</span>
                        <span>End</span>
                     </div>
                     <div className="h-2 bg-slate-700/50 rounded-full relative overflow-hidden">
                        <div className="absolute left-[10%] right-[10%] h-full bg-gradient-to-r from-slate-600 via-gold-500 to-slate-600 opacity-80"></div>
                     </div>
                     <div className="flex justify-between text-sm font-bold mt-2 font-mono tracking-tighter">
                        <span>{data.aging.drinkFrom}</span>
                        <span className="text-gold-400 text-base">{data.aging.peakYears}</span>
                        <span>{data.aging.drinkUntil}</span>
                     </div>
                </div>

                {/* Bar Chart (Vintage Comparison) */}
                {data.vintageComparison && data.vintageComparison.length > 0 && (
                    <div className="mb-6 bg-slate-800/50 rounded-xl p-4 border border-white/5 shadow-inner">
                        <div className="flex justify-between items-end mb-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vintage Quality</p>
                           <p className="text-[9px] text-slate-500 italic">Scores (0-100)</p>
                        </div>
                        <VintageChart data={data.vintageComparison} currentVintage={data.vintage} />
                    </div>
                )}

                {/* Detailed Investment Value Text */}
                <div className="relative bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Projected 5yr Value</p>
                        <div className="text-right">
                           <span className="text-[9px] block text-slate-500 uppercase font-bold tracking-wide mb-0.5">Investment Grade</span>
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                               data.aging.investmentPotential?.toLowerCase().includes('high') 
                               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                               : data.aging.investmentPotential?.toLowerCase().includes('medium') 
                               ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                               : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                           }`}>
                               {data.aging.investmentPotential || 'N/A'}
                           </span>
                        </div>
                    </div>
                    
                    {/* Value Description */}
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                        {data.aging.estimatedValue5Years}
                    </p>
                    <div className="mt-3 flex justify-end">
                       <p className="text-[9px] text-slate-500 italic flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Based on market trends (Vivino/WineSearcher)
                       </p>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* ZONE 4: EXPLORER (The Deep Dive - Collapsible) */}
      <div className="mx-4 space-y-4">
         
         {/* Pairing Accordion */}
         {data.pairing && (
            <CollapsibleSection title="Food Matches" icon={Utensils}>
                <div className="flex flex-wrap gap-2.5">
                    {data.pairing.foods.map((food, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-stone-50 px-3.5 py-2 rounded-lg border border-stone-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-wine-400"></div>
                             <span className="text-sm text-stone-700 font-medium">{food}</span>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
         )}

         {/* Terroir Accordion with Donut Chart */}
         {data.terroir && (
            <CollapsibleSection title="Terroir & Winemaking" icon={Mountain}>
                <div className="space-y-6">
                    {/* NEW: Grape Composition Donut Chart */}
                    {data.grapeComposition && data.grapeComposition.length > 0 && (
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                            <CompositionChart data={data.grapeComposition} />
                        </div>
                    )}

                    {data.terroir.soil.length > 0 && (
                        <div>
                             <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Soil Composition</p>
                             <p className="text-base text-stone-800 font-medium">{data.terroir.soil.join(', ')}</p>
                        </div>
                    )}
                    {data.terroir.oak && (
                        <div>
                             <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Oak Regimen</p>
                             <p className="text-base text-stone-800 font-medium">{data.terroir.oak}</p>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {data.terroir.farming.map((f, i) => (
                            <span key={i} className="text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-200 uppercase tracking-wide">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </CollapsibleSection>
         )}

         {/* History Accordion */}
         <CollapsibleSection title="Winery Heritage" icon={BookOpen} defaultOpen={false}>
             <div className="space-y-6">
                 <p className="text-[1.05rem] text-stone-700 leading-loose font-serif italic border-l-2 border-wine-200 pl-4">
                    "{data.wineryInfo}"
                 </p>

                 {/* Explicit Visit Website Button */}
                 {data.websiteUrl && (
                    <a 
                      href={ensureAbsoluteUrl(data.websiteUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-wine-600 font-bold uppercase text-[10px] tracking-widest hover:text-wine-800 transition-colors bg-wine-50 px-3 py-2 rounded-lg border border-wine-100"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit Official Website
                    </a>
                 )}
                 
                 {data.bestVintages && (
                     <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Legendary Vintages</p>
                         <div className="space-y-3">
                             {data.bestVintages.map((v, i) => {
                                 if (typeof v === 'string') {
                                     return (
                                        <span key={i} className="text-sm font-bold text-wine-900 bg-white px-2 py-1 rounded shadow-sm border border-stone-200 tabular-nums inline-block mr-2">
                                            {v}
                                        </span>
                                     );
                                 }
                                 return (
                                    <div key={i} className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-1">
                                            <span className="text-wine-900 font-bold text-lg font-serif">{v.year}</span>
                                            <span className="text-sm text-stone-500 font-medium leading-relaxed">{v.notes}</span>
                                        </div>
                                        {v.awards && v.awards.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {v.awards.map((award, j) => (
                                                    <span key={j} className="text-[10px] font-bold bg-gold-50 text-gold-700 px-1.5 py-0.5 rounded border border-gold-200 uppercase tracking-wide flex items-center gap-1">
                                                        <Award className="w-3 h-3" />
                                                        {award}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                 );
                             })}
                         </div>
                     </div>
                 )}

                 {/* Fun Facts / Trivia */}
                 {data.funFacts && data.funFacts.length > 0 && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Did you know?</p>
                        </div>
                        <ul className="space-y-2">
                            {data.funFacts.map((fact, i) => (
                                <li key={i} className="text-sm text-stone-700 font-medium leading-relaxed flex gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    {fact}
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
             </div>
         </CollapsibleSection>
      </div>

      {/* NEW: RECOMMENDATIONS (Sommelier's Pivot) */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="mx-4">
             <h3 className="ml-3 mb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-gold-500" /> You Might Also Like
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {data.recommendations.map((rec, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-start gap-4">
                        <div className="bg-wine-50 text-wine-600 font-bold text-lg px-3 py-1 rounded-lg">
                            {i + 1}
                        </div>
                        <div>
                            <p className="font-serif font-bold text-wine-900 text-lg leading-tight">{rec.name}</p>
                            <p className="text-xs text-stone-500 mt-1 leading-relaxed">{rec.reason}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 grid grid-cols-2 gap-4">
        {/* Export Report */}
        <button 
          onClick={exportReport}
          className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm border tracking-wide uppercase bg-white border-wine-100 text-wine-900 hover:bg-wine-50"
        >
          <FileDown className="w-4 h-4" />
          Export to Docs
        </button>

        {/* Add to Cellar (Replaces Favorite) */}
        <button 
          onClick={() => setShowCellarModal(true)}
          className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg tracking-wide uppercase bg-wine-900 text-white shadow-wine-900/20 hover:bg-wine-800`}
        >
          <Package className="w-4 h-4" />
          Add to Cellar
        </button>
      </div>

    </div>
  );
};
