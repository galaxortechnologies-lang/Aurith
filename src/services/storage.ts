import { ApiSettings, Conversation, NoteItem, ReminderItem, MemoryItem, AppActivityRecord, DownloadFileItem } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'aurith_settings_v1',
  CONVERSATIONS: 'aurith_conversations_v1',
  ACTIVE_CONV: 'aurith_active_conv_id_v1',
  NOTES: 'aurith_notes_v1',
  REMINDERS: 'aurith_reminders_v1',
  MEMORIES: 'aurith_memories_v1',
  APP_ACTIVITY: 'aurith_app_activity_v1',
  DOWNLOADS: 'aurith_downloads_v1',
  NOTIFICATIONS: 'aurith_notifications_v1',
};

const DEFAULT_SETTINGS: ApiSettings = {
  openRouterApiKey: '',
  openRouterModelId: 'google/gemma-4-26b-a4b-it:free',
  openRouterEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
  fishAudioApiKey: '',
  ttsEngine: 'lifetime_free_device',
  ttsModelId: 's2.1-pro-free',
  ttsEndpoint: 'https://api.fish.audio/v1/tts',
  micSoundMode: 'disabled',
  speechRate: 1.0,
  speechPitch: 0.50, // Deep testosterone male pitch depth
  voiceGender: 'male',
  voiceProfile: 'natural',
  selectedLanguage: 'hinglish',
  memoryEnabled: true,
  autoSpeakReplies: true,
};

export const getStoredSettings = (): ApiSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: ApiSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const maskApiKey = (key: string): string => {
  if (!key) return 'Not configured';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
};

export const getStoredConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) {
      return [
        {
          id: 'default-conv',
          title: 'Welcome to AURITH',
          createdAt: Date.now(),
          messages: [
            {
              id: 'msg-1',
              sender: 'aurith',
              text: 'Namaste! I am AURITH, your personal AI assistant created by Anup Chand. I am connected directly to OpenRouter (google/gemma-4-26b-a4b-it:free) and Fish Audio TTS (s2.1-pro-free). Ask me anything in Hindi, English, or Hinglish, or ask me to check your battery, launch apps, or take notes!',
              timestamp: Date.now(),
            },
          ],
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
};

export const getStoredNotes = (): NoteItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      return [
        {
          id: 'note-1',
          title: 'Project Architecture',
          content: 'AURITH Native Android 16 single-activity Jetpack Compose assistant with Room DB and Keystore encryption.',
          updatedAt: Date.now() - 3600000,
        },
        {
          id: 'note-2',
          title: 'Personal Assistant Goals',
          content: 'Support Hindi, English, and Hinglish voice interactions with Fish Audio s2.1-pro-free.',
          updatedAt: Date.now() - 86400000,
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveNotes = (notes: NoteItem[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
};

export const getStoredReminders = (): ReminderItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      return [
        {
          id: 'rem-1',
          title: 'Daily Standup Meeting',
          time: '09:30 AM',
          timestamp: Date.now() + 3600000,
          isCompleted: false,
          type: 'reminder',
        },
        {
          id: 'rem-2',
          title: 'Morning Alarm',
          time: '06:00 AM',
          timestamp: Date.now() + 86400000,
          isCompleted: false,
          type: 'alarm',
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveReminders = (reminders: ReminderItem[]) => {
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
};

export const getStoredMemories = (): MemoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (!raw) {
      return [
        {
          id: 'mem-1',
          category: 'preference',
          content: 'User prefers Hinglish and Hindi responses for voice queries.',
          timestamp: Date.now() - 86400000,
          isEnabled: true,
        },
        {
          id: 'mem-2',
          category: 'fact',
          content: 'Application created and engineered by Anup Chand.',
          timestamp: Date.now() - 172800000,
          isEnabled: true,
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveMemories = (memories: MemoryItem[]) => {
  localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
};

export const getStoredAppActivity = (): AppActivityRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_ACTIVITY);
    if (!raw) {
      return [
        {
          id: 'act-1',
          packageName: 'com.anupchand.aurith',
          appName: 'AURITH Assistant',
          eventType: 'INSTALLED',
          timestamp: Date.now() - 7200000,
        },
        {
          id: 'act-2',
          packageName: 'com.whatsapp',
          appName: 'WhatsApp Messenger',
          eventType: 'UPDATED',
          timestamp: Date.now() - 86400000,
        },
        {
          id: 'act-3',
          packageName: 'com.android.chrome',
          appName: 'Google Chrome',
          eventType: 'UPDATED',
          timestamp: Date.now() - 172800000,
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveAppActivity = (records: AppActivityRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.APP_ACTIVITY, JSON.stringify(records));
};

export const getStoredDownloads = (): DownloadFileItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    if (!raw) {
      return [
        {
          id: 'file-1',
          name: 'aurith_architecture_v1.pdf',
          type: 'PDF Document',
          sizeBytes: 1450000,
          sizeFormatted: '1.45 MB',
          date: 'Nov 11, 2026',
        },
        {
          id: 'file-2',
          name: 'voice_sample_hinglish.mp3',
          type: 'Audio File',
          sizeBytes: 3120000,
          sizeFormatted: '3.12 MB',
          date: 'Nov 10, 2026',
        },
        {
          id: 'file-3',
          name: 'aurith_debug_log.txt',
          type: 'Text File',
          sizeBytes: 45000,
          sizeFormatted: '45 KB',
          date: 'Nov 9, 2026',
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveDownloads = (files: DownloadFileItem[]) => {
  localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(files));
};
