import React from 'react';
import { TranscriptSegment } from '../services/transcription/DeepgramClient';

interface SpeechDisplayProps {
  segments: TranscriptSegment[];
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const SpeechDisplay: React.FC<SpeechDisplayProps> = ({ segments }) => {
  return (
  <div>
      <code>{segments.map(s => JSON.stringify(s))}</code>
  </div>
  )
}
