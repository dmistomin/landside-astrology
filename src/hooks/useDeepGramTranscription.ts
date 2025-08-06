import { useState, useEffect } from 'react';
import {
  DeepgramClient,
  ConnectionState,
  TranscriptSegment,
} from '../services/transcription/DeepgramClient';
import { DeepgramConfig, ApiError } from '../types/api';

interface UseDeepgramTranscriptionProps {
  apiKey?: string;
  language?: 'en' | 'multi';
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
}: UseDeepgramTranscriptionProps = {}): UseDeepgramTranscriptionReturn => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('idle');
  const [transcriptSegments, setTranscriptSegments] = useState<
    TranscriptSegment[]
  >([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [client, setClient] = useState<DeepgramClient | null>(null);

  // Create and set up client when apiKey or language changes
  useEffect(() => {
    if (!apiKey) {
      console.log('🟡 No API key provided, client not created');
      setClient(null);
      return;
    }

    const fullConfig: DeepgramConfig = {
      apiKey,
      language,
      punctuate: true,
      smartFormat: true,
      encoding: 'linear16',
      channels: 1,
      sampleRate: 44100, // Match browser's default sample rate
    } as DeepgramConfig;

    console.log('🟡 Creating new DeepgramClient with config:', {
      ...fullConfig,
      apiKey: '***' + fullConfig.apiKey.slice(-4),
    });

    const newClient = new DeepgramClient(fullConfig);

    // Set up event listeners
    const unsubscribeConnectionState = newClient.onConnectionState((state) => {
      setConnectionState(state);
    });

    const unsubscribeTranscript = newClient.onTranscript((segment) => {
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

    const unsubscribeError = newClient.onError((err) => {
      setError(err);
    });

    console.log('🟡 Deepgram client listeners set up');
    setClient(newClient);

    // Cleanup
    return () => {
      unsubscribeConnectionState();
      unsubscribeTranscript();
      unsubscribeError();
      newClient.disconnect();
    };
  }, [apiKey, language]);

  const connect = async () => {
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
  };

  const disconnect = () => {
    if (client) {
      client.disconnect();
    }
    setError(null);
  };

  const sendAudioData = (data: ArrayBuffer) => {
    if (client) {
      client.sendAudioData(data);
    }
  };

  const clearTranscript = () => {
    setTranscriptSegments([]);
    setError(null);
  };

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
