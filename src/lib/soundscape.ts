// 브라우저 Web Audio API 기반의 하이엔드 절차적(Procedural) ASMR 오디오 엔진
// 4가지 사운드(빗소리, 모닥불, 밤바다 파도, 밤바람)를 각기 고유한 물리 음향 모델링으로 합성

export type SoundMode = 'off' | 'rain' | 'fire' | 'wave' | 'wind';

type SoundListener = (mode: SoundMode) => void;

class SoundscapeManager {
  private ctx: AudioContext | null = null;
  private currentMode: SoundMode = 'off';
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.45;
  private activeNodes: AudioNode[] = [];
  private activeIntervals: (NodeJS.Timeout | number)[] = [];
  private listeners: Set<SoundListener> = new Set();

  public subscribe(listener: SoundListener): () => void {
    this.listeners.add(listener);
    listener(this.currentMode);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentMode));
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  // 화이트 노이즈 버퍼
  private createWhiteNoiseBuffer(durationSec = 2): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSec;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 핑크/브라운 노이즈 버퍼 (깊은 저음 질감)
  private createBrownNoiseBuffer(durationSec = 3): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSec;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // 게인 보정
    }
    return buffer;
  }

  public play(mode: SoundMode) {
    if (this.currentMode === mode) return;
    this.stop();

    if (mode === 'off') {
      this.currentMode = 'off';
      this.notify();
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    // =========================================================================
    // 1. [RAIN: 포근한 창문 빗소리]
    // =========================================================================
    if (mode === 'rain') {
      // 레이어 1: 굵은 빗줄기 배경음 (브라운 노이즈 + 로우패스 480Hz)
      const brownBuf = this.createBrownNoiseBuffer(3);
      if (brownBuf) {
        const brownSrc = this.ctx.createBufferSource();
        brownSrc.buffer = brownBuf;
        brownSrc.loop = true;

        const lowFilter = this.ctx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.setValueAtTime(450, now);

        const brownGain = this.ctx.createGain();
        brownGain.gain.setValueAtTime(0.55, now);

        brownSrc.connect(lowFilter);
        lowFilter.connect(brownGain);
        brownGain.connect(this.masterGain);
        brownSrc.start();
        this.activeNodes.push(brownSrc, lowFilter, brownGain);
      }

      // 레이어 2: 흩뿌려지는 잔잔한 빗방울 지지직 질감 (화이트 노이즈 + 밴드패스 2400Hz)
      const whiteBuf = this.createWhiteNoiseBuffer(2);
      if (whiteBuf) {
        const whiteSrc = this.ctx.createBufferSource();
        whiteSrc.buffer = whiteBuf;
        whiteSrc.loop = true;

        const drizzleFilter = this.ctx.createBiquadFilter();
        drizzleFilter.type = 'bandpass';
        drizzleFilter.frequency.setValueAtTime(2400, now);
        drizzleFilter.Q.setValueAtTime(0.8, now);

        const drizzleGain = this.ctx.createGain();
        drizzleGain.gain.setValueAtTime(0.2, now);

        whiteSrc.connect(drizzleFilter);
        drizzleFilter.connect(drizzleGain);
        drizzleGain.connect(this.masterGain);
        whiteSrc.start();
        this.activeNodes.push(whiteSrc, drizzleFilter, drizzleGain);
      }

      // 레이어 3: 창문에 톡톡 부딪히는 실제 빗방울 물방울 소리 (Random Damped Micro Sine Chirp)
      const dropTimer = setInterval(() => {
        if (!this.ctx || !this.masterGain || this.currentMode !== 'rain') return;
        try {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          const startFreq = 800 + Math.random() * 600;
          osc.frequency.setValueAtTime(startFreq, t);
          osc.frequency.exponentialRampToValueAtTime(300, t + 0.035);

          gain.gain.setValueAtTime(0.04 + Math.random() * 0.07, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.04);
        } catch {}
      }, 120);

      this.activeIntervals.push(dropTimer);
    }

    // =========================================================================
    // 2. [FIRE: 타닥타닥 타오르는 장작 모닥불]
    // =========================================================================
    else if (mode === 'fire') {
      const brownBuf = this.createBrownNoiseBuffer(3);
      if (brownBuf) {
        const fireSrc = this.ctx.createBufferSource();
        fireSrc.buffer = brownBuf;
        fireSrc.loop = true;

        const flameFilter = this.ctx.createBiquadFilter();
        flameFilter.type = 'lowpass';
        flameFilter.frequency.setValueAtTime(140, now);

        const flameGain = this.ctx.createGain();
        flameGain.gain.setValueAtTime(0.7, now);

        fireSrc.connect(flameFilter);
        flameFilter.connect(flameGain);
        flameGain.connect(this.masterGain);
        fireSrc.start();
        this.activeNodes.push(fireSrc, flameFilter, flameGain);
      }

      const whiteBuf = this.createWhiteNoiseBuffer(2);
      if (whiteBuf) {
        const hissSrc = this.ctx.createBufferSource();
        hissSrc.buffer = whiteBuf;
        hissSrc.loop = true;

        const hissFilter = this.ctx.createBiquadFilter();
        hissFilter.type = 'bandpass';
        hissFilter.frequency.setValueAtTime(750, now);
        hissFilter.Q.setValueAtTime(1.5, now);

        const hissGain = this.ctx.createGain();
        hissGain.gain.setValueAtTime(0.12, now);

        hissSrc.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(this.masterGain);
        hissSrc.start();
        this.activeNodes.push(hissSrc, hissFilter, hissGain);
      }

      const crackleTimer = setInterval(() => {
        if (!this.ctx || !this.masterGain || this.currentMode !== 'fire') return;
        if (Math.random() > 0.6) return;

        try {
          const t = this.ctx.currentTime;
          const burstCount = Math.floor(Math.random() * 3) + 1;

          for (let i = 0; i < burstCount; i++) {
            const burstOffset = i * (0.015 + Math.random() * 0.02);
            const popBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.015), this.ctx.sampleRate);
            const popData = popBuf.getChannelData(0);
            for (let j = 0; j < popData.length; j++) {
              popData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (popData.length * 0.2));
            }

            const popSrc = this.ctx.createBufferSource();
            popSrc.buffer = popBuf;

            const popFilter = this.ctx.createBiquadFilter();
            popFilter.type = 'bandpass';
            popFilter.frequency.setValueAtTime(1800 + Math.random() * 2500, t + burstOffset);
            popFilter.Q.setValueAtTime(5 + Math.random() * 5, t + burstOffset);

            const popGain = this.ctx.createGain();
            popGain.gain.setValueAtTime(0.25 + Math.random() * 0.35, t + burstOffset);

            popSrc.connect(popFilter);
            popFilter.connect(popGain);
            popGain.connect(this.masterGain);

            popSrc.start(t + burstOffset);
          }
        } catch {}
      }, 100);

      this.activeIntervals.push(crackleTimer);
    }

    // =========================================================================
    // 3. [WAVE: 심야 바닷가 밀물과 썰물 파도]
    // =========================================================================
    else if (mode === 'wave') {
      const brownBuf = this.createBrownNoiseBuffer(4);
      if (brownBuf) {
        const waveSrc = this.ctx.createBufferSource();
        waveSrc.buffer = brownBuf;
        waveSrc.loop = true;

        const waveFilter = this.ctx.createBiquadFilter();
        waveFilter.type = 'lowpass';
        waveFilter.frequency.setValueAtTime(250, now);

        const waveGain = this.ctx.createGain();
        waveGain.gain.setValueAtTime(0.2, now);

        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.105, now);

        const lfoGainMod = this.ctx.createGain();
        lfoGainMod.gain.setValueAtTime(0.35, now);
        lfo.connect(lfoGainMod);
        lfoGainMod.connect(waveGain.gain);

        const lfoFilterMod = this.ctx.createGain();
        lfoFilterMod.gain.setValueAtTime(600, now);
        lfo.connect(lfoFilterMod);
        lfoFilterMod.connect(waveFilter.frequency);

        lfo.start();

        waveSrc.connect(waveFilter);
        waveFilter.connect(waveGain);
        waveGain.connect(this.masterGain);
        waveSrc.start();

        this.activeNodes.push(waveSrc, waveFilter, waveGain, lfo, lfoGainMod, lfoFilterMod);
      }
    }

    // =========================================================================
    // 4. [WIND: 새벽 들판의 휘몰아치는 따뜻한 밤바람]
    // =========================================================================
    else if (mode === 'wind') {
      const whiteBuf = this.createWhiteNoiseBuffer(3);
      if (whiteBuf) {
        const windSrc = this.ctx.createBufferSource();
        windSrc.buffer = whiteBuf;
        windSrc.loop = true;

        const whistleFilter = this.ctx.createBiquadFilter();
        whistleFilter.type = 'bandpass';
        whistleFilter.frequency.setValueAtTime(420, now);
        whistleFilter.Q.setValueAtTime(5.5, now);

        const windLfo = this.ctx.createOscillator();
        windLfo.type = 'triangle';
        windLfo.frequency.setValueAtTime(0.22, now);

        const windFilterMod = this.ctx.createGain();
        windFilterMod.gain.setValueAtTime(260, now);
        windLfo.connect(windFilterMod);
        windFilterMod.connect(whistleFilter.frequency);

        const windGain = this.ctx.createGain();
        windGain.gain.setValueAtTime(0.38, now);

        const windGainLfo = this.ctx.createOscillator();
        windGainLfo.type = 'sine';
        windGainLfo.frequency.setValueAtTime(0.14, now);
        const windGainMod = this.ctx.createGain();
        windGainMod.gain.setValueAtTime(0.2, now);
        windGainLfo.connect(windGainMod);
        windGainMod.connect(windGain.gain);

        windLfo.start();
        windGainLfo.start();

        windSrc.connect(whistleFilter);
        whistleFilter.connect(windGain);
        windGain.connect(this.masterGain);
        windSrc.start();

        this.activeNodes.push(windSrc, whistleFilter, windGain, windLfo, windFilterMod, windGainLfo, windGainMod);
      }
    }

    this.currentMode = mode;
    this.notify();
  }

  // 온기 촛불 탭 시 재생되는 맑은 크리스탈 싱잉볼/차임벨 음향
  public playCandleChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const freqs = [739.99, 932.33, 1108.73];

    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      const delay = idx * 0.04;
      gain.gain.setValueAtTime(0.0001, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), t + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + delay);
      osc.stop(t + delay + 1.3);
    });
  }

  public stop() {
    this.activeIntervals.forEach((id) => clearInterval(id as any));
    this.activeIntervals = [];

    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];

    this.currentMode = 'off';
    this.notify();
  }

  public getMode(): SoundMode {
    return this.currentMode;
  }
}

export const soundscape = new SoundscapeManager();
