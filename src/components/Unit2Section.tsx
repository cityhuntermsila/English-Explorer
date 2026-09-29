import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Calendar, Backpack, Play, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { TIMETABLE_SLOTS, ALL_FLASHCARDS } from '../data/curriculumData';
import { PlacedCard, MascotMood } from '../types';
import { soundManager } from '../utils/audio';

interface Unit2SectionProps {
  activityId: 'u2-hide-seek' | 'u2-timetable' | 'u2-color-blitz';
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

export const Unit2Section: React.FC<Unit2SectionProps> = ({
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
  // ---- Hide & Seek Spatial State ----
  const spatialTasks = [
    {
      id: 'task-1',
      instruction: 'Put the blue pen ON the book!',
      french: 'Pose le stylo bleu SUR le livre !',
      targetItem: 'sch-pen',
      referenceItem: 'sch-book',
      prep: 'on',
    },
    {
      id: 'task-2',
      instruction: 'Put the yellow pencil UNDER the book!',
      french: 'Pose le crayon jaune SOUS le livre !',
      targetItem: 'sch-pencil',
      referenceItem: 'sch-book',
      prep: 'under',
    },
    {
      id: 'task-3',
      instruction: 'Put the red rubber NEXT TO the ruler!',
      french: 'Pose la gomme rouge À CÔTÉ DE la règle !',
      targetItem: 'sch-rubber',
      referenceItem: 'sch-ruler',
      prep: 'next_to',
    },
  ];
  const [spatialIndex, setSpatialIndex] = useState<number>(0);
  const [spatialSuccess, setSpatialSuccess] = useState<boolean>(false);
  const [spatialCompleted, setSpatialCompleted] = useState<boolean>(false);

  // ---- Timetable Master State ----
  const [unlockedSlots, setUnlockedSlots] = useState<{ [day: string]: boolean }>({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
  });
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [timetableCompleted, setTimetableCompleted] = useState<boolean>(false);

  // ---- Color & Item Blitz State ----
  const blitzItems = [
    { text: 'Red rubber!', cardId: 'sch-rubber', french: 'Gomme rouge !' },
    { text: 'Green ruler!', cardId: 'sch-ruler', french: 'Règle verte !' },
    { text: 'Blue pen!', cardId: 'sch-pen', french: 'Stylo bleu !' },
    { text: 'Yellow pencil!', cardId: 'sch-pencil', french: 'Crayon jaune !' },
    { text: 'Red book!', cardId: 'sch-book', french: 'Livre rouge !' },
  ];
  const [blitzIndex, setBlitzIndex] = useState<number>(0);
  const [blitzSeconds, setBlitzSeconds] = useState<number>(5);
  const [blitzIsRunning, setBlitzIsRunning] = useState<boolean>(false);
  const [blitzScore, setBlitzScore] = useState<number>(0);

  // Initial prompt setup
  useEffect(() => {
    if (activityId === 'u2-hide-seek') {
      const task = spatialTasks[spatialIndex];
      setMascotSpeech(task.instruction, task.french, 'talking');
      soundManager.speak(task.instruction, 'en-US');
      setExpectedCard(task.targetItem);
      setExpectedVoice('', [task.prep, 'book', 'pen', 'pencil']);
    } else if (activityId === 'u2-timetable') {
      const slot = TIMETABLE_SLOTS[selectedSlotIndex];
      setMascotSpeech(
        `Read aloud: "${slot.prompt}"`,
        `Lis à voix haute : « ${slot.prompt} »`,
        'talking'
      );
      soundManager.speak(slot.prompt, 'en-US');
      setExpectedCard(null);
      setExpectedVoice(slot.prompt, [slot.day.toLowerCase(), slot.subject.toLowerCase()]);
    } else if (activityId === 'u2-color-blitz') {
      setMascotSpeech(
        'Color & School Items Blitz! 5 seconds per item, find them fast!',
        'Défi chrono : 5 secondes par fourniture, réagis le plus vite possible !',
        'talking'
      );
      setExpectedCard(null);
      setExpectedVoice('', []);
    }
  }, [activityId, spatialIndex, selectedSlotIndex]);

  // Spatial Check Logic
  useEffect(() => {
    if (activityId === 'u2-hide-seek') {
      const currentTask = spatialTasks[spatialIndex];
      const targetCard = placedCards.find(p => p.cardId === currentTask.targetItem);
      const refCard = placedCards.find(p => p.cardId === currentTask.referenceItem);

      if (targetCard && refCard && !spatialSuccess) {
        let satisfied = false;
        if (currentTask.prep === 'on') {
          satisfied = Math.abs(targetCard.x - refCard.x) < 25 && targetCard.y <= refCard.y + 10;
        } else if (currentTask.prep === 'under') {
          satisfied = targetCard.y > refCard.y - 10;
        } else if (currentTask.prep === 'next_to') {
          satisfied = Math.abs(targetCard.x - refCard.x) > 10;
        }

        if (satisfied) {
          triggerSpatialSuccess();
        }
      }
    }
  }, [placedCards, activityId, spatialIndex, spatialSuccess]);

  const triggerSpatialSuccess = () => {
    setSpatialSuccess(true);
    soundManager.playSuccess();
    onAwardStars(3);
    confetti({ particleCount: 35, spread: 55 });
    setMascotSpeech('Spatial preposition matched perfectly!', 'Position spatiale validée avec succès !', 'cheering');

    setTimeout(() => {
      setSpatialSuccess(false);
      if (spatialIndex < spatialTasks.length - 1) {
        setSpatialIndex(i => i + 1);
      } else {
        setSpatialCompleted(true);
        onCompleteActivity();
        setMascotSpeech('You are the Master of prepositions (IN, ON, UNDER, NEXT TO)!', 'Tu maîtrises toutes les prépositions de lieu !', 'cheering');
      }
    }, 2000);
  };

  // Timetable unlock
  const handleUnlockCurrentSlot = () => {
    const slot = TIMETABLE_SLOTS[selectedSlotIndex];
    setUnlockedSlots(prev => ({ ...prev, [slot.day]: true }));
    soundManager.playSuccess();
    onAwardStars(2);
    confetti({ particleCount: 30, spread: 50 });
    setMascotSpeech(`Excellent! On ${slot.day}, you have ${slot.subject}!`, `Bravo ! Le ${slot.day}, tu as ${slot.subject} !`, 'cheering');

    if (selectedSlotIndex < TIMETABLE_SLOTS.length - 1) {
      setSelectedSlotIndex(i => i + 1);
    } else {
      setTimetableCompleted(true);
      onCompleteActivity();
    }
  };

  // Blitz Timer
  useEffect(() => {
    let timer: number;
    if (blitzIsRunning && blitzSeconds > 0) {
      timer = window.setInterval(() => {
        setBlitzSeconds(s => {
          if (s <= 1) {
            if (blitzIndex < blitzItems.length - 1) {
              setBlitzIndex(b => b + 1);
              return 5;
            } else {
              setBlitzIsRunning(false);
              soundManager.playSuccess();
              onCompleteActivity();
              setMascotSpeech(`Blitz completed! Score: ${blitzScore} / 5!`, `Fin du Blitz ! Score : ${blitzScore} / 5 !`, 'cheering');
              return 0;
            }
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [blitzIsRunning, blitzSeconds, blitzIndex, blitzScore]);

  const startBlitz = () => {
    setBlitzIndex(0);
    setBlitzSeconds(5);
    setBlitzScore(0);
    setBlitzIsRunning(true);
    setMascotSpeech(blitzItems[0].text, blitzItems[0].french, 'talking');
    soundManager.speak(blitzItems[0].text, 'en-US');
  };

  const handleBlitzItemHit = (cardId: string) => {
    if (!blitzIsRunning) return;
    if (blitzItems[blitzIndex].cardId === cardId) {
      soundManager.playSuccess();
      setBlitzScore(s => s + 1);
      onAwardStars(1);
      confetti({ particleCount: 20, spread: 40 });

      if (blitzIndex < blitzItems.length - 1) {
        setBlitzIndex(b => b + 1);
        setBlitzSeconds(5);
        const nextItem = blitzItems[blitzIndex + 1];
        setMascotSpeech(nextItem.text, nextItem.french, 'talking');
        soundManager.speak(nextItem.text, 'en-US');
      } else {
        setBlitzIsRunning(false);
        onCompleteActivity();
        setMascotSpeech('Blitz champion! Super quick reflexes!', 'Champion du Blitz ! Réflexes ultra rapides !', 'cheering');
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Activity 7: Hide & Seek School Things */}
      {activityId === 'u2-hide-seek' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 7/10 · Prépositions Spatiales ({spatialIndex + 1} / {spatialTasks.length})
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                {spatialTasks[spatialIndex].instruction}
              </h2>
              <p className="text-xs text-slate-500">
                {spatialTasks[spatialIndex].french}
              </p>
            </div>

            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-xl text-xs uppercase font-mono">
              Prep : {spatialTasks[spatialIndex].prep.toUpperCase()}
            </span>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-amber-900">Disposition attendue sur la table :</p>
              <p>1. Place la carte référence <strong>{ALL_FLASHCARDS.find(c => c.id === spatialTasks[spatialIndex].referenceItem)?.label}</strong></p>
              <p>2. Place ensuite <strong>{ALL_FLASHCARDS.find(c => c.id === spatialTasks[spatialIndex].targetItem)?.label}</strong> en position <strong>{spatialTasks[spatialIndex].prep.toUpperCase()}</strong></p>
            </div>

            <button
              type="button"
              onClick={() => {
                onPlaceCard(spatialTasks[spatialIndex].referenceItem, 50, 60);
                onPlaceCard(
                  spatialTasks[spatialIndex].targetItem,
                  50,
                  spatialTasks[spatialIndex].prep === 'on' ? 30 : 80
                );
                triggerSpatialSuccess();
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer font-heading shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider la position</span>
            </button>
          </div>

          {spatialCompleted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Activité 7 terminée avec succès ! Prépositions acquises.</span>
              </div>
              <button
                type="button"
                onClick={onNextActivity}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer font-heading"
              >
                Passer à l'Activité 8 (Timetable Master) →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity 8: Timetable Master */}
      {activityId === 'u2-timetable' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 8/10 · Emploi du Temps Hebdomadaire
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                Timetable Master
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Prononce chaque case pour débloquer la matière
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
            {TIMETABLE_SLOTS.map((slot, index) => {
              const isUnlocked = unlockedSlots[slot.day];
              const isCurrent = index === selectedSlotIndex;

              return (
                <button
                  key={slot.day}
                  type="button"
                  onClick={() => setSelectedSlotIndex(index)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer font-heading border-2 text-center select-none ${
                    isUnlocked
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-sm'
                      : isCurrent
                      ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-300 scale-102'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">
                    {slot.day}
                  </span>
                  <span className="text-3xl mb-1">{isUnlocked ? slot.icon : '❓'}</span>
                  <span className="text-sm font-bold">
                    {isUnlocked ? slot.subject : 'Matière cachée'}
                  </span>
                  {isUnlocked && (
                    <span className="text-[10px] text-emerald-600 font-bold mt-1">Validé ✓</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">À prononcer dans le micro :</p>
              <p className="text-base font-bold text-slate-900 font-heading mt-0.5">
                « {TIMETABLE_SLOTS[selectedSlotIndex].prompt} »
              </p>
            </div>

            <button
              type="button"
              onClick={handleUnlockCurrentSlot}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer font-heading shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider la lecture orale</span>
            </button>
          </div>

          {timetableCompleted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Activité 8 terminée avec succès ! Emploi du temps maîtrisé.</span>
              </div>
              <button
                type="button"
                onClick={onNextActivity}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer font-heading"
              >
                Passer à l'Activité 9 (Défi Blitz) →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity 9: Color & School Items Blitz */}
      {activityId === 'u2-color-blitz' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 9/10 · Défi Éclair (5 Secondes par Objet)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                Color & School Items Blitz
              </h2>
              <p className="text-xs text-slate-500">
                Trouve la bonne fourniture et clique dessus en moins de 5 secondes !
              </p>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-amber-800">Chrono Objet</p>
                <p className="text-2xl font-extrabold text-amber-900 font-heading tabular-nums text-center">
                  0{blitzSeconds}s
                </p>
              </div>
            </div>
          </div>

          {blitzIsRunning && (
            <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-md text-center mb-4 animate-pulse-subtle">
              <span className="text-xs uppercase font-mono tracking-widest text-amber-100">
                Objet {blitzIndex + 1} / {blitzItems.length}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading mt-1">
                "{blitzItems[blitzIndex].text}"
              </h3>
              <p className="text-xs text-amber-100 mt-1">
                ({blitzItems[blitzIndex].french})
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {ALL_FLASHCARDS.filter(c => c.category === 'school').map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleBlitzItemHit(item.id)}
                disabled={!blitzIsRunning}
                className="p-3 bg-slate-50 hover:bg-amber-100 border border-slate-200 hover:border-amber-400 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer font-heading select-none disabled:opacity-60"
              >
                <span className="text-3xl mb-1">{item.iconName}</span>
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {blitzIsRunning
                ? `⚡ Vite ! Trouve "${blitzItems[blitzIndex].text}"`
                : blitzSeconds === 0
                ? `Terminé ! Score final : ${blitzScore} / 5`
                : 'Appuie sur Démarrer pour lancer le Blitz !'}
            </span>

            <div className="flex items-center gap-2">
              {!blitzIsRunning && (
                <button
                  type="button"
                  onClick={startBlitz}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Démarrer le Blitz</span>
                </button>
              )}

              {blitzScore > 0 && !blitzIsRunning && (
                <button
                  type="button"
                  onClick={onNextActivity}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <span>Passer au Test Term 1 (Activité 10) 🏆 →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
