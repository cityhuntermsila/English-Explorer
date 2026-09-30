import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, Sparkles, Heart, Mic, MicOff, Camera, CameraOff, RefreshCw, Trophy, CheckCircle2, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { voiceAssistant } from '../utils/speechRecognition';
import { MascotMood, PlacedCard } from '../types';
import parrotImg from '../assets/images/osmo_words_parrot_1790630260148.jpg';
import mascotImg from '../assets/images/massi_fennec_mascot_1790628791368.jpg';

interface OsmoGameplayScreenProps {
  title: string;
  unitTag: string;
  onBackToMap: () => void;
  targetWord?: string; // e.g. "SISTER", "PENCIL", "MATHS"
  promptInstruction: string;
  frenchInstruction?: string;
  mascotSpeech: string;
  mascotFrench?: string;
  mascotMood?: MascotMood;
  starsCount: number;
  onAwardStars: (count: number) => void;
  onNextActivity?: () => void;
  children?: React.ReactNode;
  heroImage?: string;
  targetLetters?: string[]; // e.g. ['S', 'I', 'X'] or ['I', 'J', 'L', 'T', 'U']
  expectedVoiceKeywords?: string[];
  placedCards?: PlacedCard[];
  onPlaceCard?: (id: string, x?: number, y?: number) => void;
  onRemoveCard?: (id: string) => void;
}

export const OsmoGameplayScreen: React.FC<OsmoGameplayScreenProps> = ({
  title,
  unitTag,
  onBackToMap,
  targetWord = 'SISTER',
  promptInstruction,
  frenchInstruction,
  mascotSpeech,
  mascotFrench,
  mascotMood = 'happy',
  starsCount,
  onAwardStars,
  onNextActivity,
  children,
  heroImage,
  targetLetters,
  expectedVoiceKeywords = [],
  placedCards = [],
  onPlaceCard,
  onRemoveCard,
}) => {
  // Revealed letters in the active word slots (like Osmo Words in photos 1, 3, 4)
  const lettersArray = (targetWord || 'WORD').toUpperCase().split('');
  const [revealedIndices, setRevealedIndices] = useState<number[]>([1, 2]); // reveal some as hints
  const [hearts, setHearts] = useState<number>(5);
  const [floatingBonus, setFloatingBonus] = useState<string | null>(null);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Available Osmo Red & Blue Alphabet Tiles (Full 26-Letter English Alphabet)
  const availableTiles = [
    { letter: 'A', isVowel: true },
    { letter: 'B', isVowel: false },
    { letter: 'C', isVowel: false },
    { letter: 'D', isVowel: false },
    { letter: 'E', isVowel: true },
    { letter: 'F', isVowel: false },
    { letter: 'G', isVowel: false },
    { letter: 'H', isVowel: false },
    { letter: 'I', isVowel: true },
    { letter: 'J', isVowel: false },
    { letter: 'K', isVowel: false },
    { letter: 'L', isVowel: false },
    { letter: 'M', isVowel: false },
    { letter: 'N', isVowel: false },
    { letter: 'O', isVowel: true },
    { letter: 'P', isVowel: false },
    { letter: 'Q', isVowel: false },
    { letter: 'R', isVowel: false },
    { letter: 'S', isVowel: false },
    { letter: 'T', isVowel: false },
    { letter: 'U', isVowel: true },
    { letter: 'V', isVowel: false },
    { letter: 'W', isVowel: false },
    { letter: 'X', isVowel: false },
    { letter: 'Y', isVowel: true },
    { letter: 'Z', isVowel: false },
  ];

  // Reset revealed when targetWord changes
  useEffect(() => {
    setRevealedIndices([]);
  }, [targetWord]);

  // Handle letter tile selection (touch or camera detection)
  const handlePlayLetter = (letter: string) => {
    const upper = letter.toUpperCase();
    let hitFound = false;

    lettersArray.forEach((char, idx) => {
      if (char === upper && !revealedIndices.includes(idx)) {
        hitFound = true;
        setRevealedIndices(prev => [...prev, idx]);
      }
    });

    if (hitFound) {
      soundManager.playSuccess();
      onAwardStars(1);
      setFloatingBonus('+2');
      setTimeout(() => setFloatingBonus(null), 1200);

      // Check if whole word revealed
      const nextRevealedCount = revealedIndices.length + 1;
      if (nextRevealedCount >= lettersArray.length) {
        confetti({ particleCount: 50, spread: 60 });
        soundManager.speak(targetWord, 'en-US');
      }
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (isListeningMic) {
      voiceAssistant.stop();
      setIsListeningMic(false);
    } else {
      setIsListeningMic(true);
      setTranscript('');
      voiceAssistant.start(
        (text) => {
          setTranscript(text);
          // Check matching letters or words
          const clean = text.toUpperCase();
          let matched = false;

          lettersArray.forEach((char, idx) => {
            if (clean.includes(char) && !revealedIndices.includes(idx)) {
              matched = true;
              setRevealedIndices(prev => [...prev, idx]);
            }
          });

          if (matched || (expectedVoiceKeywords.length > 0 && expectedVoiceKeywords.some(kw => text.toLowerCase().includes(kw.toLowerCase())))) {
            soundManager.playSuccess();
            onAwardStars(2);
            confetti({ particleCount: 30, spread: 50 });
            setFloatingBonus('+5');
            setTimeout(() => setFloatingBonus(null), 1200);
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (useCamera) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setUseCamera(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setUseCamera(true);
      } catch (err) {
        console.warn('Camera blocked:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      voiceAssistant.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const isWordComplete = lettersArray.every((_, idx) => revealedIndices.includes(idx));

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden select-none rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-amber-300 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] text-white shadow-2xl">
      {/* 1. TOP OSMO GAMEPLAY HUD (Exact look of Photos 1, 3, 4, 7) */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-white/10 backdrop-blur-md border-b border-white/20">
        {/* Left: Round Back button + Title */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToMap}
            className="w-10 h-10 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer font-black"
            title="Retour au sommaire"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>

          <div>
            <span className="text-[10px] font-bold text-amber-200 uppercase font-mono tracking-wider block">
              {unitTag}
            </span>
            <h1 className="text-sm sm:text-base font-extrabold text-white font-heading leading-tight truncate max-w-xs sm:max-w-md">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Osmo Progress Dotted Circles (Matches Photos 1, 3, 4) */}
        <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/15">
          {lettersArray.map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all border-2 ${
                revealedIndices.includes(i)
                  ? 'bg-amber-400 border-white shadow-[0_0_8px_#fde047]'
                  : 'bg-white/20 border-white/40 border-dashed'
              }`}
            />
          ))}
        </div>

        {/* Right: Audio Speaker + Hearts Lives + Score */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hear pronunciation */}
          <button
            type="button"
            onClick={() => soundManager.speak(targetWord || mascotSpeech, 'en-US')}
            className="w-9 h-9 rounded-full bg-white/90 text-amber-900 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Écouter la prononciation"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
          </button>

          {/* Hearts Shelf (Matches Photo 4) */}
          <div className="flex items-center gap-1 bg-black/25 px-2.5 py-1.5 rounded-full border border-white/20">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 transition-all ${
                  i < hearts
                    ? 'text-red-500 fill-red-500 animate-pulse'
                    : 'text-white/30 fill-white/10'
                }`}
              />
            ))}
          </div>

          {/* Stars Score Pill */}
          <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full shadow-md font-heading text-xs sm:text-sm">
            <span>⭐</span>
            <span className="tabular-nums">{starsCount}</span>
          </div>
        </div>
      </div>

      {/* 2. CENTRAL VIVID VISUAL STAGE (Flex-1 min-h-0 for full viewport containment) */}
      <div className="relative flex-1 min-h-0 flex flex-col justify-between p-2 sm:p-4 overflow-hidden">
        {/* Background Visual Scene */}
        <div className="absolute inset-0">
          <img
            src={heroImage || parrotImg}
            alt="Osmo Game Scene"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90"
          />
          {/* Subtle contrast gradient for gameplay readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
        </div>

        {/* Live Camera View Overlay if active */}
        {useCamera && (
          <div className="absolute top-4 right-4 w-44 h-32 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-2xl z-30 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-2 text-[9px] font-mono bg-red-600 text-white px-1.5 py-0.2 rounded">
              Caméra Table
            </span>
          </div>
        )}

        {/* Floating Bonus Bubble Animation (+2, +5) */}
        {floatingBonus && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl sm:text-5xl font-black text-amber-300 font-heading drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-bounce z-40">
            {floatingBonus} ⭐
          </div>
        )}

        {/* Top Floating Prompt Card */}
        <div className="relative z-20 max-w-xl mx-auto bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center shadow-lg">
          <p className="text-sm sm:text-base font-extrabold text-white font-heading leading-snug">
            {promptInstruction}
          </p>
          {frenchInstruction && (
            <p className="text-xs text-amber-200 mt-0.5 font-medium italic">
              {frenchInstruction}
            </p>
          )}
        </div>

        {/* Activity-Specific Embed (if provided, e.g. tracing canvas or timetable) */}
        {children && (
          <div className="relative z-20 my-2">
            {children}
          </div>
        )}

        {/* 3. THE ICONIC OSMO WORD TILES BAR (Exact layout of Photos 1, 3, 4) */}
        <div className="relative z-20 flex flex-col items-center justify-center my-3">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 bg-black/50 backdrop-blur-md rounded-3xl border-2 border-white/30 shadow-2xl">
            {lettersArray.map((letter, idx) => {
              const isRevealed = revealedIndices.includes(idx);
              const isNextMissing = !isRevealed && (idx === 0 || revealedIndices.includes(idx - 1));

              return (
                <div
                  key={idx}
                  className={`w-11 h-13 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center font-black transition-all select-none font-heading shadow-xl ${
                    isRevealed
                      ? 'bg-white text-blue-600 border-2 border-white scale-105 shadow-blue-500/40'
                      : isNextMissing
                      ? 'bg-amber-400 text-slate-900 border-4 border-white animate-pulse shadow-amber-400/50 scale-105'
                      : 'bg-white/25 border-2 border-dashed border-white/50 text-transparent'
                  }`}
                  style={{
                    boxShadow: isRevealed
                      ? '0 6px 12px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.8)'
                      : undefined,
                  }}
                >
                  <span className="text-2xl sm:text-3xl font-extrabold">
                    {isRevealed ? letter : isNextMissing ? '?' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Word Completion Celebration Banner */}
          {isWordComplete && (
            <div className="mt-3 px-5 py-2.5 bg-emerald-500 text-white rounded-2xl shadow-xl border-2 border-white flex items-center gap-3 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="font-extrabold text-sm sm:text-base font-heading">
                Bravo ! Mot validé avec brio ! ⭐
              </span>
              {onNextActivity && (
                <button
                  type="button"
                  onClick={onNextActivity}
                  className="px-3.5 py-1 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition-all cursor-pointer font-heading"
                >
                  Suivant →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mascot in Corner (Massi le Fennec Waving, like the parrot character in Photo 4!) */}
        <div className="relative z-20 flex items-end justify-between gap-3 mt-2">
          {/* Mascot Lockup */}
          <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 max-w-md shadow-lg">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 bg-amber-200 shrink-0">
              <img
                src={mascotImg}
                alt="Massi"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-white font-heading leading-tight truncate sm:whitespace-normal">
                "{mascotSpeech}"
              </p>
              {mascotFrench && (
                <p className="text-[10px] text-amber-200 truncate sm:whitespace-normal italic">
                  {mascotFrench}
                </p>
              )}
            </div>
          </div>

          {/* Dual Action Controls: Mic + Camera Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleMic}
              className={`px-3 py-2 rounded-2xl font-heading font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                isListeningMic
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white'
              }`}
            >
              {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="hidden sm:inline">{isListeningMic ? 'Écoute...' : 'Prononcer 🎙️'}</span>
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`p-2 rounded-2xl transition-all shadow-md cursor-pointer ${
                useCamera ? 'bg-amber-400 text-slate-950' : 'bg-white/30 hover:bg-white/40 text-white'
              }`}
              title="Activer la caméra pour les cartes physiques"
            >
              {useCamera ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM TANGIBLE OSMO TILES TRAY (Matching Photos 2, 4, 5, 7) */}
      <div className="p-3 sm:p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-800 border-t-2 border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 font-heading">
              Tuiles Osmo (26 Lettres A-Z) :
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              (Rouge = Voyelles · Bleu = Consonnes)
            </span>
          </div>
          {isListeningMic && (
            <span className="text-xs text-emerald-400 font-mono animate-pulse">
              Micro : « {transcript || 'Parle maintenant...'} »
            </span>
          )}
        </div>

        {/* Grid of Red and Blue Osmo Letter Tiles - Flex-Wrapped so all 26 letters are visible */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 md:gap-2 p-0.5 sm:p-1 overflow-x-hidden">
          {availableTiles.map((tile) => (
            <button
              key={tile.letter}
              type="button"
              onClick={() => handlePlayLetter(tile.letter)}
              className={`w-7.5 h-9 sm:w-10 sm:h-12 md:w-11 md:h-13 rounded-lg sm:rounded-xl bg-white shadow-md flex items-center justify-center font-black transition-all hover:scale-115 active:scale-90 cursor-pointer select-none font-heading border border-slate-200 sm:border-2 hover:border-amber-400 hover:shadow-xl ${
                tile.isVowel ? 'text-red-600' : 'text-blue-700'
              }`}
              style={{
                boxShadow: '0 3px 5px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.9)',
              }}
              title={`Lettre ${tile.letter} (${tile.isVowel ? 'Voyelle' : 'Consonne'})`}
            >
              <span className="text-base sm:text-xl md:text-2xl font-black">
                {tile.letter}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
