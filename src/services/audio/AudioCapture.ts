export type AudioLevelCallback = (level: number) => void;

export interface AudioCaptureOptions {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export class AudioCapture {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private levelCallbacks: Set<AudioLevelCallback> = new Set();
  private animationId: number | null = null;
  private capturing = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordedBlob: Blob | null = null;

  constructor(private options: AudioCaptureOptions = {}) {
    this.options = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      ...options,
    };
  }

  async startCapture(): Promise<MediaStream> {
    if (this.capturing) {
      throw new Error('Audio capture already in progress');
    }

    try {
      // Check for browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support audio capture');
      }

      // Request microphone access without specifying sample rate
      // to let the browser choose the native sample rate
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.options.echoCancellation,
          noiseSuppression: this.options.noiseSuppression,
          autoGainControl: this.options.autoGainControl,
          channelCount: 1, // Request mono audio
        },
      });

      // Create audio context without specifying sample rate
      // This will use the default sample rate of the audio hardware
      this.audioContext = new AudioContext();

      // Get the actual sample rate from the audio context
      const actualSampleRate = this.audioContext.sampleRate;
      console.log(`Audio context sample rate: ${actualSampleRate}Hz`);

      // Log the actual audio track settings
      const audioTrack = this.mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        console.log('Audio track settings:', settings);
        console.log(
          `Channel count: ${settings.channelCount || 'not specified'}`
        );
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect the stream to the analyser
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.source.connect(this.analyser);

      this.capturing = true;
      this.startLevelMonitoring();
      this.startRecording();

      return this.mediaStream;
    } catch (error) {
      this.cleanup();
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Microphone permission denied');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found');
        } else if (error.name === 'NotReadableError') {
          throw new Error('Microphone is already in use');
        }
      }
      throw error;
    }
  }

  stopCapture(): void {
    this.stopRecording();
    this.cleanup();
  }

  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square) for more accurate level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Convert to 0-100 scale
    return Math.min(100, Math.round(rms * 200));
  }

  onAudioLevel(callback: AudioLevelCallback): () => void {
    this.levelCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.levelCallbacks.delete(callback);
    };
  }

  isCapturing(): boolean {
    return this.capturing;
  }

  getRecordedAudio(): Blob | null {
    return this.recordedBlob;
  }

  downloadRecordedAudio(filename = 'recorded-audio.wav'): void {
    if (!this.recordedBlob) {
      console.warn('No recorded audio available for download');
      return;
    }

    const url = URL.createObjectURL(this.recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getAudioUrl(): string | null {
    if (!this.recordedBlob) return null;
    return URL.createObjectURL(this.recordedBlob);
  }

  private startRecording(): void {
    if (!this.mediaStream) return;

    this.recordedChunks = [];
    this.recordedBlob = null;

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: 'audio/webm',
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.recordedBlob = new Blob(this.recordedChunks, {
        type: 'audio/webm',
      });
      console.log('Recording stopped, blob created:', this.recordedBlob);
    };

    this.mediaRecorder.start(100);
    console.log('Started recording audio');
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      console.log('Stopped recording audio');
    }
  }

  private startLevelMonitoring(): void {
    const monitor = () => {
      if (!this.capturing) return;

      const level = this.getAudioLevel();
      this.levelCallbacks.forEach((callback) => callback(level));

      this.animationId = requestAnimationFrame(monitor);
    };

    monitor();
  }

  private cleanup(): void {
    this.capturing = false;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.analyser) {
      this.analyser = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }
}
