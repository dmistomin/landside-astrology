import { useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { AudioLevelIndicator } from './components/AudioLevelIndicator';
import { useAudioStream } from './hooks/useAudioStream';

function App() {
  const { isRecording, audioLevel, error, startRecording, stopRecording } = useAudioStream();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      setIsLoading(true);
      await startRecording();
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Audio Capture Demo
        </h1>
        
        <div className="space-y-8">
          {/* Recording Status */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Status</p>
            <p className="text-lg font-medium text-white">
              {isRecording ? 'Recording...' : 'Ready to record'}
            </p>
          </div>

          {/* Audio Level Indicator */}
          <div className="flex justify-center">
            <AudioLevelIndicator level={audioLevel} isActive={isRecording} />
          </div>

          {/* Record Button */}
          <div className="flex justify-center">
            <AudioControls
              isRecording={isRecording}
              isLoading={isLoading}
              onToggleRecording={handleToggleRecording}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Audio Level Value (for debugging) */}
          {isRecording && (
            <div className="text-center">
              <p className="text-xs text-gray-500">Audio Level: {audioLevel}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
