// Browser speech recognition wrapper with fallback and simulated mic level

export interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal?: boolean;
    };
  };
}

export type SpeechCallback = (transcript: string, isFinal: boolean, confidence: number) => void;

interface IWindowWithSpeech extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export class VoiceAssistant {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: SpeechCallback | null = null;
  private onStateChange: ((listening: boolean) => void) | null = null;
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  public volumeLevel: number = 0; // 0 to 100

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindowWithSpeech) : null;
    const SpeechClass = win ? (win.SpeechRecognition || win.webkitSpeechRecognition) : null;

    if (SpeechClass) {
      try {
        this.recognition = new SpeechClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let maxConfidence = 0.85;

          for (let i = 0; i < Object.keys(event.results).length; i++) {
            const res = event.results[i];
            if (res && res[0]) {
              if (res.isFinal) {
                finalTranscript += res[0].transcript;
                if (res[0].confidence) maxConfidence = Math.max(maxConfidence, res[0].confidence);
              } else {
                interimTranscript += res[0].transcript;
              }
            }
          }

          const currentText = finalTranscript || interimTranscript;
          if (currentText.trim() && this.onResultCallback) {
            this.onResultCallback(currentText.trim().toLowerCase(), Boolean(finalTranscript), maxConfidence);
          }
        };

        this.recognition.onerror = () => {
          // If error happens or silence, stay calm
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch {
              this.isListening = false;
              if (this.onStateChange) this.onStateChange(false);
            }
          }
        };
      } catch {
        this.recognition = null;
      }
    }
  }

  isSupported(): boolean {
    return Boolean(this.recognition);
  }

  start(onResult: SpeechCallback, onState?: (listening: boolean) => void) {
    this.onResultCallback = onResult;
    this.onStateChange = onState || null;
    this.isListening = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        // May already be started
      }
    }

    if (this.onStateChange) this.onStateChange(true);
    this.startMicrophoneVisualizer();
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (this.onStateChange) this.onStateChange(false);
    this.stopMicrophoneVisualizer();
  }

  private startMicrophoneVisualizer() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        this.audioStream = stream;
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          const update = () => {
            if (!this.isListening) return;
            if (this.analyser) {
              this.analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              this.volumeLevel = Math.min(100, Math.round((avg / 255) * 150));
            }
            this.animFrameId = requestAnimationFrame(update);
          };
          update();
        }
      }).catch(() => {
        // Microphone permission denied, simulate wave
        this.simulateWaveform();
      });
    } else {
      this.simulateWaveform();
    }
  }

  private simulateWaveform() {
    const update = () => {
      if (!this.isListening) return;
      this.volumeLevel = Math.floor(25 + Math.random() * 45);
      this.animFrameId = window.setTimeout(update, 120);
    };
    update();
  }

  private stopMicrophoneVisualizer() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      clearTimeout(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(t => t.stop());
      this.audioStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.volumeLevel = 0;
  }
}

export const voiceAssistant = new VoiceAssistant();
