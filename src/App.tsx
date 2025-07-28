import { useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { AudioLevelIndicator } from './components/AudioLevelIndicator';
import { ApiKeyInput } from './components/ApiKeyInput';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { useAudioTranscription } from './hooks/useAudioTranscription';

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    isRecording,
    audioLevel,
    connectionState,
    transcriptSegments,
    error,
    transcriptionError,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useAudioTranscription({ apiKey });

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (!apiKey) {
        return;
      }
      setIsLoading(true);
      try {
        await startRecording();
      } catch (err) {
        console.error('Failed to start recording:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  const isConnected = connectionState === 'connected';
  const canRecord = apiKey && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Real-time Audio Transcription
        </h1>
        
        {/* API Key Configuration */}
        <ApiKeyInput
          onApiKeySubmit={handleApiKeySubmit}
          currentApiKey={apiKey}
          isConnected={isConnected}
          error={transcriptionError?.message}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Audio Controls */}
          <div className="space-y-6">
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Audio Recording</h2>
              
              {/* Recording Status */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <p className="text-lg font-medium text-gray-900">
                  {isRecording ? 'Recording & Transcribing...' : 
                   apiKey ? 'Ready to record' : 'Enter API key to begin'}
                </p>
                {connectionState !== 'idle' && connectionState !== 'connected' && (
                  <p className="text-sm text-gray-500 mt-1 capitalize">
                    Connection: {connectionState}
                  </p>
                )}
              </div>

              {/* Audio Level Indicator */}
              <div className="flex justify-center mb-6">
                <AudioLevelIndicator level={audioLevel} isActive={isRecording} />
              </div>

              {/* Record Button */}
              <div className="flex justify-center mb-4">
                <AudioControls
                  isRecording={isRecording}
                  isLoading={isLoading}
                  onToggleRecording={handleToggleRecording}
                  disabled={!canRecord}
                />
              </div>

              {/* Audio Level Value */}
              {isRecording && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">Audio Level: {audioLevel}%</p>
                </div>
              )}
            </div>

            {/* Audio Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Audio Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Transcript */}
          <div>
            <TranscriptDisplay
              segments={transcriptSegments}
              isRecording={isRecording}
              onClear={clearTranscript}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
