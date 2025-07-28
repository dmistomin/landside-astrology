import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioCapture } from '../services/audio/AudioCapture';
import { useDeepGramTranscription } from './useDeepGramTranscription';
import { ConnectionState, TranscriptSegment } from '../services/transcription/DeepGramClient';
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

  const {
    connectionState,
    transcriptSegments,
    error: transcriptionError,
    connect: connectTranscription,
    disconnect: disconnectTranscription,
    sendAudioData,
    clearTranscript,
  } = useDeepGramTranscription({ apiKey });

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

  const setupAudioProcessing = useCallback(async (mediaStream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStream);
      
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (event) => {
        if (!isRecording) return;

        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        const int16Array = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        sendAudioData(int16Array.buffer);
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
    } catch (err) {
      console.error('Failed to setup audio processing:', err);
      throw new Error('Failed to setup audio processing for transcription');
    }
  }, [isRecording, sendAudioData]);

  const startRecording = useCallback(async () => {
    if (!audioCaptureRef.current || !apiKey) return;

    try {
      setError(null);

      await connectTranscription();

      const mediaStream = await audioCaptureRef.current.startCapture();
      
      await setupAudioProcessing(mediaStream);

      const unsubscribe = audioCaptureRef.current.onAudioLevel((level) => {
        setAudioLevel(level);
      });

      const currentCapture = audioCaptureRef.current as AudioCapture & { _unsubscribe?: () => void };
      currentCapture._unsubscribe = unsubscribe;

      setIsRecording(true);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      console.error('Failed to start recording:', err);
      
      cleanupAudioProcessing();
      
      if (audioCaptureRef.current?.isCapturing()) {
        audioCaptureRef.current.stopCapture();
      }
    }
  }, [apiKey, connectTranscription, setupAudioProcessing, cleanupAudioProcessing]);

  const stopRecording = useCallback(() => {
    if (!audioCaptureRef.current) return;

    const currentCapture = audioCaptureRef.current as AudioCapture & { _unsubscribe?: () => void };
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