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

  // Initialize Web Audio graph
  public init(audio: HTMLAudioElement) {
    if (this.audioElement === audio && this.ctx) return;
    this.audioElement = audio;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.source = this.ctx.createMediaElementSource(audio);

      // 3-Band Parametric Filter Node Chain
      this.lowFilter = this.ctx.createBiquadFilter();
      this.lowFilter.type = "lowshelf";
      this.lowFilter.frequency.value = 250;

      this.midFilter = this.ctx.createBiquadFilter();
      this.midFilter.type = "peaking";
      this.midFilter.frequency.value = 1500;
      this.midFilter.Q.value = 1.0;

      this.highFilter = this.ctx.createBiquadFilter();
      this.highFilter.type = "highshelf";
      this.highFilter.frequency.value = 4000;

      // Connect source -> low -> mid -> high -> destination
      this.source.connect(this.lowFilter);
      this.lowFilter.connect(this.midFilter);
      this.midFilter.connect(this.highFilter);
      this.highFilter.connect(this.ctx.destination);
    } catch {
      // AudioContext might already be connected or restricted by CORS
    }
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
