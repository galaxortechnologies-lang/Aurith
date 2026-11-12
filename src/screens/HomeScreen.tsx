import React from 'react';
import { ScreenId } from '../types';
import { AiOrb } from '../components/AiOrb';
import {
  Mic,
  MessageSquare,
  Smartphone,
  Grid,
  DownloadCloud,
  Clock,
  History,
  Bell,
  FileEdit,
  AlarmClock,
  BrainCircuit,
  Key,
  ShieldCheck,
  Shield,
  Info,
  BatteryCharging,
  Battery,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
} from 'lucide-react';
import { useDeviceTelemetry } from '../hooks/useDeviceTelemetry';

interface HomeScreenProps {
  onNavigate: (screen: ScreenId) => void;
  openRouterConfigured: boolean;
  fishAudioConfigured: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  openRouterConfigured,
  fishAudioConfigured,
}) => {
  const { telemetry, refresh, isRefreshing } = useDeviceTelemetry();
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-[#F8FAFC]">
      {/* Top Header & Notification Quick Access */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-cyan-800 font-heading">
            AURITH
          </h1>
          <p className="text-xs text-slate-500 font-medium">Your Personal AI Assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('notifications')}
            className="p-2.5 rounded-full bg-white border border-slate-200 text-cyan-700 hover:border-cyan-400 transition relative shadow-sm"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
          </button>
        </div>
      </div>

      {/* Main Light Holographic AI Orb Command Center */}
      <div className="relative rounded-3xl holographic-card p-6 flex flex-col items-center text-center shadow-xl border border-cyan-300/60 overflow-hidden">
        {/* Status chip */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-100/90 border border-cyan-300 text-[11px] font-mono text-cyan-900 font-bold mb-4 tracking-wide shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
          SYSTEM ONLINE • ANDROID 16
        </div>

        {/* Animated AI Orb */}
        <AiOrb size={135} onClick={() => onNavigate('voice')} />

        <div className="mt-4">
          <h2 className="text-base font-bold text-slate-900 font-heading tracking-wide">
            AURITH VOICE & ASSISTANT
          </h2>
          <p className="text-xs text-slate-600 max-w-xs mt-1 leading-relaxed font-medium">
            Real-time streaming speech in Hindi, English & Hinglish with deep male voice tone.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 mt-5 w-full max-w-xs">
          <button
            onClick={() => onNavigate('voice')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 transition cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            Live Voice
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-cyan-300 text-cyan-800 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-cyan-700" />
            Chat
          </button>
        </div>

        {/* API Warning if not configured */}
        {(!openRouterConfigured || !fishAudioConfigured) && (
          <button
            onClick={() => onNavigate('api_config')}
            className="mt-3 text-[11px] text-cyan-800 hover:text-cyan-900 underline font-semibold cursor-pointer"
          >
            Configure your personal AI Brain & Voice settings &rarr;
          </button>
        )}
      </div>

      {/* Developer Credit Banner */}
      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
        <span className="text-[11px] font-mono tracking-widest text-cyan-800 font-bold">
          CREATED BY ANUP CHAND
        </span>
      </div>

      {/* Device Telemetry Snapshot Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>REAL-TIME HARDWARE TELEMETRY</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            refresh();
          }}
          disabled={isRefreshing}
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-cyan-700 transition"
          title="Refresh Device Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Live Battery */}
        <div
          onClick={() => onNavigate('device')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] group-hover:text-cyan-700 font-medium">Battery</span>
            {telemetry.isCharging ? (
              <BatteryCharging className="w-4 h-4 text-cyan-600 animate-pulse" />
            ) : (
              <Battery className="w-4 h-4 text-cyan-600" />
            )}
          </div>
          <div className="text-lg font-bold text-slate-900 font-heading">
            {telemetry.batteryPct}%
          </div>
          <div className="text-[10px] text-cyan-700 font-semibold truncate">
            {telemetry.isCharging ? 'Charging (Power Connected)' : 'Discharging'}
          </div>
        </div>

        {/* Live RAM */}
        <div
          onClick={() => onNavigate('device')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] group-hover:text-cyan-700 font-medium">RAM (Memory)</span>
            <Cpu className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-heading">
            {telemetry.ramUsedGb} / {telemetry.ramTotalGb} GB
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {(telemetry.ramTotalGb - telemetry.ramUsedGb).toFixed(1)} GB Free
          </div>
        </div>

        {/* Live Storage */}
        <div
          onClick={() => onNavigate('device')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] group-hover:text-cyan-700 font-medium">Storage (StatFs)</span>
            <HardDrive className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-heading">
            {telemetry.storageFreeGb} GB Free
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {telemetry.storageUsedGb} GB Used ({telemetry.storagePercent}%)
          </div>
        </div>

        {/* Live Network */}
        <div
          onClick={() => onNavigate('device')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] group-hover:text-cyan-700 font-medium">Network</span>
            <Wifi className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-heading">
            {telemetry.networkType}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {telemetry.isOnline ? 'Online (Connected)' : 'Offline'}
          </div>
        </div>
      </div>
    </div>
  );
};
