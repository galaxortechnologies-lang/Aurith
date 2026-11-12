import React, { useState, useEffect, useRef } from 'react';
import { ScreenId, ApiSettings, SupportedLanguage } from '../types';
import { AiOrb } from '../components/AiOrb';
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  ArrowLeft,
  Volume2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import { callOpenRouter, callOpenRouterStream, buildSystemPrompt } from '../services/openrouter';
import { executeDeviceAction } from '../services/deviceActions';
import { getStoredMemories } from '../services/storage';
import { detectVoiceAppLaunch } from '../services/appLauncher';

interface VoiceScreenProps {
  onNavigate: (screen: ScreenId) => void;
  settings: ApiSettings;
  onUpdateLanguage: (lang: SupportedLanguage) => void;
  onRequestConfirmAction?: (details: any) => void;
}

export const VoiceScreen: React.FC<VoiceScreenProps> = ({
  onNavigate,
  settings,
  onUpdateLanguage,
  onRequestConfirmAction,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Tap the microphone to speak');
  const [audioPaused, setAudioPaused] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleAudioState = (playing: boolean) => {
      setIsSpeaking(playing);
    };
    ttsService.addListener(handleAudioState);
    return () => {
      ttsService.removeListener(handleAudioState);
      ttsService.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    ttsService.stop();
    setAudioPaused(false);
    setTranscribedText('');
    setAiResponseText('');

    // Play configured mic start sound (silent / disabled by default)
    ttsService.playMicStartSound(settings.micSoundMode);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage('Web Speech Recognition is not supported by your browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;

      // Map language
      recognition.lang =
        settings.selectedLanguage === 'hi-IN'
          ? 'hi-IN'
          : settings.selectedLanguage === 'en-IN'
          ? 'en-IN'
          : 'hi-IN'; // Hinglish defaults to hi-IN recognition

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage(
          `Listening in ${
            settings.selectedLanguage === 'hi-IN'
              ? 'Hindi'
              : settings.selectedLanguage === 'en-IN'
              ? 'English'
              : 'Hinglish'
          }...`
        );
      };

      recognition.onresult = (event: any) => {
        // BARGE-IN INTERRUPT: Stop AI speech instantly as soon as user starts speaking!
        if (ttsService.getIsPlaying() || isSpeaking) {
          ttsService.stop();
          setIsSpeaking(false);
        }

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript;
            setTranscribedText(finalTranscript);
            handleProcessVoiceInput(finalTranscript);
          } else {
            interim += event.results[i][0].transcript;
            setTranscribedText(interim);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setStatusMessage(`Speech recognition: ${event.error || 'Stopped'}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setStatusMessage(`Error starting speech recognition: ${err.message}`);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setStatusMessage('Tap microphone to speak');
  };

  const speakReply = async (text: string) => {
    try {
      const res = await ttsService.speakText(text, {
        language: settings.selectedLanguage,
        engine: settings.ttsEngine,
        apiKey: settings.fishAudioApiKey,
        modelId: settings.ttsModelId,
        endpoint: settings.ttsEndpoint,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        gender: settings.voiceGender || 'male',
      });
      setStatusMessage(`Speaking (${res.engineUsed})...`);
    } catch (err: any) {
      console.warn('Speak error:', err);
    }
  };

  const handleProcessVoiceInput = async (spokenText: string) => {
    if (!spokenText || !spokenText.trim()) return;

    setIsListening(false);

    // 1. Instant Voice App Launch Interceptor (Hindi, English, Hinglish)
    const appMatch = detectVoiceAppLaunch(spokenText);
    if (appMatch) {
      const isHindi = settings.selectedLanguage === 'hi-IN' || settings.selectedLanguage === 'hinglish';
      const reply = isHindi ? appMatch.feedbackHi : appMatch.feedbackEn;
      setAiResponseText(reply);
      setIsProcessing(false);
      setStatusMessage(`🚀 Launching ${appMatch.appName}...`);

      // Trigger web/intent launch if available
      if (appMatch.app?.webUrl) {
        try {
          window.open(appMatch.app.webUrl, '_blank');
        } catch {
          // ignore popup blocks
        }
      }

      // Smooth transition to Apps Launcher view
      setTimeout(() => {
        onNavigate('apps');
      }, 1200);

      // Speak response using lifetime free voice engine
      await speakReply(reply);
      return;
    }

    setIsProcessing(true);
    const activeModelName = settings.openRouterModelId
      ? settings.openRouterModelId.split('/').pop()?.split(':')[0] || 'AI'
      : 'Gemma 4 26B';
    setStatusMessage(`Thinking with ${activeModelName}...`);

    try {
      if (!settings.openRouterApiKey) {
        // If API key is not configured, give a friendly voice response
        const fallbackMsg =
          settings.selectedLanguage === 'hi-IN'
            ? 'नमस्ते! कृपया सेटिंग्स में जाकर ओपन-राउटर एपीआई की कॉन्फ़िगर करें।'
            : 'Please configure your OpenRouter API key in Settings to unlock the full AI brain.';
        setAiResponseText(fallbackMsg);
        setIsProcessing(false);
        await speakReply(fallbackMsg);
        return;
      }

      const memories = settings.memoryEnabled
        ? getStoredMemories().filter((m) => m.isEnabled).map((m) => m.content)
        : [];
      const systemPrompt = buildSystemPrompt(settings.selectedLanguage, memories);

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: spokenText },
      ];

      let streamAccumulator = '';
      const response = await callOpenRouterStream(
        settings.openRouterApiKey,
        messages,
        (chunk) => {
          streamAccumulator += chunk;
          setAiResponseText(streamAccumulator);
        },
        true,
        settings.openRouterModelId,
        settings.openRouterEndpoint
      );

      let replyToSpeak = response.content || streamAccumulator;

      // Handle tool calling in voice mode
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolCall = response.toolCalls[0];
        const toolName = toolCall.function.name;
        let toolArgs = {};
        try {
          toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch {
          // ignore
        }

        const actionResult = await executeDeviceAction(toolName, toolArgs, (screen) => {
          onNavigate(screen as ScreenId);
        });

        if (actionResult.requiresConfirmation && onRequestConfirmAction) {
          onRequestConfirmAction(actionResult.confirmationDetails);
        }

        const followup = await callOpenRouter(
          settings.openRouterApiKey,
          [
            ...messages,
            { role: 'assistant' as const, content: response.content || `Running ${toolName}` },
            { role: 'tool' as const, name: toolName, content: JSON.stringify(actionResult) },
          ],
          false,
          settings.openRouterModelId,
          settings.openRouterEndpoint
        );

        replyToSpeak = followup.content || actionResult.message;
      }

      setAiResponseText(replyToSpeak);
      setIsProcessing(false);

      // Synthesize audio using lifetime free voice engine
      await speakReply(replyToSpeak);
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleStopSpeaking = () => {
    ttsService.stop();
    setIsSpeaking(false);
    setAudioPaused(false);
    setStatusMessage('Speech stopped. Tap microphone to speak again.');
  };

  const handleTogglePause = () => {
    if (audioPaused) {
      ttsService.resume();
      setAudioPaused(false);
    } else {
      ttsService.pause();
      setAudioPaused(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-5 bg-[#F8FAFC] overflow-hidden select-none">
      {/* Top Bar with Language Selector */}
      <div className="w-full flex items-center justify-between shrink-0">
        <button
          onClick={() => {
            ttsService.stop();
            onNavigate('home');
          }}
          className="p-2 text-slate-600 hover:text-cyan-700 rounded-lg hover:bg-slate-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['hinglish', 'hi-IN', 'en-IN'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onUpdateLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition ${
                settings.selectedLanguage === lang
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-sm shadow-cyan-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hinglish' ? 'Hinglish' : lang === 'hi-IN' ? 'हिन्दी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Center AI Orb & State */}
      <div className="flex flex-col items-center justify-center my-auto space-y-5">
        <AiOrb
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          size={180}
        />

        {/* Dynamic Status message */}
        <div className="text-center space-y-1.5 max-w-[280px]">
          <div className="text-xs font-bold font-mono tracking-wider text-cyan-800 flex items-center justify-center gap-1.5">
            {isListening && <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping mr-1" />}
            {isSpeaking && <Volume2 className="w-3.5 h-3.5 text-cyan-700 animate-pulse" />}
            {isProcessing && <Sparkles className="w-3.5 h-3.5 text-blue-700 animate-spin" />}
            {isListening
              ? 'LISTENING'
              : isProcessing
              ? 'THINKING'
              : isSpeaking
              ? 'AURITH SPEAKING'
              : 'READY'}
          </div>
          <p className="text-xs text-slate-600 font-sans font-medium leading-relaxed">
            {statusMessage}
          </p>
        </div>

        {/* Live Speech Transcript Preview */}
        {transcribedText && (
          <div className="p-3.5 rounded-2xl liquid-glass max-w-[310px] text-center shadow-md border border-cyan-400/30">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-800 block mb-0.5 font-bold">
              You Said
            </span>
            <p className="text-xs text-slate-900 italic line-clamp-3 font-medium">
              "{transcribedText}"
            </p>
          </div>
        )}

        {/* AI Response Preview */}
        {aiResponseText && !isListening && (
          <div className="p-3.5 rounded-2xl holographic-card max-w-[310px] text-center shadow-lg border border-cyan-400/40">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-800 block mb-0.5 font-bold">
              AURITH Response
            </span>
            <p className="text-xs text-slate-900 line-clamp-3 leading-relaxed font-medium">
              {aiResponseText}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Voice Controls */}
      <div className="w-full flex flex-col items-center shrink-0 space-y-4">
        <div className="flex items-center justify-center gap-5">
          {/* Stop Audio Button */}
          <button
            onClick={handleStopSpeaking}
            disabled={!isSpeaking && !audioPaused}
            className="p-3.5 rounded-full bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-400 transition shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            title="Stop Speech"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>

          {/* Central Mic Button */}
          <button
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            className={`p-5 rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200 scale-105 animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-200 hover:scale-105'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          {/* Pause / Resume Button */}
          <button
            onClick={handleTogglePause}
            disabled={!isSpeaking && !audioPaused}
            className="p-3.5 rounded-full bg-white hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-400 transition shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            title={audioPaused ? 'Resume Speech' : 'Pause Speech'}
          >
            {audioPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 truncate max-w-full font-medium">
          <span className="truncate">Model: {settings.openRouterModelId ? settings.openRouterModelId.split('/').pop()?.split(':')[0] : 'Gemma 4 26B'}</span>
          <span>•</span>
          <span>Voice: Male Neural (₹0)</span>
          <span>•</span>
          <span>Mic Sound: Silent</span>
        </div>
      </div>
    </div>
  );
};
