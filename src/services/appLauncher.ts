export interface AppDefinition {
  id: string;
  name: string;
  packageName: string;
  aliases: string[];
  category: 'Social' | 'Media' | 'Utility' | 'Communication' | 'Productivity' | 'Finance' | 'Shopping';
  webUrl?: string;
  scheme?: string;
}

export const COMPREHENSIVE_APP_CATALOG: AppDefinition[] = [
  // Communication & Social
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    aliases: ['whatsapp', 'whatsup', 'watsapp', 'wa', 'व्हाट्सएप', 'व्हाट्सऐप'],
    category: 'Communication',
    webUrl: 'https://web.whatsapp.com',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    aliases: ['instagram', 'insta', 'ig', 'इंस्टाग्राम', 'इन्स्टा'],
    category: 'Social',
    webUrl: 'https://instagram.com',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    packageName: 'org.telegram.messenger',
    aliases: ['telegram', 'tg', 'टेलीग्राम'],
    category: 'Communication',
    webUrl: 'https://web.telegram.org',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    aliases: ['facebook', 'fb', 'फेसबुक'],
    category: 'Social',
    webUrl: 'https://facebook.com',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    packageName: 'com.twitter.android',
    aliases: ['twitter', 'x', 'ट्विटर'],
    category: 'Social',
    webUrl: 'https://x.com',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    packageName: 'com.snapchat.android',
    aliases: ['snapchat', 'snap', 'स्नैपचैट'],
    category: 'Social',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    packageName: 'com.linkedin.android',
    aliases: ['linkedin', 'लिंक्डइन'],
    category: 'Social',
    webUrl: 'https://linkedin.com',
  },
  {
    id: 'discord',
    name: 'Discord',
    packageName: 'com.discord',
    aliases: ['discord', 'डिस्कॉर्ड'],
    category: 'Communication',
    webUrl: 'https://discord.com/app',
  },

  // Media & Video
  {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    aliases: ['youtube', 'yt', 'you tube', 'यूट्यूब', 'विडियो'],
    category: 'Media',
    webUrl: 'https://youtube.com',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    packageName: 'com.spotify.music',
    aliases: ['spotify', 'music', 'songs', 'स्पॉटिफ़ाई', 'गाना', 'गाने'],
    category: 'Media',
    webUrl: 'https://open.spotify.com',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    packageName: 'com.netflix.mediaclient',
    aliases: ['netflix', 'नेटफ्लिक्स'],
    category: 'Media',
    webUrl: 'https://netflix.com',
  },
  {
    id: 'hotstar',
    name: 'Disney+ Hotstar',
    packageName: 'in.startv.hotstar',
    aliases: ['hotstar', 'disney', 'हॉटस्टार'],
    category: 'Media',
    webUrl: 'https://hotstar.com',
  },
  {
    id: 'primevideo',
    name: 'Prime Video',
    packageName: 'com.amazon.avod.thirdpartyclient',
    aliases: ['prime video', 'amazon prime', 'प्राइम वीडियो'],
    category: 'Media',
    webUrl: 'https://primevideo.com',
  },

  // System & Phone Tools
  {
    id: 'camera',
    name: 'Camera',
    packageName: 'com.android.camera',
    aliases: ['camera', 'photo', 'cam', 'कैमरा', 'फोटो', 'तस्वीर'],
    category: 'Utility',
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    packageName: 'com.android.chrome',
    aliases: ['chrome', 'browser', 'google chrome', 'इंटरनेट', 'ब्राउज़र', 'गूगल'],
    category: 'Utility',
    webUrl: 'https://google.com',
  },
  {
    id: 'clock',
    name: 'Clock & Alarms',
    packageName: 'com.google.android.deskclock',
    aliases: ['clock', 'alarm', 'timer', 'घड़ी', 'अलार्म'],
    category: 'Utility',
  },
  {
    id: 'settings',
    name: 'Settings',
    packageName: 'com.android.settings',
    aliases: ['settings', 'phone settings', 'सिस्टम सेटिंग्स', 'सेटिंग्स', 'सेटिंग'],
    category: 'Utility',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    packageName: 'com.google.android.calculator',
    aliases: ['calculator', 'calc', 'कैलकुलेटर', 'हिसाब'],
    category: 'Utility',
  },
  {
    id: 'maps',
    name: 'Google Maps',
    packageName: 'com.google.android.apps.maps',
    aliases: ['maps', 'google maps', 'navigation', 'gps', 'मैप्स', 'नक्शा', 'रास्ता'],
    category: 'Utility',
    webUrl: 'https://maps.google.com',
  },
  {
    id: 'phone',
    name: 'Phone Dialer',
    packageName: 'com.google.android.dialer',
    aliases: ['phone', 'dialer', 'call', 'कॉल', 'फोन', 'डायलर'],
    category: 'Communication',
  },
  {
    id: 'messages',
    name: 'Messages',
    packageName: 'com.google.android.apps.messaging',
    aliases: ['messages', 'sms', 'message', 'मैसेज', 'एसएमएस'],
    category: 'Communication',
  },
  {
    id: 'files',
    name: 'Files & Downloads',
    packageName: 'com.google.android.documentsui',
    aliases: ['files', 'downloads', 'file manager', 'फाइल्स', 'डाउनलोड'],
    category: 'Utility',
  },
  {
    id: 'gallery',
    name: 'Photos / Gallery',
    packageName: 'com.google.android.apps.photos',
    aliases: ['gallery', 'photos', 'albums', 'गैलरी', 'तस्वीरें'],
    category: 'Media',
  },

  // Productivity
  {
    id: 'gmail',
    name: 'Gmail',
    packageName: 'com.google.android.gm',
    aliases: ['gmail', 'email', 'mail', 'जीमेल', 'ईमेल'],
    category: 'Productivity',
    webUrl: 'https://mail.google.com',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    packageName: 'com.google.android.apps.docs',
    aliases: ['drive', 'google drive', 'ड्राइव'],
    category: 'Productivity',
    webUrl: 'https://drive.google.com',
  },

  // Payments & Finance
  {
    id: 'gpay',
    name: 'Google Pay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    aliases: ['gpay', 'google pay', 'गूगल पे', 'जीपे'],
    category: 'Finance',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    packageName: 'com.phonepe.app',
    aliases: ['phonepe', 'phone pe', 'फोनपे'],
    category: 'Finance',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    packageName: 'net.one97.paytm',
    aliases: ['paytm', 'पेटीएम'],
    category: 'Finance',
  },

  // Shopping & Food
  {
    id: 'amazon',
    name: 'Amazon',
    packageName: 'in.amazon.mShop.android.shopping',
    aliases: ['amazon', 'अमेज़न'],
    category: 'Shopping',
    webUrl: 'https://amazon.in',
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    packageName: 'com.flipkart.android',
    aliases: ['flipkart', 'फ्लिपकार्ट'],
    category: 'Shopping',
    webUrl: 'https://flipkart.com',
  },
  {
    id: 'zomato',
    name: 'Zomato',
    packageName: 'com.application.zomato',
    aliases: ['zomato', 'खाना', 'ज़ोमैटो'],
    category: 'Shopping',
    webUrl: 'https://zomato.com',
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    packageName: 'in.swiggy.android',
    aliases: ['swiggy', 'स्विगी'],
    category: 'Shopping',
    webUrl: 'https://swiggy.com',
  },
];

export interface VoiceAppLaunchMatch {
  matched: boolean;
  app?: AppDefinition;
  appName: string;
  feedbackEn: string;
  feedbackHi: string;
}

/**
 * High-speed voice command parser for Hindi, English and Hinglish app launches.
 * Detects patterns like:
 * - "open WhatsApp", "launch YouTube", "start Camera", "switch to Settings"
 * - "WhatsApp kholo", "YouTube chalao", "Camera on karo", "Settings open karo"
 * - "kholo WhatsApp", "chalao Spotify", "open karo Instagram"
 */
export function detectVoiceAppLaunch(voiceInput: string): VoiceAppLaunchMatch | null {
  const text = voiceInput.trim().toLowerCase();
  if (!text) return null;

  // Launch trigger verbs in English, Hindi, and Hinglish
  const englishOpenPrefixes = ['open', 'launch', 'start', 'run', 'go to', 'switch to', 'show me'];
  const hindiPostVerbs = ['kholo', 'chalao', 'start karo', 'open karo', 'khol do', 'chala do', 'on karo', 'dikhao'];
  const hindiPreVerbs = ['kholo', 'chalao', 'start karo', 'open karo', 'kholiye'];

  // Check prefix matches: "open [app]"
  for (const prefix of englishOpenPrefixes) {
    if (text.startsWith(prefix + ' ')) {
      const candidate = text.slice(prefix.length).trim();
      const matchedApp = findAppByQuery(candidate);
      if (matchedApp) {
        return buildMatch(matchedApp);
      }
      if (candidate.length > 1) {
        return buildGenericMatch(candidate);
      }
    }
  }

  // Check prefix matches in Hindi: "kholo [app]"
  for (const verb of hindiPreVerbs) {
    if (text.startsWith(verb + ' ')) {
      const candidate = text.slice(verb.length).trim();
      const matchedApp = findAppByQuery(candidate);
      if (matchedApp) {
        return buildMatch(matchedApp);
      }
      if (candidate.length > 1) {
        return buildGenericMatch(candidate);
      }
    }
  }

  // Check suffix matches: "[app] kholo", "[app] chalao", "[app] open karo"
  for (const suffix of hindiPostVerbs) {
    if (text.endsWith(' ' + suffix)) {
      const candidate = text.slice(0, text.length - suffix.length - 1).trim();
      const matchedApp = findAppByQuery(candidate);
      if (matchedApp) {
        return buildMatch(matchedApp);
      }
      if (candidate.length > 1) {
        return buildGenericMatch(candidate);
      }
    }
  }

  // Direct app name match
  const directMatch = findAppByQuery(text);
  if (directMatch) {
    return buildMatch(directMatch);
  }

  return null;
}

function findAppByQuery(query: string): AppDefinition | undefined {
  const q = query.replace(/[.,?!]/g, '').trim().toLowerCase();
  if (!q) return undefined;

  // Exact name or id match
  let app = COMPREHENSIVE_APP_CATALOG.find(
    (a) => a.name.toLowerCase() === q || a.id.toLowerCase() === q
  );
  if (app) return app;

  // Alias match
  app = COMPREHENSIVE_APP_CATALOG.find((a) =>
    a.aliases.some((alias) => alias.toLowerCase() === q)
  );
  if (app) return app;

  // Substring match
  app = COMPREHENSIVE_APP_CATALOG.find(
    (a) =>
      q.includes(a.name.toLowerCase()) ||
      a.aliases.some((alias) => q.includes(alias.toLowerCase()))
  );
  return app;
}

function buildMatch(app: AppDefinition): VoiceAppLaunchMatch {
  return {
    matched: true,
    app,
    appName: app.name,
    feedbackEn: `Opening ${app.name} for you.`,
    feedbackHi: `${app.name} khol raha hoon.`,
  };
}

function buildGenericMatch(appNameRaw: string): VoiceAppLaunchMatch {
  const cleanName = appNameRaw.replace(/[.,?!]/g, '').trim();
  const formatted = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  return {
    matched: true,
    appName: formatted,
    feedbackEn: `Launching ${formatted} on device.`,
    feedbackHi: `${formatted} khol raha hoon.`,
  };
}
