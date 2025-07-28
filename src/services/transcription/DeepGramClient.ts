import { DeepGramConfig, DeepGramResponse, isDeepGramError, isDeepGramResults, ApiError } from '../../types/api';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'reconnecting';

export interface TranscriptSegment {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export type TranscriptCallback = (segment: TranscriptSegment) => void;
export type ConnectionStateCallback = (state: ConnectionState) => void;
export type ErrorCallback = (error: ApiError) => void;

export class DeepGramClient {
  private ws: WebSocket | null = null;
  private config: DeepGramConfig;
  private connectionState: ConnectionState = 'idle';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeoutId: number | null = null;
  private keepAliveIntervalId: number | null = null;
  
  private transcriptCallbacks: Set<TranscriptCallback> = new Set();
  private connectionStateCallbacks: Set<ConnectionStateCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();

  constructor(config: DeepGramConfig) {
    this.config = {
      punctuate: true,
      smartFormat: true,
      encoding: 'linear16',
      channels: 1,
      ...config,
    };
  }

  connect(): Promise<void> {
    console.log('🔵 DeepGramClient.connect() called');
    console.log('🔵 Current connection state:', this.connectionState);
    console.log('🔵 API key provided:', !!this.config.apiKey);
    
    return new Promise((resolve, reject) => {
      if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
        console.log('🔵 Already connected/connecting, resolving immediately');
        resolve();
        return;
      }

      this.setConnectionState('connecting');

      const wsUrl = this.buildWebSocketUrl();
      console.log('🔵 Built WebSocket URL:', wsUrl);
      console.log('🔵 Creating WebSocket with subprotocols:', ['token', this.config.apiKey]);
      
      this.ws = new WebSocket(wsUrl, ['token', this.config.apiKey]);

      this.ws.onopen = () => {
        console.log('✅ DeepGram WebSocket connected successfully!');
        this.setConnectionState('connected');
        this.reconnectAttempts = 0;
        this.startKeepAlive();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const response: DeepGramResponse = JSON.parse(event.data);
          this.handleWebSocketMessage(response);
        } catch (error) {
          console.error('Failed to parse DeepGram response:', error);
          this.notifyError({
            code: 'PARSE_ERROR',
            message: 'Failed to parse WebSocket message',
            details: error,
          });
        }
      };

      this.ws.onclose = (event) => {
        console.log('❌ DeepGram WebSocket closed:', event.code, event.reason);
        console.log('❌ Connection state when closed:', this.connectionState);
        this.stopKeepAlive();
        
        if (this.connectionState === 'connected') {
          this.handleReconnect();
        } else if (this.connectionState === 'connecting') {
          reject(new Error(`Connection failed: ${event.reason || 'Unknown error'}`));
        }
      };

      this.ws.onerror = (event) => {
        console.error('❌ DeepGram WebSocket error:', event);
        console.error('❌ Connection state during error:', this.connectionState);
        this.setConnectionState('error');
        this.notifyError({
          code: 'WEBSOCKET_ERROR',
          message: 'WebSocket connection error',
          details: event,
        });
        
        if (this.connectionState === 'connecting') {
          console.error('❌ Rejecting connection promise due to error');
          reject(new Error('WebSocket connection failed'));
        }
      };
    });
  }

  disconnect(): void {
    this.stopKeepAlive();
    this.clearReconnectTimeout();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setConnectionState('idle');
  }

  sendAudioData(audioData: ArrayBuffer): void {
    if (this.connectionState !== 'connected' || !this.ws) {
      console.warn('Cannot send audio data: WebSocket not connected');
      return;
    }

    try {
      this.ws.send(audioData);
    } catch (error) {
      console.error('Failed to send audio data:', error);
      this.notifyError({
        code: 'SEND_ERROR',
        message: 'Failed to send audio data',
        details: error,
      });
    }
  }

  onTranscript(callback: TranscriptCallback): () => void {
    this.transcriptCallbacks.add(callback);
    return () => this.transcriptCallbacks.delete(callback);
  }

  onConnectionState(callback: ConnectionStateCallback): () => void {
    this.connectionStateCallbacks.add(callback);
    callback(this.connectionState);
    return () => this.connectionStateCallbacks.delete(callback);
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  private buildWebSocketUrl(): string {
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

    return `${baseUrl}?${params.toString()}`;
  }

  private handleWebSocketMessage(response: DeepGramResponse): void {
    console.log('🔵 Raw WebSocket message received:', response);
    
    if (isDeepGramError(response)) {
      console.log('🔵 DeepGram error response:', response.error);
      this.notifyError({
        code: response.error.code,
        message: response.error.message,
        details: response.error,
      });
      return;
    }

    if (isDeepGramResults(response)) {
      console.log('🔵 DeepGram results response:', response);
      const alternative = response.channel.alternatives[0];
      console.log('🔵 First alternative:', alternative);
      
      if (alternative && alternative.transcript.trim()) {
        const segment: TranscriptSegment = {
          transcript: alternative.transcript,
          confidence: alternative.confidence,
          isFinal: response.is_final,
          timestamp: Date.now(),
        };

        console.log('🔵 Created transcript segment:', segment);
        console.log('🔵 Notifying', this.transcriptCallbacks.size, 'callbacks');

        this.transcriptCallbacks.forEach(callback => {
          try {
            callback(segment);
          } catch (error) {
            console.error('Error in transcript callback:', error);
          }
        });
      } else {
        console.log('🔵 Skipping empty transcript or no alternative found');
      }
    } else {
      console.log('🔵 Unknown message type received:', response);
    }
  }

  private handleReconnect(): void {
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

  private startKeepAlive(): void {
    this.keepAliveIntervalId = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
      }
    }, 30000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveIntervalId !== null) {
      clearInterval(this.keepAliveIntervalId);
      this.keepAliveIntervalId = null;
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId !== null) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      console.log(`🔄 Connection state changed: ${this.connectionState} -> ${state}`);
      this.connectionState = state;
      this.connectionStateCallbacks.forEach(callback => {
        try {
          callback(state);
        } catch (error) {
          console.error('Error in connection state callback:', error);
        }
      });
    }
  }

  private notifyError(error: ApiError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }
}