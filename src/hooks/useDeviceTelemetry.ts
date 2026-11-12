import { useState, useEffect, useCallback } from 'react';
import { telemetryService, DetailedDeviceTelemetry } from '../services/telemetry';

export function useDeviceTelemetry() {
  const [telemetry, setTelemetry] = useState<DetailedDeviceTelemetry>(
    telemetryService.getTelemetry()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = telemetryService.subscribe((latest) => {
      setTelemetry({ ...latest });
    });
    return () => unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await telemetryService.refreshAll();
      setTelemetry({ ...updated });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  return { telemetry, refresh, isRefreshing };
}
