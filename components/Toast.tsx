import React, { useEffect } from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info';
}

interface ToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ messages, onRemove }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs space-y-3 px-4 pointer-events-none">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ message: ToastMessage; onRemove: (id: string) => void }> = ({ message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(message.id), 4000);
    return () => clearTimeout(timer);
  }, [message.id, onRemove]);

  return (
    <div className="pointer-events-auto animate-slide-down bg-white/95 backdrop-blur-md border border-wine-100 rounded-2xl p-4 shadow-2xl flex items-center gap-3 ring-1 ring-black/5">
      <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-wine-50 text-wine-600'}`}>
        {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
      </div>
      <p className="flex-1 text-sm font-bold text-wine-900 leading-tight">
        {message.text}
      </p>
      <button onClick={() => onRemove(message.id)} className="text-stone-300 hover:text-stone-500 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
