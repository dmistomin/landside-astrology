import { AudioControls } from './AudioControls';
import { AudioLevelIndicator } from './AudioLevelIndicator';
import { RecordingStatus } from './RecordingStatus';

interface RecordingPanelProps {
  isRecording: boolean;
  isLoading: boolean;
  audioLevel: number;
  connectionState: string;
  hasApiKey: boolean;
  canRecord: boolean;
  onToggleRecording: () => void;
}

export function RecordingPanel({
  isRecording,
  isLoading,
  audioLevel,
  connectionState,
  hasApiKey,
  canRecord,
  onToggleRecording,
}: RecordingPanelProps) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Audio Recording
      </h2>

      <RecordingStatus
        isRecording={isRecording}
        hasApiKey={hasApiKey}
        connectionState={connectionState}
        audioLevel={audioLevel}
      />

      <div className="flex justify-center mb-6">
        <AudioLevelIndicator level={audioLevel} isActive={isRecording} />
      </div>

      <div className="flex justify-center mb-4">
        <AudioControls
          isRecording={isRecording}
          isLoading={isLoading}
          onToggleRecording={onToggleRecording}
          disabled={!canRecord}
        />
      </div>
    </div>
  );
}
