/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ModuleTab, ActivityId, EvaluationScores } from './types';
import { ACTIVITIES_LIST } from './data/curriculumData';
import { TopHUD } from './components/TopHUD';
import { ActivityHub } from './components/ActivityHub';
import { EvaluationReportModal } from './components/EvaluationReportModal';
import { PrintableCardsModal } from './components/PrintableCardsModal';
import { CameraOcrScannerModal } from './components/CameraOcrScannerModal';
import { soundManager } from './utils/audio';

// 10 Independent Activity Pages
import { Activity1SimonSays } from './components/activities/Activity1SimonSays';
import { Activity2PhonicsPop } from './components/activities/Activity2PhonicsPop';
import { Activity3AlphabetDash } from './components/activities/Activity3AlphabetDash';
import { Activity4PhotoAlbum } from './components/activities/Activity4PhotoAlbum';
import { Activity5TalkMassi } from './components/activities/Activity5TalkMassi';
import { Activity6FamilyRace } from './components/activities/Activity6FamilyRace';
import { Activity7HideSeek } from './components/activities/Activity7HideSeek';
import { Activity8Timetable } from './components/activities/Activity8Timetable';
import { Activity9ColorBlitz } from './components/activities/Activity9ColorBlitz';
import { Activity10TermTest } from './components/activities/Activity10TermTest';

export default function App() {
  // Current Activity Page
  const [currentActivityId, setCurrentActivityId] = useState<ActivityId>('hub');
  const [completedActivities, setCompletedActivities] = useState<ActivityId[]>([]);

  // HUD & Rewards State
  const [starsCount, setStarsCount] = useState<number>(14);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals State
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isPrintCardsOpen, setIsPrintCardsOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Official Evaluation Report Scores
  const [evaluationScores, setEvaluationScores] = useState<EvaluationScores>({
    phase1: 6,
    phase2: 8,
    phase3: 5,
    total: 19,
    voiceFluency: 92,
    vowelPronunciation: 88,
    visionPrecision: 95,
    spatialAccuracy: 90,
    notes: [
      'Excellente compréhension des consignes de classe et des membres de la famille.',
      'Prononciation des voyelles /ɪ/ (six, sister) et /ʌ/ (bus, duck) bien assimilée.',
      'Prépositions de lieu (in, on, under) parfaitement maîtrisées.',
    ],
    recommendations: [
      'Poursuivre la pratique de la fluidité orale avec Massi.',
      'S\'entraîner à l\'écriture cursive des mots simples pour le Term 2.',
    ],
    completedAt: 'En cours',
  });

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (!next) soundManager.stopSpeaking();
  };

  // Mark activity as completed
  const handleCompleteActivity = (id: ActivityId) => {
    setCompletedActivities(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  // Test completion
  const handleCompleteTest = (scores: EvaluationScores) => {
    setEvaluationScores(scores);
    handleCompleteActivity('term-eval-test');
    setIsReportOpen(true);
  };

  // Navigation helpers
  const handleNextActivity = () => {
    const currentIndex = ACTIVITIES_LIST.findIndex(a => a.id === currentActivityId);
    if (currentIndex >= 0 && currentIndex < ACTIVITIES_LIST.length - 1) {
      setCurrentActivityId(ACTIVITIES_LIST[currentIndex + 1].id);
    } else {
      setCurrentActivityId('hub');
    }
  };

  const getCurrentTab = (): ModuleTab | 'hub' => {
    if (currentActivityId === 'hub') return 'hub';
    const meta = ACTIVITIES_LIST.find(a => a.id === currentActivityId);
    return meta ? meta.unitTag : 'pre-unit';
  };

  const handleSelectTab = (tab: ModuleTab | 'hub') => {
    if (tab === 'hub') {
      setCurrentActivityId('hub');
    } else if (tab === 'pre-unit') {
      setCurrentActivityId('pre-simon');
    } else if (tab === 'unit-1') {
      setCurrentActivityId('u1-photo-album');
    } else if (tab === 'unit-2') {
      setCurrentActivityId('u2-hide-seek');
    } else if (tab === 'term-test') {
      setCurrentActivityId('term-eval-test');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef3f7] text-slate-800 antialiased selection:bg-amber-200">
      {/* 1. TOP HUD (Visible uniquement sur le sommaire / hub, masqué durant les activités) */}
      {currentActivityId === 'hub' && (
        <TopHUD
          currentTab={getCurrentTab()}
          onSelectTab={handleSelectTab}
          starsCount={starsCount}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenPrintCards={() => setIsPrintCardsOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
      )}

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto flex flex-col ${currentActivityId === 'hub' ? 'max-w-6xl p-3 sm:p-5 gap-4' : 'max-w-5xl p-2 sm:p-4 gap-3'}`}>
        {/* Hub / Sommaire View */}
        {currentActivityId === 'hub' && (
          <ActivityHub
            onSelectActivity={(id) => setCurrentActivityId(id)}
            completedActivities={completedActivities}
          />
        )}

        {/* 1. Pre-Unit: Classroom Simon Says */}
        {currentActivityId === 'pre-simon' && (
          <Activity1SimonSays
            onComplete={() => handleCompleteActivity('pre-simon')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 2. Pre-Unit: Phonics Pop */}
        {currentActivityId === 'pre-phonics-pop' && (
          <Activity2PhonicsPop
            onComplete={() => handleCompleteActivity('pre-phonics-pop')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 3. Pre-Unit: Speed Alphabet Dash */}
        {currentActivityId === 'pre-alphabet-dash' && (
          <Activity3AlphabetDash
            onComplete={() => handleCompleteActivity('pre-alphabet-dash')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 4. Unit 1: The Magic Photo Album */}
        {currentActivityId === 'u1-photo-album' && (
          <Activity4PhotoAlbum
            onComplete={() => handleCompleteActivity('u1-photo-album')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 5. Unit 1: Talk with Massi */}
        {currentActivityId === 'u1-talk-massi' && (
          <Activity5TalkMassi
            onComplete={() => handleCompleteActivity('u1-talk-massi')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 6. Unit 1: Family Assembly Race */}
        {currentActivityId === 'u1-family-race' && (
          <Activity6FamilyRace
            onComplete={() => handleCompleteActivity('u1-family-race')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 7. Unit 2: Hide & Seek School Things */}
        {currentActivityId === 'u2-hide-seek' && (
          <Activity7HideSeek
            onComplete={() => handleCompleteActivity('u2-hide-seek')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 8. Unit 2: Timetable Master */}
        {currentActivityId === 'u2-timetable' && (
          <Activity8Timetable
            onComplete={() => handleCompleteActivity('u2-timetable')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 9. Unit 2: Color & School Items Blitz */}
        {currentActivityId === 'u2-color-blitz' && (
          <Activity9ColorBlitz
            onComplete={() => handleCompleteActivity('u2-color-blitz')}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}

        {/* 10. Term 1 Evaluation Test */}
        {currentActivityId === 'term-eval-test' && (
          <Activity10TermTest
            onCompleteTest={handleCompleteTest}
            onNextActivity={handleNextActivity}
            onBackToHub={() => setCurrentActivityId('hub')}
            onNavigate={(id) => setCurrentActivityId(id)}
            starsCount={starsCount}
            onAwardStars={(c) => setStarsCount(s => s + c)}
          />
        )}
      </main>

      {/* Teacher / Parents Evaluation Report Modal */}
      <EvaluationReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        scores={evaluationScores}
      />

      {/* Printable Flashcards Kit Modal */}
      <PrintableCardsModal
        isOpen={isPrintCardsOpen}
        onClose={() => setIsPrintCardsOpen(false)}
      />

      {/* Global Camera OCR Scanner Modal (Tesseract.js) */}
      <CameraOcrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        expectedTargets={['PENCIL', 'BOOK', 'RULER', 'STAND', 'SIX', 'SISTER', 'FATHER', 'MOTHER', 'IN', 'ON', 'UNDER']}
        activityTitle="Reconnaissance Visuelle OCR (Tesseract.js)"
        onDetected={(text, matched) => {
          setStarsCount(s => s + 1);
        }}
      />
    </div>
  );
}
