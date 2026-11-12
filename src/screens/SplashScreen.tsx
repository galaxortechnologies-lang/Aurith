import React, { useEffect } from 'react';
import { ScreenId } from '../types';
import { AiOrb } from '../components/AiOrb';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="flex-1 flex flex-col items-center justify-center p-6 bg-[#040812] select-none cursor-pointer"
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        <AiOrb size={150} isSpeaking={true} />

        <h1 className="text-4xl font-black text-cyan-400 tracking-[0.25em] font-heading mt-8 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
          AURITH
        </h1>
        <p className="text-xs text-slate-400 mt-2 font-sans tracking-wide">
          Your Personal AI Assistant
        </p>

        <div className="mt-8 px-4 py-1.5 rounded-full bg-[#08152B] border border-cyan-500/30 text-[11px] font-mono font-bold tracking-widest text-cyan-300">
          CREATED BY ANUP CHAND
        </div>

        <div className="mt-12 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>BOOTING NATIVE ANDROID 16 KERNEL...</span>
        </div>
      </div>
    </div>
  );
};
