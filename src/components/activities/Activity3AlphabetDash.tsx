import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Flame } from 'lucide-react';
import { GameActivityFrame } from '../GameActivityFrame';
import { ActivityId } from '../../types';
import { soundManager } from '../../utils/audio';
import { voiceAssistant } from '../../utils/speechRecognition';
import classroomBg from '../../assets/images/classroom_desk_backdrop_1790628802837.jpg';

interface ActivityProps {
  onComplete: () => void;
  onNextActivity: () => void;
  onBackToHub: () => void;
  onNavigate: (id: ActivityId) => void;
  starsCount: number;
  onAwardStars: (count: number) => void;
}

export const Activity3AlphabetDash: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const targetAlphabet = ['I', 'J', 'L', 'T', 'U'];
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [scrambled, setScrambled] = useState<string[]>(['U', 'I', 'T', 'J', 'L']);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(5);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsRunning(false);
            soundManager.playTick();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isCompleted]);

  const handleStart = () => {
    setIsRunning(true);
    setTimeLeft(30);
    setPlacedLetters([]);
    setScrambled(['U', 'I', 'T', 'J', 'L']);
    soundManager.speak('Go! Place the letters in alphabetical order!', 'en-US');
  };

  const handleSelectLetter = (letter: string) => {
    if (!isRunning && !isCompleted) {
      setIsRunning(true);
    }

    const nextIndex = placedLetters.length;
    const expectedLetter = targetAlphabet[nextIndex];

    if (letter === expectedLetter) {
      soundManager.playSuccess();
      soundManager.speak(letter, 'en-US');
      setPlacedLetters(prev => [...prev, letter]);
      setScrambled(prev => prev.filter(l => l !== letter));

      if (nextIndex + 1 === targetAlphabet.length) {
        setIsRunning(false);
        setIsCompleted(true);
        onAwardStars(5);
        confetti({ particleCount: 50, spread: 70 });
        soundManager.speak('Super! Alphabet challenge complete!', 'en-US');
        onComplete();
      }
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
      soundManager.speak(`Not ${letter}! In the alphabet, find: ${expectedLetter}`, 'en-US');
    }
  };

  // Candle height calculation (0-100%)
  const candlePercent = Math.max(10, (timeLeft / 30) * 100);

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
          const upper = text.toUpperCase();
          for (const char of upper) {
            if (targetAlphabet.includes(char)) {
              handleSelectLetter(char);
            }
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="pre-alphabet-dash"
      title="Speed Alphabet Dash"
      unit="Pre-Unit"
      unitTag="pre-unit"
      pageIndex={3}
      totalSteps={targetAlphabet.length}
      currentStep={placedLetters.length}
      targetWord={targetAlphabet[placedLetters.length] || 'IJLTU'}
      revealedIndices={placedLetters.map((_, i) => i)}
      promptEnglish="Place letters I, J, L, T, U in alphabetical order before the candle melts!"
      promptFrench="Range les lettres I, J, L, T, U dans l'ordre alphabétique avant que la bougie ne fonde !"
      mascotSpeech={
        isRunning
          ? `Hurry! You have ${timeLeft}s left! Next letter is: ${targetAlphabet[placedLetters.length] || 'done'}!`
          : isCompleted
          ? 'Amazing speed! You sorted all 5 letters in time!'
          : 'Ready? Press Start and place the letters in order: I -> J -> L -> T -> U!'
      }
      mascotFrench={
        isRunning
          ? `Vite ! Il te reste ${timeLeft}s !`
          : 'Prêt ? Clique pour commencer le chrono de 30 secondes !'
      }
      hearts={hearts}
      starsCount={starsCount}
      heroImage={classroomBg}
      isCompleted={isCompleted}
      onNextActivity={onNextActivity}
      onBackToHub={onBackToHub}
      onNavigate={onNavigate}
      isListeningMic={isListeningMic}
      transcript={transcript}
      onToggleMic={toggleMic}
      onLetterTileClick={handleSelectLetter}
      expectedTargets={targetAlphabet}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        for (const char of query) {
          if (targetAlphabet.includes(char)) {
            handleSelectLetter(char);
          }
        }
      }}
    >
      <div className="flex flex-col items-center justify-center gap-4 max-w-xl mx-auto">
        {/* Animated Candle Timer Bar */}
        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
          <div className="flex items-center gap-1.5 text-amber-300 font-black font-heading text-sm">
            <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
            <span>Chrono Bougie :</span>
          </div>

          <div className="w-48 sm:w-64 h-5 bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/30">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${candlePercent}%` }}
            />
          </div>

          <span className="font-mono font-black text-white text-base tabular-nums">
            {timeLeft}s
          </span>

          {!isRunning && !isCompleted && (
            <button
              type="button"
              onClick={handleStart}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold font-heading cursor-pointer flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Go</span>
            </button>
          )}
        </div>

        {/* Target Alphabet Order Slots */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {targetAlphabet.map((letter, idx) => {
            const isFilled = placedLetters.includes(letter);
            return (
              <div
                key={idx}
                className={`w-14 h-18 sm:w-18 sm:h-22 rounded-2xl flex flex-col items-center justify-center font-black font-heading transition-all ${
                  isFilled
                    ? 'bg-white text-blue-600 border-4 border-amber-300 shadow-2xl scale-105'
                    : 'bg-white/20 border-3 border-dashed border-white/40 text-white/50'
                }`}
              >
                <span className="text-3xl sm:text-4xl">{isFilled ? letter : '?'}</span>
                <span className="text-[10px] font-mono uppercase mt-1 opacity-70">
                  #{idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Scrambled Available Letters Shelf */}
        <div className="flex items-center gap-2.5 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20">
          <span className="text-xs font-bold text-amber-200 font-heading mr-1">
            Choisis la suivante :
          </span>
          {scrambled.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => handleSelectLetter(l)}
              className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-white text-slate-900 shadow-xl flex items-center justify-center font-black text-2xl sm:text-3xl font-heading hover:scale-110 active:scale-95 cursor-pointer border-2 border-slate-300"
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </GameActivityFrame>
  );
};
