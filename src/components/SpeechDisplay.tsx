import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
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

const getConfidenceColor = (confidence: number): string => {
  const percentage = confidence * 100;
  if (percentage < 40) return 'text-red-500';
  if (percentage < 70) return 'text-yellow-500';
  return 'text-green-500';
};

const getProgressColor = (confidence: number): string => {
  const percentage = confidence * 100;
  if (percentage < 40) return 'stroke-red-500';
  if (percentage < 70) return 'stroke-yellow-500';
  return 'stroke-green-500';
};

export const SpeechDisplay: React.FC<SpeechDisplayProps> = ({ segments }) => {
  if (segments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No transcripts yet</div>
    );
  }

  return (
    <ol className="relative border-s border-gray-200 dark:border-gray-700">
      {segments.map((segment, index) => {
        const confidencePercentage = Math.round(segment.confidence * 100);
        const circumference = 2 * Math.PI * 10; // radius = 10
        const strokeDashoffset =
          circumference - (confidencePercentage / 100) * circumference;

        return (
          <li
            key={index}
            className={`${index === segments.length - 1 ? 'ms-6' : 'mb-10 ms-6'}`}
          >
            <div className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
              <div className="relative w-6 h-6">
                <svg
                  className="absolute inset-0 w-6 h-6 transform -rotate-90"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={getProgressColor(segment.confidence)}
                    style={{
                      transition: 'stroke-dashoffset 0.5s ease-in-out',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-gray-600 dark:text-gray-300"
                    size="xs"
                  />
                  <span
                    className={`absolute text-[6px] font-bold mt-3 ${getConfidenceColor(segment.confidence)}`}
                  >
                    {confidencePercentage}%
                  </span>
                </div>
              </div>
            </div>
            <div className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-xs sm:flex dark:bg-gray-700 dark:border-gray-600">
              <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                {formatTimestamp(segment.timestamp)}
              </time>
              <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
                {segment.transcript}
                {!segment.isFinal && (
                  <span className="ml-1 text-xs text-gray-400 italic">
                    (interim)
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
