import '@testing-library/jest-dom';
import { beforeAll } from 'vitest';

beforeAll(() => {
  Object.defineProperty(window, 'MediaStream', {
    writable: true,
    value: class MediaStream {
      getTracks() { return []; }
    }
  });
  
  Object.defineProperty(window.navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: () => Promise.resolve(new window.MediaStream())
    }
  });
  
  Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: class AudioContext {
      sampleRate = 44100;
      createAnalyser() {
        return {
          fftSize: 256,
          smoothingTimeConstant: 0.8,
          frequencyBinCount: 128,
          getByteTimeDomainData: () => {},
          connect: () => {},
          disconnect: () => {}
        };
      }
      createMediaStreamSource() {
        return { connect: () => {}, disconnect: () => {} };
      }
      close() {}
    }
  });
  
  Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: (callback: () => void) => setTimeout(callback, 16)
  });
  
  Object.defineProperty(window, 'cancelAnimationFrame', {
    writable: true,
    value: (id: number) => clearTimeout(id)
  });
});
