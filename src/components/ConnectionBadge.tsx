import React from 'react';
import { ConnectionState } from '../services/transcription/DeepgramClient';

interface ConnectionBadgeProps {
  connectionState: ConnectionState;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({
  connectionState,
}) => {
  return (
    <span className="bg-gray-100 text-gray-800 border border-gray-400 text-md font-medium capitalize px-5 py-0.8 rounded-full">
      {connectionState}
    </span>
  );
};
