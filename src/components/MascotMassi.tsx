import React from 'react';
import { Volume2, Sparkles, MessageCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { MascotMood } from '../types';
import mascotImage from '../assets/images/massi_fennec_mascot_1790628791368.jpg';

interface MascotProps {
  speech: string;
  frenchSub?: string;
  isSpeaking?: boolean;
  mood?: MascotMood;
  onRepeatAudio?: () => void;
}

export const MascotMassi: React.FC<MascotProps> = ({
  speech,
  frenchSub,
  isSpeaking = false,
  mood = 'neutral',
  onRepeatAudio,
}) => {
  const handlePlayVoice = () => {
    if (onRepeatAudio) {
      onRepeatAudio();
    } else {
      soundManager.speak(speech, 'en-US');
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-md">
      {/* Mascot Avatar with lively animation */}
      <div className="relative shrink-0">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-inner bg-amber-100/50 transition-transform ${isSpeaking ? 'scale-105 ring-4 ring-amber-300/60' : 'hover:scale-102'}`}>
          <img
            src={mascotImage}
            alt="Massi le Fennec - Mascotte éducative"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        {mood === 'cheering' && (
          <div className="absolute -top-2 -right-1 text-base animate-bounce">
            ⭐
          </div>
        )}
        {mood === 'listening' && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] text-white font-bold items-center justify-center">🎙</span>
          </span>
        )}
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1 font-heading">
            <MessageCircle className="w-3.5 h-3.5 text-amber-600 inline" /> Massi le Fennec
          </span>
          <span className="text-[11px] text-amber-600 font-medium bg-amber-100/80 px-2 py-0.5 rounded-md">
            {mood === 'listening' ? 'T\'écoute attentivement...' : mood === 'cheering' ? 'Bravo !' : 'Guide d\'anglais'}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug font-heading">
              "{speech}"
            </p>
            {frenchSub && (
              <p className="text-xs text-slate-500 mt-0.5 italic">
                {frenchSub}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handlePlayVoice}
            title="Écouter la prononciation"
            aria-label="Écouter la prononciation"
            className="shrink-0 p-2 text-amber-700 bg-amber-100 hover:bg-amber-200 active:scale-95 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-semibold hidden md:inline">Écouter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
