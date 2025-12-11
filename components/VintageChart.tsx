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

  // 1. Calculate Scales
  const scores = sortedData.map(d => d.score);
  // Zoom in on the variance (e.g. if scores are 90-95, don't show 0-100)
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  
  // Dynamic Y-Axis: min is slightly below lowest score, max is 100
  const minY = Math.max(0, minScore - 5);
  const maxY = 100;
  const rangeY = maxY - minY;

  const width = 800;
  const height = 250;
  const paddingX = 40;
  const paddingY = 30;
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

  const barWidth = Math.min(60, (graphWidth / sortedData.length) * 0.6); // 60% of slot width

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
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.8"/> {/* Slate-400 */}
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.5"/> {/* Slate-500 */}
            </linearGradient>
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
                >
                  {d.score}
                </text>

                {/* Year Label (Bottom) */}
                <text 
                  x={x} 
                  y={height - 5} 
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