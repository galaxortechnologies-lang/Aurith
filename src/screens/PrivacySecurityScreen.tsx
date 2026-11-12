import React from 'react';
import { ScreenId } from '../types';
import { ArrowLeft, Shield, Lock, CheckCircle2, AlertOctagon, Terminal, Database, Key } from 'lucide-react';

interface PrivacySecurityScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const PrivacySecurityScreen: React.FC<PrivacySecurityScreenProps> = ({ onNavigate }) => {
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
          <h2 className="text-lg font-bold text-slate-100 font-heading">Privacy & Safety</h2>
          <p className="text-[11px] text-slate-400">AURITH Security Constitution & Rules</p>
        </div>
      </div>

      {/* Main Principles */}
      <div className="p-4 rounded-2xl bg-[#09152B] border border-cyan-500/30 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
          <Shield className="w-4 h-4" />
          ALLOWLISTED DEVICE ACTION ARCHITECTURE
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The AI model (Gemma 4 26B) does not execute unrestricted operating system shell commands or bash scripts. Every action is strictly parsed, typed, validated, and authorized by the local <strong>DeviceActionManager</strong> before execution.
        </p>
      </div>

      {/* Security Pillars */}
      <div className="space-y-2.5">
        {[
          {
            title: 'Explicit Action Confirmations',
            desc: 'High-risk actions (file deletions, calls, uninstalls, financial transactions) are blocked until the user taps Authorize on the Android confirmation dialog.',
            icon: AlertOctagon,
            color: 'text-amber-400',
          },
          {
            title: 'Zero Root Access / No Exploits',
            desc: 'AURITH strictly follows Android platform security guidelines. No root exploits, hidden background microphone recording, or background surveillance are present.',
            icon: Lock,
            color: 'text-emerald-400',
          },
          {
            title: 'Local-First Room Database',
            desc: 'User memories, notes, scheduled alarms, and app activity histories remain on-device in Room SQLite. Only the current prompt is sent to OpenRouter.',
            icon: Database,
            color: 'text-blue-400',
          },
          {
            title: 'Hardware Keystore Encryption',
            desc: 'OpenRouter and Fish Audio credentials are encrypted at rest using Android Keystore AES-256 GCM authenticated master keys.',
            icon: Key,
            color: 'text-cyan-400',
          },
          {
            title: 'No Universal Package Scanning',
            desc: 'AURITH declares explicit intent filters in AndroidManifest.xml queries rather than requesting unrestricted QUERY_ALL_PACKAGES.',
            icon: Terminal,
            color: 'text-purple-400',
          },
        ].map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className="p-3.5 rounded-xl bg-[#081429] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <IconComp className={`w-4 h-4 ${item.color}`} />
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="p-3 text-center text-[11px] text-slate-500 font-mono">
        DEVELOPER CREDIT: CREATED BY ANUP CHAND
      </div>
    </div>
  );
};
