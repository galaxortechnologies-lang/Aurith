import React, { useState } from 'react';
import { ScreenId } from '../types';
import { ArrowLeft, ShieldCheck, Mic, Clock, Bell, HardDrive, Camera, ExternalLink, AlertTriangle } from 'lucide-react';

interface PermissionsScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onNavigate }) => {
  const [permissions, setPermissions] = useState([
    {
      id: 'mic',
      name: 'Microphone (Record Audio)',
      purpose: 'Enables native Android SpeechRecognizer for hands-free voice commands in Hindi, English, and Hinglish.',
      status: 'Granted',
      icon: Mic,
      critical: true,
    },
    {
      id: 'usage',
      name: 'Package Usage Access',
      purpose: 'Allows UsageStatsManager to inspect screen time and app usage stats for Phone Intelligence.',
      status: 'Granted',
      icon: Clock,
      critical: true,
    },
    {
      id: 'storage',
      name: 'Media & Storage Access',
      purpose: 'Enables viewing and managing downloads via MediaStore and Storage Access Framework.',
      status: 'Granted',
      icon: HardDrive,
      critical: false,
    },
    {
      id: 'camera',
      name: 'Camera Launch Intent',
      purpose: 'Allows triggering native Camera capture when explicitly commanded.',
      status: 'Granted',
      icon: Camera,
      critical: false,
    },
    {
      id: 'notifications',
      name: 'Notification Listener',
      purpose: 'Optional service to display active system alerts inside AURITH Notification Center.',
      status: 'Active',
      icon: Bell,
      critical: false,
    },
  ]);

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
          <h2 className="text-lg font-bold text-slate-100 font-heading">Permissions Center</h2>
          <p className="text-[11px] text-slate-400">Android 16 Runtime Privacy & Scopes</p>
        </div>
      </div>

      {/* Philosophy Card */}
      <div className="p-3.5 rounded-2xl bg-[#09152B] border border-cyan-500/20 text-xs text-slate-300 space-y-1.5">
        <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Strict Least-Privilege Architecture
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AURITH requests permissions only when functionally required. We do not request universal QUERY_ALL_PACKAGES or root privileges. Permissions can be revoked at any time via Android System Settings.
        </p>
      </div>

      {/* Permissions List */}
      <div className="space-y-2.5">
        {permissions.map((perm) => {
          const IconComp = perm.icon;
          return (
            <div
              key={perm.id}
              className="p-4 rounded-xl bg-[#081429] border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{perm.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {perm.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{perm.purpose}</p>
            </div>
          );
        })}
      </div>

      {/* Revocation Guide */}
      <div className="p-3.5 rounded-xl bg-[#081224] border border-slate-800 text-xs text-slate-400 space-y-1">
        <span className="font-bold text-slate-300 text-[11px] uppercase">How to Revoke Permissions</span>
        <p className="text-[11px] leading-relaxed">
          Open <strong>Android Settings &gt; Apps &gt; AURITH &gt; Permissions</strong> to grant, deny, or customize any runtime access.
        </p>
      </div>
    </div>
  );
};
