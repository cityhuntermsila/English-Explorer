import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, Zap, Flame } from 'lucide-react';
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

export const Activity9ColorBlitz: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const blitzRounds = [
    { target: 'Red rubber!', color: 'Red', item: 'Rubber', icon: '🧼', colorHex: 'bg-red-500', word: 'RED' },
    { target: 'Green ruler!', color: 'Green', item: 'Ruler', icon: '📏', colorHex: 'bg-emerald-500', word: 'GREEN' },
    { target: 'Blue pen!', color: 'Blue', item: 'Pen', icon: '🖊️', colorHex: 'bg-blue-500', word: 'BLUE' },
    { target: 'Yellow pencil!', color: 'Yellow', item: 'Pencil', icon: '✏️', colorHex: 'bg-amber-400', word: 'YELLOW' },
    { target: 'Orange book!', color: 'Orange', item: 'Book', icon: '📖', colorHex: 'bg-orange-500', word: 'ORANGE' },
  ];

  const [shuffledRounds, setShuffledRounds] = useState<typeof blitzRounds>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(6);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(5);
  const [combo, setCombo] = useState<number>(1);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  // Shuffle blitz rounds on component mount
  useEffect(() => {
    const shuffled = [...blitzRounds].sort(() => Math.random() - 0.5);
    setShuffledRounds(shuffled);
  }, []);

  const currentRound = shuffledRounds[currentStep] || blitzRounds[currentStep] || blitzRounds[0];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            soundManager.playTick();
            setCombo(1);
            return 6; // restart round
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isCompleted]);

  useEffect(() => {
    if (isRunning) {
      soundManager.speak(currentRound.target, 'en-US');
    }
  }, [currentStep, isRunning]);

  const handleSelectCombo = (targetStr: string) => {
    if (!isRunning && !isCompleted) {
      setIsRunning(true);
    }

    if (targetStr === currentRound.target) {
      soundManager.playSuccess();
      const points = 2 * combo;
      onAwardStars(points);
      confetti({ particleCount: 30, spread: 60 });
      setCombo(c => Math.min(5, c + 1));
      setTimeLeft(6);

      if (currentStep < blitzRounds.length - 1) {
        setCurrentStep(s => s + 1);
      } else {
        setIsRunning(false);
        setIsCompleted(true);
        onAwardStars(5);
        soundManager.speak('Super blitz! All combos matched!', 'en-US');
        onComplete();
      }
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
      setCombo(1);
    }
  };

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
          const lower = text.toLowerCase();
          if (lower.includes(currentRound.color.toLowerCase()) || lower.includes(currentRound.item.toLowerCase())) {
            handleSelectCombo(currentRound.target);
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="u2-color-blitz"
      title="Color & School Items Blitz (Défi Éclair 5s)"
      unit="Unit 2"
      unitTag="unit-2"
      pageIndex={9}
      totalSteps={blitzRounds.length}
      currentStep={currentStep}
      targetWord={currentRound.word}
      revealedIndices={currentRound.word.split('').map((_, i) => i)}
      promptEnglish={`BLITZ! Find: "${currentRound.target}" before the clock ticks down!`}
      promptFrench={`DÉFI ÉCLAIR ! Trouve : "${currentRound.target}" avant la fin du chrono !`}
      mascotSpeech={
        isRunning
          ? `Blitz! Find "${currentRound.target}"! ${timeLeft}s left! Combo x${combo}!`
          : isCompleted
          ? 'Legendary! You crushed the blitz challenge!'
          : 'Ready for the rapid Color Blitz? Press Start!'
      }
      mascotFrench={isRunning ? `Trouve : ${currentRound.target} !` : 'Prêt pour le défi éclair ?'}
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
      onLetterTileClick={(l) => {
        const match = blitzRounds.find(r => r.target.startsWith(l.toUpperCase()) || r.color.startsWith(l.toUpperCase()));
        if (match) handleSelectCombo(match.target);
      }}
      expectedTargets={[currentRound.color.toUpperCase(), currentRound.item.toUpperCase(), currentRound.word]}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        if (query.includes(currentRound.color.toUpperCase()) || query.includes(currentRound.item.toUpperCase()) || query.includes(currentRound.word)) {
          handleSelectCombo(currentRound.target);
        }
      }}
    >
      <div className="flex flex-col items-center justify-center gap-4 max-w-xl mx-auto">
        {/* Blitz Speed & Combo Counter */}
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-2xl border-2 border-amber-300 shadow-2xl">
          <div className="flex items-center gap-1.5 text-amber-300 font-black font-heading text-sm sm:text-base">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-bounce" />
            <span>Combo : x{combo}</span>
          </div>

          <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black font-heading flex items-center justify-center text-lg shadow-md animate-pulse">
            {timeLeft}s
          </div>

          {!isRunning && !isCompleted && (
            <button
              type="button"
              onClick={() => {
                setIsRunning(true);
                setTimeLeft(6);
              }}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold font-heading cursor-pointer flex items-center gap-1 shadow-md"
            >
              <Play className="w-4 h-4" />
              <span>Démarrer</span>
            </button>
          )}
        </div>

        {/* Rapid Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {blitzRounds.map((r) => {
            const isTarget = r.target === currentRound.target;
            return (
              <button
                key={r.target}
                type="button"
                onClick={() => handleSelectCombo(r.target)}
                className={`p-3.5 rounded-2xl flex items-center gap-3 font-heading transition-all shadow-xl cursor-pointer border-3 select-none ${
                  isTarget && isRunning
                    ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-300/60 scale-105'
                    : 'bg-white/90 hover:bg-white text-slate-900 border-slate-300 hover:scale-105'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${r.colorHex} flex items-center justify-center text-2xl shadow-sm text-white shrink-0`}>
                  {r.icon}
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-black block leading-tight">
                    {r.target}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    {r.color}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </GameActivityFrame>
  );
};
