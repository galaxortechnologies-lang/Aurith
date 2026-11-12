import React, { useState } from 'react';
import { ScreenId, ApiSettings, TtsEngine, MicSoundMode, VoiceGender } from '../types';
import {
  ArrowLeft,
  Key,
  CheckCircle,
  AlertCircle,
  Lock,
  RefreshCw,
  Trash2,
  ExternalLink,
  Volume2,
  VolumeX,
  Mic,
  Cpu,
  Radio,
  Play,
  Square,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { saveSettings, maskApiKey } from '../services/storage';
import {
  testOpenRouterConnection,
  POPULAR_MODELS,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_OPENROUTER_ENDPOINT,
} from '../services/openrouter';
import { ttsService } from '../services/ttsService';

interface ApiConfigScreenProps {
  onNavigate: (screen: ScreenId) => void;
  settings: ApiSettings;
  onUpdateSettings: (s: ApiSettings) => void;
}

export const ApiConfigScreen: React.FC<ApiConfigScreenProps> = ({
  onNavigate,
  settings,
  onUpdateSettings,
}) => {
  // AI Brain state
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState(settings.openRouterApiKey || '');
  const [selectedModel, setSelectedModel] = useState(settings.openRouterModelId || DEFAULT_OPENROUTER_MODEL);
  const [customModelInput, setCustomModelInput] = useState(
    POPULAR_MODELS.some((m) => m.id === (settings.openRouterModelId || DEFAULT_OPENROUTER_MODEL))
      ? ''
      : settings.openRouterModelId || ''
  );
  const [endpointInput, setEndpointInput] = useState(settings.openRouterEndpoint || DEFAULT_OPENROUTER_ENDPOINT);

  // Voice Engine (TTS) state
  const [ttsEngine, setTtsEngine] = useState<TtsEngine>(settings.ttsEngine || 'lifetime_free_device');
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(settings.voiceGender || 'male');
  const [fishAudioKeyInput, setFishAudioKeyInput] = useState(settings.fishAudioApiKey || '');
  const [ttsModelInput, setTtsModelInput] = useState(settings.ttsModelId || 's2.1-pro-free');
  const [ttsEndpointInput, setTtsEndpointInput] = useState(settings.ttsEndpoint || 'https://api.fish.audio/v1/tts');
  const [speechRate, setSpeechRate] = useState<number>(settings.speechRate || 1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(settings.speechPitch || 0.92);

  // Mic Sound state
  const [micSoundMode, setMicSoundMode] = useState<MicSoundMode>(settings.micSoundMode || 'disabled');

  // Test & UI states
  const [testingAi, setTestingAi] = useState(false);
  const [aiResult, setAiResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testingTts, setTestingTts] = useState(false);
  const [ttsResult, setTtsResult] = useState<{ success: boolean; message: string } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const isCustomModel = selectedModel === 'custom';
  const effectiveModelId = isCustomModel
    ? (customModelInput.trim() || DEFAULT_OPENROUTER_MODEL)
    : selectedModel;

  const handleSave = () => {
    const updated: ApiSettings = {
      ...settings,
      openRouterApiKey: openRouterKeyInput.trim(),
      openRouterModelId: effectiveModelId,
      openRouterEndpoint: endpointInput.trim() || DEFAULT_OPENROUTER_ENDPOINT,
      ttsEngine: ttsEngine,
      ttsModelId: ttsModelInput.trim() || 's2.1-pro-free',
      ttsEndpoint: ttsEndpointInput.trim() || 'https://api.fish.audio/v1/tts',
      fishAudioApiKey: fishAudioKeyInput.trim(),
      micSoundMode: micSoundMode,
      speechRate: speechRate,
      speechPitch: speechPitch,
      voiceGender: voiceGender,
      autoSpeakReplies: true, // Auto speech enabled so user always hears responses
    };
    onUpdateSettings(updated);
    saveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearKeys = () => {
    if (confirm('Clear custom API keys and restore default lifetime free configuration?')) {
      const updated: ApiSettings = {
        ...settings,
        openRouterApiKey: '',
        openRouterModelId: DEFAULT_OPENROUTER_MODEL,
        openRouterEndpoint: DEFAULT_OPENROUTER_ENDPOINT,
        ttsEngine: 'lifetime_free_device',
        fishAudioApiKey: '',
        micSoundMode: 'disabled',
        speechRate: 1.0,
      };
      setOpenRouterKeyInput('');
      setSelectedModel(DEFAULT_OPENROUTER_MODEL);
      setCustomModelInput('');
      setEndpointInput(DEFAULT_OPENROUTER_ENDPOINT);
      setTtsEngine('lifetime_free_device');
      setFishAudioKeyInput('');
      setMicSoundMode('disabled');
      setSpeechRate(1.0);
      onUpdateSettings(updated);
      saveSettings(updated);
      setAiResult(null);
      setTtsResult(null);
    }
  };

  const handleTestAiConnection = async () => {
    const key = openRouterKeyInput.trim() || settings.openRouterApiKey;
    if (!key) {
      setAiResult({
        success: false,
        message: 'Please enter an API Key to test connection. You can get a free key from OpenRouter.',
      });
      return;
    }
    setTestingAi(true);
    setAiResult(null);
    const res = await testOpenRouterConnection(key, effectiveModelId, endpointInput.trim());
    setAiResult(res);
    setTestingAi(false);
  };

  const handleTestVoice = async () => {
    setTestingTts(true);
    setTtsResult(null);

    const testText =
      settings.selectedLanguage === 'hi-IN'
        ? 'नमस्ते! मैं ऑरिथ हूँ। आपका वॉइस इंजन सक्रिय और तैयार है।'
        : settings.selectedLanguage === 'en-IN'
        ? 'Hello! I am AURITH. Your voice engine is active and ready to assist you.'
        : 'Namaste! Main AURITH hoon. Aapka voice engine active aur bolne ke liye bilkul taiyar hai!';

    const res = await ttsService.speakText(testText, {
      language: settings.selectedLanguage,
      engine: ttsEngine,
      apiKey: fishAudioKeyInput.trim() || settings.fishAudioApiKey,
      modelId: ttsModelInput.trim(),
      endpoint: ttsEndpointInput.trim(),
      rate: speechRate,
      pitch: speechPitch,
      gender: voiceGender,
    });

    setTtsResult({
      success: res.success,
      message: `${res.message} (Engine: ${res.engineUsed})`,
    });
    setTestingTts(false);
  };

  const handleTestMicSound = (mode: MicSoundMode) => {
    if (mode === 'disabled') {
      alert('Sound is disabled (Silent). No tone will play when microphone starts.');
      return;
    }
    ttsService.playMicStartSound(mode);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-1.5 text-slate-600 hover:text-cyan-700 rounded-lg hover:bg-slate-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">API & Model Configuration</h2>
          <p className="text-[11px] text-slate-500 font-medium">Customizable AI Models, Real-Time Streaming & Male Voice Controls</p>
        </div>
      </div>

      {/* Security Vault Banner */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-800 font-bold">
            <Lock className="w-4 h-4" />
            <span>Android Keystore Encrypted Vault</span>
          </div>
          <span className="text-[10px] text-emerald-800 font-mono px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-bold">
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Configure any OpenRouter model, real-time streaming, lifetime free voice engines, and microphone sound controls.
        </p>
      </div>

      {/* 1. AI BRAIN & MODEL SELECTION */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> AI BRAIN & MODEL
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
              Active: {effectiveModelId}
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 font-bold">
            Configurable
          </span>
        </div>

        {/* Model Dropdown */}
        <div>
          <label className="text-[11px] text-slate-300 font-medium block mb-1.5">
            Select AI Model:
          </label>
          <select
            value={POPULAR_MODELS.some((m) => m.id === selectedModel) ? selectedModel : 'custom'}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none"
          >
            {POPULAR_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} [{m.badge}]
              </option>
            ))}
            <option value="custom">Custom Model ID (Enter manually)...</option>
          </select>
        </div>

        {/* Custom Model ID Input */}
        {(selectedModel === 'custom' || !POPULAR_MODELS.some((m) => m.id === selectedModel)) && (
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">
              Custom Model ID:
            </label>
            <input
              type="text"
              value={customModelInput}
              onChange={(e) => setCustomModelInput(e.target.value)}
              placeholder="e.g. google/gemma-4-26b-a4b-it:free or meta-llama/llama-3-8b"
              className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none"
            />
          </div>
        )}

        {/* API Endpoint Input */}
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">
            API Endpoint URL:
          </label>
          <input
            type="text"
            value={endpointInput}
            onChange={(e) => setEndpointInput(e.target.value)}
            placeholder="https://openrouter.ai/api/v1/chat/completions"
            className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Standard OpenAI-compatible chat completions endpoint (OpenRouter, Groq, Ollama, etc.)
          </p>
        </div>

        {/* API Key Input */}
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">
            API Key (sk-or-...):
          </label>
          <input
            type="password"
            value={openRouterKeyInput}
            onChange={(e) => setOpenRouterKeyInput(e.target.value)}
            placeholder="Enter API Key"
            className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none"
          />
          {settings.openRouterApiKey && (
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Currently saved: {maskApiKey(settings.openRouterApiKey)}
            </div>
          )}
        </div>

        {/* Links and Test */}
        <div className="flex items-center justify-between pt-1">
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Get Free Key <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={handleTestAiConnection}
            disabled={testingAi}
            className="px-3 py-1.5 rounded-lg bg-[#0F203D] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${testingAi ? 'animate-spin' : ''}`} />
            {testingAi ? 'Testing...' : 'Test AI Model'}
          </button>
        </div>

        {aiResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              aiResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}
          >
            {aiResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{aiResult.message}</span>
          </div>
        )}
      </div>

      {/* 2. VOICE ENGINE (TTS) - LIFETIME FREE GUARANTEED */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> VOICE ENGINE (TTS)
            </div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Lifetime Free Voice Supported (₹0)
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 font-bold">
            Always Speaks
          </span>
        </div>

        {/* Engine Selection */}
        <div>
          <label className="text-[11px] text-slate-300 font-medium block mb-1.5">
            Choose Voice Engine:
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                ttsEngine === 'lifetime_free_device'
                  ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                  : 'bg-[#040812] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="ttsEngine"
                checked={ttsEngine === 'lifetime_free_device'}
                onChange={() => setTtsEngine('lifetime_free_device')}
                className="mt-0.5 text-cyan-400"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  Lifetime Free: Device Neural Engine
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">
                    RECOMMENDED (₹0)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                  100% Free forever. No API key or signup required. Speaks natural Hindi, English, and Hinglish with zero latency.
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                ttsEngine === 'lifetime_free_google'
                  ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                  : 'bg-[#040812] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="ttsEngine"
                checked={ttsEngine === 'lifetime_free_google'}
                onChange={() => setTtsEngine('lifetime_free_google')}
                className="mt-0.5 text-cyan-400"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  Lifetime Free: Google Free Stream API
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono font-bold">
                    FREE MP3 (₹0)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                  Direct cloud speech stream. No API key required. High fidelity Indian accents.
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                ttsEngine === 'fish_audio'
                  ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                  : 'bg-[#040812] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="ttsEngine"
                checked={ttsEngine === 'fish_audio'}
                onChange={() => setTtsEngine('fish_audio')}
                className="mt-0.5 text-cyan-400"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  Fish Audio Cloud TTS
                  <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    Key Required
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                  High-fidelity custom model (`s2.1-pro-free`). Auto-falls back to Lifetime Free if quota expires.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Fish Audio Settings (Shown if Fish Audio selected) */}
        {ttsEngine === 'fish_audio' && (
          <div className="p-3 rounded-xl bg-[#040812] border border-slate-800 space-y-2.5">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Fish Audio Bearer API Key:
              </label>
              <input
                type="password"
                value={fishAudioKeyInput}
                onChange={(e) => setFishAudioKeyInput(e.target.value)}
                placeholder="Enter Fish Audio API Key"
                className="w-full bg-[#081224] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                TTS Model ID:
              </label>
              <input
                type="text"
                value={ttsModelInput}
                onChange={(e) => setTtsModelInput(e.target.value)}
                placeholder="s2.1-pro-free"
                className="w-full bg-[#081224] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Voice Gender Selection */}
        <div>
          <label className="text-[11px] text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
            <span>Voice Tone & Gender:</span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">
              {voiceGender} Voice Active
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setVoiceGender('male');
                setSpeechPitch(0.92);
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                voiceGender === 'male'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-950'
                  : 'bg-[#040812] text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>👨🏻 Male Voice</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceGender('female');
                setSpeechPitch(1.08);
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                voiceGender === 'female'
                  ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-slate-950 border-fuchsia-400 shadow-md shadow-fuchsia-950'
                  : 'bg-[#040812] text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>👩🏻 Female Voice</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceGender('auto');
                setSpeechPitch(1.0);
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                voiceGender === 'auto'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                  : 'bg-[#040812] text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>⚙️ Auto Voice</span>
            </button>
          </div>
        </div>

        {/* Speech Rate & Pitch Sliders */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" /> Speech Speed / Pace:
            </label>
            <span className="text-[11px] font-mono text-cyan-300">{speechRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.3"
            step="0.05"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Test Speech Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Verify AI voice output immediately:
          </span>

          <button
            onClick={handleTestVoice}
            disabled={testingTts}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Play className={`w-3 h-3 fill-current ${testingTts ? 'animate-pulse' : ''}`} />
            {testingTts ? 'Speaking...' : 'Test Voice / Play Sample'}
          </button>
        </div>

        {ttsResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              ttsResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}
          >
            {ttsResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{ttsResult.message}</span>
          </div>
        )}
      </div>

      {/* 3. MICROPHONE START SOUND SETTINGS */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" /> MICROPHONE START SOUND
            </div>
            <div className="text-[10px] text-slate-400">
              Eliminate Google Assistant start chime or mute mic sound
            </div>
          </div>
          <span className="text-[10px] text-slate-300 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {micSoundMode === 'disabled' ? 'Muted / Silent' : micSoundMode}
          </span>
        </div>

        {/* Mic Sound Mode Options */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <label
            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
              micSoundMode === 'disabled'
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                : 'bg-[#040812] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="micSoundMode"
                checked={micSoundMode === 'disabled'}
                onChange={() => setMicSoundMode('disabled')}
                className="text-emerald-400"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                  Disabled (Silent - Recommended)
                </div>
                <div className="text-[10px] text-slate-400">
                  Completely silent. No Google beep or start sound when tapping mic.
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
              Quiet
            </span>
          </label>

          <label
            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
              micSoundMode === 'subtle'
                ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                : 'bg-[#040812] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="micSoundMode"
                checked={micSoundMode === 'subtle'}
                onChange={() => setMicSoundMode('subtle')}
                className="text-cyan-400"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Subtle Futuristic Aurith Chime
                </div>
                <div className="text-[10px] text-slate-400">
                  Soft, non-intrusive 40ms harmonic frequency cue (not Google sound).
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleTestMicSound('subtle');
              }}
              className="text-[10px] bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 font-mono"
            >
              Test Tone
            </button>
          </label>

          <label
            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
              micSoundMode === 'default'
                ? 'bg-slate-800/60 border-slate-600 text-slate-200'
                : 'bg-[#040812] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="micSoundMode"
                checked={micSoundMode === 'default'}
                onChange={() => setMicSoundMode('default')}
                className="text-slate-400"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Google / System Default
                </div>
                <div className="text-[10px] text-slate-400">
                  Standard browser/Android SpeechRecognizer earcon cue.
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Save & Clear Actions */}
      <div className="flex gap-2.5 pt-2">
        <button
          onClick={handleClearKeys}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Reset Defaults
        </button>

        <button
          onClick={handleSave}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-950 transition flex items-center justify-center gap-1.5"
        >
          {savedSuccess ? <CheckCircle className="w-4 h-4 text-slate-950" /> : <Lock className="w-4 h-4" />}
          {savedSuccess ? 'Configuration Saved & Encrypted!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};
