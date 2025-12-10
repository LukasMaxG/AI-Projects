import React, { useState, useEffect } from 'react';
import { WineData, LegendaryVintage } from '../types';
import { Download, MapPin, Droplet, TrendingUp, Utensils, Thermometer, Wine as WineIcon, Mountain, ExternalLink, Lightbulb, Clock, BookOpen, ChevronDown, ChevronUp, Activity, FileDown, Heart, Award, Star } from 'lucide-react';
import { VintageChart } from './VintageChart';

interface WineDisplayProps {
  data: WineData;
  imagePreview: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

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

const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
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

export const WineDisplay: React.FC<WineDisplayProps> = ({ data, imagePreview, isFavorite, onToggleFavorite }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  // Reset state when data changes (new search)
  useEffect(() => {
    setCurrentImageIndex(0);
    setUsingFallback(false);
  }, [data]);
  
  const fallbackImage = 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&q=80&w=600';
  
  // Logic: 
  // 1. User Scan Preview (if available)
  // 2. AI Candidates (cycling through index)
  // 3. Fallback
  const getDisplayImage = () => {
    if (imagePreview) return imagePreview;
    if (usingFallback) return fallbackImage;
    
    const candidates = data.imageCandidates || (data.onlineImage ? [data.onlineImage] : []);
    if (candidates.length > 0 && currentImageIndex < candidates.length) {
      return candidates[currentImageIndex];
    }
    return fallbackImage;
  };

  const handleImageError = () => {
    const candidates = data.imageCandidates || (data.onlineImage ? [data.onlineImage] : []);
    if (currentImageIndex < candidates.length - 1) {
      // Try next candidate
      setCurrentImageIndex(prev => prev + 1);
    } else {
      // All failed, use fallback
      setUsingFallback(true);
    }
  };
  
  const displayImage = getDisplayImage();
  
  // Google Maps Link
  const mapQuery = encodeURIComponent(`${data.region}, ${data.country}`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  // Value Rating Logic (Vivino Style)
  const score = parseInt(data.criticScores?.[0]?.score || '0');
  const rating5Scale = score > 0 ? (score / 20).toFixed(1) : 'N/A';
  
  const getValueBadge = (score: number) => {
    if (score >= 95) return { label: "Iconic", color: "bg-purple-100 text-purple-700 border-purple-200" };
    if (score >= 90) return { label: "Excellent Value", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    if (score >= 85) return { label: "Good Value", color: "bg-amber-100 text-amber-700 border-amber-200" };
    return null;
  };
  
  const valueBadge = getValueBadge(score);

  const WebsiteWrapper = ({ children }: { children: React.ReactNode }) => {
    if (data.websiteUrl) {
      return (
        <a href={data.websiteUrl} target="_blank" rel="noopener noreferrer" className="group relative block cursor-pointer">
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
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.name} - Sommelier AI Report</title>
        <style>
          body { font-family: 'Georgia', serif; color: #444; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { color: #882333; font-size: 2.5em; margin-bottom: 0.2em; border-bottom: 3px solid #f6d5da; padding-bottom: 15px; }
          .subtitle { font-size: 1.2em; color: #666; font-style: italic; margin-bottom: 40px; }
          .section { margin-bottom: 30px; background: #fafaf9; padding: 25px; border-radius: 8px; border: 1px solid #e7e5e4; }
          h2 { color: #882333; font-size: 1.4em; margin-top: 0; text-transform: uppercase; letter-spacing: 0.05em; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .label { font-weight: bold; font-size: 0.8em; text-transform: uppercase; color: #999; display: block; margin-bottom: 4px; }
          .value { font-size: 1.1em; color: #222; font-weight: 500; }
          .tag { display: inline-block; background: #e7e5e4; padding: 4px 10px; border-radius: 12px; font-size: 0.9em; margin-right: 5px; }
          footer { margin-top: 50px; border-top: 1px solid #eee; pt: 20px; font-size: 0.8em; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${data.name}</h1>
        <div class="subtitle">${data.vintage} &bull; ${data.region}, ${data.country}</div>
        
        <div class="grid">
          <div class="section">
             <h2>Analysis</h2>
             <p><span class="label">Market Price</span> <span class="value">${data.marketPrice}</span></p>
             <p><span class="label">Critic Score</span> <span class="value">${data.criticScores?.[0]?.score || 'N/A'}</span></p>
             <p><span class="label">Drinking Window</span> <span class="value">${data.aging?.drinkFrom} - ${data.aging?.drinkUntil}</span></p>
          </div>
          <div class="section">
             <h2>Winemaking</h2>
             <p><span class="label">Varietals</span> <span class="value">${data.varietals.join(', ')}</span></p>
             <p><span class="label">ABV</span> <span class="value">${data.abv}</span></p>
             <p><span class="label">Type</span> <span class="value">${data.type}</span></p>
          </div>
        </div>

        <div class="section">
           <h2>Tasting Profile</h2>
           <p><span class="label">Nose</span> <span class="value">${data.nose}</span></p>
           <p><span class="label">Taste</span> <span class="value">${data.taste}</span></p>
        </div>

        <div class="section">
           <h2>Heritage</h2>
           <p>${data.wineryInfo}</p>
        </div>
        
        <footer>Generated by Sommelier AI - MagmaTek.com</footer>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-report.html`;
    link.click();
  };

  return (
    <div className="pb-24 space-y-6">
      
      {/* ZONE 1: SNAPSHOT (Header) */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-wine-100/50 relative overflow-hidden mx-4">
        {/* Decorative BG */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-wine-50 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex gap-6">
            {/* Left: Image (Winery or Bottle) */}
            <div className="w-1/3 shrink-0">
               <WebsiteWrapper>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-100 shadow-md relative flex items-center justify-center group">
                    <img 
                      src={displayImage} 
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
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
            <div className="flex-1 flex flex-col justify-center min-w-0">
                <a 
                   href={mapUrl}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-1.5 text-wine-600 hover:text-wine-800 text-[10px] font-bold uppercase tracking-widest mb-2 cursor-pointer transition-colors"
                >
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1 underline decoration-dotted underline-offset-2">{data.country}</span>
                </a>
                <h2 className="text-2xl font-serif font-bold text-wine-950 leading-[1.1] tracking-tight mb-2 line-clamp-3">
                    {data.name}
                </h2>
                
                {/* Region / Grape Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 bg-wine-50 text-wine-900 text-[9px] font-bold rounded-md uppercase tracking-wide border border-wine-100 truncate max-w-full">
                        {data.region}
                    </span>
                    {data.varietals.slice(0, 1).map(v => (
                         <span key={v} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[9px] font-bold rounded-md uppercase tracking-wide border border-stone-200">
                            {v}
                        </span>
                    ))}
                </div>

                {/* Modern Value Indicator & Price Card */}
                <div className="mt-auto bg-stone-50 rounded-xl p-3 border border-stone-100 flex items-center justify-between shadow-sm">
                    {/* Price */}
                    <div>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-0.5">Price</p>
                        <p className="text-lg font-serif font-bold text-wine-900 tabular-nums tracking-tight leading-none">{data.marketPrice}</p>
                    </div>
                    
                    {/* Vivino-style Rating */}
                    {score > 0 && (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-bold text-wine-900 leading-none">{rating5Scale}</span>
                                    <div className="flex -space-x-0.5">
                                        {[1,2,3,4,5].map(i => (
                                            <Star key={i} className={`w-2.5 h-2.5 ${i <= Math.round(Number(rating5Scale)) ? 'fill-gold-500 text-gold-500' : 'text-stone-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-wine-900 text-white text-xs font-bold px-1.5 py-1 rounded min-w-[24px] text-center">
                                    {score}
                                </div>
                            </div>
                            {valueBadge && (
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide mt-1 border ${valueBadge.color}`}>
                                    {valueBadge.label}
                                </span>
                            )}
                        </div>
                    )}
                </div>
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
                        {/* Fake active bar for visual effect */}
                        <div className="absolute left-[10%] right-[10%] h-full bg-gradient-to-r from-slate-600 via-gold-500 to-slate-600 opacity-80"></div>
                     </div>
                     <div className="flex justify-between text-sm font-bold mt-2 font-mono tracking-tighter">
                        <span>{data.aging.drinkFrom}</span>
                        <span className="text-gold-400 text-base">{data.aging.peakYears}</span>
                        <span>{data.aging.drinkUntil}</span>
                     </div>
                </div>

                {/* Chart */}
                {data.vintageComparison && data.vintageComparison.length > 0 && (
                    <div className="mb-6 bg-slate-800/50 rounded-xl p-2 border border-white/5 shadow-inner">
                        <VintageChart data={data.vintageComparison} currentVintage={data.vintage} />
                    </div>
                )}

                {/* ROI */}
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Projected 5yr Value</p>
                        <p className="text-xl font-bold text-emerald-400 tabular-nums tracking-tight">{data.aging.estimatedValue5Years}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Investment Grade</p>
                        <p className="text-sm font-bold text-white tracking-wide">{data.aging.investmentPotential}</p>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* ZONE 4: EXPLORER (The Deep Dive - Collapsible) */}
      <div className="mx-4 space-y-4">
         
         {/* Pairing Accordion (If list is long) */}
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

         {/* Terroir Accordion */}
         {data.terroir && (
            <CollapsibleSection title="Terroir & Winemaking" icon={Mountain}>
                <div className="space-y-5">
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
                 
                 {data.bestVintages && (
                     <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Legendary Vintages</p>
                         <div className="space-y-3">
                             {data.bestVintages.map((v, i) => {
                                 // Backward compatibility check for old string-based data
                                 if (typeof v === 'string') {
                                     return (
                                        <span key={i} className="text-sm font-bold text-wine-900 bg-white px-2 py-1 rounded shadow-sm border border-stone-200 tabular-nums inline-block mr-2">
                                            {v}
                                        </span>
                                     );
                                 }
                                 // Rich Data Display
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

                 {data.funFacts && (
                     <div className="space-y-3">
                         {data.funFacts.map((fact, i) => (
                             <div key={i} className="flex gap-3 text-sm text-stone-600 leading-relaxed bg-white p-3 rounded-lg border border-stone-100">
                                 <Lightbulb className="w-5 h-5 text-gold-500 shrink-0" />
                                 <span>{fact}</span>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         </CollapsibleSection>
      </div>

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

        {/* Favorite Button */}
        <button 
          onClick={onToggleFavorite}
          className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg tracking-wide uppercase ${isFavorite ? 'bg-wine-600 text-white shadow-wine-900/20 hover:bg-wine-700' : 'bg-wine-900 text-white shadow-wine-900/20 hover:bg-wine-800'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Saved' : 'Add to Favorites'}
        </button>
      </div>

    </div>
  );
};