import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
  mode?: 'listening' | 'speaking' | 'processing' | 'idle';
  barCount?: number;
  height?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isActive,
  mode = 'listening',
  barCount = 20,
  height = 48,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const bars = Array.from({ length: barCount }, () => Math.random());

    const render = () => {
      phase += 0.1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const canvasHeight = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        
        // Calculate height with sine wave modulation for GPU-accelerated 60fps rendering
        const sinFactor = Math.sin(phase + i * 0.3);
        const randomFactor = isActive ? Math.random() * 0.4 + 0.6 : 0.15;
        const normalizedH = isActive ? Math.max(6, (Math.abs(sinFactor) * 0.8 + randomFactor) * (canvasHeight - 10)) : 6;

        const y = (canvasHeight - normalizedH) / 2;

        // Gradient color based on mode
        const gradient = ctx.createLinearGradient(0, y, 0, y + normalizedH);
        if (mode === 'speaking') {
          gradient.addColorStop(0, '#10B981'); // Emerald
          gradient.addColorStop(1, '#06B6D4'); // Cyan
        } else if (mode === 'processing') {
          gradient.addColorStop(0, '#3B82F6'); // Blue
          gradient.addColorStop(1, '#8B5CF6'); // Purple
        } else if (mode === 'listening') {
          gradient.addColorStop(0, '#EF4444'); // Red
          gradient.addColorStop(1, '#F97316'); // Orange
        } else {
          gradient.addColorStop(0, '#94A3B8');
          gradient.addColorStop(1, '#64748B');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, normalizedH, 4);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, mode, barCount]);

  return (
    <div
      className="flex items-center justify-center px-4 py-2 rounded-2xl liquid-glass shadow-inner overflow-hidden will-change-transform"
      style={{ height, transform: 'translateZ(0)' }}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
