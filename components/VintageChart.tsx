import React, { useMemo } from 'react';
import { VintageScore } from '../types';

interface VintageChartProps {
  data: VintageScore[];
  currentVintage: string;
}

export const VintageChart: React.FC<VintageChartProps> = ({ data, currentVintage }) => {
  // Sort data by year
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [data]);

  if (sortedData.length < 2) return null;

  // 1. Calculate Scales & Stats
  const scores = sortedData.map(d => d.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  // Find min/max to set dynamic range
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  
  // Dynamic Y-Axis: Add padding above and below
  // Use a range that makes sense for wine scores (usually 80-100), but fallback to data
  const minY = Math.max(0, minScore - 3);
  const maxY = Math.min(100, maxScore + 2);
  const rangeY = maxY - minY;

  // Reduced dimensions to ensure font sizes (px) render larger relative to the viewbox
  const width = 600; 
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const graphWidth = width - (paddingX * 2);
  const graphHeight = height - (paddingY * 2);

  const getX = (index: number) => {
    // Distribute points evenly across the width
    const count = sortedData.length;
    if (count === 1) return width / 2;
    const step = graphWidth / (count - 1);
    return paddingX + (index * step);
  };

  const getY = (score: number) => {
    const normalized = (score - minY) / (rangeY || 1);
    return paddingY + graphHeight - (normalized * graphHeight);
  };

  const yAvg = getY(avgScore);

  // Generate Points & Paths
  const points = sortedData.map((d, i) => ({
    x: getX(i),
    y: getY(d.score),
    ...d
  }));

  // Line Path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Area Path (Close the loop at bottom)
  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x} ${height - paddingY}
    L ${points[0].x} ${height - paddingY}
    Z
  `;

  return (
    <div className="w-full select-none">
      <div className="relative w-full aspect-[2.5/1] max-h-60">
        <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible font-sans"
            preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" /> {/* Gold-500 */}
              <stop offset="100%" stopColor="#d97706" /> {/* Gold-600 */}
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
               <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3"/>
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
               <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
          </defs>

          {/* Y-Axis Grid Lines & Labels */}
          {[minY, (minY + maxY) / 2, maxY].map((val, i) => {
              const y = getY(val);
              return (
                  <g key={i}>
                      <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="0" />
                      <text x={paddingX - 12} y={y + 4} textAnchor="end" className="text-xs fill-slate-300 font-medium tracking-tight tabular-nums">
                        {Math.round(val)}
                      </text>
                  </g>
              )
          })}

          {/* Average Line */}
           <line x1={paddingX} y1={yAvg} x2={width - paddingX} y2={yAvg} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" strokeOpacity="0.5" />
           <text x={width - paddingX + 6} y={yAvg + 3} className="text-[10px] fill-slate-300 font-bold font-mono uppercase tracking-widest">Avg {avgScore}</text>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line Stroke */}
          <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#shadow)' }} />

          {/* Data Points */}
          {points.map((p, i) => {
             const isCurrent = p.year === currentVintage;
             return (
               <g key={p.year}>
                 {/* Circle Point */}
                 <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={isCurrent ? 5 : 3.5} 
                    fill={isCurrent ? "#f59e0b" : "#1e293b"} // Gold fill if current, Dark bg match if other
                    stroke={isCurrent ? "#ffffff" : "#94a3b8"} 
                    strokeWidth={isCurrent ? 2 : 1.5}
                    className="transition-all duration-300"
                    style={{ filter: isCurrent ? 'url(#glow)' : 'none' }}
                 />

                 {/* Score Label (Above) */}
                 <text 
                    x={p.x} 
                    y={p.y - 12} 
                    textAnchor="middle" 
                    className={`text-sm tracking-tight ${isCurrent ? 'fill-gold-400 font-bold' : 'fill-slate-300 font-medium'}`}
                 >
                    {p.score}
                 </text>

                 {/* Year Label (Bottom) */}
                 <text 
                    x={p.x} 
                    y={height - 8} 
                    textAnchor="middle" 
                    className={`text-xs tracking-tight ${isCurrent ? 'fill-white font-bold' : 'fill-slate-400 font-medium'}`}
                 >
                    {p.year}
                 </text>
               </g>
             );
          })}
        </svg>
      </div>
    </div>
  );
};
