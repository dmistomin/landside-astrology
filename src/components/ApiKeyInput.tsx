import React, { useState, FormEvent } from 'react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  currentApiKey?: string;
  isConnected: boolean;
  error?: string | null;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeySubmit,
  currentApiKey = '',
  isConnected,
  error,
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      return;
    }

    if (!isValidApiKeyFormat(trimmedKey)) {
      return;
    }

    onApiKeySubmit(trimmedKey);
  };

  const isValidApiKeyFormat = (key: string): boolean => {
    return key.length >= 40 && /^[a-zA-Z0-9_-]+$/.test(key);
  };

  const getConnectionStatusColor = () => {
    if (isConnected) return 'text-green-600';
    if (error) return 'text-red-600';
    return 'text-gray-500';
  };

  const getConnectionStatusText = () => {
    if (isConnected) return 'Connected';
    if (error) return 'Error';
    return 'Disconnected';
  };

  const hasValidFormat = apiKey.trim()
    ? isValidApiKeyFormat(apiKey.trim())
    : true;

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Deepgram API Configuration
        </h3>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-green-500'
                : error
                  ? 'bg-red-500'
                  : 'bg-gray-400'
            }`}
          />
          <span className={`text-sm ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            API Key
          </label>
          <div className="relative">
            <input
              id="apiKey"
              type={isVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Deepgram API key"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-20 ${
                !hasValidFormat ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isConnected}
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {isVisible ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
            <button
              type="submit"
              disabled={!apiKey.trim() || !hasValidFormat || isConnected}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Connect
            </button>
          </div>
          {!hasValidFormat && apiKey.trim() && (
            <p className="mt-1 text-xs text-red-600">
              Invalid API key format. Expected 40+ characters with letters,
              numbers, underscores, and hyphens only.
            </p>
          )}
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg
              className="w-4 h-4 text-red-400 mt-0.5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Connection Error
              </h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {currentApiKey && !isConnected && (
        <div className="text-xs text-gray-500">
          Using API key: {currentApiKey.slice(0, 8)}...{currentApiKey.slice(-4)}
        </div>
      )}
    </div>
  );
};
