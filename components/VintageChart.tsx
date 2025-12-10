import React, { useMemo } from 'react';
import { VintageScore } from '../types';

interface VintageChartProps {
  data: VintageScore[];
  currentVintage: string;
}

export const VintageChart: React.FC<VintageChartProps> = ({ data, currentVintage }) => {
  // Sort data by year just in case AI returns them out of order
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [data]);

  if (sortedData.length < 2) return null;

  // 1. Calculate Scales
  const scores = sortedData.map(d => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  
  // Add some padding to the Y axis so the line doesn't hit the absolute edges
  const yPadding = 5;
  const minY = Math.max(0, minScore - yPadding); // Floor at 0
  const maxY = Math.min(100, maxScore + yPadding); // Ceiling at 100
  const rangeY = maxY - minY;

  // 2. Helper to map values to SVG coordinates
  // ViewBox will be 1000 x 200 roughly
  const width = 1000;
  const height = 300;
  const paddingX = 50;
  const paddingY = 20;
  const graphWidth = width - (paddingX * 2);
  const graphHeight = height - (paddingY * 2);

  const getX = (index: number) => {
    return paddingX + (index / (sortedData.length - 1)) * graphWidth;
  };

  const getY = (score: number) => {
    const normalized = (score - minY) / rangeY;
    // SVG Y is inverted (0 is top)
    return paddingY + graphHeight - (normalized * graphHeight);
  };

  // 3. Generate Path Data
  const points = sortedData.map((d, i) => `${getX(i)},${getY(d.score)}`).join(' ');
  
  // Area path (closed loop at bottom)
  const areaPath = `
    M ${getX(0)},${height} 
    L ${points} 
    L ${getX(sortedData.length - 1)},${height} 
    Z
  `;

  return (
    <div className="w-full select-none">
      <div className="relative w-full aspect-[2/1] max-h-60">
        <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a32639" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#a32639" stopOpacity="0.0"/>
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid Lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" strokeOpacity="0.2" />
          <line x1={paddingX} y1={paddingY + graphHeight/2} x2={width - paddingX} y2={paddingY + graphHeight/2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" strokeOpacity="0.2" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" strokeOpacity="0.2" />

          {/* The Filled Area */}
          <path 
            d={areaPath} 
            fill="url(#chartGradient)" 
          />

          {/* The Line Graph */}
          <polyline 
            points={points} 
            fill="none" 
            stroke="#a32639" 
            strokeWidth="4" 
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Data Points */}
          {sortedData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.score);
            const isCurrent = d.year === currentVintage;
            
            return (
              <g key={d.year}>
                {/* Interaction Target (invisible larger circle) */}
                <circle cx={cx} cy={cy} r="30" fill="transparent" />
                
                {/* Visual Dot */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isCurrent ? 8 : 5} 
                  fill={isCurrent ? "#a32639" : "#fff"} 
                  stroke="#a32639" 
                  strokeWidth={isCurrent ? 3 : 2}
                  className="transition-all duration-300"
                />

                {/* Score Label (Above Dot) */}
                <text 
                  x={cx} 
                  y={cy - 20} 
                  textAnchor="middle" 
                  className={`text-2xl fill-white ${isCurrent ? 'font-bold' : 'font-medium opacity-70'}`}
                  style={{ fontSize: '24px', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}
                >
                  {d.score}
                </text>

                {/* Year Label (Bottom) */}
                <text 
                  x={cx} 
                  y={height} 
                  textAnchor="middle" 
                  className={`fill-slate-400 ${isCurrent ? 'font-bold fill-white' : 'font-medium opacity-60'}`}
                  style={{ fontSize: '20px', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}
                >
                  {d.year}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Current Vintage Indicator Overlay */}
        {sortedData.find(d => d.year === currentVintage) && (
            <div className="absolute top-2 right-2 bg-slate-800/80 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm pointer-events-none tracking-wide">
                Comparing {currentVintage}
            </div>
        )}
      </div>
    </div>
  );
};