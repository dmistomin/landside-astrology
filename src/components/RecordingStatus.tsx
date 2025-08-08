interface RecordingStatusProps {
  isRecording: boolean;
  hasApiKey: boolean;
  connectionState: string;
  audioLevel: number;
}

export function RecordingStatus({
  isRecording,
  hasApiKey,
  connectionState,
  audioLevel,
}: RecordingStatusProps) {
  return (
    <div className="text-center mb-6">
      <p className="text-sm text-gray-500 mb-2">Status</p>
      <p className="text-lg font-medium text-gray-900">
        {isRecording
          ? 'Recording & Transcribing...'
          : hasApiKey
            ? 'Ready to record'
            : 'Enter API key to begin'}
      </p>
      {connectionState !== 'idle' && connectionState !== 'connected' && (
        <p className="text-sm text-gray-500 mt-1 capitalize">
          Connection: {connectionState}
        </p>
      )}
      {isRecording && (
        <p className="text-xs text-gray-500 mt-4">Audio Level: {audioLevel}%</p>
      )}
    </div>
  );
}
