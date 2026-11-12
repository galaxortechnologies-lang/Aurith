export type ScreenId =
  | 'splash'
  | 'home'
  | 'chat'
  | 'voice'
  | 'apps'
  | 'device'
  | 'downloads'
  | 'app_activity'
  | 'app_usage'
  | 'notifications'
  | 'notes'
  | 'reminders'
  | 'memory'
  | 'api_config'
  | 'permissions'
  | 'privacy_security'
  | 'settings'
  | 'about';

export type SupportedLanguage = 'hi-IN' | 'en-IN' | 'hinglish';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aurith';
  text: string;
  timestamp: number;
  toolCall?: {
    name: string;
    args: Record<string, any>;
    result?: Record<string, any>;
    status?: 'running' | 'success' | 'failed' | 'cancelled';
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string;
  timestamp: number;
  isCompleted: boolean;
  type: 'reminder' | 'alarm';
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'fact' | 'habit' | 'contact';
  content: string;
  timestamp: number;
  isEnabled: boolean;
}

export interface AppActivityRecord {
  id: string;
  packageName: string;
  appName: string;
  eventType: 'INSTALLED' | 'REMOVED' | 'UPDATED';
  timestamp: number;
}

export interface DownloadFileItem {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  sizeFormatted: string;
  date: string;
}

export interface DeviceTelemetry {
  batteryPct: number;
  isCharging: boolean;
  batteryHealth: string;
  batteryTemp: number;
  ramUsedGb: number;
  ramTotalGb: number;
  storageUsedGb: number;
  storageTotalGb: number;
  androidVersion: string;
  sdkInt: number;
  securityPatch: string;
  deviceModel: string;
  manufacturer: string;
  cpuArchitecture: string;
  networkType: 'WiFi 6' | '5G' | 'LTE' | 'Offline';
  sensorCount: number;
}

export type TtsEngine = 'lifetime_free_device' | 'lifetime_free_google' | 'fish_audio';
export type MicSoundMode = 'disabled' | 'subtle' | 'default';
export type VoiceGender = 'male' | 'female' | 'auto';
export type VoiceProfile = 'natural' | 'energetic' | 'calm';

export interface ApiSettings {
  openRouterApiKey: string;
  openRouterModelId: string;
  openRouterEndpoint: string;
  fishAudioApiKey: string;
  ttsEngine: TtsEngine;
  ttsModelId: string;
  ttsEndpoint: string;
  micSoundMode: MicSoundMode;
  speechRate: number;
  speechPitch: number;
  voiceGender: VoiceGender;
  voiceProfile: VoiceProfile;
  selectedLanguage: SupportedLanguage;
  memoryEnabled: boolean;
  autoSpeakReplies: boolean;
}

