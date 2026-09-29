import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { voiceAssistant } from '../utils/speechRecognition';
import { soundManager } from '../utils/audio';

interface AudioVoiceZoneProps {
  expectedPhrase?: string;
  expectedKeywords?: string[];
  onVoiceMatch?: (transcript: string, matched: boolean) => void;
  promptLabel?: string;
  autoListen?: boolean;
}

export const AudioVoiceZone: React.FC<AudioVoiceZoneProps> = ({
  expectedPhrase = '',
  expectedKeywords = [],
  onVoiceMatch,
  promptLabel = 'Parle quand l\'onde brille',
  autoListen = true,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'success' | 'retry'>('idle');

  // Start or stop speech recognition
  const toggleListening = () => {
    if (isListening) {
      voiceAssistant.stop();
      setIsListening(false);
    } else {
      setMatchStatus('idle');
      setTranscript('');
      voiceAssistant.start(
        (text, isFinal, confidence) => {
          setTranscript(text);
          checkMatch(text);
        },
        (active) => {
          setIsListening(active);
        }
      );
    }
  };

  // Check matching against expected phrase or keywords
  const checkMatch = (spokenText: string) => {
    const cleanSpoken = spokenText.toLowerCase();
    let isMatched = false;

    if (expectedKeywords.length > 0) {
      isMatched = expectedKeywords.some(kw => cleanSpoken.includes(kw.toLowerCase()));
    } else if (expectedPhrase) {
      const cleanExpected = expectedPhrase.toLowerCase();
      isMatched = cleanSpoken.includes(cleanExpected) || cleanExpected.includes(cleanSpoken);
    }

    if (isMatched) {
      setMatchStatus('success');
      soundManager.playSuccess();
      if (onVoiceMatch) {
        onVoiceMatch(spokenText, true);
      }
    }
  };

  // Waveform animation update loop
  useEffect(() => {
    let interval: number;
    if (isListening) {
      interval = window.setInterval(() => {
        setMicVolume(voiceAssistant.volumeLevel);
      }, 80);
    } else {
      setMicVolume(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Clean up
  useEffect(() => {
    return () => {
      voiceAssistant.stop();
    };
  }, []);

  // Quick simulate button for testing without microphone or noisy environment
  const handleSimulateVoice = (customText?: string) => {
    const textToSimulate = customText || expectedKeywords[0] || expectedPhrase || 'Hello';
    setTranscript(textToSimulate);
    checkMatch(textToSimulate);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-white rounded-2xl border-2 border-emerald-400/40 shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="text-xs font-bold tracking-wide text-emerald-300 uppercase font-heading">
            Zone Vocale · Onde Audio
          </span>
        </div>

        <button
          type="button"
          onClick={toggleListening}
          className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
            isListening
              ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isListening ? 'Arrêter micro' : 'Activer micro'}</span>
        </button>
      </div>

      {/* Instruction banner */}
      <div className="px-3.5 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium truncate">{promptLabel}</span>
        </div>

        {matchStatus === 'success' && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" /> Prononciation Validée !
          </span>
        )}
      </div>

      {/* Center Waveform & Audio Stage */}
      <div className="flex-1 min-h-[170px] bg-gradient-to-b from-slate-900 to-slate-950 p-4 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glowing backdrop circle */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-2xl transition-all pointer-events-none ${
            isListening ? 'bg-emerald-500/20 scale-125' : 'bg-slate-700/10 scale-90'
          }`}
        />

        {/* Dynamic Waveform Bars */}
        <div className="flex items-center justify-center gap-1.5 h-20 mb-3 z-10">
          {[...Array(14)].map((_, i) => {
            const distance = Math.abs(i - 6.5);
            const factor = Math.max(0.2, 1 - distance * 0.12);
            const dynamicHeight = isListening
              ? Math.max(8, (micVolume * factor * 0.9) + (Math.sin(Date.now() / 200 + i) * 12))
              : 8;

            return (
              <div
                key={i}
                style={{
                  height: `${Math.min(68, dynamicHeight)}px`,
                  transition: 'height 80ms ease-out',
                }}
                className={`w-1.5 sm:w-2 rounded-full ${
                  isListening
                    ? 'bg-gradient-to-t from-emerald-500 to-teal-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    : 'bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Live Recognized Text Box */}
        <div className="z-10 w-full max-w-sm bg-slate-800/80 backdrop-blur-md rounded-xl p-3 border border-slate-700/80 text-center">
          <p className="text-xs text-slate-400 font-medium mb-1">
            {isListening ? 'Parole détectée :' : 'Micro en veille - clique sur Activer'}
          </p>
          <p className="text-base sm:text-lg font-bold text-emerald-300 font-heading min-h-[28px] flex items-center justify-center">
            {transcript ? `« ${transcript} »` : isListening ? '...' : 'Silence'}
          </p>
        </div>
      </div>

      {/* Bottom Audio Helper & Quick simulation for accessibility */}
      <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-400 truncate">
          <span>Attendu :</span>
          <span className="font-semibold text-emerald-300 font-heading">
            {expectedPhrase || expectedKeywords.join(' / ') || 'Parle en anglais'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {expectedPhrase && (
            <button
              type="button"
              onClick={() => soundManager.speak(expectedPhrase, 'en-US')}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Écouter le modèle audio"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSimulateVoice()}
            className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            title="Tester la réponse si tu n'as pas de micro branché"
          >
            Simuler voix 🎙️
          </button>
        </div>
      </div>
    </div>
  );
};
