import React, { useEffect, useRef } from 'react';
import { TranscriptSegment } from '../services/transcription/DeepgramClient';

interface TranscriptDisplayProps {
  segments: TranscriptSegment[];
  isRecording: boolean;
  onClear: () => void;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  segments,
  isRecording,
  onClear,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [segments]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  const finalSegments = segments.filter((s) => s.isFinal);
  const interimSegments = segments.filter((s) => !s.isFinal);
  const latestInterim = interimSegments[interimSegments.length - 1];

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Live Transcript</h3>
        <div className="flex items-center space-x-2">
          {isRecording && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-600">Recording</span>
            </div>
          )}
          <button
            onClick={onClear}
            disabled={segments.length === 0}
            className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="h-64 overflow-y-auto border border-gray-100 rounded-md p-3 bg-gray-50 space-y-2"
      >
        {segments.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <p className="text-sm">Start recording to see transcript here</p>
            </div>
          </div>
        )}

        {finalSegments.map((segment, index) => (
          <div
            key={`final-${index}`}
            className="bg-white p-3 rounded border border-gray-200"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-gray-500 font-mono">
                {formatTimestamp(segment.timestamp)}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">Final</span>
                <span
                  className={`text-xs font-medium ${getConfidenceColor(segment.confidence)}`}
                >
                  {getConfidenceText(segment.confidence)}
                </span>
              </div>
            </div>
            <p className="text-gray-900 leading-relaxed">
              {segment.transcript}
            </p>
          </div>
        ))}

        {latestInterim && (
          <div className="bg-blue-50 p-3 rounded border border-blue-200 border-dashed">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-blue-600 font-mono">
                {formatTimestamp(latestInterim.timestamp)}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-blue-600">Interim</span>
                <span
                  className={`text-xs font-medium ${getConfidenceColor(latestInterim.confidence)}`}
                >
                  {getConfidenceText(latestInterim.confidence)}
                </span>
              </div>
            </div>
            <p className="text-blue-800 leading-relaxed italic">
              {latestInterim.transcript}
            </p>
          </div>
        )}
      </div>

      {segments.length > 0 && (
        <div className="text-xs text-gray-500 flex justify-between">
          <span>
            {finalSegments.length} final segment
            {finalSegments.length !== 1 ? 's' : ''}
          </span>
          <span>
            {interimSegments.length} interim result
            {interimSegments.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};
