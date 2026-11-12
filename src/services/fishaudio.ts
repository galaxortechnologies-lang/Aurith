export const FISH_AUDIO_MODEL = 's2.1-pro-free';
export const FISH_AUDIO_ENDPOINT = 'https://api.fish.audio/v1/tts';

class FishAudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private isPlaying: boolean = false;
  private onStateChangeListeners: Array<(isPlaying: boolean) => void> = [];

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

  private chunkText(text: string, maxLength: number = 120): string[] {
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
    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Streaming buffer pre-fetcher for Fish Audio with Voice Profiles (Natural, Energetic, Calm):
   * Starts playing the first audio chunk immediately while pre-fetching subsequent chunks in background.
   */
  public async speakText(
    apiKey: string,
    text: string,
    customModel?: string,
    customEndpoint?: string,
    voiceProfile: 'natural' | 'energetic' | 'calm' = 'natural'
  ): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return {
        success: false,
        message: 'Fish Audio API key is not configured. Go to Settings > API Configuration.',
      };
    }

    if (!text || !text.trim()) {
      return { success: false, message: 'No text provided for speech synthesis.' };
    }

    const endpoint = customEndpoint?.trim() || FISH_AUDIO_ENDPOINT;
    const model = customModel?.trim() || FISH_AUDIO_MODEL;

    try {
      this.stop();
      const chunks = this.chunkText(text, 140);
      if (chunks.length === 0) return { success: false, message: 'No speech chunks generated.' };

      const fetchChunkBlob = async (chunkTextStr: string): Promise<string | null> => {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey.trim()}`,
              'Content-Type': 'application/json',
              model: model,
            },
            body: JSON.stringify({
              text: chunkTextStr,
              format: 'mp3',
              speed: voiceProfile === 'energetic' ? 1.15 : voiceProfile === 'calm' ? 0.88 : 1.0,
            }),
          });
          if (res.ok) {
            const blob = await res.blob();
            if (blob.size > 0) {
              return URL.createObjectURL(blob);
            }
          }
        } catch {
          // ignore individual chunk error
        }
        return null;
      };

      const chunk0Promise = fetchChunkBlob(chunks[0]);
      const chunk1Promise = chunks.length > 1 ? fetchChunkBlob(chunks[1]) : Promise.resolve(null);

      const url0 = await chunk0Promise;
      if (!url0) {
        return { success: false, message: 'Fish Audio streaming pre-fetch failed for initial chunk.' };
      }

      this.currentAudioUrl = url0;
      const audio = new Audio(url0);
      this.currentAudio = audio;

      let currentChunkIndex = 0;

      const playNextChunk = async (nextUrl: string | null) => {
        if (!nextUrl) {
          this.setPlaying(false);
          this.currentAudio = null;
          return;
        }

        if (this.currentAudioUrl && this.currentAudioUrl !== nextUrl) {
          try {
            URL.revokeObjectURL(this.currentAudioUrl);
          } catch {
            // ignore
          }
        }

        this.currentAudioUrl = nextUrl;
        audio.src = nextUrl;
        await audio.play();
        this.setPlaying(true);

        currentChunkIndex++;
        if (currentChunkIndex < chunks.length) {
          fetchChunkBlob(chunks[currentChunkIndex]).then((subsequentUrl) => {
            audio.onended = () => {
              playNextChunk(subsequentUrl);
            };
          });
        } else {
          audio.onended = () => {
            this.setPlaying(false);
            this.currentAudio = null;
          };
        }
      };

      audio.onplay = () => this.setPlaying(true);
      audio.onerror = () => {
        this.setPlaying(false);
        this.currentAudio = null;
      };

      const url1 = await chunk1Promise;
      audio.onended = () => {
        playNextChunk(url1);
      };

      await audio.play();

      for (let i = 2; i < chunks.length; i++) {
        fetchChunkBlob(chunks[i]);
      }

      return { success: true, message: `Playing Fish Audio (${voiceProfile} profile)` };
    } catch (err: any) {
      this.setPlaying(false);
      return {
        success: false,
        message: `Audio playback failed: ${err.message || 'Unknown error'}`,
      };
    }
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.setPlaying(false);
    }
  }

  public resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.setPlaying(true);
    }
  }

  public stop() {
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
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
      } catch {
        // ignore
      }
      this.currentAudioUrl = null;
    }
    this.setPlaying(false);
  }

  public async testConnection(
    apiKey: string,
    customModel?: string,
    customEndpoint?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Fish Audio key cannot be empty.' };
    }

    const endpoint = customEndpoint?.trim() || FISH_AUDIO_ENDPOINT;
    const model = customModel?.trim() || FISH_AUDIO_MODEL;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          model: model,
        },
        body: JSON.stringify({
          text: 'AURITH connection test.',
          format: 'mp3',
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Fish Audio connection verified! Model: ${model} is active and ready.`,
        };
      } else {
        const err = await response.text();
        return {
          success: false,
          message: `Fish Audio HTTP ${response.status}: ${err || response.statusText}`,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: `Connection failed: ${e.message}`,
      };
    }
  }
}

export const fishAudio = new FishAudioService();
