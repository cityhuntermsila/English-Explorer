import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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

export const Activity4PhotoAlbum: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const familyRounds = [
    {
      role: 'Father',
      pronoun: 'He',
      sentence: 'He is my father.',
      french: 'C\'est mon père.',
      targetWord: 'FATHER',
      icon: '👨',
      color: 'bg-blue-500',
    },
    {
      role: 'Mother',
      pronoun: 'She',
      sentence: 'She is my mother.',
      french: 'C\'est ma mère.',
      targetWord: 'MOTHER',
      icon: '👩',
      color: 'bg-pink-500',
    },
    {
      role: 'Sister',
      pronoun: 'She',
      sentence: 'She is my sister.',
      french: 'C\'est ma sœur.',
      targetWord: 'SISTER',
      icon: '👧',
      color: 'bg-purple-500',
    },
    {
      role: 'Brother',
      pronoun: 'He',
      sentence: 'He is my brother.',
      french: 'C\'est mon frère.',
      targetWord: 'BROTHER',
      icon: '👦',
      color: 'bg-emerald-500',
    },
    {
      role: 'Grandfather',
      pronoun: 'He',
      sentence: 'He is my grandfather.',
      french: 'C\'est mon grand-père.',
      targetWord: 'GRANDPA',
      icon: '👴',
      color: 'bg-amber-600',
    },
  ];

  const [shuffledRounds, setShuffledRounds] = useState<typeof familyRounds>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [hearts, setHearts] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  // Shuffle rounds on component mount to randomize questions
  useEffect(() => {
    const shuffled = [...familyRounds].sort(() => Math.random() - 0.5);
    setShuffledRounds(shuffled);
  }, []);

  const currentRound = shuffledRounds[currentStep] || familyRounds[currentStep] || familyRounds[0];
  const targetLetters = currentRound.targetWord.split('');

  useEffect(() => {
    if (shuffledRounds.length > 0) {
      setRevealedIndices([]);
      soundManager.speak(currentRound.sentence, 'en-US');
    }
  }, [currentStep, shuffledRounds]);

  const handleSelectRole = (role: string) => {
    if (role === currentRound.role) {
      handleSuccess();
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
      soundManager.speak(`Not ${role}! Look for: ${currentRound.role}`, 'en-US');
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
    confetti({ particleCount: 35, spread: 60 });
    setRevealedIndices(targetLetters.map((_, i) => i));

    if (currentStep < familyRounds.length - 1) {
      setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, 1300);
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
          if (lower.includes(currentRound.role.toLowerCase()) || lower.includes('father') || lower.includes('mother')) {
            handleSuccess();
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="u1-photo-album"
      title="The Magic Photo Album"
      unit="Unit 1"
      unitTag="unit-1"
      pageIndex={4}
      totalSteps={familyRounds.length}
      currentStep={currentStep}
      targetWord={currentRound.targetWord}
      revealedIndices={revealedIndices}
      promptEnglish={`Who is ${currentRound.pronoun.toLowerCase()}? ${currentRound.sentence}`}
      promptFrench={`Qui est-ce ? ${currentRound.french}`}
      mascotSpeech={`Magic Photo Album! Who is ${currentRound.pronoun.toLowerCase()}? Tap "${currentRound.role}" or say "${currentRound.sentence}"!`}
      mascotFrench={`Qui est-ce ? Touche "${currentRound.role}" ou dis "${currentRound.sentence}" !`}
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
      onLetterTileClick={handleLetterTileClick}
      expectedTargets={familyRounds.map(r => r.role.toUpperCase())}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        for (const r of familyRounds) {
          if (query.includes(r.role.toUpperCase())) {
            handleSelectRole(r.role);
            return;
          }
        }
        for (const char of query) {
          handleLetterTileClick(char);
        }
      }}
    >
      {/* Family Tree Character Cards on Screen */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl mx-auto">
        {familyRounds.map((member) => {
          const isTarget = member.role === currentRound.role;
          return (
            <button
              key={member.role}
              type="button"
              onClick={() => handleSelectRole(member.role)}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/95 text-slate-900 shadow-xl border-3 transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading ${
                isTarget
                  ? 'border-amber-400 ring-4 ring-amber-300/50 scale-105'
                  : 'border-slate-200 opacity-90'
              }`}
            >
              <span className="text-4xl mb-1.5">{member.icon}</span>
              <span className="text-xs sm:text-sm font-black">{member.role}</span>
              <span className="text-[10px] text-slate-500 font-medium">{member.pronoun}</span>
            </button>
          );
        })}
      </div>
    </GameActivityFrame>
  );
};
