import React, { useState, useRef, useEffect } from 'react';
import { ScreenId, ChatMessage, Conversation, ApiSettings } from '../types';
import {
  Send,
  Mic,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Plus,
  ArrowLeft,
  Wrench,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { callOpenRouter, callOpenRouterStream, buildSystemPrompt } from '../services/openrouter';
import { executeDeviceAction } from '../services/deviceActions';
import { ttsService } from '../services/ttsService';
import { getStoredMemories } from '../services/storage';
import { detectVoiceAppLaunch } from '../services/appLauncher';

interface ChatScreenProps {
  conversation: Conversation;
  onUpdateConversation: (conv: Conversation) => void;
  onNewChat: () => void;
  onNavigate: (screen: ScreenId) => void;
  settings: ApiSettings;
  onRequestConfirmAction?: (details: any) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversation,
  onUpdateConversation,
  onNewChat,
  onNavigate,
  settings,
  onRequestConfirmAction,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, loading]);

  useEffect(() => {
    const handleAudioChange = (playing: boolean) => {
      if (!playing) setPlayingMessageId(null);
    };
    ttsService.addListener(handleAudioChange);
    return () => {
      ttsService.removeListener(handleAudioChange);
      ttsService.stop();
    };
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = async (msgId: string, text: string) => {
    if (playingMessageId === msgId) {
      ttsService.stop();
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(msgId);
    const result = await ttsService.speakText(text, {
      language: settings.selectedLanguage,
      engine: settings.ttsEngine,
      apiKey: settings.fishAudioApiKey,
      modelId: settings.ttsModelId,
      endpoint: settings.ttsEndpoint,
      rate: settings.speechRate,
    });
    if (!result.success) {
      setPlayingMessageId(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setInputText('');
    setErrorMsg(null);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...conversation.messages, userMessage];
    onUpdateConversation({
      ...conversation,
      messages: updatedMessages,
    });

    setLoading(true);

    // 1. Direct Voice / Text App Launch Interceptor
    const appMatch = detectVoiceAppLaunch(text);
    if (appMatch) {
      const isHindi = settings.selectedLanguage === 'hi-IN' || settings.selectedLanguage === 'hinglish';
      const reply = isHindi ? appMatch.feedbackHi : appMatch.feedbackEn;
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'aurith',
        text: reply,
        timestamp: Date.now(),
        toolCall: {
          name: 'open_app',
          args: { app_name: appMatch.appName, package_name: appMatch.app?.packageName },
          result: { success: true, message: `Launched ${appMatch.appName}` },
          status: 'success',
        },
      };

      onUpdateConversation({
        ...conversation,
        messages: [...updatedMessages, assistantMessage],
      });
      setLoading(false);

      if (appMatch.app?.webUrl) {
        try {
          window.open(appMatch.app.webUrl, '_blank');
        } catch {
          // ignore
        }
      }

      if (settings.autoSpeakReplies) {
        handleSpeak(assistantMessage.id, assistantMessage.text);
      }
      return;
    }

    try {
      if (!settings.openRouterApiKey) {
        throw new Error('API key is not configured. Go to Settings > API & Model Configuration to add your key.');
      }

      const memories = settings.memoryEnabled ? getStoredMemories().filter((m) => m.isEnabled).map((m) => m.content) : [];
      const systemPrompt = buildSystemPrompt(settings.selectedLanguage, memories);

      // Build message payload for API
      const payloadMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...updatedMessages.slice(-10).map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        })),
      ];

      const response = await callOpenRouter(
        settings.openRouterApiKey,
        payloadMessages,
        true,
        settings.openRouterModelId,
        settings.openRouterEndpoint
      );

      // Check if model requested tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolCall = response.toolCalls[0];
        const toolName = toolCall.function.name;
        let toolArgs = {};
        try {
          toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch {
          // ignore
        }

        // Execute allowlisted action safely
        const actionResult = await executeDeviceAction(toolName, toolArgs, (screen) => {
          onNavigate(screen as ScreenId);
        });

        if (actionResult.requiresConfirmation && onRequestConfirmAction) {
          onRequestConfirmAction(actionResult.confirmationDetails);
        }

        // Follow up with model passing tool output
        const followupMessages = [
          ...payloadMessages,
          {
            role: 'assistant' as const,
            content: response.content || `Calling action ${toolName}...`,
          },
          {
            role: 'tool' as const,
            name: toolName,
            content: JSON.stringify(actionResult),
            tool_call_id: toolCall.id,
          },
        ];

        const secondResponse = await callOpenRouter(
          settings.openRouterApiKey,
          followupMessages,
          false,
          settings.openRouterModelId,
          settings.openRouterEndpoint
        );

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'aurith',
          text: secondResponse.content || actionResult.message,
          timestamp: Date.now(),
          toolCall: {
            name: toolName,
            args: toolArgs,
            result: actionResult,
            status: actionResult.success ? 'success' : 'failed',
          },
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        onUpdateConversation({
          ...conversation,
          messages: finalMessages,
        });

        if (settings.autoSpeakReplies) {
          handleSpeak(assistantMessage.id, assistantMessage.text);
        }
      } else {
        // Standard chat response
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'aurith',
          text: response.content,
          timestamp: Date.now(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        onUpdateConversation({
          ...conversation,
          messages: finalMessages,
        });

        if (settings.autoSpeakReplies) {
          handleSpeak(assistantMessage.id, assistantMessage.text);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while contacting AI model.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...conversation.messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#040812] overflow-hidden">
      {/* Top App Bar */}
      <div className="p-3.5 bg-[#081224] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              AURITH Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono">
              Gemma 4 26B (OpenRouter) • Fish Audio TTS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0F203D] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 transition"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[88%]">
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-md shadow-cyan-950/40'
                      : 'bg-[#0B172E] border border-cyan-500/30 text-slate-200 rounded-tl-xs shadow-inner'
                  }`}
                >
                  {/* Tool Call Tag if present */}
                  {msg.toolCall && (
                    <div className="mb-2 p-2 rounded-lg bg-[#050C18] border border-cyan-500/40 flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-mono text-cyan-300 font-bold truncate">
                          Action: {msg.toolCall.name}
                        </div>
                        {msg.toolCall.result?.message && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {msg.toolCall.result.message}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Actions Bar for AURITH responses */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-slate-400">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded hover:text-cyan-400 hover:bg-slate-800/60 transition"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`p-1 rounded hover:bg-slate-800/60 transition ${
                          playingMessageId === msg.id ? 'text-cyan-400 animate-pulse' : 'hover:text-cyan-400'
                        }`}
                        title="Read aloud with Fish Audio"
                      >
                        {playingMessageId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-[#0B172E] border border-cyan-500/30 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <span>AURITH is thinking via Gemma 4 26B...</span>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center justify-between">
            <div className="flex-1 pr-2">{errorMsg}</div>
            <button
              onClick={handleRetry}
              className="px-2 py-1 rounded bg-red-900/60 hover:bg-red-800 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-slate-900">
        {[
          'Check battery status',
          'Phone storage info',
          'Open Camera app',
          'Create a note: Meeting tomorrow',
          'Set alarm for 7:00 AM',
          'Battery kitna percent hai?',
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-[#0B172E] hover:bg-[#122345] border border-cyan-500/20 text-cyan-300 text-[11px] whitespace-nowrap transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#081224] border-t border-slate-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Type in Hindi, English or Hinglish..."
          className="flex-1 bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-full px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
        />

        <button
          onClick={() => onNavigate('voice')}
          className="p-2.5 rounded-full bg-[#0E1E3A] hover:bg-[#152a50] text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
          title="Switch to Live Voice Assistant"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || loading}
          className="p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
