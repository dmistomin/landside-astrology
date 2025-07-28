import { createClient, LiveTranscriptionEvents, DeepgramClient as DGClient, ListenLiveClient } from '@deepgram/sdk';
import { DeepGramConfig, ApiError } from '../../types/api';

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
  private deepgram: DGClient | null = null;
  private connection: ListenLiveClient | null = null;
  private config: DeepGramConfig;
  private connectionState: ConnectionState = 'idle';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeoutId: number | null = null;
  
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
    
    this.deepgram = createClient(config.apiKey);
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

      if (!this.deepgram) {
        reject(new Error('DeepGram client not initialized'));
        return;
      }

      this.setConnectionState('connecting');

      try {
        const connectionOptions = {
          model: this.config.model || 'nova-2',
          language: this.config.language || 'en',
          smart_format: this.config.smartFormat || true,
          punctuate: this.config.punctuate || true,
          encoding: this.config.encoding || 'linear16',
          channels: this.config.channels || 1,
          sample_rate: this.config.sampleRate || 16000,
          interim_results: true,
        };

        console.log('🔵 Creating live connection with options:', connectionOptions);
        this.connection = this.deepgram.listen.live(connectionOptions);

        this.connection.on(LiveTranscriptionEvents.Open, () => {
          console.log('✅ DeepGram connection opened successfully!');
          this.setConnectionState('connected');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.connection.on(LiveTranscriptionEvents.Transcript, (data: unknown) => {
          console.log('🔵 Received transcript data:', data);
          this.handleTranscriptMessage(data);
        });

        this.connection.on(LiveTranscriptionEvents.Error, (error: unknown) => {
          console.error('❌ DeepGram connection error:', error);
          this.setConnectionState('error');
          const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as Error).message : 'DeepGram connection error';
          this.notifyError({
            code: 'DEEPGRAM_ERROR',
            message: errorMessage,
            details: error,
          });
          
          if (this.connectionState === 'connecting') {
            reject(new Error('DeepGram connection failed'));
          }
        });

        this.connection.on(LiveTranscriptionEvents.Close, (event: unknown) => {
          console.log('❌ DeepGram connection closed:', event);
          
          if (this.connectionState === 'connected') {
            this.handleReconnect();
          } else if (this.connectionState === 'connecting') {
            const eventReason = event && typeof event === 'object' && 'reason' in event ? (event as {reason: string}).reason : 'Unknown error';
            reject(new Error(`Connection failed: ${eventReason}`));
          }
        });

      } catch (error) {
        console.error('❌ Failed to create DeepGram connection:', error);
        this.setConnectionState('error');
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.clearReconnectTimeout();
    
    if (this.connection) {
      try {
        this.connection.finish();
      } catch (error) {
        console.warn('Error finishing connection:', error);
      }
      this.connection = null;
    }
    
    this.setConnectionState('idle');
  }

  sendAudioData(audioData: ArrayBuffer): void {
    if (this.connectionState !== 'connected' || !this.connection) {
      console.warn('Cannot send audio data: Connection not established');
      return;
    }

    try {
      this.connection.send(audioData);
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

  private handleTranscriptMessage(data: unknown): void {
    console.log('🔵 Raw transcript message received:', data);
    
    try {
      if (!data || typeof data !== 'object') {
        console.log('🔵 Invalid data format received');
        return;
      }

      const transcriptData = data as {
        channel?: {
          alternatives?: Array<{
            transcript: string;
            confidence: number;
          }>;
        };
        is_final?: boolean;
      };

      const alternative = transcriptData.channel?.alternatives?.[0];
      console.log('🔵 First alternative:', alternative);
      
      if (alternative && alternative.transcript.trim()) {
        const segment: TranscriptSegment = {
          transcript: alternative.transcript,
          confidence: alternative.confidence || 0,
          isFinal: transcriptData.is_final || false,
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
    } catch (error) {
      console.error('Error processing transcript message:', error);
      this.notifyError({
        code: 'TRANSCRIPT_PARSE_ERROR',
        message: 'Failed to parse transcript message',
        details: error,
      });
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