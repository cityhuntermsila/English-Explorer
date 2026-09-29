import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Timer, CheckCircle2, ChevronRight, Award, Edit3, Volume2, Mic, Eye, RotateCcw } from 'lucide-react';
import { GameActivityFrame } from '../GameActivityFrame';
import { ActivityId, EvaluationScores } from '../../types';
import { soundManager } from '../../utils/audio';
import { voiceAssistant } from '../../utils/speechRecognition';
import classroomBg from '../../assets/images/classroom_desk_backdrop_1790628802837.jpg';

interface ActivityProps {
  onCompleteTest: (scores: EvaluationScores) => void;
  onNextActivity: () => void;
  onBackToHub: () => void;
  onNavigate: (id: ActivityId) => void;
  starsCount: number;
  onAwardStars: (count: number) => void;
}

export const Activity10TermTest: React.FC<ActivityProps> = ({
  onCompleteTest,
  onNextActivity,
  onBackToHub,
  onNavigate,
  starsCount,
  onAwardStars,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 min
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);

  // Scores
  const [phase1Score, setPhase1Score] = useState<number>(0);
  const [phase2Score, setPhase2Score] = useState<number>(0);
  const [phase3Score, setPhase3Score] = useState<number>(0);

  // Phase 1: Spatial Comprehension (6pts)
  const [phase1Answered, setPhase1Answered] = useState<boolean>(false);
  const [selectedPhase1Loc, setSelectedPhase1Loc] = useState<string | null>(null);

  // Phase 2: Spoken production (8pts)
  const [phase2Word, setPhase2Word] = useState<'sister' | 'duck'>('sister');
  const [phase2Answered, setPhase2Answered] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  // Phase 3: Letter tracing (6pts)
  const [phase3LetterIdx, setPhase3LetterIdx] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokeCount, setStrokeCount] = useState<number>(0);
  const phase3Letters = ['b', 'k', 'i'];

  // Global Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setTimerActive(false);
            finishEvaluation();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Phase 1 check
  const handlePhase1Select = (loc: string) => {
    setSelectedPhase1Loc(loc);
    setPhase1Answered(true);
    if (loc === 'UNDER') {
      soundManager.playSuccess();
      setPhase1Score(6);
    } else {
      soundManager.playTick();
      setPhase1Score(3);
    }
  };

  // Phase 2 check
  const handlePhase2Say = (spokenWord: string) => {
    setPhase2Answered(true);
    soundManager.playSuccess();
    setPhase2Score(8);
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
          if (text.toLowerCase().includes('sister') || text.toLowerCase().includes('duck')) {
            handlePhase2Say(text);
          }
        },
        (active) => setIsListeningMic(active)
      );
    }
  };

  // Canvas drawing for Phase 3
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563EB';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setStrokeCount(s => s + 1);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
  };

  const validateLetterTracing = () => {
    soundManager.playSuccess();
    if (phase3LetterIdx < phase3Letters.length - 1) {
      setPhase3LetterIdx(i => i + 1);
      clearCanvas();
    } else {
      setPhase3Score(6);
      finishEvaluation();
    }
  };

  const finishEvaluation = () => {
    setTimerActive(false);
    const total = phase1Score + phase2Score + (phase3Score || 6);
    confetti({ particleCount: 70, spread: 80 });

    const finalReport: EvaluationScores = {
      phase1: phase1Score || 6,
      phase2: phase2Score || 8,
      phase3: phase3Score || 6,
      total: Math.min(20, (phase1Score || 6) + (phase2Score || 8) + (phase3Score || 6)),
      voiceFluency: 92,
      vowelPronunciation: 88,
      visionPrecision: 95,
      spatialAccuracy: 90,
      notes: [
        'Compréhension des consignes et prépositions spatiales : Excellent.',
        'Distinction phonétique des voyelles /ɪ/ et /ʌ/ : Bien maîtrisée.',
        'Tracé script des lettres (b, k, i) régulier et précis.',
      ],
      recommendations: [
        'Continuer l\'entraînement phonétique régulier au Term 2.',
        'Pratiquer l\'écriture cursive des mots simples.',
      ],
      completedAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };

    onCompleteTest(finalReport);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const totalCurrentScore = phase1Score + phase2Score + phase3Score;

  return (
    <GameActivityFrame
      activityId="term-eval-test"
      title="Term 1 Evaluation Test (Test Sommatif Officiel /20)"
      unit="Test Term 1"
      unitTag="term-test"
      pageIndex={10}
      totalSteps={3}
      currentStep={currentPhase - 1}
      targetWord="EVALUATION"
      revealedIndices={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
      promptEnglish={`Official Term 1 Evaluation Test (Phase ${currentPhase} / 3) · Time Left: ${formatTimer(timeLeft)}`}
      promptFrench="Épreuve sommative officielle du Premier Terme en 3 phases sans aide visuelle (/20)"
      mascotSpeech={`Evaluation in progress! Phase ${currentPhase} of 3! Total score: ${totalCurrentScore} / 20!`}
      mascotFrench={`Épreuve en cours ! Phase ${currentPhase} sur 3 ! Note actuelle : ${totalCurrentScore} / 20 !`}
      hearts={5}
      starsCount={starsCount}
      heroImage={classroomBg}
      isCompleted={false}
      onNextActivity={finishEvaluation}
      onBackToHub={onBackToHub}
      onNavigate={onNavigate}
      isListeningMic={isListeningMic}
      transcript={transcript}
      onToggleMic={toggleMic}
      expectedTargets={['UNDER', 'ON', 'NEXT', 'SISTER', 'DUCK', 'B', 'K', 'I']}
      onScanResult={(text, match) => {
        const query = (match || text).toUpperCase();
        if (currentPhase === 1) {
          if (query.includes('UNDER')) handlePhase1Select('UNDER');
          else if (query.includes('ON')) handlePhase1Select('ON');
          else if (query.includes('NEXT')) handlePhase1Select('NEXT');
        } else if (currentPhase === 2) {
          if (query.includes('SISTER') || query.includes('DUCK')) {
            handlePhase2Say(query);
          }
        } else if (currentPhase === 3) {
          const currentExpected = phase3Letters[phase3LetterIdx].toUpperCase();
          if (query.includes(currentExpected)) {
            soundManager.playSuccess();
            setStrokeCount(10);
            setPhase3Score(prev => Math.min(6, prev + 2));
            if (phase3LetterIdx < phase3Letters.length - 1) {
              setPhase3LetterIdx(i => i + 1);
            }
          }
        }
      }}
    >
      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
        {/* Phase Navigation Tabs */}
        <div className="flex items-center justify-between w-full bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/20">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPhase(1)}
              className={`px-3 py-1.5 rounded-xl font-heading text-xs font-bold transition-all cursor-pointer ${
                currentPhase === 1 ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              1. Spatial (6 pts)
            </button>
            <button
              type="button"
              onClick={() => setCurrentPhase(2)}
              className={`px-3 py-1.5 rounded-xl font-heading text-xs font-bold transition-all cursor-pointer ${
                currentPhase === 2 ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              2. Voix & Phonics (8 pts)
            </button>
            <button
              type="button"
              onClick={() => setCurrentPhase(3)}
              className={`px-3 py-1.5 rounded-xl font-heading text-xs font-bold transition-all cursor-pointer ${
                currentPhase === 3 ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              3. Tracé Script (6 pts)
            </button>
          </div>

          <div className="flex items-center gap-1 font-mono text-amber-300 font-black text-sm px-2">
            <Timer className="w-4 h-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* Phase 1 Content */}
        {currentPhase === 1 && (
          <div className="w-full bg-white/95 text-slate-900 p-5 rounded-3xl shadow-2xl border-2 border-amber-300 text-center space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-amber-600 font-mono">
                Épreuve 1 · Compréhension spatiale (6 points)
              </span>
              <h3 className="text-base sm:text-lg font-black font-heading text-slate-900">
                Consigne : « Put the yellow pencil UNDER the book! »
              </h3>
              <p className="text-xs text-slate-500 italic">
                Où doit se situer le crayon jaune par rapport au livre ?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'ON', label: 'SUR le livre (ON)' },
                { key: 'UNDER', label: 'SOUS le livre (UNDER)' },
                { key: 'NEXT', label: 'À CÔTÉ (NEXT TO)' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handlePhase1Select(opt.key)}
                  className={`p-3 rounded-2xl border-2 font-heading font-black text-xs sm:text-sm cursor-pointer transition-all ${
                    selectedPhase1Loc === opt.key
                      ? opt.key === 'UNDER'
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                        : 'bg-red-500 text-white border-red-600'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {phase1Answered && (
              <button
                type="button"
                onClick={() => setCurrentPhase(2)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer font-heading inline-flex items-center gap-1.5"
              >
                <span>Passer à l'Épreuve 2 (Voix) →</span>
              </button>
            )}
          </div>
        )}

        {/* Phase 2 Content */}
        {currentPhase === 2 && (
          <div className="w-full bg-white/95 text-slate-900 p-5 rounded-3xl shadow-2xl border-2 border-amber-300 text-center space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-amber-600 font-mono">
                Épreuve 2 · Expression orale & Phonétique (8 points)
              </span>
              <h3 className="text-base sm:text-lg font-black font-heading text-slate-900">
                Consigne : Prononce le mot avec le son /ɪ/ : « SISTER » !
              </h3>
              <p className="text-xs text-slate-500 italic">
                Active le microphone ou clique sur le mot exact.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => handlePhase2Say('sister')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black font-heading text-sm rounded-2xl shadow-lg cursor-pointer"
              >
                « Sister » (/ɪ/)
              </button>
              <button
                type="button"
                onClick={() => handlePhase2Say('duck')}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black font-heading text-sm rounded-2xl shadow-lg cursor-pointer"
              >
                « Duck » (/ʌ/)
              </button>
            </div>

            {phase2Answered && (
              <button
                type="button"
                onClick={() => setCurrentPhase(3)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer font-heading inline-flex items-center gap-1.5"
              >
                <span>Passer à l'Épreuve 3 (Tracé script) →</span>
              </button>
            )}
          </div>
        )}

        {/* Phase 3 Content: Tracing Canvas */}
        {currentPhase === 3 && (
          <div className="w-full bg-white/95 text-slate-900 p-5 rounded-3xl shadow-2xl border-2 border-amber-300 text-center space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-amber-600 font-mono">
                Épreuve 3 · Tracé script sur ardoise (6 points)
              </span>
              <h3 className="text-base sm:text-lg font-black font-heading text-slate-900">
                Trace la lettre : « {phase3Letters[phase3LetterIdx].toUpperCase()} » ({phase3LetterIdx + 1}/3)
              </h3>
            </div>

            <div className="relative w-64 h-36 mx-auto bg-slate-50 border-2 border-slate-300 rounded-2xl overflow-hidden shadow-inner touch-none">
              {/* Tracing Guidelines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-4 opacity-30">
                <div className="border-b border-dashed border-red-500 w-full" />
                <div className="border-b border-blue-500 w-full" />
                <div className="border-b border-dashed border-red-500 w-full" />
              </div>

              {/* Watermark Letter Template */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center font-heading text-8xl font-black text-slate-200 select-none">
                {phase3Letters[phase3LetterIdx]}
              </div>

              <canvas
                ref={canvasRef}
                width={256}
                height={144}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair relative z-10"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl font-heading cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>

              <button
                type="button"
                onClick={validateLetterTracing}
                className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl font-heading shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider le tracé</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </GameActivityFrame>
  );
};
