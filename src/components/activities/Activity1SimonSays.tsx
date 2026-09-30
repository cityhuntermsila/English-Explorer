import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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

export const Activity1SimonSays: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const steps = [
    {
      command: 'Show me your pencil!',
      french: 'Montre-moi ton crayon !',
      targetWord: 'PENCIL',
      icon: '✏️',
      actionKey: 'pencil',
      echo: 'pencil',
    },
    {
      command: 'Simon says: Stand up!',
      french: 'Jacques a dit : Lève-toi !',
      targetWord: 'STAND',
      icon: '🧍',
      actionKey: 'stand',
      echo: 'stand up',
    },
    {
      command: 'Show me your book!',
      french: 'Montre-moi ton livre !',
      targetWord: 'BOOK',
      icon: '📖',
      actionKey: 'book',
      echo: 'book',
    },
    {
      command: 'Simon says: Listen!',
      french: 'Jacques a dit : Écoute !',
      targetWord: 'LISTEN',
      icon: '👂',
      actionKey: 'listen',
      echo: 'listen',
    },
    {
      command: 'Show me your ruler!',
      french: 'Montre-moi ta règle !',
      targetWord: 'RULER',
      icon: '📏',
      actionKey: 'ruler',
      echo: 'ruler',
    },
  ];

  const [shuffledSteps, setShuffledSteps] = useState<typeof steps>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [hearts, setHearts] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  // Shuffle steps on component mount to randomize questions
  useEffect(() => {
    const shuffled = [...steps].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);
  }, []);

  const currentRound = shuffledSteps[currentStep] || steps[currentStep] || steps[0];
  const targetLetters = currentRound.targetWord.split('');

  useEffect(() => {
    if (shuffledSteps.length > 0) {
      setRevealedIndices([]);
      soundManager.speak(currentRound.command, 'en-US');
    }
  }, [currentStep, shuffledSteps]);

  const handleCardClick = (actionKey: string) => {
    if (actionKey === currentRound.actionKey) {
      handleSuccess();
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
      soundManager.speak(`Try again! Find: ${currentRound.targetWord}`, 'en-US');
    }
  };

  const handleLetterTileClick = (letter: string) => {
    const upper = letter.toUpperCase();
    let found = false;
    targetLetters.forEach((char, idx) => {
      if (char === upper && !revealedIndices.includes(idx)) {
        found = true;
        setRevealedIndices(prev => {
          const next = [...prev, idx];
          if (next.length >= targetLetters.length) {
            setTimeout(handleSuccess, 500);
          }
          return next;
        });
      }
    });

    if (found) {
      soundManager.playSuccess();
      onAwardStars(1);
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
    }
  };

  const handleSuccess = () => {
    soundManager.playSuccess();
    onAwardStars(2);
    confetti({ particleCount: 40, spread: 60 });
    setRevealedIndices(targetLetters.map((_, i) => i));

    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, 1200);
    } else {
      setIsCompleted(true);
      onComplete();
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
          if (lower.includes(currentRound.echo) || lower.includes(currentRound.targetWord.toLowerCase())) {
            handleSuccess();
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="pre-simon"
      title="Classroom Simon Says"
      unit="Pre-Unit"
      unitTag="pre-unit"
      pageIndex={1}
      totalSteps={steps.length}
      currentStep={currentStep}
      targetWord={currentRound.targetWord}
      revealedIndices={revealedIndices}
      promptEnglish={currentRound.command}
      promptFrench={currentRound.french}
      mascotSpeech={`Simon Says: ${currentRound.command}! Touch the card or say "${currentRound.targetWord}"!`}
      mascotFrench={`Jacques a dit : ${currentRound.french} ! Touche la carte ou dis "${currentRound.targetWord}" !`}
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
      onLetterTileClick={handleLetterTileClick}
      expectedTargets={[currentRound.targetWord, currentRound.actionKey.toUpperCase()]}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        if (query.includes(currentRound.targetWord) || query.includes(currentRound.actionKey.toUpperCase())) {
          handleSuccess();
        } else {
          for (const char of query) {
            handleLetterTileClick(char);
          }
        }
      }}
    >
      {/* Interactive School Objects & Action Cards directly on screen */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2.5 max-w-2xl mx-auto w-full">
        {[
          { key: 'pencil', label: 'Pencil', icon: '✏️', color: 'from-amber-400 to-yellow-500' },
          { key: 'book', label: 'Book', icon: '📖', color: 'from-red-400 to-rose-500' },
          { key: 'ruler', label: 'Ruler', icon: '📏', color: 'from-emerald-400 to-teal-500' },
          { key: 'stand', label: 'Stand Up', icon: '🧍', color: 'from-blue-400 to-indigo-500' },
          { key: 'sit', label: 'Sit Down', icon: '🪑', color: 'from-purple-400 to-fuchsia-500' },
          { key: 'listen', label: 'Listen', icon: '👂', color: 'from-cyan-400 to-sky-500' },
        ].map((item) => {
          const isTarget = item.key === currentRound.actionKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleCardClick(item.key)}
              className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b ${item.color} text-white shadow-lg border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer select-none font-heading ${
                isTarget ? 'border-amber-300 ring-2 sm:ring-4 ring-amber-300/40 animate-pulse' : 'border-white/50 opacity-90 hover:opacity-100'
              }`}
            >
              <span className="text-2xl sm:text-3xl mb-0.5 drop-shadow-md">{item.icon}</span>
              <span className="text-[11px] sm:text-xs font-black drop-shadow-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </GameActivityFrame>
  );
};
