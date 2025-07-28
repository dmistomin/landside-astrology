import React from 'react';

interface AudioControlsProps {
  isRecording: boolean;
  isLoading: boolean;
  onToggleRecording: () => void;
  disabled?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isRecording,
  isLoading,
  onToggleRecording,
  disabled = false,
}) => {
  return (
    <button
      onClick={onToggleRecording}
      disabled={isLoading || disabled}
      className={`
        relative flex items-center justify-center
        w-20 h-20 rounded-full
        transition-all duration-200 transform
        ${(isLoading || disabled) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${isRecording 
          ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
          : disabled ? 'bg-gray-400' : 'bg-red-900/70 hover:bg-red-800/80 shadow-lg shadow-red-900/30'
        }
      `}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <div className="w-6 h-6 bg-white rounded-sm" />
      ) : (
        <div className="w-6 h-6 bg-white rounded-full" />
      )}
      
      {isRecording && (
        <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" />
      )}
    </button>
  );
};