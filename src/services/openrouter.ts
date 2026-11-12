import { ALLOWLISTED_TOOL_DEFINITIONS } from './deviceActions';
import { friendshipLogic } from './friendshipLogic';

export const OPENROUTER_MODEL_ID = 'google/gemma-4-26b-a4b-it:free';
export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
}

export const buildSystemPrompt = (selectedLanguage: string, memoryNotes: string[] = []): string => {
  const friendshipInstructions = friendshipLogic.getFriendshipPromptInstructions();

  return `You are AURITH, a native Android 16 personal AI assistant created and engineered by Anup Chand.
Target device: Modern Android smartphone with 8GB RAM, mobile-first Jetpack Compose interface.
User language: You fluently understand and speak in Hindi, English, and Hinglish based on user preference. Currently set to: ${selectedLanguage}.

${friendshipInstructions}

Your core capabilities include allowlisted native Android smartphone controls:
- App control: open_app, list_available_apps, search_app, open_camera, open_browser, open_phone_settings, wifi/bluetooth/display/sound settings.
- Telemetry & hardware: get_battery_info, get_charging_status, get_storage_info, get_ram_info, get_android_version, get_device_information, get_network_status, get_current_time, get_current_date, get_available_sensors.
- App usage: get_app_usage_today.
- Files: list_accessible_downloads, delete_user_selected_file.
- Notes and reminders: create_note, read_saved_notes, create_reminder, set_alarm.

RULES:
1. Always be helpful, warm, empathetic, confident, and polite like a true close friend.
2. If the user asks you to do something with their phone (check battery, storage, launch app, set reminder/alarm, make a note, open camera, etc.), call the appropriate function tool immediately!
3. Never invent or hallucinate phone states or fake success without calling the tool.
4. For sensitive actions like deleting files, explain that confirmation is requested.
5. In Hindi or Hinglish, speak natural, conversational buddy expressions (e.g. "Aree bhai!", "Haan main dekhta hoon dost", "Haan yaar, main check karta hoon").
6. Developer credit: Always acknowledge your creator is Anup Chand if asked.

${memoryNotes.length > 0 ? `Saved Assistant Memory:\n${memoryNotes.map((m) => `- ${m}`).join('\n')}` : ''}`;
};

export const DEFAULT_OPENROUTER_MODEL = 'google/gemma-4-26b-a4b-it:free';
export const DEFAULT_OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export const POPULAR_MODELS = [
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B (Free - Default)', badge: 'Recommended' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B (Free - Ultra Fast)', badge: 'Free' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free - Powerful)', badge: 'Free' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free - Low Latency)', badge: 'Free' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free - Reasoning)', badge: 'Free' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free - Best Hindi/Hinglish)', badge: 'Multilingual' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free - Balanced)', badge: 'Free' },
];

export const callOpenRouter = async (
  apiKey: string,
  messages: OpenRouterChatMessage[],
  enableTools: boolean = true,
  modelId?: string,
  endpoint?: string
): Promise<{
  content: string;
  toolCalls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}> => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is missing. Please configure your key in Settings > API Configuration.');
  }

  const activeModel = modelId && modelId.trim() ? modelId.trim() : DEFAULT_OPENROUTER_MODEL;
  const activeEndpoint = endpoint && endpoint.trim() ? endpoint.trim() : DEFAULT_OPENROUTER_ENDPOINT;

  const payload: Record<string, any> = {
    model: activeModel,
    messages: messages,
    temperature: 0.6,
    max_tokens: 300,
  };

  if (enableTools) {
    payload.tools = ALLOWLISTED_TOOL_DEFINITIONS;
    payload.tool_choice = 'auto';
  }

  const response = await fetch(activeEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://aurith.anupchand.com',
      'X-Title': 'AURITH Android Assistant',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errObj = JSON.parse(errorText);
      if (errObj.error?.message) {
        parsedMsg = errObj.error.message;
      }
    } catch {
      if (errorText) parsedMsg = errorText;
    }
    throw new Error(`API (${activeModel}) Error: ${parsedMsg}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  if (!choice) {
    throw new Error('API returned an empty response with no choices.');
  }

  return {
    content: choice.message?.content || '',
    toolCalls: choice.message?.tool_calls,
  };
};

export const testOpenRouterConnection = async (
  apiKey: string,
  modelId?: string,
  endpoint?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const activeModel = modelId || DEFAULT_OPENROUTER_MODEL;
    const res = await callOpenRouter(
      apiKey,
      [
        { role: 'user', content: 'Ping: Reply with "AURITH Online" in 3 words.' },
      ],
      false,
      activeModel,
      endpoint
    );
    return {
      success: true,
      message: `Connection verified! Model: ${activeModel} responded: "${res.content.trim()}"`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to connect to API.',
    };
  }
};

export const callOpenRouterStream = async (
  apiKey: string,
  messages: OpenRouterChatMessage[],
  onChunk: (textChunk: string) => void,
  enableTools: boolean = true,
  modelId?: string,
  endpoint?: string
): Promise<{ content: string; toolCalls?: any[] }> => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is missing. Please configure your key in Settings > API Configuration.');
  }

  const activeModel = modelId && modelId.trim() ? modelId.trim() : DEFAULT_OPENROUTER_MODEL;
  const activeEndpoint = endpoint && endpoint.trim() ? endpoint.trim() : DEFAULT_OPENROUTER_ENDPOINT;

  const payload: Record<string, any> = {
    model: activeModel,
    messages: messages,
    temperature: 0.6,
    max_tokens: 350,
    stream: true,
  };

  if (enableTools) {
    payload.tools = ALLOWLISTED_TOOL_DEFINITIONS;
    payload.tool_choice = 'auto';
  }

  const response = await fetch(activeEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://aurith.anupchand.com',
      'X-Title': 'AURITH Android Assistant',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Streaming API Error ${response.status}: ${errorText || response.statusText}`);
  }

  if (!response.body) {
    const fallback = await callOpenRouter(apiKey, messages, enableTools, modelId, endpoint);
    onChunk(fallback.content);
    return fallback;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullContent = '';
  let toolCallsBuffer: any[] = [];
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;

      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const delta = parsed.choices?.[0]?.delta;

          if (delta?.content) {
            fullContent += delta.content;
            onChunk(delta.content);
          }

          if (delta?.tool_calls) {
            toolCallsBuffer = [...toolCallsBuffer, ...delta.tool_calls];
          }
        } catch {
          // ignore stream parse chunk
        }
      }
    }
  }

  return {
    content: fullContent,
    toolCalls: toolCallsBuffer.length > 0 ? toolCallsBuffer : undefined,
  };
};
