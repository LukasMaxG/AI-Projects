import React, { useRef } from 'react';
import { Camera, WifiOff } from 'lucide-react';

interface ScanButtonProps {
  onImageSelect: (file: File) => void;
  disabled: boolean;
}

export const ScanButton: React.FC<ScanButtonProps> = ({ onImageSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const triggerSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={triggerSelect}
        disabled={disabled}
        className={`rounded-full px-8 py-4 shadow-xl flex items-center space-x-3 transition-all active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed ${disabled ? 'bg-stone-500 text-stone-200 grayscale' : 'bg-wine-900 text-white hover:bg-wine-800'}`}
      >
        {disabled && !navigator.onLine ? <WifiOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
        <span className="font-semibold text-lg">
          {disabled && !navigator.onLine ? "Offline - Search History Only" : "Scan Wine Label"}
        </span>
      </button>
    </div>
  );
};