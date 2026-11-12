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

  public async speakText(
    apiKey: string,
    text: string,
    customModel?: string,
    customEndpoint?: string
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

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          model: model,
        },
        body: JSON.stringify({
          text: text.slice(0, 500), // optimal chunk length for snappy response
          format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: `Fish Audio (${model}) error ${response.status}: ${errorText || response.statusText}`,
        };
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        return { success: false, message: 'Fish Audio returned an empty audio stream.' };
      }

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
      return { success: true, message: 'Playing Fish Audio voice response' };
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
