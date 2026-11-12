export interface BatteryRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  actionName: string;
}

class BatteryMonitorService {
  private latencySpikeListeners: Array<(latencyMs: number, recommendations: BatteryRecommendation[]) => void> = [];
  private lastLatency: number = 0;
  private powerSavingMode: boolean = false;

  public addListener(listener: (latencyMs: number, recommendations: BatteryRecommendation[]) => void) {
    this.latencySpikeListeners.push(listener);
  }

  public removeListener(listener: (latencyMs: number, recommendations: BatteryRecommendation[]) => void) {
    this.latencySpikeListeners = this.latencySpikeListeners.filter((l) => l !== listener);
  }

  public reportLatency(latencyMs: number) {
    this.lastLatency = latencyMs;
    if (latencyMs > 2000) {
      const recs = this.getPowerSavingRecommendations();
      this.latencySpikeListeners.forEach((l) => l(latencyMs, recs));
    }
  }

  public getLastLatency(): number {
    return this.lastLatency;
  }

  public setPowerSavingMode(enabled: boolean) {
    this.powerSavingMode = enabled;
  }

  public getPowerSavingMode(): boolean {
    return this.powerSavingMode;
  }

  public getPowerSavingRecommendations(): BatteryRecommendation[] {
    return [
      {
        id: 'sensors',
        title: 'Disable Live Sensor Polling',
        description: 'High AI latency (>2.0s) detected due to thermal throttling or CPU load. Pause live accelerometer & gyroscope updates.',
        impact: 'High',
        actionName: 'Optimize Sensors',
      },
      {
        id: 'tts_buffer',
        title: 'Enable Streaming Audio Pre-fetcher',
        description: 'Reduce audio buffering overhead by caching initial TTS sentence chunks.',
        impact: 'Medium',
        actionName: 'Apply Prefetch',
      },
      {
        id: 'background_sync',
        title: 'Restrict Background Telemetry',
        description: 'Reduce battery consumption by lowering hardware telemetry check frequency from 5s to 30s.',
        impact: 'High',
        actionName: 'Save Battery',
      },
    ];
  }
}

export const batteryMonitor = new BatteryMonitorService();
