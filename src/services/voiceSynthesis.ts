import { ApiSettings, MicSoundMode, SupportedLanguage } from '../types';
import { ttsService } from './ttsService';

// Helper to strip markdown and format text for human-like spoken speech
export const cleanTextForSpeech = (rawText: string): string => {
  if (!rawText) return '';
  return rawText
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/#{1,6}\s+/g, '') // Headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/[•*\-]\s+/g, '') // Bullet points
    .replace(/\{[\s\S]*?\}/g, '') // JSON chunks
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Emojis
    .replace(/\s+/g, ' ')
    .trim();
};

class VoiceSynthesisService {
  public addListener(listener: (isPlaying: boolean) => void) {
    ttsService.addListener(listener);
  }

  public removeListener(listener: (isPlaying: boolean) => void) {
    ttsService.removeListener(listener);
  }

  public getIsPlaying(): boolean {
    return ttsService.getIsPlaying();
  }

  public async speak(
    text: string,
    settings: ApiSettings
  ): Promise<{ success: boolean; engine: string; message: string }> {
    const speechText = cleanTextForSpeech(text);
    const res = await ttsService.speakText(speechText, {
      language: settings.selectedLanguage,
      engine: settings.ttsEngine,
      apiKey: settings.fishAudioApiKey,
      modelId: settings.ttsModelId,
      endpoint: settings.ttsEndpoint,
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      gender: settings.voiceGender,
    });
    return {
      success: res.success,
      engine: res.engineUsed,
      message: res.message,
    };
  }

  public pause() {
    ttsService.pause();
  }

  public resume() {
    ttsService.resume();
  }

  public stop() {
    ttsService.stop();
  }

  public playMicFeedback(mode: MicSoundMode) {
    ttsService.playMicStartSound(mode);
  }
}

export const voiceSynthesis = new VoiceSynthesisService();
