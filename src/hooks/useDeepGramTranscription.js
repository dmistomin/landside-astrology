import { useState, useEffect, useRef, useCallback } from 'react';
import { DeepGramClient } from '../services/transcription/DeepGramClient';
export const useDeepGramTranscription = ({ apiKey, config = {}, } = {}) => {
    const [client, setClient] = useState(null);
    const [connectionState, setConnectionState] = useState('idle');
    const [transcriptSegments, setTranscriptSegments] = useState([]);
    const [error, setError] = useState(null);
    const clientRef = useRef(null);
    useEffect(() => {
        const defaultConfig = {
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
        const fullConfig = {
            apiKey,
            ...defaultConfig,
        };
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
        }
        catch (err) {
            const error = {
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
