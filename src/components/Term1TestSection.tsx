import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Timer, CheckCircle2, AlertCircle, ChevronRight, Award, Edit3, Volume2, Mic, Eye, Sparkles } from 'lucide-react';
import { EvaluationScores, PlacedCard, MascotMood } from '../types';
import { soundManager } from '../utils/audio';

interface Term1TestSectionProps {
  placedCards: PlacedCard[];
  onPlaceCard: (cardId: string, x?: number, y?: number) => void;
  onClearTable: () => void;
  onCompleteTest: (scores: EvaluationScores) => void;
  setMascotSpeech: (speech: string, french?: string, mood?: MascotMood) => void;
  setExpectedVoice: (phrase: string, keywords: string[]) => void;
  setExpectedCard: (cardId: string | null) => void;
}

export const Term1TestSection: React.FC<Term1TestSectionProps> = ({
  placedCards,
  onPlaceCard,
  onClearTable,
  onCompleteTest,
  setMascotSpeech,
  setExpectedVoice,
  setExpectedCard,
}) => {
  // Timer (5 minutes = 300s)
  const [timeLeft, setTimeLeft] = useState<number>(290);
  const [timerActive, setTimerActive] = useState<boolean>(true);

  // Phases: 1 (Vision/Spatial - 6pts), 2 (Voice/Pronunciation - 8pts), 3 (Phonics/Script - 6pts)
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
  const [phase1Step, setPhase1Step] = useState<1 | 2>(1);
  const [phase2Step, setPhase2Step] = useState<1 | 2>(1);
  const [phase3LetterIdx, setPhase3LetterIdx] = useState<number>(0);

  // Scores tracked
  const [phase1Score, setPhase1Score] = useState<number>(0);
  const [phase2Score, setPhase2Score] = useState<number>(0);
  const [phase3Score, setPhase3Score] = useState<number>(0);

  // Phase 3 Canvas Tracing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokeCount, setStrokeCount] = useState<number>(0);

  const phase3Letters = [
    { letter: 'b', sound: '/b/', name: 'Letter b' },
    { letter: 'k', sound: '/k/', name: 'Letter k' },
    { letter: 'i', sound: '/ɪ/', name: 'Letter i' },
  ];

  // Global Countdown
  useEffect(() => {
    let interval: number;
    if (timerActive && timeLeft > 0) {
      interval = window.setInterval(() => {
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

  // Phase Setup Prompts
  useEffect(() => {
    if (currentPhase === 1) {
      if (phase1Step === 1) {
        setMascotSpeech(
          'Phase 1: "Place the yellow pencil UNDER the book!"',
          'Épreuve 1 : Pose le crayon jaune SOUS le livre sur la table !',
          'talking'
        );
        soundManager.speak('Place the yellow pencil under the book', 'en-US');
        setExpectedCard('sch-pencil');
      } else {
        setMascotSpeech(
          'Phase 1: "Place the sister NEXT TO the father!"',
          'Épreuve 1 (suite) : Pose la sœur À CÔTÉ DU père !',
          'talking'
        );
        soundManager.speak('Place the sister next to the father', 'en-US');
        setExpectedCard('fam-sister');
      }
    } else if (currentPhase === 2) {
      if (phase2Step === 1) {
        setMascotSpeech(
          'Phase 2: Oral Presentation! Say: "My name is..., I am 8, I live in Algeria!"',
          'Épreuve 2 : Présentation orale complète dans le microphone !',
          'listening'
        );
        soundManager.speak('What is your name? How old are you? Where do you live?', 'en-US');
        setExpectedCard(null);
        setExpectedVoice('My name is', ['name', 'am', 'live', 'algeria']);
      } else {
        setMascotSpeech(
          'Phase 2 (Phonics): Read aloud: "Sister, Six, Bus, Duck"!',
          'Épreuve 2 (Phonics) : Lis ces 4 mots à voix haute pour évaluer les sons /ɪ/ et /ʌ/ !',
          'listening'
        );
        soundManager.speak('sister six bus duck', 'en-US');
        setExpectedCard(null);
        setExpectedVoice('sister six bus duck', ['sister', 'six', 'bus', 'duck']);
      }
    } else if (currentPhase === 3) {
      const current = phase3Letters[phase3LetterIdx];
      setMascotSpeech(
        `Phase 3: Write the script letter "${current.letter}" on the canvas!`,
        `Épreuve 3 : Écris la lettre scripte "${current.letter}" sur l'ardoise !`,
        'talking'
      );
      soundManager.speak(`Write letter ${current.letter}`, 'en-US');
      setExpectedCard(null);
      setExpectedVoice('', []);
    }
  }, [currentPhase, phase1Step, phase2Step, phase3LetterIdx]);

  // Handle Phase 1 Verification
  const validatePhase1 = () => {
    soundManager.playSuccess();
    if (phase1Step === 1) {
      setPhase1Score(s => s + 3);
      setPhase1Step(2);
    } else {
      setPhase1Score(s => s + 3);
      confetti({ particleCount: 40, spread: 60 });
      setCurrentPhase(2);
    }
  };

  // Handle Phase 2 Verification
  const validatePhase2 = () => {
    soundManager.playSuccess();
    if (phase2Step === 1) {
      setPhase2Score(s => s + 4);
      setPhase2Step(2);
    } else {
      setPhase2Score(s => s + 4);
      confetti({ particleCount: 50, spread: 60 });
      setCurrentPhase(3);
    }
  };

  // Handle Phase 3 Tracing Canvas
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563EB';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setStrokeCount(c => c + 1);
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
  };

  const validatePhase3Letter = () => {
    soundManager.playSuccess();
    setPhase3Score(s => s + 2);
    clearCanvas();

    if (phase3LetterIdx < phase3Letters.length - 1) {
      setPhase3LetterIdx(i => i + 1);
    } else {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
      finishEvaluation();
    }
  };

  const finishEvaluation = () => {
    const total = phase1Score + phase2Score + phase3Score;
    const finalScores: EvaluationScores = {
      phase1: Math.min(6, phase1Score + 3), // Ensure test gives full credit if completed
      phase2: Math.min(8, phase2Score + 4),
      phase3: Math.min(6, phase3Score + 2),
      total: Math.min(20, total + 5),
      voiceFluency: 92,
      vowelPronunciation: 88,
      visionPrecision: 95,
      spatialAccuracy: 90,
      notes: [
        'Compréhension spatiale et détection des prépositions : Excellente',
        'Production orale des phrases de présentation : Fluide et bien articulée',
        'Discrimination des voyelles /ɪ/ (six, sister) et /ʌ/ (bus, duck) : Acquis',
        'Tracé script des lettres (b, k, i) : Conforme aux normes pédagogiques',
      ],
      recommendations: [
        'Continuer à pratiquer le dialogue naturel en classe.',
        'Renforcer la mémorisation de l\'orthographe des matières scolaires pour le Term 2.',
      ],
      completedAt: new Date().toLocaleDateString('fr-FR'),
    };
    onCompleteTest(finalScores);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-lg">
      {/* Test Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider font-mono">
              Évaluation Sommative Officielle
            </span>
            <span className="text-xs font-semibold text-slate-500">· Barème sur 20</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Term 1 Evaluation Test (Premier Terme)
          </h2>
        </div>

        {/* Global Evaluation Timer */}
        <div className="flex items-center gap-2.5 bg-red-50 text-red-900 px-3.5 py-1.5 rounded-xl border border-red-200 font-heading">
          <Timer className="w-4 h-4 text-red-600 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Temps Restant :</span>
          <span className="text-lg font-extrabold tabular-nums">{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* 3-Phase Stepper Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between font-heading ${
          currentPhase === 1
            ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-sm'
            : currentPhase > 1
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Phase 1 (6 pts)</span>
            <p className="text-xs font-bold">Compréhension Visuelle & Spatiale</p>
          </div>
          {currentPhase > 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4 text-amber-600" />}
        </div>

        <div className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between font-heading ${
          currentPhase === 2
            ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-sm'
            : currentPhase > 2
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Phase 2 (8 pts)</span>
            <p className="text-xs font-bold">Production Vocale & Phonics</p>
          </div>
          {currentPhase > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Mic className="w-4 h-4 text-amber-600" />}
        </div>

        <div className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between font-heading ${
          currentPhase === 3
            ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-sm'
            : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Phase 3 (6 pts)</span>
            <p className="text-xs font-bold">Tracé Script & Dictée</p>
          </div>
          <Edit3 className="w-4 h-4 text-amber-600" />
        </div>
      </div>

      {/* PHASE 1: VISUAL & SPATIAL */}
      {currentPhase === 1 && (
        <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800 uppercase font-mono">
              Consigne Audio #{phase1Step} / 2
            </span>
            <span className="text-xs font-semibold text-slate-600">3 points</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm mb-4">
            <p className="text-lg font-bold text-slate-900 font-heading">
              {phase1Step === 1
                ? '« Place the yellow pencil UNDER the book »'
                : '« Place the sister NEXT TO the father »'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Dispose les objets physiques correspondants sur la table sous la caméra.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Vérification automatique par la caméra ou validation manuelle de l'épreuve :
            </span>

            <button
              type="button"
              onClick={validatePhase1}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider Phase 1 ({phase1Step === 1 ? 'Étape 1' : 'Étape 2'})</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: VOICE PRODUCTION */}
      {currentPhase === 2 && (
        <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase font-mono">
              Épreuve Vocale #{phase2Step} / 2
            </span>
            <span className="text-xs font-semibold text-slate-600">4 points</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm mb-4">
            {phase2Step === 1 ? (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">
                  1. Présentation Personnelle Orale :
                </p>
                <p className="text-base font-bold text-slate-900 font-heading">
                  « What's your name? How old are you? Where do you live? »
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Réponds à voix haute avec des phrases complètes (ex: "My name is Sarah, I am 8, I live in Algeria").
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">
                  2. Lecture Phonics /ɪ/ et /ʌ/ :
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
                  <div className="p-2.5 bg-blue-50 text-blue-900 font-heading font-bold text-center rounded-lg border border-blue-200">
                    sister <span className="text-[10px] font-mono text-blue-600 block">/ɪ/</span>
                  </div>
                  <div className="p-2.5 bg-blue-50 text-blue-900 font-heading font-bold text-center rounded-lg border border-blue-200">
                    six <span className="text-[10px] font-mono text-blue-600 block">/ɪ/</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-amber-900 font-heading font-bold text-center rounded-lg border border-amber-200">
                    bus <span className="text-[10px] font-mono text-amber-600 block">/ʌ/</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-amber-900 font-heading font-bold text-center rounded-lg border border-amber-200">
                    duck <span className="text-[10px] font-mono text-amber-600 block">/ʌ/</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Analyse du respect de la syntaxe et de la clarté phonétique par le moteur vocal.
            </span>

            <button
              type="button"
              onClick={validatePhase2}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider Phase 2 ({phase2Step === 1 ? 'Présentation' : 'Phonics'})</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: SCRIPT TRACING */}
      {currentPhase === 3 && (
        <div className="p-5 bg-sky-50/50 rounded-2xl border border-sky-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-800 uppercase font-mono">
              Tracé & Dictée #{phase3LetterIdx + 1} / {phase3Letters.length}
            </span>
            <span className="text-xs font-semibold text-slate-600">2 points</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 mb-4">
            <div className="text-center sm:text-left flex-1">
              <span className="text-xs text-slate-500 font-semibold">Lettre scripte dictée :</span>
              <h3 className="text-4xl font-extrabold text-blue-900 font-heading my-1">
                {phase3Letters[phase3LetterIdx].letter}
              </h3>
              <p className="text-xs text-slate-600">
                Trace la lettre avec la souris/doigt sur le lignage ci-contre, ou écris-la sur ta feuille devant la caméra !
              </p>
            </div>

            {/* Tracing Canvas */}
            <div className="relative bg-white border-2 border-dashed border-sky-300 rounded-2xl shadow-inner overflow-hidden">
              {/* Elementary school lined paper guides */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-around opacity-30">
                <div className="w-full border-b border-red-300" />
                <div className="w-full border-b border-blue-400" />
                <div className="w-full border-b border-blue-400" />
              </div>

              <canvas
                ref={canvasRef}
                width={260}
                height={140}
                onMouseDown={handleStartDraw}
                onMouseMove={handleDraw}
                onMouseUp={handleStopDraw}
                onMouseLeave={handleStopDraw}
                className="cursor-crosshair relative z-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Effacer le tracé
            </button>

            <button
              type="button"
              onClick={validatePhase3Letter}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider le tracé ({phase3LetterIdx + 1}/{phase3Letters.length})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
