import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudioStream } from './useAudioStream';
// Mock the AudioCapture module
vi.mock('../services/audio/AudioCapture');
describe('useAudioStream', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('initializes with correct default values', () => {
        const { result } = renderHook(() => useAudioStream());
        expect(result.current.isRecording).toBe(false);
        expect(result.current.audioLevel).toBe(0);
        expect(result.current.error).toBe(null);
        expect(typeof result.current.startRecording).toBe('function');
        expect(typeof result.current.stopRecording).toBe('function');
    });
});
