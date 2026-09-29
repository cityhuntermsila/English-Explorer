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

export const Activity8Timetable: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const scheduleSlots = [
    {
      day: 'Monday',
      subject: 'Maths',
      icon: '📐',
      sentence: 'On Monday, I have Maths!',
      french: 'Le lundi, j\'ai Mathématiques !',
      targetWord: 'MATHS',
    },
    {
      day: 'Tuesday',
      subject: 'English',
      icon: '🇬🇧',
      sentence: 'On Tuesday, I have English!',
      french: 'Le mardi, j\'ai Anglais !',
      targetWord: 'ENGLISH',
    },
    {
      day: 'Wednesday',
      subject: 'Science',
      icon: '🔬',
      sentence: 'On Wednesday, I have Science!',
      french: 'Le mercredi, j\'ai Sciences !',
      targetWord: 'SCIENCE',
    },
    {
      day: 'Thursday',
      subject: 'Arabic',
      icon: '📖',
      sentence: 'On Thursday, I have Arabic!',
      french: 'Le jeudi, j\'ai Arabe !',
      targetWord: 'ARABIC',
    },
    {
      day: 'Friday',
      subject: 'Sport',
      icon: '⚽',
      sentence: 'On Friday, I have Sport!',
      french: 'Le vendredi, j\'ai Sport !',
      targetWord: 'SPORT',
    },
  ];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [hearts, setHearts] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  const currentRound = scheduleSlots[currentStep] || scheduleSlots[0];
  const targetLetters = currentRound.targetWord.split('');

  useEffect(() => {
    setRevealedIndices([]);
    soundManager.speak(currentRound.sentence, 'en-US');
  }, [currentStep]);

  const handleSelectSubject = (subj: string) => {
    if (subj === currentRound.subject) {
      handleSuccess();
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
      soundManager.speak(`Not ${subj}! On ${currentRound.day}, we have: ${currentRound.subject}!`, 'en-US');
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

    if (currentStep < scheduleSlots.length - 1) {
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
          if (lower.includes(currentRound.subject.toLowerCase()) || lower.includes(currentRound.day.toLowerCase())) {
            handleSuccess();
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="u2-timetable"
      title="Timetable Master (Emploi du Temps)"
      unit="Unit 2"
      unitTag="unit-2"
      pageIndex={8}
      totalSteps={scheduleSlots.length}
      currentStep={currentStep}
      targetWord={currentRound.targetWord}
      revealedIndices={revealedIndices}
      promptEnglish={currentRound.sentence}
      promptFrench={currentRound.french}
      mascotSpeech={`Timetable Master! Say: "${currentRound.sentence}" or touch "${currentRound.subject}"!`}
      mascotFrench={`Lis à voix haute : "${currentRound.sentence}" ou touche "${currentRound.subject}" !`}
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
      expectedTargets={[currentRound.targetWord, currentRound.subject.toUpperCase(), currentRound.day.toUpperCase()]}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        if (query.includes(currentRound.targetWord) || query.includes(currentRound.subject.toUpperCase())) {
          handleSuccess();
        } else {
          for (const char of query) {
            handleLetterTileClick(char);
          }
        }
      }}
    >
      {/* Visual Weekly Timetable Grid */}
      <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 w-full">
          {scheduleSlots.map((slot, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={slot.day}
                className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center font-heading border-2 transition-all ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-300/50 scale-102 shadow-xl'
                    : isDone
                    ? 'bg-emerald-500 text-white border-emerald-300 shadow-md'
                    : 'bg-black/40 text-white/70 border-white/20'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-bold uppercase font-mono">
                  {slot.day.slice(0, 3)}
                </span>
                <span className="text-xl sm:text-2xl my-0.5 sm:my-1">
                  {isDone || isCurrent ? slot.icon : '❓'}
                </span>
                <span className="text-[11px] sm:text-xs font-black truncate max-w-full">
                  {isDone ? slot.subject : isCurrent ? 'À trouver !' : '---'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Available Subject Choice Cards */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {scheduleSlots.map((s) => (
            <button
              key={s.subject}
              type="button"
              onClick={() => handleSelectSubject(s.subject)}
              className={`px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-extrabold text-xs sm:text-sm font-heading shadow-md border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                s.subject === currentRound.subject ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.subject}</span>
            </button>
          ))}
        </div>
      </div>
    </GameActivityFrame>
  );
};
