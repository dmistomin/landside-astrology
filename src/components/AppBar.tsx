import React from 'react';

import { ConnectionState } from '../services/transcription/DeepgramClient';
import { ConnectionBadge } from './ConnectionBadge';

interface AppBarProps {
  title: string;
  apiKey: string;
  connectionState: ConnectionState;
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  apiKey,
  connectionState,
}) => {
  return (
    <div className="bg-white fixed w-full z-20 top-0 start-0 border-b border-gray-200 shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto py-4 px-8">
        <h1 className="text-xl font-bold">{title}</h1>
        <ConnectionBadge apiKey={apiKey} connectionState={connectionState} />
      </div>
    </div>
  );
};
