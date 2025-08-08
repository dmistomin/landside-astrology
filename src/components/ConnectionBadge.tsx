import React from 'react';
import { ConnectionState } from '../services/transcription/DeepgramClient';

interface ConnectionBadgeProps {
  connectionState: ConnectionState;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({
  connectionState,
}) => {
  const getStylesByStatus = (status: ConnectionState) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-800 border-gray-400';
      case 'connecting':
        return 'bg-yellow-100 text-yellow00 border-yellow-300';
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'reconnecting':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-400';
    }
  };

  return (
    <span
      className={`${getStylesByStatus(connectionState)} text-md font-medium capitalize px-5 py-0.8 rounded-full`}
    >
      {connectionState}
    </span>
  );
};
