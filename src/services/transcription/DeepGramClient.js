import { isDeepGramError, isDeepGramResults } from '../../types/api';
export class DeepGramClient {
    constructor(config) {
        this.ws = null;
        this.connectionState = 'idle';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.reconnectTimeoutId = null;
        this.keepAliveIntervalId = null;
        this.transcriptCallbacks = new Set();
        this.connectionStateCallbacks = new Set();
        this.errorCallbacks = new Set();
        this.config = {
            punctuate: true,
            smartFormat: true,
            encoding: 'linear16',
            channels: 1,
            ...config,
        };
    }
    connect() {
        return new Promise((resolve, reject) => {
            if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
                resolve();
                return;
            }
            this.setConnectionState('connecting');
            const wsUrl = this.buildWebSocketUrl();
            this.ws = new WebSocket(wsUrl);
            this.ws.onopen = () => {
                console.log('DeepGram WebSocket connected');
                this.setConnectionState('connected');
                this.reconnectAttempts = 0;
                this.startKeepAlive();
                resolve();
            };
            this.ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    this.handleWebSocketMessage(response);
                }
                catch (error) {
                    console.error('Failed to parse DeepGram response:', error);
                    this.notifyError({
                        code: 'PARSE_ERROR',
                        message: 'Failed to parse WebSocket message',
                        details: error,
                    });
                }
            };
            this.ws.onclose = (event) => {
                console.log('DeepGram WebSocket closed:', event.code, event.reason);
                this.stopKeepAlive();
                if (this.connectionState === 'connected') {
                    this.handleReconnect();
                }
                else if (this.connectionState === 'connecting') {
                    reject(new Error(`Connection failed: ${event.reason || 'Unknown error'}`));
                }
            };
            this.ws.onerror = (event) => {
                console.error('DeepGram WebSocket error:', event);
                this.setConnectionState('error');
                this.notifyError({
                    code: 'WEBSOCKET_ERROR',
                    message: 'WebSocket connection error',
                    details: event,
                });
                if (this.connectionState === 'connecting') {
                    reject(new Error('WebSocket connection failed'));
                }
            };
        });
    }
    disconnect() {
        this.stopKeepAlive();
        this.clearReconnectTimeout();
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        this.setConnectionState('idle');
    }
    sendAudioData(audioData) {
        if (this.connectionState !== 'connected' || !this.ws) {
            console.warn('Cannot send audio data: WebSocket not connected');
            return;
        }
        try {
            this.ws.send(audioData);
        }
        catch (error) {
            console.error('Failed to send audio data:', error);
            this.notifyError({
                code: 'SEND_ERROR',
                message: 'Failed to send audio data',
                details: error,
            });
        }
    }
    onTranscript(callback) {
        this.transcriptCallbacks.add(callback);
        return () => this.transcriptCallbacks.delete(callback);
    }
    onConnectionState(callback) {
        this.connectionStateCallbacks.add(callback);
        callback(this.connectionState);
        return () => this.connectionStateCallbacks.delete(callback);
    }
    onError(callback) {
        this.errorCallbacks.add(callback);
        return () => this.errorCallbacks.delete(callback);
    }
    getConnectionState() {
        return this.connectionState;
    }
    buildWebSocketUrl() {
        const baseUrl = 'wss://api.deepgram.com/v1/listen';
        const params = new URLSearchParams({
            language: this.config.language,
            punctuate: this.config.punctuate?.toString() || 'true',
            smart_format: this.config.smartFormat?.toString() || 'true',
            encoding: this.config.encoding || 'linear16',
            channels: this.config.channels?.toString() || '1',
            interim_results: 'true',
        });
        if (this.config.sampleRate) {
            params.append('sample_rate', this.config.sampleRate.toString());
        }
        if (this.config.model) {
            params.append('model', this.config.model);
        }
        return `${baseUrl}?${params.toString()}&token=${this.config.apiKey}`;
    }
    handleWebSocketMessage(response) {
        if (isDeepGramError(response)) {
            this.notifyError({
                code: response.error.code,
                message: response.error.message,
                details: response.error,
            });
            return;
        }
        if (isDeepGramResults(response)) {
            const alternative = response.channel.alternatives[0];
            if (alternative && alternative.transcript.trim()) {
                const segment = {
                    transcript: alternative.transcript,
                    confidence: alternative.confidence,
                    isFinal: response.is_final,
                    timestamp: Date.now(),
                };
                this.transcriptCallbacks.forEach(callback => {
                    try {
                        callback(segment);
                    }
                    catch (error) {
                        console.error('Error in transcript callback:', error);
                    }
                });
            }
        }
    }
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.setConnectionState('error');
            this.notifyError({
                code: 'MAX_RECONNECT_ATTEMPTS',
                message: `Failed to reconnect after ${this.maxReconnectAttempts} attempts`,
            });
            return;
        }
        this.setConnectionState('reconnecting');
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        this.reconnectTimeoutId = window.setTimeout(() => {
            this.connect().catch(error => {
                console.error('Reconnection failed:', error);
                this.handleReconnect();
            });
        }, delay);
    }
    startKeepAlive() {
        this.keepAliveIntervalId = window.setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
            }
        }, 30000);
    }
    stopKeepAlive() {
        if (this.keepAliveIntervalId !== null) {
            clearInterval(this.keepAliveIntervalId);
            this.keepAliveIntervalId = null;
        }
    }
    clearReconnectTimeout() {
        if (this.reconnectTimeoutId !== null) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }
    }
    setConnectionState(state) {
        if (this.connectionState !== state) {
            this.connectionState = state;
            this.connectionStateCallbacks.forEach(callback => {
                try {
                    callback(state);
                }
                catch (error) {
                    console.error('Error in connection state callback:', error);
                }
            });
        }
    }
    notifyError(error) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(error);
            }
            catch (callbackError) {
                console.error('Error in error callback:', callbackError);
            }
        });
    }
}
