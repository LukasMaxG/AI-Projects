import React from 'react';
import { GrapeComposition } from '../types';

interface CompositionChartProps {
  data: GrapeComposition[];
}

export const CompositionChart: React.FC<CompositionChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, curr) => acc + curr.percentage, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const colors = [
    '#882333',
    '#c3354b',
    '#e58796',
    '#f6d5da',
    '#d6d3d1',
  ];

  const slices = data.map((slice, index) => {
    const startPercent = cumulativePercent;
    const endPercent = cumulativePercent + (slice.percentage / total);
    cumulativePercent = endPercent;

    const [startX, startY] = getCoordinatesForPercent(startPercent - 0.25);
    const [endX, endY] = getCoordinatesForPercent(endPercent - 0.25);

    if (slice.percentage >= 100) {
      return {
        path: `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`,
        color: colors[index % colors.length],
        label: slice.grape,
        percent: slice.percentage
      };
    }

    const largeArcFlag = slice.percentage / total > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`,
    ].join(' ');

    return {
      path: pathData,
      color: colors[index % colors.length],
      label: slice.grape,
      percent: slice.percentage
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
           {slices.map((slice, i) => (
             <path 
               key={i} 
               d={slice.path} 
               fill={slice.color} 
               stroke="white" 
               strokeWidth="0.05"
             />
           ))}
           <circle cx="0" cy="0" r="0.6" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Blend</span>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-1 gap-2">
         {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></div>
               <div className="flex flex-col leading-none">
                   <span className="text-sm font-bold text-wine-900">{slice.percent}%</span>
                   <span className="text-xs text-stone-500 font-medium">{slice.label}</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};