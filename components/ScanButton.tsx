import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';

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
        className="bg-wine-900 text-white rounded-full px-8 py-4 shadow-xl flex items-center space-x-3 hover:bg-wine-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Camera className="w-6 h-6" />
        <span className="font-semibold text-lg">Scan Wine Label</span>
      </button>
    </div>
  );
};
