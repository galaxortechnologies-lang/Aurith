import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import {
  Home,
  MessageSquare,
  Grid,
  Smartphone,
  Settings,
  Wifi,
  Battery,
  BatteryCharging,
  Code2,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useDeviceTelemetry } from '../hooks/useDeviceTelemetry';

interface PhoneFrameProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  children: React.ReactNode;
  onOpenCodeExplorer: () => void;
  onDownloadZip: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  currentScreen,
  onNavigate,
  children,
  onOpenCodeExplorer,
  onDownloadZip,
}) => {
  const { telemetry } = useDeviceTelemetry();
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:42');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const showBottomNav =
    currentScreen !== 'splash' &&
    currentScreen !== 'voice' &&
    currentScreen !== 'chat';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'apps', label: 'Apps', icon: Grid },
    { id: 'device', label: 'Device', icon: Smartphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-start p-2 sm:p-4">
      {/* Top AI Studio Companion Bar */}
      <header className="w-full max-w-4xl mb-3 flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200/90 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse shadow-[0_0_8px_#0284c7]" />
          <span className="font-heading font-black text-cyan-700 tracking-wider">
            AURITH
          </span>
          <span className="hidden sm:inline text-slate-500 font-mono text-[11px]">
            • Native Android 16 (Kotlin/Compose)
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold hidden md:inline">
            CREATED BY ANUP CHAND
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <button
            onClick={() => setIsFullWidth(!isFullWidth)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-cyan-700 transition flex items-center gap-1 text-[11px]"
            title={isFullWidth ? 'Switch to Phone Chassis' : 'Switch to Full Dashboard'}
          >
            {isFullWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullWidth ? 'Chassis View' : 'Full Width'}</span>
          </button>

          {/* Code Explorer */}
          <button
            onClick={onOpenCodeExplorer}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Inspect Native Kotlin / XML / Gradle Files"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Sources</span>
          </button>

          {/* Download Zip */}
          <button
            onClick={onDownloadZip}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-cyan-200 transition cursor-pointer"
            title="Download Android Studio Project (.ZIP)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .ZIP</span>
          </button>
        </div>
      </header>

      {/* Smartphone Chassis Container */}
      <main
        className={`w-full transition-all duration-300 flex flex-col bg-[#F8FAFC] border border-slate-300/80 shadow-[0_20px_60px_-15px_rgba(14,165,233,0.18)] overflow-hidden ${
          isFullWidth
            ? 'max-w-4xl h-[88vh] rounded-2xl'
            : 'max-w-[420px] h-[86vh] rounded-[38px] ring-8 ring-slate-200/90'
        }`}
      >
        {/* Android 16 Status Bar */}
        <div className="h-9 px-6 bg-slate-100/90 flex items-center justify-between text-[11px] font-mono text-slate-600 shrink-0 border-b border-slate-200/80 select-none">
          <span className="font-bold text-slate-800">{currentTime}</span>

          {/* Punch Hole Camera in phone mode */}
          {!isFullWidth && (
            <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-400 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-[10px] font-bold text-cyan-700">
              {telemetry.networkType === 'Offline' ? 'NO NET' : telemetry.networkType === '5G' ? '5G' : '4G+'}
            </span>
            <Wifi className={`w-3.5 h-3.5 ${telemetry.isOnline ? 'text-cyan-600' : 'text-slate-400'}`} />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-800">{telemetry.batteryPct}%</span>
              {telemetry.isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
              ) : (
                <Battery className="w-3.5 h-3.5 text-cyan-600" />
              )}
            </div>
          </div>
        </div>

        {/* Screen Dynamic Body */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Jetpack Compose Material 3 Bottom Navigation Bar */}
        {showBottomNav && (
          <nav className="h-16 bg-white/95 border-t border-slate-200 flex items-center justify-around px-2 shrink-0 select-none shadow-lg">
            {navItems.map((item) => {
              const active = currentScreen === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as ScreenId)}
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer relative ${
                    active ? 'text-cyan-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div
                    className={`p-1 rounded-xl transition ${
                      active ? 'bg-cyan-100 text-cyan-800 shadow-sm' : ''
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                      active ? 'font-bold text-cyan-800' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Android Gesture Navigation Pill */}
        <div className="h-3 bg-white flex items-center justify-center shrink-0">
          <div className="w-24 h-1 rounded-full bg-slate-300" />
        </div>
      </main>
    </div>
  );
};
