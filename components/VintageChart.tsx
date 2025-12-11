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
  
  // Zoom in on the variance (e.g. if scores are 90-95, don't show 0-100)
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  
  // Dynamic Y-Axis: min is slightly below lowest score, max is 100
  const minY = Math.max(0, minScore - 4);
  const maxY = 100;
  const rangeY = maxY - minY;

  const width = 800;
  const height = 280; // Increased height slightly
  const paddingX = 40;
  const paddingY = 40;
  const graphWidth = width - (paddingX * 2);
  const graphHeight = height - (paddingY * 2);

  const getX = (index: number) => {
    // Distribute bars evenly
    const count = sortedData.length;
    const step = graphWidth / count;
    // Center the bar in the step
    return paddingX + (index * step) + (step / 2);
  };

  const getY = (score: number) => {
    const normalized = (score - minY) / rangeY;
    return paddingY + graphHeight - (normalized * graphHeight);
  };

  const yAvg = getY(avgScore);

  const barWidth = Math.min(60, (graphWidth / sortedData.length) * 0.5); // 50% of slot width

  // Generate Trend Line Path
  const trendPath = useMemo(() => {
    if (sortedData.length < 2) return '';
    return sortedData.map((d, i) => {
        const x = getX(i);
        const y = getY(d.score);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [sortedData, minY, rangeY]);

  return (
    <div className="w-full select-none">
      <div className="relative w-full aspect-[2/1] max-h-60">
        <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="barGradientCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1"/> {/* Gold-500 */}
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.8"/> {/* Gold-600 */}
            </linearGradient>
            <linearGradient id="barGradientOther" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.7"/> {/* Slate-400 */}
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.3"/> {/* Slate-500 */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {[0, 0.5, 1].map((tick) => {
              const y = paddingY + (graphHeight * tick);
              const val = Math.round(maxY - (tick * rangeY));
              return (
                  <g key={tick}>
                      <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4,4" />
                      <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">{val}</text>
                  </g>
              )
          })}

          {/* Average Line */}
          <g>
             <line x1={paddingX} y1={yAvg} x2={width - paddingX} y2={yAvg} stroke="#f59e0b" strokeWidth="1" strokeDasharray="6,4" strokeOpacity="0.6" />
             <text x={width - paddingX + 5} y={yAvg + 4} className="text-[10px] fill-gold-500/80 font-bold font-mono">Avg {avgScore}</text>
          </g>

          {/* Trend Line (Behind Bars) */}
          <path d={trendPath} fill="none" stroke="#f8fafc" strokeWidth="2" strokeOpacity="0.2" />

          {/* Bars */}
          {sortedData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.score);
            const h = height - paddingY - y; // Height from y down to bottom
            const isCurrent = d.year === currentVintage;

            return (
              <g key={d.year}>
                <rect
                    x={x - (barWidth / 2)}
                    y={y}
                    width={barWidth}
                    height={h}
                    rx="4"
                    fill={isCurrent ? "url(#barGradientCurrent)" : "url(#barGradientOther)"}
                    className="transition-all duration-300 hover:opacity-100 opacity-90"
                />
                
                {/* Score Label (Top of Bar) */}
                <text 
                  x={x} 
                  y={y - 8} 
                  textAnchor="middle" 
                  className={`text-sm ${isCurrent ? 'fill-white font-bold' : 'fill-slate-400 font-medium'}`}
                  style={{ filter: isCurrent ? 'url(#glow)' : 'none' }}
                >
                  {d.score}
                </text>

                {/* Year Label (Bottom) */}
                <text 
                  x={x} 
                  y={height - 10} 
                  textAnchor="middle" 
                  className={`text-xs ${isCurrent ? 'fill-gold-400 font-bold' : 'fill-slate-500 font-medium'}`}
                >
                  {d.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};