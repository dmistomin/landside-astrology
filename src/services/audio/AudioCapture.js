export class AudioCapture {
    constructor(options = {}) {
        this.options = options;
        this.mediaStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.levelCallbacks = new Set();
        this.animationId = null;
        this.capturing = false;
        this.options = {
            sampleRate: 44100,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            ...options,
        };
    }
    async startCapture() {
        if (this.capturing) {
            throw new Error('Audio capture already in progress');
        }
        try {
            // Check for browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser does not support audio capture');
            }
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: this.options.echoCancellation,
                    noiseSuppression: this.options.noiseSuppression,
                    autoGainControl: this.options.autoGainControl,
                    sampleRate: this.options.sampleRate,
                },
            });
            // Create audio context and analyser
            this.audioContext = new AudioContext({ sampleRate: this.options.sampleRate });
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            // Connect the stream to the analyser
            this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.source.connect(this.analyser);
            this.capturing = true;
            this.startLevelMonitoring();
            return this.mediaStream;
        }
        catch (error) {
            this.cleanup();
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    throw new Error('Microphone permission denied');
                }
                else if (error.name === 'NotFoundError') {
                    throw new Error('No microphone found');
                }
                else if (error.name === 'NotReadableError') {
                    throw new Error('Microphone is already in use');
                }
            }
            throw error;
        }
    }
    stopCapture() {
        this.cleanup();
    }
    getAudioLevel() {
        if (!this.analyser)
            return 0;
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
    onAudioLevel(callback) {
        this.levelCallbacks.add(callback);
        // Return unsubscribe function
        return () => {
            this.levelCallbacks.delete(callback);
        };
    }
    isCapturing() {
        return this.capturing;
    }
    startLevelMonitoring() {
        const monitor = () => {
            if (!this.capturing)
                return;
            const level = this.getAudioLevel();
            this.levelCallbacks.forEach(callback => callback(level));
            this.animationId = requestAnimationFrame(monitor);
        };
        monitor();
    }
    cleanup() {
        this.capturing = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
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
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }
}
