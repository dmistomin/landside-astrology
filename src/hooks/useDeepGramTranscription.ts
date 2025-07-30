import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DeepgramClient,
  ConnectionState,
  TranscriptSegment,
} from '../services/transcription/DeepgramClient';
import { DeepgramConfig, ApiError } from '../types/api';

interface UseDeepgramTranscriptionProps {
  apiKey?: string;
  language?: 'en' | 'multi';
  config?: Partial<DeepgramConfig>;
}

interface UseDeepgramTranscriptionReturn {
  client: DeepgramClient | null;
  connectionState: ConnectionState;
  transcriptSegments: TranscriptSegment[];
  error: ApiError | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudioData: (data: ArrayBuffer) => void;
  clearTranscript: () => void;
}

export const useDeepgramTranscription = ({
  apiKey,
  language = 'en',
  config = {},
}: UseDeepgramTranscriptionProps = {}): UseDeepgramTranscriptionReturn => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('idle');
  const [transcriptSegments, setTranscriptSegments] = useState<
    TranscriptSegment[]
  >([]);
  const [error, setError] = useState<ApiError | null>(null);

  // Create client only once using useMemo
  const client = useMemo(() => {
    if (!apiKey) {
      console.log('🟡 No API key provided, client not created');
      return null;
    }

    const fullConfig: DeepgramConfig = {
      apiKey,
      language,
      punctuate: true,
      smartFormat: true,
      encoding: 'linear16',
      channels: 1,
      sampleRate: 44100, // Match browser's default sample rate
      ...config,
    } as DeepgramConfig;

    console.log('🟡 Creating new DeepgramClient with config:', {
      ...fullConfig,
      apiKey: '***' + fullConfig.apiKey.slice(-4),
    });

    return new DeepgramClient(fullConfig);
  }, [apiKey, language, config]);

  // Set up event listeners
  useEffect(() => {
    if (!client) return;

    const unsubscribeConnectionState = client.onConnectionState((state) => {
      setConnectionState(state);
    });

    const unsubscribeTranscript = client.onTranscript((segment) => {
      console.log('🟡 Received transcript segment:', segment);
      setTranscriptSegments((prev) => {
        console.log('🟡 Current segments before update:', prev.length);
        if (segment.isFinal) {
          const filtered = prev.filter((s) => s.isFinal);
          const newSegments = [...filtered, segment];
          console.log(
            '🟡 Adding final segment, new total:',
            newSegments.length
          );
          return newSegments;
        } else {
          const filtered = prev.filter((s) => s.isFinal);
          const newSegments = [...filtered, segment];
          console.log(
            '🟡 Adding interim segment, new total:',
            newSegments.length
          );
          return newSegments;
        }
      });
    });

    const unsubscribeError = client.onError((err) => {
      setError(err);
    });

    console.log('🟡 Deepgram client listeners set up');

    return () => {
      unsubscribeConnectionState();
      unsubscribeTranscript();
      unsubscribeError();
      client.disconnect();
    };
  }, [client]);

  const connect = useCallback(async () => {
    console.log('🟡 useDeepgramTranscription.connect() called');
    console.log('🟡 Client available:', !!client);
    console.log('🟡 Current connection state:', client?.getConnectionState());

    if (!client) {
      console.error('🟡 No Deepgram client available!');
      throw new Error('Deepgram client not initialized');
    }

    // If already connected or connecting, return immediately
    const currentState = client.getConnectionState();
    if (currentState === 'connected' || currentState === 'connecting') {
      console.log(
        '🟡 Already connected/connecting, skipping connection attempt'
      );
      return;
    }

    setError(null);

    try {
      console.log('🟡 Calling client.connect()');
      await client.connect();
      console.log('🟡 Client connection successful!');
    } catch (err) {
      console.error('🟡 Client connection failed:', err);
      const error: ApiError = {
        code: 'CONNECTION_FAILED',
        message:
          err instanceof Error ? err.message : 'Failed to connect to Deepgram',
        details: err,
      };
      setError(error);
      throw error;
    }
  }, [client]);

  const disconnect = useCallback(() => {
    if (client) {
      client.disconnect();
    }
    setError(null);
  }, [client]);

  const sendAudioData = useCallback(
    (data: ArrayBuffer) => {
      if (client) {
        client.sendAudioData(data);
      }
    },
    [client]
  );

  const clearTranscript = useCallback(() => {
    setTranscriptSegments([]);
    setError(null);
  }, []);

  return {
    client,
    connectionState,
    transcriptSegments,
    error,
    connect,
    disconnect,
    sendAudioData,
    clearTranscript,
  };
};
