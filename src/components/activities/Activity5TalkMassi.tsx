import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameActivityFrame } from '../GameActivityFrame';
import { ActivityId } from '../../types';
import { soundManager } from '../../utils/audio';
import { voiceAssistant } from '../../utils/speechRecognition';
import mascotBg from '../../assets/images/massi_fennec_mascot_1790628791368.jpg';

interface ActivityProps {
  onComplete: () => void;
  onNextActivity: () => void;
  onBackToHub: () => void;
  onNavigate: (id: ActivityId) => void;
  starsCount: number;
  onAwardStars: (count: number) => void;
}

export const Activity5TalkMassi: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const dialogueSteps = [
    {
      question: "Hello! What's your name?",
      french: "Bonjour ! Comment tu t'appelles ?",
      targetWord: 'NAME',
      suggestedAnswers: ['My name is Amine', 'My name is Amina', 'My name is Sarah'],
      keywords: ['name', 'my name is', 'i am'],
      massiReply: "Nice to meet you! You have a wonderful name!",
    },
    {
      question: "How old are you?",
      french: "Quel âge as-tu ?",
      targetWord: 'EIGHT',
      suggestedAnswers: ['I am 7 years old', 'I am 8 years old', 'I am 9 years old'],
      keywords: ['7', '8', '9', 'seven', 'eight', 'nine', 'years'],
      massiReply: "Awesome! You are growing up so fast!",
    },
    {
      question: "Where do you live?",
      french: "Où habites-tu ?",
      targetWord: 'ALGERIA',
      suggestedAnswers: ['I live in Algeria', 'I live in Algiers', 'I live in Oran'],
      keywords: ['live', 'algeria', 'algiers', 'oran', 'constantine'],
      massiReply: "Algeria is a magnificent country! I love the Sahara desert!",
    },
    {
      question: "What languages do you speak?",
      french: "Quelles langues parles-tu ?",
      targetWord: 'ENGLISH',
      suggestedAnswers: ['I speak Arabic and English', 'I speak French and English'],
      keywords: ['speak', 'arabic', 'english', 'french'],
      massiReply: "You speak English so clearly! Congratulations!",
    },
  ];

  const [shuffledSteps, setShuffledSteps] = useState<typeof dialogueSteps>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [hearts, setHearts] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isMassiSpeaking, setIsMassiSpeaking] = useState<boolean>(false);

  // Shuffle dialogue steps on component mount to randomize questions
  useEffect(() => {
    const shuffled = [...dialogueSteps].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);
  }, []);

  const currentRound = shuffledSteps[currentStep] || dialogueSteps[currentStep] || dialogueSteps[0];
  const targetLetters = currentRound.targetWord.split('');

  useEffect(() => {
    if (shuffledSteps.length > 0) {
      setRevealedIndices([]);
      soundManager.speak(currentRound.question, 'en-US');
    }
  }, [currentStep, shuffledSteps]);

  const handleSelectAnswer = (ans: string) => {
    soundManager.speak(ans, 'en-US');
    handleSuccess();
  };

  const handleSuccess = () => {
    soundManager.playSuccess();
    onAwardStars(2);
    confetti({ particleCount: 35, spread: 60 });
    setRevealedIndices(targetLetters.map((_, i) => i));

    setIsMassiSpeaking(true);
    soundManager.speak(currentRound.massiReply, 'en-US');

    setTimeout(() => {
      setIsMassiSpeaking(false);
      if (currentStep < dialogueSteps.length - 1) {
        setCurrentStep(s => s + 1);
      } else {
        setIsCompleted(true);
        onComplete();
      }
    }, 2200);
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
          const match = currentRound.keywords.some(k => lower.includes(k));
          if (match || lower.length > 3) {
            handleSuccess();
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="u1-talk-massi"
      title="Talk with Massi (Dialogue Oral)"
      unit="Unit 1"
      unitTag="unit-1"
      pageIndex={5}
      totalSteps={dialogueSteps.length}
      currentStep={currentStep}
      targetWord={currentRound.targetWord}
      revealedIndices={revealedIndices}
      promptEnglish={currentRound.question}
      promptFrench={currentRound.french}
      mascotSpeech={
        isMassiSpeaking
          ? currentRound.massiReply
          : currentRound.question
      }
      mascotFrench={currentRound.french}
      mascotMood={isMassiSpeaking ? 'cheering' : 'talking'}
      hearts={hearts}
      starsCount={starsCount}
      heroImage={mascotBg}
      isCompleted={isCompleted}
      onNextActivity={onNextActivity}
      onBackToHub={onBackToHub}
      onNavigate={onNavigate}
      isListeningMic={isListeningMic}
      transcript={transcript}
      onToggleMic={toggleMic}
      onLetterTileClick={(l) => {
        const upper = l.toUpperCase();
        targetLetters.forEach((char, idx) => {
          if (char === upper) {
            setRevealedIndices(prev => [...prev, idx]);
          }
        });
      }}
      expectedTargets={[currentRound.targetWord, ...currentRound.keywords.map(k => k.toUpperCase())]}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        if (query.includes(currentRound.targetWord) || currentRound.keywords.some(k => query.includes(k.toUpperCase()))) {
          handleSuccess();
        }
      }}
    >
      {/* Dialogue Choices & Audio Prompt */}
      <div className="flex flex-col items-center justify-center gap-3 max-w-xl mx-auto">
        <span className="text-xs font-bold text-amber-200 font-heading">
          Réponds à voix haute ou choisis une réponse :
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
          {currentRound.suggestedAnswers.map((ans) => (
            <button
              key={ans}
              type="button"
              onClick={() => handleSelectAnswer(ans)}
              className="px-4 py-2.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 font-extrabold text-xs sm:text-sm font-heading shadow-xl border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>💬</span>
              <span>« {ans} »</span>
            </button>
          ))}
        </div>
      </div>
    </GameActivityFrame>
  );
};
