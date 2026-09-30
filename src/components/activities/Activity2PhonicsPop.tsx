import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameActivityFrame } from '../GameActivityFrame';
import { ActivityId } from '../../types';
import { soundManager } from '../../utils/audio';
import { voiceAssistant } from '../../utils/speechRecognition';
import parrotBg from '../../assets/images/osmo_words_parrot_1790630260148.jpg';

interface ActivityProps {
  onComplete: () => void;
  onNextActivity: () => void;
  onBackToHub: () => void;
  onNavigate: (id: ActivityId) => void;
  starsCount: number;
  onAwardStars: (count: number) => void;
}

interface BubbleWord {
  id: string;
  word: string;
  phonics: string;
  isTarget: boolean; // true if /ɪ/, false if /ʌ/
  popped: boolean;
}

export const Activity2PhonicsPop: React.FC<ActivityProps> = ({
  onComplete,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const initialBubbles: BubbleWord[] = [
    { id: 'b1', word: 'SIX', phonics: '/sɪks/', isTarget: true, popped: false },
    { id: 'b2', word: 'BUS', phonics: '/bʌs/', isTarget: false, popped: false },
    { id: 'b3', word: 'SISTER', phonics: '/ˈsɪstə/', isTarget: true, popped: false },
    { id: 'b4', word: 'CUP', phonics: '/kʌp/', isTarget: false, popped: false },
    { id: 'b5', word: 'TICK', phonics: '/tɪk/', isTarget: true, popped: false },
    { id: 'b6', word: 'RUG', phonics: '/rʌɡ/', isTarget: false, popped: false },
    { id: 'b7', word: 'LIVE', phonics: '/lɪv/', isTarget: true, popped: false },
    { id: 'b8', word: 'DUCK', phonics: '/dʌk/', isTarget: false, popped: false },
    { id: 'b9', word: 'IN', phonics: '/ɪn/', isTarget: true, popped: false },
  ];

  const [bubbles, setBubbles] = useState<BubbleWord[]>([]);
  const [hearts, setHearts] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  // Shuffle bubbles on component mount to randomize order
  useEffect(() => {
    const shuffled = [...initialBubbles].sort(() => Math.random() - 0.5);
    setBubbles(shuffled);
  }, []);

  const targetCount = initialBubbles.filter(b => b.isTarget).length;
  const currentPoppedTargets = bubbles.filter(b => b.isTarget && b.popped).length;

  // Active word to show in the Osmo 3D letter slots
  const activeUnpoppedTarget = bubbles.find(b => b.isTarget && !b.popped)?.word || 'SISTER';

  const popBubble = (bubble: BubbleWord) => {
    if (bubble.popped) return;

    soundManager.speak(bubble.word, 'en-US');

    if (bubble.isTarget) {
      soundManager.playPop();
      onAwardStars(2);
      confetti({ particleCount: 25, spread: 50 });

      setBubbles(prev => {
        const next = prev.map(b => (b.id === bubble.id ? { ...b, popped: true } : b));
        const remainingTargets = next.filter(b => b.isTarget && !b.popped).length;
        if (remainingTargets === 0) {
          setIsCompleted(true);
          onComplete();
        }
        return next;
      });
    } else {
      soundManager.playTick();
      setHearts(h => Math.max(1, h - 1));
      soundManager.speak(`Oops! ${bubble.word} has the /ʌ/ sound, not /ɪ/!`, 'en-US');
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
          const upper = text.toUpperCase();
          const match = bubbles.find(b => !b.popped && upper.includes(b.word));
          if (match) {
            popBubble(match);
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  return (
    <GameActivityFrame
      activityId="pre-phonics-pop"
      title="Phonics Pop (Son Voyelle /ɪ/)"
      unit="Pre-Unit"
      unitTag="pre-unit"
      pageIndex={2}
      totalSteps={targetCount}
      currentStep={currentPoppedTargets}
      targetWord={activeUnpoppedTarget}
      revealedIndices={activeUnpoppedTarget.split('').map((_, i) => i)}
      promptEnglish="Pop ONLY the bubbles with the short /ɪ/ sound (Six, Sister, Tick, Live, In)!"
      promptFrench="Éclate UNIQUEMENT les bulles avec le son voyelle court /ɪ/ (Six, Sister, Tick, Live, In) !"
      mascotSpeech={`Pop the /ɪ/ bubbles! Click on them or speak: "Six", "Sister", "Tick"!`}
      mascotFrench={`Éclate les bulles en /ɪ/ ! Clique dessus ou prononce au micro !`}
      hearts={hearts}
      starsCount={starsCount}
      heroImage={parrotBg}
      isCompleted={isCompleted}
      onNextActivity={onNextActivity}
      onBackToHub={onBackToHub}
      onNavigate={onNavigate}
      isListeningMic={isListeningMic}
      transcript={transcript}
      onToggleMic={toggleMic}
      onLetterTileClick={(letter) => {
        const match = bubbles.find(b => !b.popped && b.word.startsWith(letter.toUpperCase()));
        if (match) popBubble(match);
      }}
      expectedTargets={bubbles.filter(b => !b.popped).map(b => b.word)}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        const found = bubbles.find(b => !b.popped && query.includes(b.word));
        if (found) popBubble(found);
      }}
    >
      {/* Floating Bubbles Stage */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto py-2">
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={b.popped}
            onClick={() => popBubble(b)}
            className={`p-3 sm:p-4 rounded-3xl backdrop-blur-md border-3 flex flex-col items-center justify-center transition-all cursor-pointer font-heading select-none ${
              b.popped
                ? 'opacity-20 scale-75 border-transparent bg-white/5 pointer-events-none'
                : 'hover:scale-110 active:scale-95 shadow-xl bg-white/25 hover:bg-white/40 border-white/60 text-white'
            }`}
          >
            <span className="text-2xl sm:text-3xl font-black drop-shadow-md">
              {b.popped ? '💥' : '🫧'} {b.word}
            </span>
            <span className="text-xs text-amber-200 font-mono mt-1">
              {b.phonics}
            </span>
          </button>
        ))}
      </div>
    </GameActivityFrame>
  );
};
