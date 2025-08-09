import { useState } from 'react';
import { ApiKeyWarning } from './components/ApiKeyWarning';
import { AppHeader } from './components/AppHeader';
import { AppBar } from './components/AppBar';
import { AudioErrorDisplay } from './components/AudioErrorDisplay';
import { AudioPlayback } from './components/AudioPlayback';
import { RecordingPanel } from './components/RecordingPanel';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { useAudioTranscription } from './hooks/useAudioTranscription';
import { SpeechDisplay } from './components/SpeechDisplay.tsx';

function App() {
  const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY || '';
  const [isLoading, setIsLoading] = useState(false);

  const {
    isRecording,
    audioLevel,
    connectionState,
    transcriptSegments,
    error,
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

  const canRecord = !!apiKey && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AppBar title="'Landside Astrology'" apiKey={apiKey} connectionState={connectionState} />
      <div className="max-w-4xl mx-auto space-y-6 py-20 px-4">
        {!apiKey && <ApiKeyWarning />}
        <SpeechDisplay segments={transcriptSegments} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Audio Controls */}
          <div className="space-y-6">
            <RecordingPanel
              isRecording={isRecording}
              isLoading={isLoading}
              audioLevel={audioLevel}
              connectionState={connectionState}
              hasApiKey={!!apiKey}
              canRecord={canRecord}
              onToggleRecording={handleToggleRecording}
            />

            <AudioPlayback
              audioUrl={getAudioUrl()}
              onDownload={() => downloadRecordedAudio('recorded-audio.webm')}
            />

            {error && <AudioErrorDisplay error={error} />}
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
