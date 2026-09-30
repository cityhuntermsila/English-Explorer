import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Volume2, Heart, Mic, MicOff, CheckCircle2, RotateCcw, Camera } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { MascotMood, ActivityId } from '../types';
import { ACTIVITIES_LIST } from '../data/curriculumData';
import mascotImg from '../assets/images/massi_fennec_mascot_1790628791368.jpg';
import { CameraOcrScannerModal } from './CameraOcrScannerModal';
import { pronunciationEvaluator, EvaluationResult } from '../utils/pronunciationEvaluator';

interface GameActivityFrameProps {
  activityId: ActivityId;
  title: string;
  unit: string;
  unitTag: string;
  pageIndex: number;
  totalActivities?: number;
  targetWord?: string;
  revealedIndices?: number[];
  promptEnglish: string;
  promptFrench?: string;
  mascotSpeech: string;
  mascotFrench?: string;
  mascotMood?: MascotMood;
  hearts: number;
  starsCount: number;
  currentStep: number;
  totalSteps: number;
  heroImage: string;
  isCompleted: boolean;
  onNextActivity: () => void;
  onBackToHub: () => void;
  onNavigate: (id: ActivityId) => void;
  isListeningMic: boolean;
  transcript?: string;
  onToggleMic: () => void;
  onLetterTileClick?: (letter: string) => void;
  customLetterTiles?: { letter: string; isVowel?: boolean }[];
  expectedTargets?: string[];
  onScanResult?: (text: string, matchedTarget?: string) => void;
  children?: React.ReactNode;
  bottomTray?: React.ReactNode;
}

export const GameActivityFrame: React.FC<GameActivityFrameProps> = ({
  activityId,
  title,
  unit,
  unitTag,
  pageIndex,
  totalActivities = 10,
  targetWord,
  revealedIndices = [],
  promptEnglish,
  promptFrench,
  mascotSpeech,
  mascotFrench,
  mascotMood = 'happy',
  hearts,
  starsCount,
  currentStep,
  totalSteps,
  heroImage,
  isCompleted,
  onNextActivity,
  onBackToHub,
  onNavigate,
  isListeningMic,
  transcript = '',
  onToggleMic,
  onLetterTileClick,
  customLetterTiles,
  expectedTargets = [],
  onScanResult,
  children,
  bottomTray,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [voiceEvaluation, setVoiceEvaluation] = useState<EvaluationResult | null>(null);

  const lettersArray = targetWord ? targetWord.toUpperCase().split('') : [];

  const targetsToEvaluate = [
    ...(targetWord ? [targetWord] : []),
    ...expectedTargets,
  ];

  const handleScanDetected = (detectedText: string, matchedTarget?: string) => {
    if (onScanResult) {
      onScanResult(detectedText, matchedTarget);
      return;
    }

    const clean = (matchedTarget || detectedText).toUpperCase();
    if (onLetterTileClick) {
      if (clean.length === 1) {
        onLetterTileClick(clean);
      } else if (targetWord) {
        for (const char of clean) {
          if (targetWord.toUpperCase().includes(char)) {
            onLetterTileClick(char);
          }
        }
      }
    }
  };

  // Actively evaluate and verify pronunciation when transcript changes
  React.useEffect(() => {
    if (!transcript || !isListeningMic) {
      if (!isListeningMic) setVoiceEvaluation(null);
      return;
    }

    const res = pronunciationEvaluator.evaluate(transcript, targetsToEvaluate);
    setVoiceEvaluation(res);

    if (res.isMatch) {
      soundManager.playSuccess();
      confetti({ particleCount: 35, spread: 60 });
      handleScanDetected(transcript, res.matchedTarget);
    }
  }, [transcript, isListeningMic]);

  // Full 26-letter tactile English alphabet tiles (red vowels, blue consonants)
  const defaultTiles = [
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

  const tilesToRender = customLetterTiles || defaultTiles;

  const currentIndex = ACTIVITIES_LIST.findIndex(a => a.id === activityId);
  const prevActivity = currentIndex > 0 ? ACTIVITIES_LIST[currentIndex - 1] : null;
  const nextActivity = currentIndex < ACTIVITIES_LIST.length - 1 ? ACTIVITIES_LIST[currentIndex + 1] : null;

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden select-none rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-amber-300 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] text-white shadow-2xl">
      {/* 1. UNIFIED COMPACT GAME TOP HUD (Navigation + Game status combined in 1 sleek row) */}
      <div className="shrink-0 flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-900/60 backdrop-blur-md border-b border-white/20 select-none">
        {/* Left: Hub back button + Prev/Next controls + Title */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToHub}
            className="px-2 sm:px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-heading shrink-0 shadow-xs"
            title="Retour au sommaire"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Sommaire</span>
          </button>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              disabled={!prevActivity}
              onClick={() => prevActivity && onNavigate(prevActivity.id)}
              className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
              title="Activité précédente"
            >
              <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              type="button"
              disabled={!nextActivity}
              onClick={() => nextActivity && onNavigate(nextActivity.id)}
              className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
              title="Activité suivante"
            >
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <div className="min-w-0 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-amber-200 uppercase font-mono px-1.5 py-0.5 rounded bg-black/30 border border-white/10 shrink-0 hidden sm:inline-block">
              {unit} · {pageIndex}/{totalActivities}
            </span>
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-white font-heading leading-tight truncate max-w-[130px] sm:max-w-xs md:max-w-md">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Dotted Progress Circles (visible on sm+) */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 bg-black/35 px-2.5 py-1 rounded-full border border-white/15 shrink-0">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all border ${
                i < currentStep
                  ? 'bg-amber-400 border-white shadow-[0_0_6px_#fde047]'
                  : i === currentStep
                  ? 'bg-white/50 border-amber-300 animate-pulse'
                  : 'bg-white/15 border-white/30 border-dashed'
              }`}
            />
          ))}
        </div>

        {/* Right: Speaker + Hearts + Stars */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => soundManager.speak(targetWord || promptEnglish, 'en-US')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-amber-900 shadow-xs flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Écouter la prononciation anglaise"
          >
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800" />
          </button>

          <div className="flex items-center gap-0.5 bg-black/35 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/20">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span className="text-[11px] font-bold font-mono text-white pl-0.5">{hearts}</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-2 sm:px-2.5 py-0.5 rounded-full font-heading text-xs sm:text-sm shadow-xs">
            <span>⭐</span>
            <span className="tabular-nums">{starsCount}</span>
          </div>
        </div>
      </div>

      {/* 2. CENTRAL VIVID VISUAL STAGE (Flex-1 min-h-0: stays strictly inside the screen display area!) */}
      <div className="relative flex-1 min-h-0 flex flex-col justify-between p-2 sm:p-3 overflow-hidden">
          {/* Scenic Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Activity Scene"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35" />
          </div>

          {/* Floating Prompt Card (Top Center) */}
          <div className="relative z-20 max-w-xl mx-auto bg-black/55 backdrop-blur-md px-3 sm:px-5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-white/25 text-center shadow-md shrink-0">
            <p className="text-xs sm:text-sm md:text-base font-extrabold text-white font-heading leading-tight">
              {promptEnglish}
            </p>
            {promptFrench && (
              <p className="text-[10px] sm:text-xs text-amber-200 mt-0.5 font-medium italic">
                {promptFrench}
              </p>
            )}
          </div>

          {/* Central Interactive Content / Child Canvas */}
          <div className="relative z-20 my-auto py-0.5 flex-1 min-h-0 flex flex-col items-center justify-center">
            {children}
          </div>

          {/* 3D Glossy Word Letter Slots (If targetWord is present) */}
          {targetWord && lettersArray.length > 0 && (
            <div className="relative z-20 flex flex-col items-center justify-center my-1 shrink-0">
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 md:gap-2 p-1 sm:p-1.5 bg-black/60 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30 shadow-xl max-w-full">
                {lettersArray.map((letter, idx) => {
                  const isRevealed = revealedIndices.includes(idx);
                  const isNextMissing = !isRevealed && (idx === 0 || revealedIndices.includes(idx - 1));

                  return (
                    <div
                      key={idx}
                      className={`w-6.5 h-8 sm:w-9 sm:h-11 md:w-11 md:h-13 rounded-lg sm:rounded-xl flex items-center justify-center font-black transition-all select-none font-heading shadow-md ${
                        isRevealed
                          ? 'bg-white text-blue-600 border border-white scale-105 shadow-blue-500/40'
                          : isNextMissing
                          ? 'bg-amber-400 text-slate-900 border-2 sm:border-3 border-white animate-pulse shadow-amber-400/50 scale-105'
                          : 'bg-white/25 border border-dashed border-white/50 text-transparent'
                      }`}
                    >
                      <span className="text-sm sm:text-lg md:text-2xl font-extrabold">
                        {isRevealed ? letter : isNextMissing ? '?' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completion Celebration Banner */}
          {isCompleted && (
            <div className="relative z-30 max-w-lg mx-auto my-1 px-3 sm:px-5 py-1 sm:py-1.5 bg-emerald-500 text-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-white flex items-center justify-between gap-3 animate-bounce shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                <div>
                  <span className="font-extrabold text-xs sm:text-sm font-heading block">
                    Activité validée avec succès ! ⭐
                  </span>
                  <span className="text-[10px] sm:text-xs text-emerald-100 font-medium">
                    Bravo ! Tu as réussi l'épreuve !
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onNextActivity}
                className="px-3 py-1 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer font-heading shrink-0"
              >
                Suivante →
              </button>
            </div>
          )}

          {/* Mascot in Corner + Direct Camera & Microphone Buttons */}
          <div className="relative z-20 flex items-center justify-between gap-2 mt-1 shrink-0">
            {/* Massi Mascot Dialogue */}
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/20 max-w-md shadow-md min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-amber-300 bg-amber-200 shrink-0">
                <img
                  src={mascotImg}
                  alt="Massi"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-bold text-white font-heading leading-tight truncate">
                  "{mascotSpeech}"
                </p>
                {mascotFrench && (
                  <p className="text-[9px] sm:text-[10px] text-amber-200 truncate italic">
                    {mascotFrench}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons: Camera OCR Scanner & Microphone Speech */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-200 hover:scale-105 active:scale-95 shrink-0"
                title="Scanner une carte physique ou une lettre avec la caméra (OCR Tesseract)"
              >
                <Camera className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="hidden sm:inline">Scanner</span> Carte 📷
              </button>

              <button
                type="button"
                onClick={onToggleMic}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer shrink-0 ${
                  isListeningMic
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-2 ring-red-400/50'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isListeningMic ? <MicOff className="w-3.5 h-3.5 shrink-0" /> : <Mic className="w-3.5 h-3.5 shrink-0" />}
                <span>{isListeningMic ? 'Écoute...' : 'Prononcer 🎙️'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Spoken Pronunciation Verification HUD */}
        {(isListeningMic || voiceEvaluation) && (
          <div className="shrink-0 mx-2 sm:mx-4 my-1 p-1.5 sm:p-2.5 bg-slate-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-emerald-400/80 shadow-xl flex items-center justify-between gap-2 text-white z-25 relative">
            <div className="flex items-center gap-2 min-w-0">
              <Mic className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold truncate">
                    Prononciation Vocale :
                  </span>
                  {voiceEvaluation && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold font-mono bg-emerald-500 text-white shrink-0">
                      {voiceEvaluation.score}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-200 truncate font-mono">
                  « {transcript || 'Parle maintenant...'} »
                </p>
              </div>
            </div>

            {targetWord && (
              <button
                type="button"
                onClick={() => {
                  soundManager.speak(targetWord, 'en-US');
                  handleScanDetected(targetWord, targetWord);
                }}
                className="px-2 py-1 rounded bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400/50 text-[10px] font-bold text-emerald-200 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Volume2 className="w-3 h-3" />
                <span>Tester</span>
              </button>
            )}
          </div>
        )}

        {/* C. Bottom Tactile Tray (Matches Photos 2, 4, 5, 7) */}
        <div className="shrink-0 p-1.5 sm:p-2.5 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/95 border-t border-white/20 select-none">
          {bottomTray ? (
            bottomTray
          ) : (
            <div>
              <div className="flex items-center justify-between gap-1 mb-1 px-1">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-300 font-heading">
                  Tuiles Tactiles (26 Lettres A-Z) :
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden md:inline">
                  (Rouge = Voyelles · Bleu = Consonnes)
                </span>
                {isListeningMic && (
                  <span className="text-[10px] text-emerald-400 font-mono animate-pulse">
                    Micro : « {transcript || 'Parle maintenant...'} »
                  </span>
                )}
              </div>

              {/* Grid of Chunky Red and Blue Letter Tiles - Flex-Wrapped so all 26 letters are directly visible and accessible */}
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-0.5 overflow-x-hidden">
                {tilesToRender.map((tile) => (
                  <button
                    key={tile.letter}
                    type="button"
                    onClick={() => onLetterTileClick && onLetterTileClick(tile.letter)}
                    className={`w-6.5 h-8 sm:w-8 sm:h-9.5 md:w-9.5 md:h-11 rounded-lg bg-white shadow-sm flex items-center justify-center font-black transition-all hover:scale-115 active:scale-90 cursor-pointer select-none font-heading border border-slate-200 hover:border-amber-400 hover:shadow-md ${
                      tile.isVowel ? 'text-red-600' : 'text-blue-700'
                    }`}
                    style={{
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.9)',
                    }}
                    title={`Lettre ${tile.letter} (${tile.isVowel ? 'Voyelle' : 'Consonne'})`}
                  >
                    <span className="text-sm sm:text-lg md:text-xl font-black">
                      {tile.letter}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Camera OCR Scanner Modal (Tesseract.js) */}
        <CameraOcrScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          targetWord={targetWord}
          expectedTargets={expectedTargets}
          activityTitle={title}
          onDetected={handleScanDetected}
        />
      </div>
    );
  };
