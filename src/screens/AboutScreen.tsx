import React from 'react';
import { ScreenId } from '../types';
import { ArrowLeft, Smartphone, Code, Heart, Shield, Cpu, Sparkles, Download } from 'lucide-react';
import { AiOrb } from '../components/AiOrb';
import { downloadAndroidProjectZip } from '../services/exportZip';

interface AboutScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenCodeExplorer?: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate, onOpenCodeExplorer }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-[#040812] text-center">
      {/* Header */}
      <div className="flex items-center gap-3 text-left">
        <button
          onClick={() => onNavigate('home')}
          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-heading">About AURITH</h2>
          <p className="text-[11px] text-slate-400">Application Identity & Developer Credits</p>
        </div>
      </div>

      {/* Orb & Hero */}
      <div className="flex flex-col items-center justify-center pt-2">
        <AiOrb size={100} />
        <h1 className="text-2xl font-black text-cyan-400 tracking-widest font-heading mt-4">
          AURITH
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete Native Android Personal AI Assistant
        </p>
        <span className="mt-2 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold">
          Version 1.0.0 • Target Android 16 (API 36)
        </span>
      </div>

      {/* Primary Developer Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C1B35] via-[#0E2347] to-[#0A172D] border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
          LEAD ARCHITECT & DEVELOPER
        </div>
        <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-100 to-blue-400 font-heading tracking-wider">
          CREATED BY ANUP CHAND
        </div>
        <p className="text-[11px] text-slate-300 mt-1">
          Package: <code className="text-cyan-300 font-mono">com.anupchand.aurith</code>
        </p>
      </div>

      {/* Technical Architecture Specs */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 text-left space-y-2.5">
        <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
          ENGINEERING SPECIFICATIONS
        </div>

        {[
          { label: 'Operating Platform', value: 'Native Android 16 (API Level 36)' },
          { label: 'Programming Language', value: 'Kotlin 2.0+ & Coroutines' },
          { label: 'UI Framework', value: 'Jetpack Compose + Material 3 Dark System' },
          { label: 'Architecture', value: 'Single-Activity Jetpack Compose' },
          { label: 'AI Brain Provider', value: 'OpenRouter (google/gemma-4-26b-a4b-it:free)' },
          { label: 'Voice TTS Engine', value: 'Fish Audio (s2.1-pro-free)' },
          { label: 'Speech Recognition', value: 'Native SpeechRecognizer (hi-IN / en-IN)' },
          { label: 'Local Database', value: 'Room Database (SQLite)' },
          { label: 'Security Vault', value: 'Android Keystore AES-256 GCM' },
          { label: 'Initial Budget', value: '₹0 (Built on Open & Free-Tier Ecosystems)' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
            <span className="text-slate-400">{item.label}</span>
            <span className="text-slate-200 font-medium font-mono text-[11px] text-right">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Code Export Action */}
      <div className="flex gap-2">
        <button
          onClick={downloadAndroidProjectZip}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download Android Studio Project (.ZIP)
        </button>

        {onOpenCodeExplorer && (
          <button
            onClick={onOpenCodeExplorer}
            className="px-4 py-3 rounded-xl bg-[#0F203D] hover:bg-[#152e59] border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Code className="w-4 h-4" />
            Explore
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-500 font-mono">
        &copy; 2026 AURITH. All rights reserved. Created by Anup Chand.
      </p>
    </div>
  );
};
