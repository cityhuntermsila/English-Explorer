import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Users, MessageSquare, Play, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { ALL_FLASHCARDS } from '../data/curriculumData';
import { PlacedCard, MascotMood } from '../types';
import { soundManager } from '../utils/audio';
import familyTreeBg from '../assets/images/family_tree_illustration_1790628815257.jpg';

interface Unit1SectionProps {
  activityId: 'u1-photo-album' | 'u1-talk-massi' | 'u1-family-race';
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

export const Unit1Section: React.FC<Unit1SectionProps> = ({
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
  // ---- Magic Photo Album State ----
  const familyMembers = [
    { id: 'fam-father', role: 'Father', pronoun: 'He', sentence: 'He is my father.', arabic: 'أب', x: 30, y: 35 },
    { id: 'fam-mother', role: 'Mother', pronoun: 'She', sentence: 'She is my mother.', arabic: 'أم', x: 70, y: 35 },
    { id: 'fam-grandfather', role: 'Grandfather', pronoun: 'He', sentence: 'He is my grandfather.', arabic: 'جد', x: 20, y: 15 },
    { id: 'fam-grandmother', role: 'Grandmother', pronoun: 'She', sentence: 'She is my grandmother.', arabic: 'جدة', x: 80, y: 15 },
    { id: 'fam-brother', role: 'Brother', pronoun: 'He', sentence: 'He is my brother.', arabic: 'أخ', x: 35, y: 70 },
    { id: 'fam-sister', role: 'Sister', pronoun: 'She', sentence: 'She is my sister.', arabic: 'أخت', x: 65, y: 70 },
  ];
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>('fam-father');
  const [albumPlacedCount, setAlbumPlacedCount] = useState<number>(0);

  // ---- Talk with Massi State ----
  const talkSteps = [
    {
      question: "Hello! What's your name?",
      french: "Bonjour ! Comment tu t'appelles ?",
      expectedVoice: "My name is",
      keywords: ["name", "my name is", "i am", "amine", "amina", "mohamed", "sarah"],
      hint: "Say: « My name is [Ton Prénom] »",
    },
    {
      question: "How old are you?",
      french: "Quel âge as-tu ?",
      expectedVoice: "I am 8",
      keywords: ["i am", "eight", "8", "seven", "7", "nine", "9", "years old"],
      hint: "Say: « I am 8 » or « I am 8 years old »",
    },
    {
      question: "Where do you live?",
      french: "Où habites-tu ?",
      expectedVoice: "I live in Algeria",
      keywords: ["live", "i live in", "algeria", "algiers", "oran", "constantine", "setif", "batna"],
      hint: "Say: « I live in Algeria »",
    },
    {
      question: "What languages do you speak?",
      french: "Quelles langues parles-tu ?",
      expectedVoice: "I speak Arabic and English",
      keywords: ["speak", "arabic", "english", "french"],
      hint: "Say: « I speak Arabic and English »",
    },
  ];
  const [talkIndex, setTalkIndex] = useState<number>(0);
  const [talkCompleted, setTalkCompleted] = useState<boolean>(false);

  // ---- Assembly Race State ----
  const [raceTimeLeft, setRaceTimeLeft] = useState<number>(45);
  const [raceIsRunning, setRaceIsRunning] = useState<boolean>(false);
  const [raceWon, setRaceWon] = useState<boolean>(false);

  // Switch Sub-Activity Setup
  useEffect(() => {
    if (activityId === 'u1-photo-album') {
      const member = familyMembers.find(m => m.id === selectedFamilyMember) || familyMembers[0];
      setMascotSpeech(
        `Who is he or she? Place the card for "${member.role}" on the table!`,
        `Qui est-ce ? Pose la carte "${member.role}" sur la table !`,
        'talking'
      );
      setExpectedCard(member.id);
      setExpectedVoice(member.sentence, [member.role.toLowerCase(), member.sentence.toLowerCase()]);
    } else if (activityId === 'u1-talk-massi') {
      const step = talkSteps[talkIndex];
      setMascotSpeech(step.question, step.french, 'talking');
      soundManager.speak(step.question, 'en-US');
      setExpectedCard(null);
      setExpectedVoice(step.expectedVoice, step.keywords);
    } else if (activityId === 'u1-family-race') {
      setMascotSpeech(
        'Family Assembly Race! Reconstruct the family tree in less than 45 seconds!',
        'Défi chrono : Reconstitue l\'arbre généalogique complet en moins de 45 secondes !',
        'talking'
      );
      setExpectedCard(null);
      setExpectedVoice('', []);
    }
  }, [activityId, selectedFamilyMember, talkIndex]);

  // Magic Album Card validation
  useEffect(() => {
    if (activityId === 'u1-photo-album') {
      const hasCard = placedCards.some(p => p.cardId === selectedFamilyMember);
      if (hasCard) {
        const member = familyMembers.find(m => m.id === selectedFamilyMember);
        if (member) {
          soundManager.playSuccess();
          onAwardStars(2);
          setAlbumPlacedCount(c => c + 1);
          if (albumPlacedCount >= 3) {
            onCompleteActivity();
          }
          confetti({ particleCount: 30, spread: 50 });
          setMascotSpeech(
            `Correct! ${member.sentence} (${member.pronoun} = ${member.pronoun === 'He' ? 'Il' : 'Elle'})`,
            `Bravo ! ${member.sentence}`,
            'cheering'
          );
          soundManager.speak(member.sentence, 'en-US');
        }
      }
    }
  }, [placedCards, activityId, selectedFamilyMember]);

  // Assembly Race Timer Loop
  useEffect(() => {
    let interval: number;
    if (raceIsRunning && raceTimeLeft > 0 && !raceWon) {
      interval = window.setInterval(() => {
        setRaceTimeLeft(t => {
          if (t <= 1) {
            setRaceIsRunning(false);
            soundManager.playTick();
            setMascotSpeech('Time is up! Re-try the race, you can do it!', 'Temps écoulé ! Réessaie, tu vas y arriver !', 'thinking');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [raceIsRunning, raceTimeLeft, raceWon]);

  // Assembly Race check
  useEffect(() => {
    if (activityId === 'u1-family-race' && raceIsRunning && !raceWon) {
      const placedFamilyCount = placedCards.filter(p => p.cardId.startsWith('fam-')).length;
      if (placedFamilyCount >= 4) {
        setRaceWon(true);
        setRaceIsRunning(false);
        soundManager.playSuccess();
        onAwardStars(5);
        onCompleteActivity();
        confetti({ particleCount: 80, spread: 80 });
        setMascotSpeech(
          'Incredible! You assembled the whole family tree in record time!',
          'Incroyable ! Tu as reconstitué l\'arbre généalogique familial à toute vitesse !',
          'cheering'
        );
      }
    }
  }, [placedCards, activityId, raceIsRunning, raceWon]);

  const startRace = () => {
    setRaceTimeLeft(45);
    setRaceWon(false);
    setRaceIsRunning(true);
    setMascotSpeech('Put the father, mother, sister and brother together! Quick!', 'Pose le père, la mère, la sœur et le frère ensemble ! Vite !', 'cheering');
  };

  const advanceTalkStep = () => {
    soundManager.playSuccess();
    onAwardStars(2);
    confetti({ particleCount: 30, spread: 45 });
    if (talkIndex < talkSteps.length - 1) {
      setTalkIndex(i => i + 1);
    } else {
      setTalkCompleted(true);
      onCompleteActivity();
      setMascotSpeech(
        'Wonderful! You introduced yourself like a true English speaker!',
        'Magnifique ! Tu sais parfaitement te présenter en anglais !',
        'cheering'
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Activity 4: The Magic Photo Album */}
      {activityId === 'u1-photo-album' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 4/10 · Arbre Généalogique & Famille
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                The Magic Photo Album
              </h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Grammaire : He is... / She is...
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/40 p-4 sm:p-6 min-h-[260px] flex flex-col justify-between mb-4">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <img
                src={familyTreeBg}
                alt="Arbre de famille"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-around gap-4">
              {familyMembers.map(member => {
                const isSelected = selectedFamilyMember === member.id;
                const isPlaced = placedCards.some(p => p.cardId === member.id);

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedFamilyMember(member.id);
                      onPlaceCard(member.id, member.x, member.y);
                    }}
                    className={`flex flex-col items-center p-3 rounded-2xl transition-all cursor-pointer select-none font-heading ${
                      isPlaced
                        ? 'bg-white/95 text-slate-900 shadow-lg ring-4 ring-emerald-400 scale-105 border-2 border-emerald-500'
                        : isSelected
                        ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 ring-2 ring-amber-300'
                        : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-3xl mb-1">{member.role === 'Father' ? '👨' : member.role === 'Mother' ? '👩' : member.role === 'Brother' ? '👦' : member.role === 'Sister' ? '👧' : member.role === 'Grandfather' ? '👴' : '👵'}</span>
                    <span className="text-xs font-bold">{member.role}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{member.sentence}</span>
                    {isPlaced && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded-full mt-1">
                        Validé ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 mt-4 p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-amber-200 flex items-center justify-between">
              <div className="text-xs text-slate-700">
                <span className="font-bold text-amber-900">Consigne :</span> Pose la carte correspondante sur la table ou clique sur un membre pour entendre la phrase complète.
              </div>

              <button
                type="button"
                onClick={() => {
                  const curr = familyMembers.find(m => m.id === selectedFamilyMember);
                  if (curr) soundManager.speak(curr.sentence, 'en-US');
                }}
                className="px-2.5 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Répéter la phrase</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onNextActivity}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer font-heading"
            >
              Passer à l'Activité 5 (Talk with Massi) →
            </button>
          </div>
        </div>
      )}

      {/* Activity 5: Talk with Massi */}
      {activityId === 'u1-talk-massi' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 5/10 · Dialogue Oral Guidé ({talkIndex + 1} / {talkSteps.length})
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                Talk with Massi le Fennec
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
              Présentation & Salutations
            </span>
          </div>

          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 mb-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🦊</span>
              <div className="flex-1">
                <p className="text-lg sm:text-xl font-bold text-amber-950 font-heading">
                  "{talkSteps[talkIndex].question}"
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {talkSteps[talkIndex].french}
                </p>

                <div className="mt-4 p-3 bg-white rounded-xl border border-amber-200/90">
                  <p className="text-xs text-slate-500 font-medium">Réponds à voix haute :</p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 font-heading mt-0.5">
                    👉 {talkSteps[talkIndex].hint}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Parle dans le microphone en bas à droite pour valider !
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={advanceTalkStep}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider cette réponse</span>
              </button>

              {talkCompleted && (
                <button
                  type="button"
                  onClick={onNextActivity}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-heading"
                >
                  Passer à l'Activité 6 (Family Race) →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity 6: Family Assembly Race */}
      {activityId === 'u1-family-race' && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase font-mono">
                Activité 6/10 · Défi Chronométré (45 Secondes)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
                Family Assembly Race
              </h2>
              <p className="text-xs text-slate-500">
                Reconstitue l'arbre généalogique en plaçant au moins 4 cartes de famille sur la table !
              </p>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <p className="text-2xl font-extrabold text-amber-900 font-heading tabular-nums">
                00:{raceTimeLeft < 10 ? `0${raceTimeLeft}` : raceTimeLeft}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {raceWon
                ? '🎉 Défi terminé avec succès !'
                : raceIsRunning
                ? 'Place la famille sur la table rapidement !'
                : 'Appuie sur Démarrer la course pour lancer le chrono !'}
            </span>

            <div className="flex items-center gap-2">
              {!raceIsRunning && !raceWon && (
                <button
                  type="button"
                  onClick={startRace}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Démarrer la Course</span>
                </button>
              )}

              {(raceWon || raceTimeLeft === 0) && (
                <button
                  type="button"
                  onClick={startRace}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-heading"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Recommencer</span>
                </button>
              )}

              {raceWon && (
                <button
                  type="button"
                  onClick={onNextActivity}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-heading"
                >
                  <span>Passer à l'Unit 2 (Activité 7) →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

