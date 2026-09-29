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
    <div className="w-full flex flex-col gap-3">
      {/* 1. TOP INDEPENDENT PAGE BREADCRUMB HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHub}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-heading"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800" />
            <span>Sommaire des 10 activités</span>
          </button>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 font-mono">
            Activité {pageIndex} / {totalActivities}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!prevActivity}
            onClick={() => prevActivity && onNavigate(prevActivity.id)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer font-heading"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Précédente</span>
          </button>

          <button
            type="button"
            disabled={!nextActivity}
            onClick={() => nextActivity && onNavigate(nextActivity.id)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer font-heading"
          >
            <span className="hidden sm:inline">Suivante</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. THE GAMEPLAY SCREEN INTERFACE (Styled exactly as in the photo!) */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] text-white select-none">
        {/* A. Top Game HUD (Back button, Title, Dotted progress dots, Speaker, Hearts, Stars) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 bg-white/10 backdrop-blur-md border-b border-white/20">
          {/* Row on mobile: Title + Right items */}
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToHub}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer font-black shrink-0"
                title="Retour au sommaire"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              </button>

              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-200 uppercase font-mono tracking-wider block truncate">
                  {unit} · Activité {pageIndex}
                </span>
                <h1 className="text-xs sm:text-base font-extrabold text-white font-heading leading-tight truncate max-w-[170px] sm:max-w-md">
                  {title}
                </h1>
              </div>
            </div>

            {/* Mobile Hearts & Stars */}
            <div className="flex items-center gap-1.5 sm:hidden shrink-0">
              <button
                type="button"
                onClick={() => soundManager.speak(targetWord || promptEnglish, 'en-US')}
                className="w-7 h-7 rounded-full bg-white/95 text-amber-900 shadow-xs flex items-center justify-center cursor-pointer"
                title="Écouter la prononciation"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-800" />
              </button>

              <div className="flex items-center gap-0.5 bg-black/30 px-2 py-0.5 rounded-full border border-white/20">
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                <span className="text-[11px] font-bold font-mono pl-0.5">{hearts}</span>
              </div>

              <div className="flex items-center gap-0.5 bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full font-heading text-xs">
                <span>⭐</span>
                <span className="tabular-nums">{starsCount}</span>
              </div>
            </div>
          </div>

          {/* Center: Progress Dotted Circles (Matches the photo!) */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-black/25 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/15 mx-auto sm:mx-0">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-all border sm:border-2 ${
                  i < currentStep
                    ? 'bg-amber-400 border-white shadow-[0_0_8px_#fde047]'
                    : i === currentStep
                    ? 'bg-white/40 border-amber-300 animate-pulse'
                    : 'bg-white/15 border-white/30 border-dashed'
                }`}
              />
            ))}
          </div>

          {/* Desktop/Tablet Right Status */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Audio pronunciation speaker */}
            <button
              type="button"
              onClick={() => soundManager.speak(targetWord || promptEnglish, 'en-US')}
              className="w-9 h-9 rounded-full bg-white/95 text-amber-900 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Écouter la prononciation anglaise"
            >
              <Volume2 className="w-4.5 h-4.5 text-amber-800" />
            </button>

            {/* Hearts Shelf (Matches the photo!) */}
            <div className="flex items-center gap-1 bg-black/30 px-2.5 py-1.5 rounded-full border border-white/20">
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
            <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-3.5 py-1 rounded-full shadow-md font-heading text-xs sm:text-sm">
              <span>⭐</span>
              <span className="tabular-nums">{starsCount}</span>
            </div>
          </div>
        </div>

        {/* B. Central Vivid Visual Stage */}
        <div className="relative min-h-[300px] sm:min-h-[360px] md:min-h-[420px] flex flex-col justify-between p-3 sm:p-5 md:p-6 overflow-hidden">
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
          <div className="relative z-20 max-w-xl mx-auto bg-black/50 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/25 text-center shadow-lg">
            <p className="text-sm sm:text-base font-extrabold text-white font-heading leading-snug">
              {promptEnglish}
            </p>
            {promptFrench && (
              <p className="text-xs text-amber-200 mt-0.5 font-medium italic">
                {promptFrench}
              </p>
            )}
          </div>

          {/* Central Interactive Content / Child Canvas */}
          <div className="relative z-20 my-auto py-2">
            {children}
          </div>

          {/* 3D Glossy Word Letter Slots (If targetWord is present) */}
          {targetWord && lettersArray.length > 0 && (
            <div className="relative z-20 flex flex-col items-center justify-center my-2 sm:my-3">
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3 bg-black/55 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 border-white/30 shadow-2xl max-w-full">
                {lettersArray.map((letter, idx) => {
                  const isRevealed = revealedIndices.includes(idx);
                  const isNextMissing = !isRevealed && (idx === 0 || revealedIndices.includes(idx - 1));

                  return (
                    <div
                      key={idx}
                      className={`w-8 h-10 sm:w-12 sm:h-14 md:w-14 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black transition-all select-none font-heading shadow-xl ${
                        isRevealed
                          ? 'bg-white text-blue-600 border-2 border-white scale-105 shadow-blue-500/40'
                          : isNextMissing
                          ? 'bg-amber-400 text-slate-900 border-2 sm:border-4 border-white animate-pulse shadow-amber-400/50 scale-105'
                          : 'bg-white/25 border-2 border-dashed border-white/50 text-transparent'
                      }`}
                      style={{
                        boxShadow: isRevealed
                          ? '0 6px 14px rgba(0,0,0,0.35), inset 0 2px 2px rgba(255,255,255,0.9)'
                          : undefined,
                      }}
                    >
                      <span className="text-lg sm:text-2xl md:text-3xl font-extrabold">
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
            <div className="relative z-30 max-w-lg mx-auto mt-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 text-white rounded-2xl shadow-2xl border-2 border-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-bounce">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />
                <div>
                  <span className="font-extrabold text-xs sm:text-base font-heading block">
                    Activité validée avec succès ! ⭐
                  </span>
                  <span className="text-[11px] sm:text-xs text-emerald-100 font-medium">
                    Bravo ! Tu as réussi l'épreuve !
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onNextActivity}
                className="w-full sm:w-auto px-4 py-2 bg-white text-emerald-800 font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer font-heading shrink-0 text-center"
              >
                Activité Suivante →
              </button>
            </div>
          )}

          {/* Mascot in Corner + Direct Microphone Button */}
          <div className="relative z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 mt-3">
            {/* Massi Mascot Dialogue */}
            <div className="flex items-center gap-2 sm:gap-2.5 bg-black/45 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-white/20 max-w-md shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-300 bg-amber-200 shrink-0">
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

            {/* Action Buttons: Camera OCR Scanner & Microphone Speech */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-amber-200 hover:scale-105 active:scale-95"
                title="Scanner une carte physique ou une lettre avec la caméra (OCR Tesseract)"
              >
                <Camera className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Scanner Carte 📷</span>
              </button>

              <button
                type="button"
                onClick={onToggleMic}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-lg cursor-pointer ${
                  isListeningMic
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-400/50'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isListeningMic ? <MicOff className="w-4 h-4 shrink-0" /> : <Mic className="w-4 h-4 shrink-0" />}
                <span>{isListeningMic ? 'Écoute...' : 'Prononcer 🎙️'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Spoken Pronunciation Verification HUD */}
        {(isListeningMic || voiceEvaluation) && (
          <div className="mx-4 sm:mx-6 my-2 p-3 sm:p-4 bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-emerald-400/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white z-25 relative animate-fadeIn">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5 text-red-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    Vérification de la Prononciation Vocale
                  </span>
                  {voiceEvaluation && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        voiceEvaluation.isMatch
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : voiceEvaluation.score >= 40
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Score : {voiceEvaluation.score}%
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white truncate">
                  {transcript ? (
                    <>
                      Tu as prononcé : <strong className="font-bold text-amber-300">« {transcript} »</strong>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">Parle maintenant dans ton micro en anglais...</span>
                  )}
                </p>
                {voiceEvaluation?.feedback && (
                  <p
                    className={`text-[11px] font-medium mt-0.5 ${
                      voiceEvaluation.isMatch ? 'text-emerald-300 font-bold' : 'text-amber-200'
                    }`}
                  >
                    {voiceEvaluation.feedback}
                  </p>
                )}
              </div>
            </div>

            {/* Test Simulation Button */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {targetWord && (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.speak(targetWord, 'en-US');
                    handleScanDetected(targetWord, targetWord);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400/50 text-[11px] font-bold text-emerald-200 flex items-center gap-1 cursor-pointer transition-all"
                  title="Écouter la prononciation correcte et tester la validation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tester modèle ({targetWord})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* C. Bottom Tactile Tray (Matches Photos 2, 4, 5, 7) */}
        <div className="p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/90 border-t-2 border-white/20">
          {bottomTray ? (
            bottomTray
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 font-heading">
                    Tuiles de Lettres Tactiles ({tilesToRender.length} Lettres A-Z) :
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                    (Rouge = Voyelles · Bleu = Consonnes)
                  </span>
                </div>
                {isListeningMic && (
                  <span className="text-xs text-emerald-400 font-mono animate-pulse">
                    Micro actif : « {transcript || 'Parle maintenant...'} »
                  </span>
                )}
              </div>

              {/* Grid of Chunky Red and Blue Letter Tiles - Flex-Wrapped so all 26 letters are directly visible and accessible */}
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 md:gap-2 p-0.5 sm:p-1 overflow-x-hidden">
                {tilesToRender.map((tile) => (
                  <button
                    key={tile.letter}
                    type="button"
                    onClick={() => onLetterTileClick && onLetterTileClick(tile.letter)}
                    className={`w-7.5 h-9 sm:w-10 sm:h-12 md:w-11 md:h-13 rounded-lg sm:rounded-xl bg-white shadow-md flex items-center justify-center font-black transition-all hover:scale-115 active:scale-90 cursor-pointer select-none font-heading border border-slate-200 sm:border-2 hover:border-amber-400 hover:shadow-xl ${
                      tile.isVowel ? 'text-red-600' : 'text-blue-700'
                    }`}
                    style={{
                      boxShadow: '0 3px 5px rgba(0,0,0,0.35), inset 0 2px 2px rgba(255,255,255,0.9)',
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
          )}
        </div>
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
