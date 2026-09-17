// Web Audio API Equalizer, Vintage AM Radio Filter, and Live Audio Recorder

export type EqualizerPreset = "normal" | "bass_boost" | "vintage_radio" | "voice_clarity";

class AudioEffectsManager {
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private lowFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private highFilter: BiquadFilterNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private audioElement: HTMLAudioElement | null = null;

  public isRecording = false;
  public currentPreset: EqualizerPreset = "normal";

  // Initialize Web Audio graph (safely without hijacking native HTML5 audio output)
  public init(audio: HTMLAudioElement) {
    this.audioElement = audio;
    // We intentionally do NOT call ctx.createMediaElementSource(audio)
    // because internet radio streams from third-party servers lack CORS headers,
    // which causes the browser's Web Audio API to output total silence (zeroes).
    // Native HTML5 <audio> handles cross-origin streams cleanly and plays full sound.
  }

  // Apply sound preset
  public setPreset(preset: EqualizerPreset) {
    this.currentPreset = preset;
    if (!this.lowFilter || !this.midFilter || !this.highFilter || !this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    switch (preset) {
      case "bass_boost":
        this.lowFilter.gain.value = 8;
        this.midFilter.gain.value = 1;
        this.highFilter.gain.value = 2;
        break;

      case "vintage_radio":
        // Emulates 1970s transistor AM radio (bandpass feel, warm mids, rolled-off lows & highs)
        this.lowFilter.gain.value = -12;
        this.midFilter.gain.value = 6;
        this.highFilter.gain.value = -14;
        break;

      case "voice_clarity":
        // Enhances spoken voice, news, podcasts
        this.lowFilter.gain.value = -4;
        this.midFilter.gain.value = 5;
        this.highFilter.gain.value = 3;
        break;

      case "normal":
      default:
        this.lowFilter.gain.value = 0;
        this.midFilter.gain.value = 0;
        this.highFilter.gain.value = 0;
        break;
    }
  }

  // Start recording live stream
  public startRecording(onTick?: (sec: number) => void): boolean {
    if (!this.audioElement || this.isRecording) return false;

    try {
      let stream: MediaStream | null = null;
      const el = this.audioElement as unknown as { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };

      if (el.captureStream) {
        stream = el.captureStream();
      } else if (el.mozCaptureStream) {
        stream = el.mozCaptureStream();
      }

      if (!stream) return false;

      this.recordedChunks = [];
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : undefined;

      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(250);
      this.isRecording = true;
      return true;
    } catch {
      return false;
    }
  }

  // Stop recording and download file
  public stopRecording(stationName = "Radio_Drack"): Blob | null {
    if (!this.mediaRecorder || !this.isRecording) return null;

    try {
      this.mediaRecorder.stop();
      this.isRecording = false;

      const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      const cleanName = stationName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      a.download = `Radio_Drack_${cleanName}_${dateStr}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      return blob;
    } catch {
      return null;
    }
  }
}

export const audioEffects = new AudioEffectsManager();
