import { useState, useEffect, useRef, useCallback } from 'react';
import { DeepGramClient, ConnectionState, TranscriptSegment } from '../services/transcription/DeepGramClient';
import { DeepGramConfig, ApiError } from '../types/api';

interface UseDeepGramTranscriptionProps {
  apiKey?: string;
  config?: Partial<DeepGramConfig>;
}

interface UseDeepGramTranscriptionReturn {
  client: DeepGramClient | null;
  connectionState: ConnectionState;
  transcriptSegments: TranscriptSegment[];
  error: ApiError | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudioData: (data: ArrayBuffer) => void;
  clearTranscript: () => void;
}

export const useDeepGramTranscription = ({
  apiKey,
  config = {},
}: UseDeepGramTranscriptionProps = {}): UseDeepGramTranscriptionReturn => {
  const [client, setClient] = useState<DeepGramClient | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  
  const clientRef = useRef<DeepGramClient | null>(null);

  useEffect(() => {
    const defaultConfig: Partial<DeepGramConfig> = {
      language: 'ja',
      punctuate: true,
      smartFormat: true,
      encoding: 'linear16',
      channels: 1,
      ...config,
    };
    if (!apiKey) {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
        setClient(null);
        setConnectionState('idle');
        setError(null);
      }
      return;
    }

    const fullConfig: DeepGramConfig = {
      apiKey,
      ...defaultConfig,
    } as DeepGramConfig;

    const newClient = new DeepGramClient(fullConfig);
    clientRef.current = newClient;
    setClient(newClient);

    const unsubscribeConnectionState = newClient.onConnectionState((state) => {
      setConnectionState(state);
    });

    const unsubscribeTranscript = newClient.onTranscript((segment) => {
      setTranscriptSegments(prev => {
        if (segment.isFinal) {
          const filtered = prev.filter(s => s.isFinal);
          return [...filtered, segment];
        } else {
          const filtered = prev.filter(s => s.isFinal);
          return [...filtered, segment];
        }
      });
    });

    const unsubscribeError = newClient.onError((err) => {
      setError(err);
    });

    return () => {
      unsubscribeConnectionState();
      unsubscribeTranscript();
      unsubscribeError();
      
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [apiKey, config]);

  const connect = useCallback(async () => {
    if (!clientRef.current) {
      throw new Error('DeepGram client not initialized');
    }

    setError(null);

    try {
      await clientRef.current.connect();
    } catch (err) {
      const error: ApiError = {
        code: 'CONNECTION_FAILED',
        message: err instanceof Error ? err.message : 'Failed to connect to DeepGram',
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
    if (clientRef.current && connectionState === 'connected') {
      clientRef.current.sendAudioData(data);
    }
  }, [connectionState]);

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