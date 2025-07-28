import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DeepGramClient } from '../services/transcription/DeepGramClient';
export const useDeepGramTranscription = ({ apiKey, config = {}, } = {}) => {
    const [client, setClient] = useState(null);
    const [connectionState, setConnectionState] = useState('idle');
    const [transcriptSegments, setTranscriptSegments] = useState([]);
    const [error, setError] = useState(null);
    const clientRef = useRef(null);
    const memoizedConfig = useMemo(() => ({
        language: 'en',
        punctuate: true,
        smartFormat: true,
        encoding: 'linear16',
        channels: 1,
        sampleRate: 16000,
        ...config,
    }), [config.language, config.punctuate, config.smartFormat, config.encoding, config.channels, config.sampleRate]);
    useEffect(() => {
        console.log('🟡 useDeepGramTranscription useEffect triggered');
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
        const fullConfig = {
            apiKey,
            ...memoizedConfig,
        };
        console.log('🟡 Creating new DeepGramClient with config:', {
            ...fullConfig,
            apiKey: '***' + fullConfig.apiKey.slice(-4)
        });
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
                }
                else {
                    const filtered = prev.filter(s => s.isFinal);
                    return [...filtered, segment];
                }
            });
        });
        const unsubscribeError = newClient.onError((err) => {
            setError(err);
        });
        
        // Automatically connect when client is created
        console.log('🟡 Auto-connecting to DeepGram...');
        newClient.connect().catch((err) => {
            console.error('🟡 Auto-connection failed:', err);
            setError({
                code: 'AUTO_CONNECTION_FAILED',
                message: 'Failed to automatically connect to DeepGram',
                details: err,
            });
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
    }, [apiKey, memoizedConfig]);
    const connect = useCallback(async () => {
        console.log('🟡 useDeepGramTranscription.connect() called');
        console.log('🟡 Client available:', !!clientRef.current);
        console.log('🟡 Current connection state:', connectionState);
        
        if (!clientRef.current) {
            console.error('🟡 No DeepGram client available!');
            throw new Error('DeepGram client not initialized');
        }
        
        // If already connected or connecting, return early
        if (connectionState === 'connected') {
            console.log('🟡 Already connected, returning early');
            return;
        }
        
        if (connectionState === 'connecting') {
            console.log('🟡 Already connecting, waiting for connection...');
            // Wait for connection to complete
            return new Promise((resolve, reject) => {
                const checkConnection = () => {
                    if (connectionState === 'connected') {
                        resolve();
                    } else if (connectionState === 'error') {
                        reject(new Error('Connection failed'));
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });
        }
        
        setError(null);
        try {
            console.log('🟡 Calling clientRef.current.connect()');
            await clientRef.current.connect();
            console.log('🟡 Client connection successful!');
        }
        catch (err) {
            console.error('🟡 Client connection failed:', err);
            const error = {
                code: 'CONNECTION_FAILED',
                message: err instanceof Error ? err.message : 'Failed to connect to DeepGram',
                details: err,
            };
            setError(error);
            throw error;
        }
    }, [connectionState]);
    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
        setError(null);
    }, []);
    const sendAudioData = useCallback((data) => {
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
