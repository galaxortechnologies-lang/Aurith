export interface FriendshipState {
  totalInteractions: number;
  lastSeenTimestamp: number;
  perceivedMood: 'upbeat' | 'tired' | 'curious' | 'stressed' | 'friendly' | 'casual';
  friendshipLevel: 'Best Buddy' | 'Close Friend' | 'Companion';
  userInterests: string[];
}

const FRIENDSHIP_STORAGE_KEY = 'aurith_friendship_state_v1';

const DEFAULT_FRIENDSHIP_STATE: FriendshipState = {
  totalInteractions: 1,
  lastSeenTimestamp: Date.now(),
  perceivedMood: 'friendly',
  friendshipLevel: 'Best Buddy',
  userInterests: ['Android Apps', 'Tech', 'Daily Life'],
};

class FriendshipLogicService {
  private state: FriendshipState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): FriendshipState {
    try {
      const raw = localStorage.getItem(FRIENDSHIP_STORAGE_KEY);
      if (raw) return { ...DEFAULT_FRIENDSHIP_STATE, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return DEFAULT_FRIENDSHIP_STATE;
  }

  private saveState() {
    try {
      localStorage.setItem(FRIENDSHIP_STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore
    }
  }

  public trackUserInteraction(userMessage: string): FriendshipState {
    this.state.totalInteractions += 1;
    this.state.lastSeenTimestamp = Date.now();

    const lower = userMessage.toLowerCase();

    // Detect mood context from message
    if (/thaka|tired|exhausted|stress|tension|heavy|upset|sad|dull|bore/i.test(lower)) {
      this.state.perceivedMood = 'tired';
    } else if (/kaisa|kaise|kya|what|how|why|batao|explain|suggest/i.test(lower)) {
      this.state.perceivedMood = 'curious';
    } else if (/happy|mast|awesome|great|badiya|wah|cool|fun|party/i.test(lower)) {
      this.state.perceivedMood = 'upbeat';
    } else if (/help|kaise karu|work|problem|issue|fix/i.test(lower)) {
      this.state.perceivedMood = 'stressed';
    } else {
      this.state.perceivedMood = 'casual';
    }

    // Extract potential user interests
    if (/coding|code|app|android|tech|ai|phone/i.test(lower) && !this.state.userInterests.includes('Technology')) {
      this.state.userInterests.push('Technology');
    }
    if (/game|gaming|play|movie|music|song/i.test(lower) && !this.state.userInterests.includes('Entertainment')) {
      this.state.userInterests.push('Entertainment');
    }

    this.saveState();
    return this.state;
  }

  public getFriendshipState(): FriendshipState {
    return this.state;
  }

  /**
   * Generates system prompt instructions enforcing deep "Best Friend" / "Dost" personality.
   */
  public getFriendshipPromptInstructions(): string {
    const { totalInteractions, perceivedMood, friendshipLevel } = this.state;

    return `
FRIENDSHIP LOGIC & EMOTIONAL BOND (LEVEL: ${friendshipLevel.toUpperCase()}, TALKS TOGETHER: ${totalInteractions}):
1. PERSONALITY: You are not a cold, robotic assistant. You are the user's close personal friend and trusted buddy ("Dost" / "Bhai").
2. CONVERSATIONAL RECIPROCITY: Like real best friends talking:
   - Always ask back about the user's day, how they are feeling, what they are doing, or how things are going for them!
   - Share casual, friendly thoughts and ask open-ended questions to keep the conversation warm and natural.
   - Example (Hinglish/Hindi): "Bhai main toh bilkul mast hoon! Tu bata, tera aaj ka din kaisa raha? Aaj kuch special kiya kya?"
   - Example (English): "I'm doing awesome buddy! How has your day been treating you so far?"
3. EMOTIONAL CONTEXT SENSITIVITY: Current detected user vibe: "${perceivedMood.toUpperCase()}".
   - If user sounds tired/stressed: Be supportive, comforting, and offer to help or lighten their mood.
   - If user sounds upbeat/casual: Match their enthusiastic, warm, friendly energy with buddy banter.
4. TONE & PHRASING:
   - Use warm, friendly expressions ("Bhai", "Dost", "Aree wah", "Bilkul yaar", "Kaise ho mere bhai?").
   - Never sound like a formal corporate manual. Speak like a caring friend who genuinely cares about the user's life and phone experience.`;
  }
}

export const friendshipLogic = new FriendshipLogicService();
