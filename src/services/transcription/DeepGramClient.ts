import {
  createClient,
  LiveTranscriptionEvents,
  DeepgramClient as DGClient,
  ListenLiveClient,
} from '@deepgram/sdk';
import { DeepgramConfig, ApiError } from '../../types/api';

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'reconnecting';

export interface TranscriptSegment {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export type TranscriptCallback = (segment: TranscriptSegment) => void;
export type ConnectionStateCallback = (state: ConnectionState) => void;
export type ErrorCallback = (error: ApiError) => void;

export class DeepgramClient {
  private deepgram: DGClient | null = null;
  private connection: ListenLiveClient | null = null;
  private config: DeepgramConfig;
  private connectionState: ConnectionState = 'idle';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeoutId: number | null = null;
  private keepAliveInterval: number | null = null;

  private transcriptCallbacks: Set<TranscriptCallback> = new Set();
  private connectionStateCallbacks: Set<ConnectionStateCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();

  constructor(config: DeepgramConfig) {
    this.config = {
      punctuate: true,
      smartFormat: true,
      encoding: 'linear16',
      channels: 1,
      sampleRate: 44100, // Default to common browser sample rate
      ...config,
    };

    this.deepgram = createClient(config.apiKey);
  }

  connect(): Promise<void> {
    console.log('🔵 DeepgramClient.connect() called');
    console.log('🔵 Current connection state:', this.connectionState);
    console.log('🔵 API key provided:', !!this.config.apiKey);

    return new Promise((resolve, reject) => {
      if (
        this.connectionState === 'connected' ||
        this.connectionState === 'connecting'
      ) {
        console.log('🔵 Already connected/connecting, resolving immediately');
        resolve();
        return;
      }

      if (!this.deepgram) {
        reject(new Error('Deepgram client not initialized'));
        return;
      }

      this.setConnectionState('connecting');

      try {
        const connectionOptions = {
          model: this.config.model || 'nova-3',
          language: this.config.language || 'en',
          smart_format: this.config.smartFormat || true,
          punctuate: this.config.punctuate || true,
          encoding: this.config.encoding || 'linear16',
          channels: this.config.channels || 1,
          sample_rate: this.config.sampleRate || 44100,
          interim_results: true,
        };

        console.log(
          '🔵 Creating live connection with options:',
          connectionOptions
        );
        this.connection = this.deepgram.listen.live(connectionOptions);

        this.connection.on(LiveTranscriptionEvents.Open, () => {
          console.log('✅ Deepgram connection opened successfully!');
          this.setConnectionState('connected');
          this.reconnectAttempts = 0;

          // Start keepAlive interval to prevent timeout
          this.startKeepAlive();

          resolve();
        });

        this.connection.on(
          LiveTranscriptionEvents.Transcript,
          (data: unknown) => {
            console.log('🔵 Received transcript data:', data);
            this.handleTranscriptMessage(data);
          }
        );

        this.connection.on(LiveTranscriptionEvents.Error, (error: unknown) => {
          console.error('❌ Deepgram connection error:', error);
          this.setConnectionState('error');
          const errorMessage =
            error && typeof error === 'object' && 'message' in error
              ? (error as Error).message
              : 'Deepgram connection error';
          this.notifyError({
            code: 'DEEPGRAM_ERROR',
            message: errorMessage,
            details: error,
          });

          if (this.connectionState === 'connecting') {
            reject(new Error('Deepgram connection failed'));
          }
        });

        this.connection.on(LiveTranscriptionEvents.Close, (event: unknown) => {
          console.log('❌ Deepgram connection closed:', event);

          // Always stop keepAlive when connection closes
          this.stopKeepAlive();

          if (this.connectionState === 'connecting') {
            const eventReason =
              event && typeof event === 'object' && 'reason' in event
                ? (event as { reason: string }).reason
                : 'Unknown error';
            reject(new Error(`Connection failed: ${eventReason}`));
          } else if (this.connectionState === 'connected') {
            // Only attempt reconnect if we were actively connected and this wasn't a manual disconnect
            console.log(
              '🔄 Connection closed while active, will not auto-reconnect. Manual reconnection required.'
            );
            this.setConnectionState('idle');
          }
        });
      } catch (error) {
        console.error('❌ Failed to create Deepgram connection:', error);
        this.setConnectionState('error');
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.clearReconnectTimeout();
    this.stopKeepAlive();

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
    try {
      if (!data || typeof data !== 'object') {
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

      if (alternative && alternative.transcript.trim()) {
        const segment: TranscriptSegment = {
          transcript: alternative.transcript,
          confidence: alternative.confidence || 0,
          isFinal: transcriptData.is_final || false,
          timestamp: Date.now(),
        };

        this.transcriptCallbacks.forEach((callback) => {
          try {
            callback(segment);
          } catch (error) {
            console.error('Error in transcript callback:', error);
          }
        });
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
    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimeoutId = window.setTimeout(() => {
      this.connect().catch((error) => {
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
      console.log(
        `🔄 Connection state changed: ${this.connectionState} -> ${state}`
      );
      this.connectionState = state;
      this.connectionStateCallbacks.forEach((callback) => {
        try {
          callback(state);
        } catch (error) {
          console.error('Error in connection state callback:', error);
        }
      });
    }
  }

  private notifyError(error: ApiError): void {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  private startKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }

    this.keepAliveInterval = window.setInterval(() => {
      if (this.connection && this.connectionState === 'connected') {
        try {
          this.connection.keepAlive();
        } catch (error) {
          console.error('Error sending keepAlive:', error);
        }
      }
    }, 8000); // Send keepAlive every 8 seconds (before the 10 second timeout)
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}
