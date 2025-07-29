import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioCapture } from '../services/audio/AudioCapture';
import { useDeepgramTranscription } from './useDeepgramTranscription';
import {
  ConnectionState,
  TranscriptSegment,
} from '../services/transcription/DeepgramClient';
import { ApiError } from '../types/api';

interface UseAudioTranscriptionProps {
  apiKey?: string;
}

interface UseAudioTranscriptionReturn {
  isRecording: boolean;
  audioLevel: number;
  connectionState: ConnectionState;
  transcriptSegments: TranscriptSegment[];
  error: string | null;
  transcriptionError: ApiError | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
}

export const useAudioTranscription = ({
  apiKey,
}: UseAudioTranscriptionProps = {}): UseAudioTranscriptionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioCaptureRef = useRef<AudioCapture | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const [sampleRate, setSampleRate] = useState<number>(16000);

  const {
    connectionState,
    transcriptSegments,
    error: transcriptionError,
    connect: connectTranscription,
    disconnect: disconnectTranscription,
    sendAudioData,
    clearTranscript,
  } = useDeepgramTranscription({
    apiKey,
    config: { sampleRate },
  });

  const cleanupAudioProcessing = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    audioCaptureRef.current = new AudioCapture();

    return () => {
      if (audioCaptureRef.current?.isCapturing()) {
        audioCaptureRef.current.stopCapture();
      }
      cleanupAudioProcessing();
    };
  }, [cleanupAudioProcessing]);

  const setupAudioProcessing = useCallback(
    async (mediaStream: MediaStream) => {
      try {
        audioContextRef.current = new AudioContext();
        const actualSampleRate = audioContextRef.current.sampleRate;
        console.log(`🔴 Audio context sample rate: ${actualSampleRate}Hz`);

        setSampleRate(actualSampleRate);

        sourceRef.current =
          audioContextRef.current.createMediaStreamSource(mediaStream);

        processorRef.current = audioContextRef.current.createScriptProcessor(
          4096,
          1,
          1
        );

        processorRef.current.onaudioprocess = (event) => {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);

          const int16Array = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          sendAudioData(int16Array.buffer);
        };

        sourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);
      } catch (err) {
        console.error('Failed to setup audio processing:', err);
        throw new Error('Failed to setup audio processing for transcription');
      }
    },
    [sendAudioData]
  );

  const startRecording = useCallback(async () => {
    console.log('🔴 useAudioTranscription.startRecording() called');
    console.log('🔴 Audio capture available:', !!audioCaptureRef.current);
    console.log('🔴 API key available:', !!apiKey);

    if (!audioCaptureRef.current || !apiKey) {
      console.log('🔴 Missing requirements, exiting early');
      return;
    }

    try {
      setError(null);

      console.log('🔴 First, connecting to Deepgram transcription service');
      await connectTranscription();
      console.log('🔴 Deepgram connection established successfully');

      console.log('🔴 Now starting audio capture');
      const mediaStream = await audioCaptureRef.current.startCapture();
      console.log('🔴 Audio capture started successfully');

      await setupAudioProcessing(mediaStream);
      console.log('🔴 Audio processing setup completed');

      const unsubscribe = audioCaptureRef.current.onAudioLevel((level) => {
        setAudioLevel(level);
      });

      const currentCapture = audioCaptureRef.current as AudioCapture & {
        _unsubscribe?: () => void;
      };
      currentCapture._unsubscribe = unsubscribe;

      setIsRecording(true);
      console.log(
        '🔴 Recording started - audio data will now flow to Deepgram'
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start recording';
      console.error('🔴 startRecording failed:', err);
      console.error('🔴 Error message:', message);
      setError(message);

      cleanupAudioProcessing();

      if (audioCaptureRef.current?.isCapturing()) {
        audioCaptureRef.current.stopCapture();
      }

      setIsRecording(false);
    }
  }, [
    apiKey,
    connectTranscription,
    setupAudioProcessing,
    cleanupAudioProcessing,
  ]);

  const stopRecording = useCallback(() => {
    if (!audioCaptureRef.current) return;

    const currentCapture = audioCaptureRef.current as AudioCapture & {
      _unsubscribe?: () => void;
    };
    if (currentCapture._unsubscribe) {
      currentCapture._unsubscribe();
    }

    audioCaptureRef.current.stopCapture();
    cleanupAudioProcessing();
    disconnectTranscription();

    setIsRecording(false);
    setAudioLevel(0);
  }, [cleanupAudioProcessing, disconnectTranscription]);

  return {
    isRecording,
    audioLevel,
    connectionState,
    transcriptSegments,
    error,
    transcriptionError,
    startRecording,
    stopRecording,
    clearTranscript,
  };
};
