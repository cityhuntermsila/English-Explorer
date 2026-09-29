import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Timer, CheckCircle2 } from 'lucide-react';
import { GameActivityFrame } from '../GameActivityFrame';
import { ActivityId } from '../../types';
import { soundManager } from '../../utils/audio';
import { voiceAssistant } from '../../utils/speechRecognition';
import familyTreeBg from '../../assets/images/family_tree_illustration_1790628815257.jpg';

interface ActivityProps {
  onComplete: () => void;
  onNextActivity: () => void;
  onBackToHub: () => void;
  onNavigate: (id: ActivityId) => void;
  starsCount: number;
  onAwardStars: (count: number) => void;
}

export const Activity6FamilyRace: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const familyList = [
    { id: 'father', role: 'Father', icon: '👨', targetWord: 'DAD' },
    { id: 'mother', role: 'Mother', icon: '👩', targetWord: 'MUM' },
    { id: 'sister', role: 'Sister', icon: '👧', targetWord: 'SIS' },
    { id: 'brother', role: 'Brother', icon: '👦', targetWord: 'BRO' },
    { id: 'grandpa', role: 'Grandfather', icon: '👴', targetWord: 'GRAND' },
  ];

  const [placed, setPlaced] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(5);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

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
    setTimeLeft(45);
    setPlaced([]);
    soundManager.speak('Fast family assembly! 45 seconds on the clock! Go!', 'en-US');
  };

  const handlePlace = (id: string) => {
    if (!isRunning && !isCompleted) {
      setIsRunning(true);
    }

    if (!placed.includes(id)) {
      soundManager.playSuccess();
      const next = [...placed, id];
      setPlaced(next);

      const member = familyList.find(f => f.id === id);
      if (member) soundManager.speak(member.role, 'en-US');

      if (next.length === familyList.length) {
        setIsRunning(false);
        setIsCompleted(true);
        onAwardStars(5);
        confetti({ particleCount: 50, spread: 70 });
        soundManager.speak('Fantastic! Family tree fully assembled!', 'en-US');
        onComplete();
      }
    }
  };

  const currentTarget = familyList.find(f => !placed.includes(f.id)) || familyList[0];

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
          const match = familyList.find(
            f => !placed.includes(f.id) && (upper.includes(f.role.toUpperCase()) || upper.includes(f.targetWord))
          );
          if (match) handlePlace(match.id);
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="u1-family-race"
      title="Family Assembly Race (Défi Chrono 45s)"
      unit="Unit 1"
      unitTag="unit-1"
      pageIndex={6}
      totalSteps={familyList.length}
      currentStep={placed.length}
      targetWord={currentTarget.targetWord}
      revealedIndices={placed.length === familyList.length ? [0, 1, 2, 3, 4] : []}
      promptEnglish={`Assemble the full family tree in under 45 seconds! Next: ${currentTarget.role}!`}
      promptFrench={`Reconstitue l'arbre généalogique en moins de 45 secondes ! Suivant : ${currentTarget.role} !`}
      mascotSpeech={
        isRunning
          ? `Fast! ${timeLeft}s left! Place "${currentTarget.role}"!`
          : isCompleted
          ? 'Phenomenal speed! The family tree is completed!'
          : 'Ready for the 45s race? Press Start to assemble the family!'
      }
      mascotFrench={isRunning ? `Il te reste ${timeLeft}s !` : 'Prêt pour le défi chrono 45s ?'}
      hearts={hearts}
      starsCount={starsCount}
      heroImage={familyTreeBg}
      isCompleted={isCompleted}
      onNextActivity={onNextActivity}
      onBackToHub={onBackToHub}
      onNavigate={onNavigate}
      isListeningMic={isListeningMic}
      transcript={transcript}
      onToggleMic={toggleMic}
      onLetterTileClick={(l) => {
        const match = familyList.find(f => !placed.includes(f.id) && f.role.startsWith(l.toUpperCase()));
        if (match) handlePlace(match.id);
      }}
      expectedTargets={familyList.filter(f => !placed.includes(f.id)).map(f => f.role.toUpperCase())}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        const found = familyList.find(f => !placed.includes(f.id) && query.includes(f.role.toUpperCase()));
        if (found) handlePlace(found.id);
      }}
    >
      <div className="flex flex-col items-center justify-center gap-4 max-w-xl mx-auto">
        {/* Timer Bar */}
        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
          <div className="flex items-center gap-1.5 text-amber-300 font-black font-heading text-sm">
            <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Chrono Course :</span>
          </div>

          <div className="w-48 sm:w-64 h-5 bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/30">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-amber-400 to-emerald-400'
              }`}
              style={{ width: `${(timeLeft / 45) * 100}%` }}
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

        {/* Tree Frame Slots */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {familyList.map((f) => {
            const isDone = placed.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handlePlace(f.id)}
                className={`w-20 h-24 sm:w-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center font-heading transition-all border-3 ${
                  isDone
                    ? 'bg-white text-blue-700 border-amber-300 shadow-2xl scale-105 pointer-events-none'
                    : 'bg-white/25 border-dashed border-white/60 hover:bg-white/40 cursor-pointer text-white hover:scale-105'
                }`}
              >
                <span className="text-3xl sm:text-4xl mb-1">{f.icon}</span>
                <span className="text-xs font-black drop-shadow-sm">{f.role}</span>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </GameActivityFrame>
  );
};
