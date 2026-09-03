// 브라우저 Web Audio API 기반의 하이엔드 절차적(Procedural) ASMR 오디오 엔진
// 4가지 사운드(빗소리, 모닥불, 밤바다 파도, 밤바람)의 독립 채널 믹싱 및 멀티 트랙 동시 조합 지원

export type SoundChannel = 'rain' | 'fire' | 'wave' | 'wind';
export type SoundMode = 'off' | SoundChannel | 'mix';

export interface ChannelInfo {
  id: SoundChannel;
  name: string;
  emoji: string;
  description: string;
  defaultVolume: number;
}

export const SOUND_CHANNELS: Record<SoundChannel, ChannelInfo> = {
  rain: {
    id: 'rain',
    name: '창문 빗소리',
    emoji: '🌧️',
    description: '창문에 톡톡 부딪히는 실제 빗방울 소리',
    defaultVolume: 0.7,
  },
  fire: {
    id: 'fire',
    name: '장작 모닥불',
    emoji: '🔥',
    description: '타닥타닥 나무 타는 온기 소리',
    defaultVolume: 0.75,
  },
  wave: {
    id: 'wave',
    name: '밤바다 파도',
    emoji: '🌊',
    description: '밀물과 썰물의 깊고 아늑한 호흡',
    defaultVolume: 0.65,
  },
  wind: {
    id: 'wind',
    name: '새벽 밤바람',
    emoji: '🍃',
    description: '나뭇잎 스치는 부드러운 바람결',
    defaultVolume: 0.6,
  },
};

export interface SoundPreset {
  id: string;
  name: string;
  channels: SoundChannel[];
  emoji: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  { id: 'rain_fire', name: '비 내리는 산장', channels: ['rain', 'fire'], emoji: '🌧️🔥' },
  { id: 'wave_wind', name: '한밤의 해변', channels: ['wave', 'wind'], emoji: '🌊🍃' },
  { id: 'rain_wind', name: '새벽 젖은 숲길', channels: ['rain', 'wind'], emoji: '🌧️🍃' },
];

export type SoundListener = (activeChannels: SoundChannel[]) => void;

class SoundscapeManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterVolume: number = 0.55;

  private activeChannels: Set<SoundChannel> = new Set();
  private channelVolumes: Record<SoundChannel, number> = {
    rain: 0.7,
    fire: 0.75,
    wave: 0.65,
    wind: 0.6,
  };

  private channelGains: Record<SoundChannel, GainNode | null> = {
    rain: null,
    fire: null,
    wave: null,
    wind: null,
  };

  private channelNodes: Record<SoundChannel, AudioNode[]> = {
    rain: [],
    fire: [],
    wave: [],
    wind: [],
  };

  private channelIntervals: Record<SoundChannel, (NodeJS.Timeout | number)[]> = {
    rain: [],
    fire: [],
    wave: [],
    wind: [],
  };

  private listeners: Set<SoundListener> = new Set();

  public subscribe(listener: SoundListener): () => void {
    this.listeners.add(listener);
    listener(Array.from(this.activeChannels));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const list = Array.from(this.activeChannels);
    this.listeners.forEach((fn) => fn(list));
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  private ensureChannelGain(channel: SoundChannel): GainNode | null {
    this.initContext();
    if (!this.ctx || !this.masterGain) return null;

    if (!this.channelGains[channel]) {
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.channelVolumes[channel], this.ctx.currentTime);
      gain.connect(this.masterGain);
      this.channelGains[channel] = gain;
    }
    return this.channelGains[channel];
  }

  public setVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setChannelVolume(channel: SoundChannel, val: number) {
    const vol = Math.max(0, Math.min(1, val));
    this.channelVolumes[channel] = vol;
    const gain = this.channelGains[channel];
    if (gain && this.ctx) {
      gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  public getChannelVolume(channel: SoundChannel): number {
    return this.channelVolumes[channel] ?? 0.7;
  }

  public isChannelActive(channel: SoundChannel): boolean {
    return this.activeChannels.has(channel);
  }

  public getActiveChannels(): SoundChannel[] {
    return Array.from(this.activeChannels);
  }

  public hasActiveSound(): boolean {
    return this.activeChannels.size > 0;
  }

  public getMode(): SoundMode {
    const list = Array.from(this.activeChannels);
    if (list.length === 0) return 'off';
    if (list.length === 1) return list[0];
    return 'mix';
  }

  public getActiveSummary(): string {
    const list = Array.from(this.activeChannels);
    if (list.length === 0) return '';
    return list.map((c) => SOUND_CHANNELS[c].name).join(' + ');
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

  // 핑크/브라운 노이즈 버퍼
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
      data[i] *= 3.5;
    }
    return buffer;
  }

  // 단일 채널 시작
  public startChannel(channel: SoundChannel) {
    if (this.activeChannels.has(channel)) return;

    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const channelGain = this.ensureChannelGain(channel);
    if (!channelGain) return;

    const now = this.ctx.currentTime;
    const nodes: AudioNode[] = [];
    const intervals: (NodeJS.Timeout | number)[] = [];

    if (channel === 'rain') {
      // 1. 굵은 빗줄기 배경음
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
        brownGain.connect(channelGain);
        brownSrc.start();
        nodes.push(brownSrc, lowFilter, brownGain);
      }

      // 2. 흩뿌려지는 잔잔한 빗방울 질감
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
        drizzleGain.connect(channelGain);
        whiteSrc.start();
        nodes.push(whiteSrc, drizzleFilter, drizzleGain);
      }

      // 3. 창문에 톡톡 부딪히는 빗방울 소리
      const dropTimer = setInterval(() => {
        if (!this.ctx || !this.activeChannels.has('rain')) return;
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
          gain.connect(channelGain);
          osc.start(t);
          osc.stop(t + 0.04);
        } catch {}
      }, 120);

      intervals.push(dropTimer);
    } else if (channel === 'fire') {
      // 1. 모닥불 저음 불꽃 바디
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
        flameGain.connect(channelGain);
        fireSrc.start();
        nodes.push(fireSrc, flameFilter, flameGain);
      }

      // 2. 열기 스르륵 노이즈
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
        hissGain.connect(channelGain);
        hissSrc.start();
        nodes.push(hissSrc, hissFilter, hissGain);
      }

      // 3. 타닥타닥 모닥불 불티 파열음
      const crackleTimer = setInterval(() => {
        if (!this.ctx || !this.activeChannels.has('fire')) return;
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
            popGain.connect(channelGain);

            popSrc.start(t + burstOffset);
          }
        } catch {}
      }, 100);

      intervals.push(crackleTimer);
    } else if (channel === 'wave') {
      // 파도 밀물/썰물
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
        waveGain.connect(channelGain);
        waveSrc.start();

        nodes.push(waveSrc, waveFilter, waveGain, lfo, lfoGainMod, lfoFilterMod);
      }
    } else if (channel === 'wind') {
      // 밤바람
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
        windGain.connect(channelGain);
        windSrc.start();

        nodes.push(windSrc, whistleFilter, windGain, windLfo, windFilterMod, windGainLfo, windGainMod);
      }
    }

    this.channelNodes[channel] = nodes;
    this.channelIntervals[channel] = intervals;
    this.activeChannels.add(channel);
    this.notify();
  }

  // 단일 채널 정지
  public stopChannel(channel: SoundChannel) {
    if (!this.activeChannels.has(channel)) return;

    this.channelIntervals[channel].forEach((id) => clearInterval(id as any));
    this.channelIntervals[channel] = [];

    this.channelNodes[channel].forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.channelNodes[channel] = [];

    this.activeChannels.delete(channel);
    this.notify();
  }

  // 채널 토글 (조합 ON/OFF)
  public toggleChannel(channel: SoundChannel) {
    if (this.activeChannels.has(channel)) {
      this.stopChannel(channel);
    } else {
      this.startChannel(channel);
    }
  }

  // 추천 조합 프리셋 재생 (기존 소리 끄고 프리셋 채널들 켜기)
  public playPreset(preset: SoundPreset) {
    this.stopAll();
    preset.channels.forEach((ch) => this.startChannel(ch));
  }

  // 기존 API 호환 메서드 (play)
  public play(mode: SoundMode) {
    if (mode === 'off') {
      this.stopAll();
      return;
    }
    if (mode === 'mix') return;

    // 단일 모드 재생 시 다른 채널 끄고 해당 채널만 켜기
    this.stopAll();
    this.startChannel(mode);
  }

  public stopAll() {
    const list = Array.from(this.activeChannels);
    list.forEach((ch) => this.stopChannel(ch));
    this.activeChannels.clear();
    this.notify();
  }

  public stop() {
    this.stopAll();
  }

  // 촛불 차임벨
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
}

export const soundscape = new SoundscapeManager();
