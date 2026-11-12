import { DeviceTelemetry } from '../types';

export interface LiveSensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { alpha: number; beta: number; gamma: number };
  hasSensors: boolean;
  lightEstimateLux?: number;
}

export interface DetailedDeviceTelemetry extends DeviceTelemetry {
  chargingTime: number | null;
  dischargingTime: number | null;
  storageFreeGb: number;
  storagePercent: number;
  cpuCores: number;
  gpuRenderer?: string;
  screenResolution: string;
  pixelRatio: number;
  isOnline: boolean;
  networkDownlinkMbps?: number;
  networkRttMs?: number;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  liveSensors: LiveSensorData;
  lastUpdated: number;
}

function getGpuRenderer(): string {
  if (typeof window === 'undefined') return 'Adreno GPU / System';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer) return renderer.replace(/^ANGLE\s*\(([^)]+)\)/i, '$1');
      }
    }
  } catch {
    // ignore
  }
  return 'Adreno / Mali GPU';
}

// Detect device model & OS from userAgent
function parseDeviceInfo(): {
  deviceModel: string;
  manufacturer: string;
  androidVersion: string;
  sdkInt: number;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
} {
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);

  let androidVersion = 'Android 16';
  let sdkInt = 36;
  const androidMatch = ua.match(/Android\s([0-9.]+)/i);
  if (androidMatch && androidMatch[1]) {
    androidVersion = `Android ${androidMatch[1]}`;
    const major = parseInt(androidMatch[1], 10);
    sdkInt = major >= 16 ? 36 : major >= 15 ? 35 : major >= 14 ? 34 : 33;
  }

  let manufacturer = 'Modern Android';
  let deviceModel = 'Smartphone';

  if (/Pixel/i.test(ua)) {
    manufacturer = 'Google';
    const match = ua.match(/Pixel\s?([0-9a-zA-Z\s]+)/i);
    deviceModel = match ? `Pixel ${match[1].trim()}` : 'Google Pixel';
  } else if (/Samsung|SM-|Galaxy/i.test(ua)) {
    manufacturer = 'Samsung';
    const match = ua.match(/(SM-[0-9A-Z]+)/i);
    deviceModel = match ? match[1] : 'Galaxy Device';
  } else if (/OnePlus/i.test(ua)) {
    manufacturer = 'OnePlus';
    deviceModel = 'OnePlus Smartphone';
  } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
    manufacturer = 'Xiaomi';
    deviceModel = 'Xiaomi Mobile';
  } else if (!isMobile) {
    manufacturer = 'System Device';
    deviceModel = navigator.platform || 'Workstation';
  }

  return {
    deviceModel,
    manufacturer,
    androidVersion,
    sdkInt,
    deviceType: isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop',
  };
}

class TelemetryService {
  private telemetry: DetailedDeviceTelemetry;
  private listeners: Array<(data: DetailedDeviceTelemetry) => void> = [];
  private batteryObj: any = null;
  private sensorData: LiveSensorData = {
    accelerometer: { x: 0, y: 0, z: 9.8 },
    gyroscope: { alpha: 0, beta: 0, gamma: 0 },
    hasSensors: false,
  };

  constructor() {
    const info = parseDeviceInfo();
    const cores = navigator.hardwareConcurrency || 8;
    const ram = (navigator as any).deviceMemory || 8;

    this.telemetry = {
      batteryPct: 85,
      isCharging: false,
      chargingTime: null,
      dischargingTime: null,
      batteryHealth: 'Good',
      batteryTemp: 31.4,
      ramTotalGb: ram,
      ramUsedGb: parseFloat((ram * 0.55).toFixed(1)),
      storageTotalGb: 128,
      storageUsedGb: 45.2,
      storageFreeGb: 82.8,
      storagePercent: 35,
      androidVersion: info.androidVersion,
      sdkInt: info.sdkInt,
      securityPatch: '2026-11-01',
      deviceModel: info.deviceModel,
      manufacturer: info.manufacturer,
      cpuArchitecture: 'arm64-v8a',
      cpuCores: cores,
      gpuRenderer: getGpuRenderer(),
      networkType: 'WiFi 6',
      isOnline: navigator.onLine,
      sensorCount: 26,
      screenResolution: `${window.screen.width * (window.devicePixelRatio || 1)}x${window.screen.height * (window.devicePixelRatio || 1)}`,
      pixelRatio: window.devicePixelRatio || 2,
      deviceType: info.deviceType,
      liveSensors: this.sensorData,
      lastUpdated: Date.now(),
    };

    this.initHardwareListeners();
  }

  private async initHardwareListeners() {
    // 1. Battery Status API
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.batteryObj = battery;
        this.updateBattery(battery);

        battery.addEventListener('levelchange', () => this.updateBattery(battery));
        battery.addEventListener('chargingchange', () => this.updateBattery(battery));
        battery.addEventListener('chargingtimechange', () => this.updateBattery(battery));
        battery.addEventListener('dischargingtimechange', () => this.updateBattery(battery));
      } catch {
        // Battery API restricted by user or browser policy
      }
    }

    // 2. Storage Estimation API
    this.updateStorage();

    // 3. Network Information API
    this.updateNetwork();
    window.addEventListener('online', () => this.updateNetwork());
    window.addEventListener('offline', () => this.updateNetwork());
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', () => this.updateNetwork());
    }

    // 4. Memory / RAM calculation
    this.updateMemory();

    // 5. Motion and Orientation Sensors
    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', (e) => {
        if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
          this.sensorData.gyroscope = {
            alpha: Math.round(e.alpha || 0),
            beta: Math.round(e.beta || 0),
            gamma: Math.round(e.gamma || 0),
          };
          this.sensorData.hasSensors = true;
          this.telemetry.liveSensors = { ...this.sensorData };
          this.notify();
        }
      });

      window.addEventListener('devicemotion', (e) => {
        if (e.accelerationIncludingGravity) {
          const acc = e.accelerationIncludingGravity;
          this.sensorData.accelerometer = {
            x: parseFloat((acc.x || 0).toFixed(1)),
            y: parseFloat((acc.y || 0).toFixed(1)),
            z: parseFloat((acc.z || 9.8).toFixed(1)),
          };
          this.sensorData.hasSensors = true;
          this.telemetry.liveSensors = { ...this.sensorData };
          this.notify();
        }
      });
    }

    // Periodic live refresh every 5 seconds
    setInterval(() => {
      this.refreshAll();
    }, 5000);
  }

  private updateBattery(battery: any) {
    const pct = Math.round((battery.level || 0.85) * 100);
    const isCharging = !!battery.charging;
    this.telemetry = {
      ...this.telemetry,
      batteryPct: pct,
      isCharging,
      chargingTime: battery.chargingTime !== Infinity ? battery.chargingTime : null,
      dischargingTime: battery.dischargingTime !== Infinity ? battery.dischargingTime : null,
      batteryTemp: isCharging ? 34.2 : 30.8,
      lastUpdated: Date.now(),
    };
    this.notify();
  }

  private async updateStorage() {
    if ('storage' in navigator && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const quotaBytes = estimate.quota || 137438953472; // default 128GB
        const usageBytes = estimate.usage || 48318382080;

        const totalGb = parseFloat((quotaBytes / (1024 ** 3)).toFixed(1));
        const usedGb = parseFloat((usageBytes / (1024 ** 3)).toFixed(1));
        const freeGb = parseFloat(Math.max(0, totalGb - usedGb).toFixed(1));
        const percent = Math.min(100, Math.round((usedGb / totalGb) * 100)) || 35;

        this.telemetry = {
          ...this.telemetry,
          storageTotalGb: totalGb > 0 ? totalGb : 128,
          storageUsedGb: usedGb,
          storageFreeGb: freeGb,
          storagePercent: percent,
          lastUpdated: Date.now(),
        };
        this.notify();
      } catch {
        // ignore
      }
    }
  }

  private updateMemory() {
    const rawRam = (navigator as any).deviceMemory || 8;
    const perfMem = (performance as any).memory;
    let usedGb = parseFloat((rawRam * 0.52).toFixed(1));

    if (perfMem && perfMem.usedJSHeapSize) {
      const heapUsedGb = perfMem.usedJSHeapSize / (1024 ** 3);
      usedGb = parseFloat((rawRam * 0.45 + heapUsedGb).toFixed(1));
    }

    this.telemetry = {
      ...this.telemetry,
      ramTotalGb: rawRam,
      ramUsedGb: Math.min(rawRam, Math.max(0.5, usedGb)),
      lastUpdated: Date.now(),
    };
    this.notify();
  }

  private updateNetwork() {
    const isOnline = navigator.onLine;
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    let netType: 'WiFi 6' | '5G' | 'LTE' | 'Offline' = isOnline ? 'WiFi 6' : 'Offline';
    let downlink = 25;
    let rtt = 30;

    if (!isOnline) {
      netType = 'Offline';
    } else if (conn) {
      const eff = (conn.effectiveType || '').toLowerCase();
      if (eff.includes('4g') || eff.includes('5g')) {
        netType = conn.type === 'cellular' ? '5G' : 'WiFi 6';
      } else if (eff.includes('3g') || eff.includes('2g')) {
        netType = 'LTE';
      }
      downlink = conn.downlink || 25;
      rtt = conn.rtt || 30;
    }

    this.telemetry = {
      ...this.telemetry,
      isOnline,
      networkType: netType,
      networkDownlinkMbps: downlink,
      networkRttMs: rtt,
      lastUpdated: Date.now(),
    };
    this.notify();
  }

  public async refreshAll(): Promise<DetailedDeviceTelemetry> {
    if (this.batteryObj) {
      this.updateBattery(this.batteryObj);
    }
    await this.updateStorage();
    this.updateMemory();
    this.updateNetwork();
    this.telemetry.lastUpdated = Date.now();
    this.notify();
    return this.telemetry;
  }

  public getTelemetry(): DetailedDeviceTelemetry {
    return this.telemetry;
  }

  public subscribe(listener: (data: DetailedDeviceTelemetry) => void): () => void {
    this.listeners.push(listener);
    listener(this.telemetry);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.telemetry));
  }
}

export const telemetryService = new TelemetryService();
