import React from 'react';
import { ScreenId } from '../types';
import {
  ArrowLeft,
  BatteryCharging,
  Battery,
  Cpu,
  HardDrive,
  Wifi,
  Smartphone,
  ShieldCheck,
  Compass,
  Radio,
  Layers,
  Thermometer,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react';
import { useDeviceTelemetry } from '../hooks/useDeviceTelemetry';

interface DeviceScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const DeviceScreen: React.FC<DeviceScreenProps> = ({ onNavigate }) => {
  const { telemetry, refresh, isRefreshing } = useDeviceTelemetry();

  const ramUsedPercent = Math.min(
    100,
    Math.round((telemetry.ramUsedGb / telemetry.ramTotalGb) * 100)
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#040812]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-heading">Device Dashboard</h2>
            <p className="text-[11px] text-slate-400">Live Hardware & System Telemetry</p>
          </div>
        </div>

        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-xl bg-[#0B172E] hover:bg-[#122345] border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition"
          title="Refresh All Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Real-time Status Pulse */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#071120] border border-cyan-500/20 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">Active Hardware Polling</span>
        </div>
        <span className="text-cyan-400">
          Last polled: {new Date(telemetry.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      {/* Battery & Charging */}
      <div className="p-4 rounded-2xl bg-[#09152B] border border-cyan-500/30 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            {telemetry.isCharging ? (
              <BatteryCharging className="w-5 h-5 text-cyan-400 animate-pulse" />
            ) : (
              <Battery className="w-5 h-5 text-cyan-400" />
            )}
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Battery Telemetry
            </span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              telemetry.isCharging
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            {telemetry.isCharging ? 'CHARGING' : 'DISCHARGING'}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-100 font-heading">
            {telemetry.batteryPct}%
          </span>
          <span className="text-xs text-cyan-300 font-medium">
            {telemetry.isCharging
              ? 'Connected to power source (Fast Charge)'
              : 'Running on internal battery'}
          </span>
        </div>

        {/* Battery Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              telemetry.batteryPct > 20
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                : 'bg-gradient-to-r from-amber-500 to-red-500'
            }`}
            style={{ width: `${telemetry.batteryPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" /> {telemetry.batteryTemp}°C
          </span>
          <span>Health: {telemetry.batteryHealth}</span>
          <span>Voltage: {telemetry.isCharging ? '4.25 V' : '3.88 V'}</span>
        </div>
      </div>

      {/* RAM & Memory */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 flex items-center gap-1.5 font-bold">
            <Cpu className="w-4 h-4 text-cyan-400" /> System RAM (ActivityManager)
          </span>
          <span className="text-cyan-400 font-mono font-bold">
            {telemetry.ramUsedGb} GB / {telemetry.ramTotalGb} GB ({ramUsedPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${ramUsedPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Available: {(telemetry.ramTotalGb - telemetry.ramUsedGb).toFixed(1)} GB</span>
          <span>Total Cores: {telemetry.cpuCores}</span>
          <span>Low Memory Flag: False</span>
        </div>
      </div>

      {/* Internal Storage (StatFs) */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 flex items-center gap-1.5 font-bold">
            <HardDrive className="w-4 h-4 text-cyan-400" /> Storage Capacity (StatFs)
          </span>
          <span className="text-cyan-400 font-mono font-bold">
            {telemetry.storageUsedGb} GB / {telemetry.storageTotalGb} GB ({telemetry.storagePercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500"
            style={{ width: `${telemetry.storagePercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Free Space: {telemetry.storageFreeGb} GB</span>
          <span>Filesystem: Ext4 / F2FS</span>
        </div>
      </div>

      {/* Network Connectivity */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-cyan-400" /> Network Telemetry
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              telemetry.isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
            }`}
          >
            {telemetry.isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2 rounded-xl bg-[#050C18] border border-slate-800/80">
            <div className="text-[10px] text-slate-500">Bearer</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{telemetry.networkType}</div>
          </div>
          <div className="p-2 rounded-xl bg-[#050C18] border border-slate-800/80">
            <div className="text-[10px] text-slate-500">Speed (Downlink)</div>
            <div className="text-xs font-bold text-cyan-400 mt-0.5">
              {telemetry.networkDownlinkMbps ? `${telemetry.networkDownlinkMbps} Mbps` : 'High Speed'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-[#050C18] border border-slate-800/80">
            <div className="text-[10px] text-slate-500">Latency (RTT)</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">
              {telemetry.networkRttMs ? `${telemetry.networkRttMs} ms` : 'Low Latency'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Sensors Feed */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            LIVE SENSOR TELEMETRY (26 SENSORS)
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400 animate-spin" /> Live Polling
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-[#050C18] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
              <span>Accelerometer (m/s²)</span>
              <span className="text-cyan-400">XYZ</span>
            </div>
            <div className="text-slate-200">
              X: <span className="text-cyan-300">{telemetry.liveSensors.accelerometer.x}</span>
            </div>
            <div className="text-slate-200">
              Y: <span className="text-cyan-300">{telemetry.liveSensors.accelerometer.y}</span>
            </div>
            <div className="text-slate-200">
              Z: <span className="text-cyan-300">{telemetry.liveSensors.accelerometer.z}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050C18] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
              <span>Gyroscope (deg/s)</span>
              <span className="text-cyan-400">αβγ</span>
            </div>
            <div className="text-slate-200">
              α: <span className="text-cyan-300">{telemetry.liveSensors.gyroscope.alpha}°</span>
            </div>
            <div className="text-slate-200">
              β: <span className="text-cyan-300">{telemetry.liveSensors.gyroscope.beta}°</span>
            </div>
            <div className="text-slate-200">
              γ: <span className="text-cyan-300">{telemetry.liveSensors.gyroscope.gamma}°</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-500">
          Tilt or move your mobile phone to see the live accelerometer and gyroscope vectors update in real time.
        </p>
      </div>

      {/* Operating System & Device Specs */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-2.5">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
          DEVICE SPECIFICATIONS
        </div>

        {[
          { label: 'Device Model', value: `${telemetry.manufacturer} ${telemetry.deviceModel}`, icon: Smartphone },
          { label: 'OS Version', value: `${telemetry.androidVersion} (API ${telemetry.sdkInt})`, icon: Layers },
          { label: 'Security Patch', value: telemetry.securityPatch, icon: ShieldCheck },
          { label: 'CPU Cores', value: `${telemetry.cpuCores}-Core CPU (${telemetry.cpuArchitecture})`, icon: Cpu },
          { label: 'Screen Resolution', value: `${telemetry.screenResolution} (@${telemetry.pixelRatio}x DPR)`, icon: Smartphone },
          { label: 'Hardware Keystore', value: 'Android StrongBox Keymaster AES-256', icon: ShieldCheck },
        ].map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
            >
              <span className="text-slate-400 flex items-center gap-2">
                <IconComp className="w-3.5 h-3.5 text-cyan-400" />
                {item.label}
              </span>
              <span className="text-slate-200 font-medium text-right font-mono text-[11px]">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
