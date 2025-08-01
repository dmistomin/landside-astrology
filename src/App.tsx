import { useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { AudioLevelIndicator } from './components/AudioLevelIndicator';
import { AudioPlayback } from './components/AudioPlayback';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { useAudioTranscription } from './hooks/useAudioTranscription';

function App() {
  const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY || '';
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
    downloadRecordedAudio,
    getAudioUrl,
  } = useAudioTranscription({ apiKey, language: 'multi' });

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

  const isConnected = connectionState === 'connected';
  const canRecord = apiKey && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Real-time Audio Transcription
        </h1>

        {/* Connection Status */}
        {!apiKey && (
          <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
            <p className="text-sm text-amber-800">
              Please set your Deepgram API key in the .env file
              (VITE_DEEPGRAM_API_KEY)
            </p>
          </div>
        )}

        {apiKey && (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Deepgram API Status
              </h3>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? 'bg-green-500'
                      : transcriptionError
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                  }`}
                />
                <span
                  className={`text-sm ${
                    isConnected
                      ? 'text-green-600'
                      : transcriptionError
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}
                >
                  {isConnected
                    ? 'Connected'
                    : transcriptionError
                      ? 'Error'
                      : 'Disconnected'}
                </span>
              </div>
            </div>
            {transcriptionError && (
              <p className="mt-2 text-sm text-red-600">
                {transcriptionError.message}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Audio Controls */}
          <div className="space-y-6">
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Audio Recording
              </h2>

              {/* Recording Status */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <p className="text-lg font-medium text-gray-900">
                  {isRecording
                    ? 'Recording & Transcribing...'
                    : apiKey
                      ? 'Ready to record'
                      : 'Enter API key to begin'}
                </p>
                {connectionState !== 'idle' &&
                  connectionState !== 'connected' && (
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                      Connection: {connectionState}
                    </p>
                  )}
              </div>

              {/* Audio Level Indicator */}
              <div className="flex justify-center mb-6">
                <AudioLevelIndicator
                  level={audioLevel}
                  isActive={isRecording}
                />
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
                  <p className="text-xs text-gray-500">
                    Audio Level: {audioLevel}%
                  </p>
                </div>
              )}
            </div>

            {/* Audio Playback */}
            <AudioPlayback
              audioUrl={getAudioUrl()}
              onDownload={() => downloadRecordedAudio('recorded-audio.webm')}
            />

            {/* Audio Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg
                    className="w-4 h-4 text-red-400 mt-0.5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      Audio Error
                    </h4>
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
