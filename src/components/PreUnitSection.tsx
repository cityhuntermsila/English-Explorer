import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Flame, Play, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { SIMON_COMMANDS, PHONICS_POP_WORDS, ALL_FLASHCARDS } from '../data/curriculumData';
import { PlacedCard, MascotMood } from '../types';
import { soundManager } from '../utils/audio';

interface PreUnitSectionProps {
  activityId: 'pre-simon' | 'pre-phonics-pop' | 'pre-alphabet-dash';
  placedCards: PlacedCard[];
  onPlaceCard: (cardId: string, x?: number, y?: number) => void;
  onRemoveCard: (cardId: string) => void;
  onAwardStars: (count: number) => void;
  onCompleteActivity: () => void;
  onNextActivity: () => void;
  setMascotSpeech: (speech: string, french?: string, mood?: MascotMood) => void;
  setExpectedVoice: (phrase: string, keywords: string[]) => void;
  setExpectedCard: (cardId: string | null) => void;
}

export const PreUnitSection: React.FC<PreUnitSectionProps> = ({
  activityId,
  placedCards,
  onPlaceCard,
  onRemoveCard,
  onAwardStars,
  onCompleteActivity,
  onNextActivity,
  setMascotSpeech,
  setExpectedVoice,
  setExpectedCard,
}) => {
  // ---- Simon Says State ----
  const [simonStep, setSimonStep] = useState<number>(0);
  const [simonSuccess, setSimonSuccess] = useState<boolean>(false);
  const [simonCompleted, setSimonCompleted] = useState<boolean>(false);

  // ---- Phonics Pop State ----
  const [bubbles, setBubbles] = useState(
    PHONICS_POP_WORDS.map((w, idx) => ({ ...w, id: idx, popped: false }))
  );
  const [poppedCount, setPoppedCount] = useState<number>(0);
  const [phonicsCompleted, setPhonicsCompleted] = useState<boolean>(false);

  // ---- Alphabet Dash State ----
  const targetAlphabet = ['let-i', 'let-j', 'let-l', 'let-t', 'let-u'];
  const [dashTimeLeft, setDashTimeLeft] = useState<number>(30);
  const [dashIsRunning, setDashIsRunning] = useState<boolean>(false);
  const [dashWon, setDashWon] = useState<boolean>(false);

  // Initial prompt setup per game
  useEffect(() => {
    if (activityId === 'pre-simon') {
      const current = SIMON_COMMANDS[simonStep];
      setMascotSpeech(current.text, current.french, 'talking');
      soundManager.speak(current.text, 'en-US');
      if (current.expectedType === 'vision' && current.targetCardId) {
        setExpectedCard(current.targetCardId);
        setExpectedVoice('', []);
      } else {
        setExpectedCard(null);
        setExpectedVoice(current.voiceEcho, [current.voiceEcho]);
      }
    } else if (activityId === 'pre-phonics-pop') {
      setMascotSpeech(
        'Pop the bubbles with the short /ɪ/ sound! Say: Six, Sister, Tick, Live, In!',
        'Fais éclater les bulles avec le son court /ɪ/ en prononçant les mots à voix haute !',
        'talking'
      );
      setExpectedCard(null);
      setExpectedVoice('', ['six', 'sister', 'tick', 'live', 'in']);
    } else if (activityId === 'pre-alphabet-dash') {
      setMascotSpeech(
        'Speed Alphabet Dash! Place i, j, l, t, u in order before the candle melts!',
        'Défi chrono : Range les 5 lettres dans l\'ordre avant que la bougie ne fonde !',
        'talking'
      );
      setExpectedVoice('', []);
    }
  }, [activityId, simonStep]);

  // Check Simon Says Vision condition
  useEffect(() => {
    if (activityId === 'pre-simon') {
      const current = SIMON_COMMANDS[simonStep];
      if (current.expectedType === 'vision' && current.targetCardId) {
        const hasCard = placedCards.some(p => p.cardId === current.targetCardId);
        if (hasCard && !simonSuccess) {
          triggerSimonSuccess();
        }
      }
    }
  }, [placedCards, activityId, simonStep]);

  const triggerSimonSuccess = () => {
    setSimonSuccess(true);
    soundManager.playSuccess();
    onAwardStars(2);
    setMascotSpeech('Great job! You did it!', 'Super travail ! Consigne validée !', 'cheering');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      setSimonSuccess(false);
      if (simonStep < SIMON_COMMANDS.length - 1) {
        setSimonStep(s => s + 1);
      } else {
        setSimonCompleted(true);
        onCompleteActivity();
        setMascotSpeech('Amazing! You completed all classroom commands!', 'Incroyable, tu maîtrises toutes les consignes de classe !', 'cheering');
      }
    }, 2000);
  };

  // Pop a bubble (by voice or click)
  const handlePopBubble = (id: number) => {
    setBubbles(prev =>
      prev.map(b => {
        if (b.id === id && !b.popped) {
          if (b.hasTargetSound) {
            soundManager.playPop();
            onAwardStars(1);
            const newCount = poppedCount + 1;
            setPoppedCount(newCount);
            if (newCount >= 5) {
              setPhonicsCompleted(true);
              onCompleteActivity();
              confetti({ particleCount: 50, spread: 60 });
              setMascotSpeech('Brilliant! All /ɪ/ phonics bubbles popped!', 'Brillant ! Toutes les bulles du son /ɪ/ sont éclatées !', 'cheering');
            }
            return { ...b, popped: true };
          } else {
            soundManager.playTick();
            setMascotSpeech(
              `"${b.word}" has the /ʌ/ sound (like cup), not /ɪ/! Try words like "Six" or "Sister"!`,
              `Ce mot a le son /ʌ/, cherche les mots avec le son /ɪ/ !`,
              'thinking'
            );
            return b;
          }
        }
        return b;
      })
    );
  };

  // Alphabet Dash Timer Loop
  useEffect(() => {
    let timer: number;
    if (dashIsRunning && dashTimeLeft > 0 && !dashWon) {
      timer = window.setInterval(() => {
        setDashTimeLeft(t => {
          if (t <= 1) {
            setDashIsRunning(false);
            soundManager.playTick();
            setMascotSpeech('Time is up! Let\'s try again, you can do it!', 'Temps écoulé ! Réessaie, tu vas y arriver !', 'thinking');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dashIsRunning, dashTimeLeft, dashWon]);

  // Check Alphabet Dash order on table
  useEffect(() => {
    if (activityId === 'pre-alphabet-dash' && dashIsRunning && !dashWon) {
      const letterCardsOnTable = placedCards
        .filter(p => targetAlphabet.includes(p.cardId))
        .sort((a, b) => a.x - b.x)
        .map(p => p.cardId);

      if (letterCardsOnTable.length === 5) {
        const isCorrect = letterCardsOnTable.every((id, idx) => id === targetAlphabet[idx]);
        if (isCorrect) {
          setDashWon(true);
          setDashIsRunning(false);
          soundManager.playSuccess();
          onAwardStars(5);
          onCompleteActivity();
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
          setMascotSpeech(
            'Alphabet Champion! You ordered i, j, l, t, u in record time!',
            'Champion de l\'alphabet ! Tu as rangé toutes les lettres avant la bougie !',
            'cheering'
          );
        }
      }
    }
  }, [placedCards, activityId, dashIsRunning, dashWon]);

  const startAlphabetDash = () => {
    setDashTimeLeft(30);
    setDashWon(false);
    setDashIsRunning(true);
    setMascotSpeech('Go, go, go! Place i, j, l, t, u from left to right!', 'C\'est parti ! Place les lettres de gauche à droite !', 'cheering');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Activity 1: Simon Says */}
      {activityId === 'pre-simon' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 1/10 · Consigne {simonStep + 1} / {SIMON_COMMANDS.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                {SIMON_COMMANDS[simonStep].text}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {SIMON_COMMANDS[simonStep].french}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-heading ${
                SIMON_COMMANDS[simonStep].expectedType === 'vision'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {SIMON_COMMANDS[simonStep].expectedType === 'vision' ? 'Reconnaissance Visuelle' : 'Reconnaissance Vocale'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="text-sm text-slate-700">
              <p className="font-semibold text-amber-900">Action demandée par Massi :</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {SIMON_COMMANDS[simonStep].expectedType === 'vision'
                  ? `👉 Pose l'objet ou la carte "${SIMON_COMMANDS[simonStep].actionText}" dans la zone Table en bas à gauche.`
                  : `👉 Répète "${SIMON_COMMANDS[simonStep].voiceEcho}" dans le micro de la zone Vocale en bas à droite.`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => triggerSimonSuccess()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm font-heading shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider l'action</span>
            </button>
          </div>

          {simonCompleted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Activité 1 terminée avec succès ! ⭐ +{SIMON_COMMANDS.length * 2} étoiles</span>
              </div>
              <button
                type="button"
                onClick={onNextActivity}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer font-heading"
              >
                Passer à l'Activité 2 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity 2: Phonics Pop */}
      {activityId === 'pre-phonics-pop' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 2/10 · Son Phonics /ɪ/ (Short I)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                Phonics Pop : Fais éclater les bulles avec le son /ɪ/ !
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Bulles /ɪ/ éclatées :</span>
              <p className="text-lg font-bold text-emerald-600 font-heading tabular-nums">
                {poppedCount} / 5
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-sky-50/60 rounded-2xl border border-sky-100 min-h-[180px] mb-4">
            {bubbles.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => handlePopBubble(b.id)}
                disabled={b.popped}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer font-heading select-none ${
                  b.popped
                    ? 'opacity-20 scale-90 bg-slate-200 border border-slate-300'
                    : b.hasTargetSound
                    ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg hover:scale-105 hover:shadow-sky-400/40'
                    : 'bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md hover:scale-105'
                }`}
              >
                <span className="text-xl font-bold tracking-wide">
                  {b.word}
                </span>
                <span className="text-[11px] opacity-80 mt-0.5 font-sans">
                  {b.translation}
                </span>
                <span className="text-[10px] font-mono mt-1 px-1.5 py-0.5 bg-black/20 rounded">
                  {b.soundType}
                </span>
                {b.popped && (
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-700">
                    💥
                  </span>
                )}
              </button>
            ))}
          </div>

          {phonicsCompleted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Activité 2 terminée avec succès ! Le son /ɪ/ est validé.</span>
              </div>
              <button
                type="button"
                onClick={onNextActivity}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer font-heading"
              >
                Passer à l'Activité 3 (Défi Chrono) →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity 3: Alphabet Dash */}
      {activityId === 'pre-alphabet-dash' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 3/10 · Défi Chronométré (30 Secondes)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                Speed Alphabet Dash (i, j, l, t, u)
              </h2>
              <p className="text-xs text-slate-500">
                Range les 5 lettres dans l'ordre alphabétique de gauche à droite sur la table !
              </p>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <div className="flex flex-col items-center">
                <Flame className={`w-5 h-5 text-amber-500 ${dashIsRunning ? 'animate-bounce' : ''}`} />
                <div className="w-4 h-12 bg-amber-200 rounded-sm overflow-hidden flex flex-col justify-end">
                  <div
                    style={{ height: `${(dashTimeLeft / 30) * 100}%` }}
                    className="w-full bg-amber-500 transition-all duration-1000"
                  />
                </div>
              </div>
              <div>
                <p className="text-[11px] text-amber-800 font-semibold uppercase">Bougie Chrono</p>
                <p className="text-2xl font-extrabold text-amber-900 font-heading tabular-nums">
                  00:{dashTimeLeft < 10 ? `0${dashTimeLeft}` : dashTimeLeft}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 mb-4">
            {targetAlphabet.map((id, index) => {
              const card = ALL_FLASHCARDS.find(c => c.id === id);
              const placed = placedCards.find(p => p.cardId === id);

              return (
                <div
                  key={id}
                  onClick={() => {
                    if (dashIsRunning) {
                      onPlaceCard(id, 20 + index * 15, 50);
                    }
                  }}
                  className={`w-14 h-18 sm:w-16 sm:h-22 rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer select-none font-heading ${
                    placed
                      ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold scale-105 shadow-md'
                      : 'bg-white text-slate-400 border-amber-300 hover:border-amber-400'
                  }`}
                  title="Clique pour placer la lettre sur la table"
                >
                  <span className="text-2xl sm:text-3xl font-bold">{card?.label}</span>
                  <span className="text-[10px] font-sans opacity-70">Pos. {index + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {dashWon
                ? '🎉 Défi réussi avec brio !'
                : dashIsRunning
                ? 'Glisse ou clique sur les cartes pour les ranger de gauche à droite sur la table...'
                : 'Appuie sur Démarrer pour allumer la bougie !'}
            </span>

            <div className="flex items-center gap-2">
              {!dashIsRunning && !dashWon && (
                <button
                  type="button"
                  onClick={startAlphabetDash}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Démarrer le Défi</span>
                </button>
              )}

              {(dashWon || dashTimeLeft === 0) && (
                <button
                  type="button"
                  onClick={startAlphabetDash}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-heading"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Recommencer</span>
                </button>
              )}

              {dashWon && (
                <button
                  type="button"
                  onClick={onNextActivity}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <span>Passer à l'Unit 1 (Activité 4) →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
