import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioCapture } from '../services/audio/AudioCapture';

interface UseAudioStreamReturn {
  isRecording: boolean;
  audioLevel: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export const useAudioStream = (): UseAudioStreamReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioCaptureRef = useRef<AudioCapture | null>(null);

  useEffect(() => {
    // Initialize audio capture service
    audioCaptureRef.current = new AudioCapture();

    // Cleanup on unmount
    return () => {
      if (audioCaptureRef.current?.isCapturing()) {
        audioCaptureRef.current.stopCapture();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!audioCaptureRef.current) return;

    try {
      setError(null);
      await audioCaptureRef.current.startCapture();

      // Subscribe to audio level updates
      const unsubscribe = audioCaptureRef.current.onAudioLevel((level) => {
        setAudioLevel(level);
        console.log('Audio level:', level);
      });

      setIsRecording(true);

      // Store unsubscribe function for cleanup
      (
        audioCaptureRef.current as AudioCapture & { _unsubscribe?: () => void }
      )._unsubscribe = unsubscribe;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      console.error('Failed to start recording:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!audioCaptureRef.current) return;

    // Unsubscribe from audio level updates
    const currentCapture = audioCaptureRef.current as AudioCapture & {
      _unsubscribe?: () => void;
    };
    if (currentCapture._unsubscribe) {
      currentCapture._unsubscribe();
    }

    audioCaptureRef.current.stopCapture();
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  return {
    isRecording,
    audioLevel,
    error,
    startRecording,
    stopRecording,
  };
};
