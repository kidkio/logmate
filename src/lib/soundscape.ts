// 브라우저 Web Audio API 기반의 순수 절차적(Procedural) 앰비언트 사운드스케이프
// 외부 오디오 파일 다운로드 0바이트, 100% 브라우저 자체 합성

export type SoundMode = 'off' | 'rain' | 'fire' | 'wave' | 'wind';

class SoundscapeManager {
  private ctx: AudioContext | null = null;
  private currentMode: SoundMode = 'off';
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private crackleInterval: NodeJS.Timeout | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private currentVolume: number = 0.35;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  // 핑크 노이즈 버퍼 생성 (자연스러운 백색/핑크소음)
  private createPinkNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public play(mode: SoundMode) {
    if (this.currentMode === mode) return;
    this.stop();

    if (mode === 'off') {
      this.currentMode = 'off';
      return;
    }

    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const noiseBuffer = this.createPinkNoiseBuffer();
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    if (mode === 'rain') {
      // 빗소리: 700Hz 로우패스 필터 적용
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(this.gainNode);
      noiseSource.start();
      this.noiseNode = noiseSource;
    } else if (mode === 'fire') {
      // 모닥불: 따뜻한 저음 베이스 + 불규칙한 타닥타닥 크랙클
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(this.gainNode);
      noiseSource.start();
      this.noiseNode = noiseSource;

      // 타닥타닥 튀는 소리 합성
      this.crackleInterval = setInterval(() => {
        if (!this.ctx || !this.gainNode || Math.random() > 0.45) return;
        try {
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120 + Math.random() * 400, this.ctx.currentTime);

          const now = this.ctx.currentTime;
          oscGain.gain.setValueAtTime(0.08 + Math.random() * 0.12, now);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          osc.connect(oscGain);
          oscGain.connect(this.gainNode);
          osc.start(now);
          osc.stop(now + 0.05);
        } catch (e) {
          // ignore
        }
      }, 180);
    } else if (mode === 'wave') {
      // 파도: 400Hz 로우패스 + 8초 주기의 저주파(LFO)로 밀려왔다 나가는 파도 음향
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      const waveGain = this.ctx.createGain();
      waveGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8초 주기
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(waveGain.gain);
      lfo.start();
      this.lfoOsc = lfo;

      noiseSource.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(this.gainNode);
      noiseSource.start();
      this.noiseNode = noiseSource;
    } else if (mode === 'wind') {
      // 밤바람: 480Hz 부드러운 밴드패스 필터
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(480, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(this.gainNode);
      noiseSource.start();
      this.noiseNode = noiseSource;
    }

    this.currentMode = mode;
  }

  public stop() {
    if (this.lfoOsc) {
      try {
        this.lfoOsc.stop();
        this.lfoOsc.disconnect();
      } catch (e) {}
      this.lfoOsc = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
    }
    if (this.crackleInterval) {
      clearInterval(this.crackleInterval);
      this.crackleInterval = null;
    }
    this.currentMode = 'off';
  }

  public getMode(): SoundMode {
    return this.currentMode;
  }
}

export const soundscape = new SoundscapeManager();
