import React from 'react';
import { Volume2, Sparkles, MessageCircle, Mic, MicOff } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { MascotMood } from '../types';

interface OsmoTabletFrameProps {
  children: React.ReactNode;
  mascotSpeech: string;
  mascotFrench?: string;
  mascotMood?: MascotMood;
  starsCount: number;
  activityTitle: string;
  unitLabel: string;
  onRepeatAudio?: () => void;
  isListening?: boolean;
  onToggleMic?: () => void;
  audioTranscript?: string;
}

export const OsmoTabletFrame: React.FC<OsmoTabletFrameProps> = ({
  children,
  mascotSpeech,
  mascotFrench,
  mascotMood = 'happy',
  starsCount,
  activityTitle,
  unitLabel,
  onRepeatAudio,
  isListening = false,
  onToggleMic,
  audioTranscript = '',
}) => {
  return (
    <div className="relative flex flex-col items-center w-full max-w-4xl mx-auto my-2">
      {/* 1. Iconic Red Camera Reflector Cap (Clipped onto top of iPad bezel!) */}
      <div className="relative z-30 flex flex-col items-center -mb-3 sm:-mb-4">
        {/* Red plastic clip body */}
        <div className="w-20 sm:w-24 h-9 sm:h-11 bg-gradient-to-b from-red-500 to-red-600 rounded-t-2xl shadow-xl flex flex-col items-center justify-center border-t-2 border-x-2 border-red-400 relative">
          {/* Reflective mirror prism window inside */}
          <div className="w-12 sm:w-14 h-4 bg-gradient-to-r from-red-900 via-red-950 to-red-900 rounded-md shadow-inner flex items-center justify-center border border-red-700/60">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-300/80 shadow-[0_0_6px_#60a5fa] animate-pulse" />
          </div>
          {/* Clip lip */}
          <div className="w-24 sm:w-28 h-2 bg-red-700 rounded-b-md shadow-md" />
        </div>
      </div>

      {/* 2. Realistic iPad / Tablet Hardware Body */}
      <div className="w-full bg-[#f8f9fa] border-[10px] sm:border-[14px] border-slate-900 rounded-[36px] sm:rounded-[44px] shadow-2xl overflow-hidden relative ring-4 ring-slate-300/80">
        {/* Top Tablet Bezel: Camera pinhole */}
        <div className="h-4 sm:h-5 bg-slate-900 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
        </div>

        {/* 3. In-Screen Content (Le Monde Vivant de l'iPad) */}
        <div className="bg-sky-100 min-h-[460px] sm:min-h-[520px] p-3 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          {/* In-Screen Mini HUD */}
          <div className="flex items-center justify-between gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-sm z-20 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl font-heading">
                {unitLabel}
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-slate-800 font-heading truncate max-w-xs sm:max-w-md">
                {activityTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300 text-amber-900 font-heading font-black text-xs">
                <span>⭐</span>
                <span className="tabular-nums">{starsCount}</span>
              </div>

              {onToggleMic && (
                <button
                  type="button"
                  onClick={onToggleMic}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                  }`}
                  title={isListening ? 'Arrêter microphone' : 'Activer microphone'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Massi Mascot Floating Speech Ribbon */}
          <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-300 shadow-md z-20 mb-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="text-2xl sm:text-3xl shrink-0">🦊</span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading leading-tight truncate sm:whitespace-normal">
                  "{mascotSpeech}"
                </p>
                {mascotFrench && (
                  <p className="text-[10px] sm:text-xs text-slate-500 truncate sm:whitespace-normal italic">
                    {mascotFrench}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onRepeatAudio || (() => soundManager.speak(mascotSpeech, 'en-US'))}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-heading shrink-0"
              title="Écouter Massi"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Écouter</span>
            </button>
          </div>

          {/* Activity Interactive Stage (Grid / Game Engine) */}
          <div className="flex-1 relative z-10">
            {children}
          </div>

          {/* Audio Wave Bar Monitor at bottom of screen if listening */}
          {isListening && (
            <div className="mt-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-xl text-white flex items-center justify-between text-xs z-20 shadow-md border border-emerald-400/40">
              <div className="flex items-center gap-2 text-emerald-300 font-heading">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Massi écoute : « {audioTranscript || 'Parle dans ton micro...'} »</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Micro actif</span>
            </div>
          )}
        </div>

        {/* Bottom Tablet Bezel: Home Button (Circle cutout as in the photo!) */}
        <div className="h-6 sm:h-7 bg-slate-900 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800" />
        </div>
      </div>

      {/* 4. White Curved Osmo Dock Stand (Holding the tablet upright on the desk!) */}
      <div className="relative -mt-3 z-10 flex flex-col items-center">
        {/* Dock cradle */}
        <div className="w-64 sm:w-80 h-10 sm:h-12 bg-gradient-to-b from-white to-slate-200 rounded-2xl shadow-2xl border border-slate-300 flex items-center justify-between px-6">
          <div className="w-12 h-2.5 bg-slate-300/80 rounded-full" />
          <span className="text-[11px] font-black text-slate-400 font-heading tracking-widest uppercase">
            OSMO DOCK
          </span>
          <div className="w-12 h-2.5 bg-slate-300/80 rounded-full" />
        </div>
        {/* Stand wings */}
        <div className="w-72 sm:w-96 h-4 bg-slate-300/60 rounded-full blur-sm -mt-1" />
      </div>
    </div>
  );
};
