import React from 'react';
import { motion } from 'motion/react';

interface AiOrbProps {
  size?: number;
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  onClick?: () => void;
}

export const AiOrb: React.FC<AiOrbProps> = ({
  size = 130,
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: size, height: size }}
    >
      {/* Outer Glow Wave */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.4, 1] : isListening ? [1, 1.25, 1] : [1, 1.1, 1],
          opacity: isSpeaking ? [0.4, 0.8, 0.4] : isListening ? [0.3, 0.7, 0.3] : [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: isSpeaking ? 0.9 : isListening ? 1.4 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-cyan-500 blur-2xl pointer-events-none"
      />

      {/* Orbit Ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full border border-cyan-500/30 border-dashed pointer-events-none"
      />

      {/* Orbit Ring 2 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-4 rounded-full border border-cyan-400/20 pointer-events-none"
      />

      {/* Core AI Orb */}
      <motion.div
        animate={{
          scale: isSpeaking ? [0.94, 1.08, 0.94] : isListening ? [0.97, 1.05, 0.97] : [1, 1.03, 1],
        }}
        transition={{
          duration: isSpeaking ? 0.6 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.6)]"
        style={{
          width: size * 0.72,
          height: size * 0.72,
          background: 'radial-gradient(circle at 35% 35%, #67e8f9 0%, #06b6d4 40%, #083344 80%, #040812 100%)',
        }}
      >
        {/* Core highlight reflection */}
        <div className="absolute top-2 left-3 w-4 h-4 rounded-full bg-white/40 blur-[1px]" />

        {/* Center Iris / Waveform */}
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                height: isSpeaking
                  ? [6, 26, 8, 20, 6]
                  : isListening
                  ? [4, 16, 6, 14, 4]
                  : [3, 8, 3],
              }}
              transition={{
                duration: 0.6 + i * 0.1,
                repeat: Infinity,
                delay: i * 0.08,
                ease: 'easeInOut',
              }}
              className="w-1 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ minHeight: 4 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
