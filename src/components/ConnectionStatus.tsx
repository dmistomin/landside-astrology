import { ApiError } from '../types/api';

interface ConnectionStatusProps {
  connectionState: string;
  isConnected: boolean;
  transcriptionError: ApiError | null;
}

export function ConnectionStatus({
  isConnected,
  transcriptionError,
}: ConnectionStatusProps) {
  return (
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
  );
}
