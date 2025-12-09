import React from 'react';
import { VintageScore } from '../types';

interface VintageChartProps {
  data: VintageScore[];
  currentVintage: string;
}

export const VintageChart: React.FC<VintageChartProps> = ({ data, currentVintage }) => {
  // Find max score to normalize bar heights (assuming 100 point scale usually)
  const maxScore = Math.max(...data.map(d => d.score), 90);
  const minScore = Math.min(...data.map(d => d.score), 80);
  
  // Calculate height relative to a baseline (e.g. 70 points) to accentuate differences
  const getHeight = (score: number) => {
    const baseline = 80;
    const effectiveScore = Math.max(score, baseline);
    const range = 100 - baseline;
    const percentage = ((effectiveScore - baseline) / range) * 100;
    return Math.max(percentage, 10); // Minimum 10% height
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-40 gap-2 mt-4 px-2">
        {data.map((item, index) => {
          const isCurrent = item.year === currentVintage;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="text-xs font-bold text-wine-900 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.score}
              </div>
              <div 
                className={`w-full max-w-[3rem] rounded-t-lg transition-all duration-500 relative ${
                  isCurrent ? 'bg-wine-600' : 'bg-wine-200'
                }`}
                style={{ height: `${getHeight(item.score)}%` }}
              >
                {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
                )}
              </div>
              <div className={`mt-2 text-xs font-medium text-center ${isCurrent ? 'text-wine-900 font-bold' : 'text-wine-500'}`}>
                {item.year}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-wine-400 text-center uppercase tracking-widest">
        Vintage Comparison
      </div>
    </div>
  );
};