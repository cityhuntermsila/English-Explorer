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

export const Activity7HideSeek: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const prepositionRounds = [
    {
      instruction: 'Put the blue pen ON the book!',
      french: 'Mets le stylo bleu SUR le livre !',
      targetWord: 'ON',
      item: 'Blue Pen',
      itemIcon: '🖊️',
      location: 'ON_BOOK',
      locationLabel: 'SUR le Livre',
    },
    {
      instruction: 'Put the yellow pencil IN the schoolbag!',
      french: 'Mets le crayon jaune DANS le cartable !',
      targetWord: 'IN',
      item: 'Yellow Pencil',
      itemIcon: '✏️',
      location: 'IN_BAG',
      locationLabel: 'DANS le Cartable',
    },
    {
      instruction: 'Put the green ruler UNDER the book!',
      french: 'Mets la règle verte SOUS le livre !',
      targetWord: 'UNDER',
      item: 'Green Ruler',
      itemIcon: '📏',
      location: 'UNDER_BOOK',
      locationLabel: 'SOUS le Livre',
    },
    {
      instruction: 'Put the red rubber NEXT TO the pen!',
      french: 'Mets la gomme rouge À CÔTÉ du stylo !',
      targetWord: 'NEXT',
      item: 'Red Rubber',
      itemIcon: '🧼',
      location: 'NEXT_TO',
      locationLabel: 'À CÔTÉ',
    },
  ];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [hearts, setHearts] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('Blue Pen');

  const currentRound = prepositionRounds[currentStep] || prepositionRounds[0];
  const targetLetters = currentRound.targetWord.split('');

  useEffect(() => {
    setRevealedIndices([]);
    soundManager.speak(currentRound.instruction, 'en-US');
  }, [currentStep]);

  const handleLocationClick = (locKey: string) => {
    if (locKey === currentRound.location) {
      handleSuccess();
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
      soundManager.speak(`Not there! We need preposition: ${currentRound.targetWord}!`, 'en-US');
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

    if (currentStep < prepositionRounds.length - 1) {
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
          if (lower.includes(currentRound.targetWord.toLowerCase()) || lower.includes(currentRound.item.toLowerCase())) {
            handleSuccess();
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="u2-hide-seek"
      title="Hide & Seek School Things (Prépositions Spatiales)"
      unit="Unit 2"
      unitTag="unit-2"
      pageIndex={7}
      totalSteps={prepositionRounds.length}
      currentStep={currentStep}
      targetWord={currentRound.targetWord}
      revealedIndices={revealedIndices}
      promptEnglish={currentRound.instruction}
      promptFrench={currentRound.french}
      mascotSpeech={`Where does it go? ${currentRound.instruction} Tap the spot or spell "${currentRound.targetWord}"!`}
      mascotFrench={`Où va l'objet ? ${currentRound.french} Touche l'emplacement ou écris "${currentRound.targetWord}" !`}
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
      expectedTargets={[currentRound.targetWord, currentRound.item.toUpperCase(), 'IN', 'ON', 'UNDER']}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        if (query.includes(currentRound.targetWord) || query.includes(currentRound.item.toUpperCase())) {
          handleSuccess();
        } else {
          for (const char of query) {
            handleLetterTileClick(char);
          }
        }
      }}
    >
      {/* Interactive Desk Placement Zones */}
      <div className="flex flex-col items-center gap-3 max-w-xl mx-auto">
        <div className="flex items-center gap-2 bg-amber-400/90 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs font-heading">
          <span>Fourniture active :</span>
          <span className="text-sm">{currentRound.itemIcon} {currentRound.item}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {[
            { key: 'ON_BOOK', label: 'ON the book', icon: '📖 ⬆️' },
            { key: 'IN_BAG', label: 'IN the schoolbag', icon: '🎒 📥' },
            { key: 'UNDER_BOOK', label: 'UNDER the book', icon: '📖 ⬇️' },
            { key: 'NEXT_TO', label: 'NEXT TO the pen', icon: '🖊️ ➡️' },
          ].map((loc) => {
            const isTarget = loc.key === currentRound.location;
            return (
              <button
                key={loc.key}
                type="button"
                onClick={() => handleLocationClick(loc.key)}
                className={`p-3.5 rounded-2xl flex flex-col items-center justify-center font-heading transition-all shadow-xl cursor-pointer border-3 ${
                  isTarget
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-white animate-pulse'
                    : 'bg-white/90 hover:bg-white text-slate-900 border-slate-300'
                }`}
              >
                <span className="text-3xl mb-1">{loc.icon}</span>
                <span className="text-xs font-black text-center">{loc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </GameActivityFrame>
  );
};
