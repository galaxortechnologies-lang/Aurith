import { SupportedLanguage, TtsEngine, MicSoundMode, VoiceGender } from '../types';

export interface SpeakOptions {
  language?: SupportedLanguage;
  engine?: TtsEngine;
  apiKey?: string;
  modelId?: string;
  endpoint?: string;
  rate?: number;
  pitch?: number;
  gender?: VoiceGender;
}

class TtsService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private isPlaying: boolean = false;
  private onStateChangeListeners: Array<(isPlaying: boolean) => void> = [];
  private audioContext: AudioContext | null = null;

  public addListener(listener: (isPlaying: boolean) => void) {
    this.onStateChangeListeners.push(listener);
  }

  public removeListener(listener: (isPlaying: boolean) => void) {
    this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
  }

  private setPlaying(playing: boolean) {
    this.isPlaying = playing;
    this.onStateChangeListeners.forEach((l) => l(playing));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Sanitizes text to fix spelling out of "AURITH" and ensure natural pronunciation.
   * "AURITH" -> "Orith" or "ऑरिथ"
   */
  public sanitizePronunciation(text: string, lang: SupportedLanguage = 'hinglish'): string {
    if (!text) return '';
    let clean = text.replace(/[*#`_~]/g, '').trim();

    // Fix letter-by-letter spelling out of AURITH
    clean = clean.replace(/A\s*[\-\.]?\s*U\s*[\-\.]?\s*R\s*[\-\.]?\s*I\s*[\-\.]?\s*T\s*[\-\.]?\s*H/gi, 'Orith');

    // Phonetic replacement for speech engines
    if (lang === 'hi-IN') {
      clean = clean.replace(/\b(AURITH|Aurith|aurith)\b/g, 'ऑरिथ');
    } else {
      clean = clean.replace(/\b(AURITH|Aurith|aurith)\b/g, 'Orith');
    }

    return clean;
  }

  /**
   * Universal speech synthesis with guaranteed lifetime free fallback.
   * AI will never be silent!
   */
  public async speakText(
    text: string,
    options: SpeakOptions = {}
  ): Promise<{ success: boolean; message: string; engineUsed: string }> {
    if (!text || !text.trim()) {
      return { success: false, message: 'No text provided for speech.', engineUsed: 'none' };
    }

    this.stop();

    const engine = options.engine || 'lifetime_free_device';
    const lang = options.language || 'hinglish';
    const gender = options.gender || 'male';
    const cleanText = this.sanitizePronunciation(text, lang);

    // 1. Try Fish Audio if selected and key provided
    if (engine === 'fish_audio' && options.apiKey && options.apiKey.trim()) {
      try {
        const endpoint = options.endpoint || 'https://api.fish.audio/v1/tts';
        const modelId = options.modelId || 's2.1-pro-free';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${options.apiKey.trim()}`,
            'Content-Type': 'application/json',
            model: modelId,
          },
          body: JSON.stringify({
            text: cleanText.slice(0, 500),
            format: 'mp3',
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          if (blob.size > 0) {
            if (this.currentAudioUrl) {
              URL.revokeObjectURL(this.currentAudioUrl);
            }
            this.currentAudioUrl = URL.createObjectURL(blob);
            const audio = new Audio(this.currentAudioUrl);
            this.currentAudio = audio;

            audio.onplay = () => this.setPlaying(true);
            audio.onended = () => {
              this.setPlaying(false);
              this.currentAudio = null;
            };
            audio.onerror = () => {
              this.setPlaying(false);
              this.currentAudio = null;
            };

            await audio.play();
            return {
              success: true,
              message: `Playing via Fish Audio (${modelId})`,
              engineUsed: 'Fish Audio Cloud',
            };
          }
        }
      } catch (err) {
        console.warn('Fish Audio error, falling back to lifetime free speech:', err);
      }
    }

    // 2. Try Google Free Stream if explicitly selected
    if (engine === 'lifetime_free_google') {
      try {
        const ttsLang = lang === 'hi-IN' ? 'hi' : lang === 'en-IN' ? 'en-IN' : 'hi';
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${ttsLang}&q=${encodeURIComponent(
          cleanText.slice(0, 200)
        )}`;

        const audio = new Audio(googleUrl);
        this.currentAudio = audio;

        audio.onplay = () => this.setPlaying(true);
        audio.onended = () => {
          this.setPlaying(false);
          this.currentAudio = null;
        };
        audio.onerror = () => {
          this.speakWithWebSpeech(cleanText, lang, options.rate, options.pitch, gender);
        };

        await audio.play();
        return {
          success: true,
          message: 'Playing via Google Free Stream (Lifetime Free, ₹0)',
          engineUsed: 'Google Free Stream',
        };
      } catch {
        // Fall through to Web Speech
      }
    }

    // 3. Lifetime Free: Native Neural Web Speech API (Male Voice priority)
    const webResult = this.speakWithWebSpeech(cleanText, lang, options.rate, options.pitch, gender);
    return {
      success: webResult.success,
      message: webResult.message,
      engineUsed: `Lifetime Free Neural Engine (${gender.toUpperCase()} Voice, ₹0)`,
    };
  }

  private speakWithWebSpeech(
    text: string,
    lang: SupportedLanguage,
    customRate?: number,
    customPitch?: number,
    gender: VoiceGender = 'male'
  ): { success: boolean; message: string } {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return { success: false, message: 'Web Speech Synthesis is not supported in this environment.' };
    }

    try {
      window.speechSynthesis.cancel();

      const chunks = this.chunkText(text, 180);
      let currentIndex = 0;

      const speakChunk = (index: number) => {
        if (index >= chunks.length) {
          this.setPlaying(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.rate = customRate || 1.0;

        // Enforce deep male acoustic pitch when gender is male
        if (gender === 'male') {
          utterance.pitch = customPitch ? Math.min(customPitch, 0.70) : 0.65; // Deep male frequency (0.65)
        } else if (gender === 'female') {
          utterance.pitch = customPitch || 1.15;
        } else {
          utterance.pitch = customPitch || 1.0;
        }

        const targetLocale =
          lang === 'hi-IN' ? 'hi-IN' : lang === 'en-IN' ? 'en-IN' : 'hi-IN';
        utterance.lang = targetLocale;

        // Select Male Voice with deep preference
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const isMale = (vName: string) => {
            const n = vName.toLowerCase();
            return (
              n.includes('male') ||
              n.includes('rishi') ||
              n.includes('prabhat') ||
              n.includes('david') ||
              n.includes('mark') ||
              n.includes('george') ||
              n.includes('guy') ||
              n.includes('liam') ||
              n.includes('vijay') ||
              n.includes('ravi') ||
              n.includes('neel') ||
              n.includes('daniel') ||
              n.includes('arthur') ||
              n.includes('alex') ||
              n.includes('fred') ||
              n.includes('natural male')
            );
          };

          const isFemale = (vName: string) => {
            const n = vName.toLowerCase();
            return (
              n.includes('female') ||
              n.includes('kalpana') ||
              n.includes('zira') ||
              n.includes('swara') ||
              n.includes('heera') ||
              n.includes('sita') ||
              n.includes('samantha') ||
              n.includes('victoria')
            );
          };

          let matchedVoice: SpeechSynthesisVoice | undefined;

          if (gender === 'male') {
            matchedVoice =
              voices.find((v) => (v.lang === targetLocale || v.lang.startsWith(targetLocale.slice(0, 2))) && isMale(v.name)) ||
              voices.find((v) => isMale(v.name)) ||
              voices.find((v) => (v.lang === targetLocale || v.lang.startsWith(targetLocale.slice(0, 2))) && !isFemale(v.name)) ||
              voices.find((v) => !isFemale(v.name)) ||
              voices[0];
          } else if (gender === 'female') {
            matchedVoice =
              voices.find((v) => (v.lang === targetLocale || v.lang.startsWith(targetLocale.slice(0, 2))) && isFemale(v.name)) ||
              voices.find((v) => isFemale(v.name)) ||
              voices[0];
          } else {
            matchedVoice =
              voices.find((v) => v.lang === targetLocale || v.lang.startsWith(targetLocale.slice(0, 2))) ||
              voices[0];
          }

          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        }

        utterance.onstart = () => {
          this.setPlaying(true);
        };

        utterance.onend = () => {
          currentIndex++;
          if (currentIndex < chunks.length) {
            speakChunk(currentIndex);
          } else {
            this.setPlaying(false);
          }
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis utterance error:', e);
          this.setPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakChunk(0);
      return {
        success: true,
        message: `Speaking with Lifetime Free Neural Male Engine (₹0 cost).`,
      };
    } catch (err: any) {
      this.setPlaying(false);
      return { success: false, message: `Voice synthesis failed: ${err.message}` };
    }
  }

  private chunkText(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) return [text];
    const sentences = text.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [text];
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + sentence).length <= maxLength) {
        current += sentence;
      } else {
        if (current.trim()) chunks.push(current.trim());
        current = sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    this.setPlaying(false);
  }

  public pause() {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // ignore
      }
    }
    if (this.currentAudio && !this.currentAudio.paused) {
      try {
        this.currentAudio.pause();
      } catch {
        // ignore
      }
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }
    if (this.currentAudio && this.currentAudio.paused) {
      try {
        this.currentAudio.play();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Controls microphone activation sound:
   * - 'disabled': Muted / Completely silent (no Google chime)
   * - 'subtle': Custom soft pleasant Aurith tone (synthesized sine)
   * - 'default': Standard system cue
   */
  public playMicStartSound(mode: MicSoundMode = 'disabled') {
    if (mode === 'disabled') {
      // Muted completely as explicitly requested!
      return;
    }

    if (mode === 'subtle') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = this.audioContext || new AudioCtx();
        this.audioContext = ctx;

        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
      } catch (err) {
        console.warn('Audio tone synthesis error:', err);
      }
    }
  }
}

export const ttsService = new TtsService();
