import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioCapture } from './AudioCapture';

describe('AudioCapture', () => {
  let audioCapture: AudioCapture;

  beforeEach(() => {
    // Mock global objects before each test
    Object.defineProperty(globalThis, 'navigator', {
      writable: true,
      value: {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }]
          })
        }
      }
    });

    Object.defineProperty(globalThis, 'AudioContext', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        sampleRate: 44100,
        createAnalyser: vi.fn().mockReturnValue({
          fftSize: 256,
          smoothingTimeConstant: 0.8,
          frequencyBinCount: 128,
          getByteTimeDomainData: vi.fn(),
          connect: vi.fn(),
          disconnect: vi.fn()
        }),
        createMediaStreamSource: vi.fn().mockReturnValue({
          connect: vi.fn(),
          disconnect: vi.fn()
        }),
        close: vi.fn()
      }))
    });

    audioCapture = new AudioCapture();
  });

  it('initializes with default options', () => {
    expect(audioCapture.isCapturing()).toBe(false);
  });

  it('returns 0 audio level when not capturing', () => {
    const level = audioCapture.getAudioLevel();
    expect(level).toBe(0);
  });

  it('subscribes and unsubscribes to audio level updates', () => {
    const callback = vi.fn();
    
    const unsubscribe = audioCapture.onAudioLevel(callback);
    expect(typeof unsubscribe).toBe('function');

    unsubscribe();
    // The callback should be removed from the set
  });

  it('uses custom options when provided', () => {
    const customOptions = {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    };

    const customAudioCapture = new AudioCapture(customOptions);
    
    expect(customAudioCapture.isCapturing()).toBe(false);
  });
});