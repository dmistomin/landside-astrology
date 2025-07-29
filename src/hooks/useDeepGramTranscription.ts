import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [client, setClient] = useState<DeepgramClient | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('idle');
  const [transcriptSegments, setTranscriptSegments] = useState<
    TranscriptSegment[]
  >([]);
  const [error, setError] = useState<ApiError | null>(null);

  const clientRef = useRef<DeepgramClient | null>(null);

  useEffect(() => {
    console.log('🟡 useDeepgramTranscription useEffect triggered');
    console.log('🟡 API key provided:', !!apiKey);
    console.log('🟡 API key length:', apiKey?.length || 0);

    if (!apiKey) {
      console.log('🟡 No API key, cleaning up existing client');
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
        setClient(null);
        setConnectionState('idle');
        setError(null);
      }
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
      ...config,
    } as DeepgramConfig;

    console.log('🟡 Creating new DeepgramClient with config:', {
      ...fullConfig,
      apiKey: '***' + fullConfig.apiKey.slice(-4),
    });

    const newClient = new DeepgramClient(fullConfig);
    clientRef.current = newClient;
    setClient(newClient);

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

    // Don't automatically connect - let the consumer decide when to connect
    console.log('🟡 Deepgram client created, ready for manual connection');

    return () => {
      unsubscribeConnectionState();
      unsubscribeTranscript();
      unsubscribeError();

      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, language]); // Recreate client when API key or language changes

  const connect = useCallback(async () => {
    console.log('🟡 useDeepgramTranscription.connect() called');
    console.log('🟡 Client available:', !!clientRef.current);
    console.log(
      '🟡 Current connection state:',
      clientRef.current?.getConnectionState()
    );

    if (!clientRef.current) {
      console.error('🟡 No Deepgram client available!');
      throw new Error('Deepgram client not initialized');
    }

    // If already connected or connecting, return immediately
    const currentState = clientRef.current.getConnectionState();
    if (currentState === 'connected' || currentState === 'connecting') {
      console.log(
        '🟡 Already connected/connecting, skipping connection attempt'
      );
      return;
    }

    setError(null);

    try {
      console.log('🟡 Calling clientRef.current.connect()');
      await clientRef.current.connect();
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
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    setError(null);
  }, []);

  const sendAudioData = useCallback((data: ArrayBuffer) => {
    if (clientRef.current) {
      clientRef.current.sendAudioData(data);
    }
  }, []);

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
