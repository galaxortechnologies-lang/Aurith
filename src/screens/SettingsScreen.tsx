import React from 'react';
import { ScreenId, ApiSettings, SupportedLanguage } from '../types';
import {
  ArrowLeft,
  Key,
  ShieldCheck,
  Shield,
  BrainCircuit,
  Info,
  Globe,
  Volume2,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { saveSettings } from '../services/storage';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  settings: ApiSettings;
  onUpdateSettings: (s: ApiSettings) => void;
  onOpenCodeExplorer?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  settings,
  onUpdateSettings,
  onOpenCodeExplorer,
}) => {
  const handleLanguageChange = (lang: SupportedLanguage) => {
    const updated = { ...settings, selectedLanguage: lang };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const handleToggleAutoSpeak = () => {
    const updated = { ...settings, autoSpeakReplies: !settings.autoSpeakReplies };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#040812]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-heading">Settings</h2>
          <p className="text-[11px] text-slate-400">Assistant Configuration & Preferences</p>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
          <Globe className="w-4 h-4" />
          PRIMARY ASSISTANT LANGUAGE
        </div>
        <p className="text-[11px] text-slate-400">
          Determines SpeechRecognizer recognition profile and model default response style.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { code: 'hi-IN', label: 'Hindi' },
              { code: 'hinglish', label: 'Hinglish' },
              { code: 'en-IN', label: 'English' },
            ] as const
          ).map((item) => {
            const active = settings.selectedLanguage === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleLanguageChange(item.code)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                  active
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950 font-black'
                    : 'bg-[#050C18] border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Auto-Speak Toggle */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5 pr-4">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            Auto-Speak Chat Replies
          </div>
          <p className="text-[11px] text-slate-400">
            Automatically synthesize incoming chat text using Fish Audio (s2.1-pro-free).
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.autoSpeakReplies}
          onChange={handleToggleAutoSpeak}
          className="w-5 h-5 accent-cyan-500 cursor-pointer"
        />
      </div>

      {/* Android Studio Project Explorer Link */}
      {onOpenCodeExplorer && (
        <button
          onClick={onOpenCodeExplorer}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-[#0B1E38] to-[#0A172C] border border-cyan-500/40 flex items-center justify-between text-left hover:border-cyan-400 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-300">
                Native Android Studio Source & ZIP
              </div>
              <div className="text-[10px] text-slate-400">
                Inspect Kotlin, Gradle, XML & download full project (.zip)
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
        </button>
      )}

      {/* Settings Navigation List */}
      <div className="rounded-2xl bg-[#081224] border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
        {[
          { label: 'API Configuration', desc: 'OpenRouter & Fish Audio keys', screen: 'api_config', icon: Key },
          { label: 'Permissions Center', desc: 'Runtime Android scopes', screen: 'permissions', icon: ShieldCheck },
          { label: 'Privacy & Safety', desc: 'Allowlisted action rules', screen: 'privacy_security', icon: Shield },
          { label: 'Memory Center', desc: 'Personal on-device facts', screen: 'memory', icon: BrainCircuit },
          { label: 'About AURITH', desc: 'Created by Anup Chand', screen: 'about', icon: Info },
        ].map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen as ScreenId)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-[#0E1E3A] transition text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#050C18] text-cyan-400 group-hover:text-cyan-300">
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
            </button>
          );
        })}
      </div>

      <div className="text-center text-[11px] text-slate-500 font-mono py-2">
        AURITH v1.0.0 (API 36) • CREATED BY ANUP CHAND
      </div>
    </div>
  );
};
