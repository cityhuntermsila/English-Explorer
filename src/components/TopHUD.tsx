import React from 'react';
import { Volume2, VolumeX, Printer, Award, Sparkles, BookOpen, LayoutGrid, Camera } from 'lucide-react';
import { ModuleTab, ActivityId } from '../types';
import { soundManager } from '../utils/audio';

interface TopHUDProps {
  currentTab: ModuleTab | 'hub';
  onSelectTab: (tab: ModuleTab | 'hub') => void;
  starsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPrintCards: () => void;
  onOpenReport: () => void;
  onOpenScanner?: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  currentTab,
  onSelectTab,
  starsCount,
  soundEnabled,
  onToggleSound,
  onOpenPrintCards,
  onOpenReport,
  onOpenScanner,
}) => {
  const tabs: { id: ModuleTab | 'hub'; label: string; tag: string }[] = [
    { id: 'hub', label: 'Sommaire (10 Activités)', tag: 'Vue d\'ensemble' },
    { id: 'pre-unit', label: 'Pre-Unit', tag: 'Classroom & Phonics' },
    { id: 'unit-1', label: 'Unit 1', tag: 'Me & My Family' },
    { id: 'unit-2', label: 'Unit 2', tag: 'My School' },
    { id: 'term-test', label: 'Test Term 1', tag: 'Evaluation /20' },
  ];

  return (
    <header className="px-3 sm:px-6 py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-sm sticky top-0 z-30 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
      {/* Top / Left: Brand Title & HUD Actions on Mobile */}
      <div className="flex items-center justify-between gap-2 w-full md:w-auto">
        <button
          type="button"
          onClick={() => onSelectTab('hub')}
          className="text-lg sm:text-2xl font-extrabold tracking-tight text-amber-900 font-heading cursor-pointer text-left truncate"
        >
          Massi English Explorer
        </button>

        {/* Compact Mobile Quick Stats */}
        <div className="flex items-center gap-1.5 md:hidden shrink-0">
          <div className="flex items-center gap-1 bg-amber-100/90 text-amber-900 font-heading font-bold text-xs px-2.5 py-1 rounded-xl border border-amber-300/70">
            <span className="text-amber-500">⭐</span>
            <span className="tabular-nums">{starsCount}</span>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-400 border-slate-300'
            }`}
            title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Middle: Navigation modules tabs (Smooth touch scroll on mobile) */}
      <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 font-heading shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-600 hover:text-amber-900 hover:bg-amber-100/60'
              }`}
            >
              {tab.id === 'hub' && <LayoutGrid className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.id === 'term-test' && (
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.2 rounded-full font-sans font-bold">
                  /20
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop / Tablet Actions (Score, Printable Cards, Report, Sound) */}
      <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Stars Score */}
        <div className="flex items-center gap-1.5 bg-amber-100/90 text-amber-900 font-heading font-bold text-sm sm:text-base px-3 py-1.5 rounded-xl border border-amber-300/70 shadow-inner">
          <span className="text-amber-500 text-base">⭐</span>
          <span className="tabular-nums">{starsCount}</span>
        </div>

        {/* Printable Cards Kit */}
        <button
          type="button"
          onClick={onOpenPrintCards}
          className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap font-heading"
          title="Imprimer ou voir le kit de cartes physiques"
        >
          <Printer className="w-3.5 h-3.5 text-amber-700" />
          <span>Kit Cartes</span>
        </button>

        {/* Global Camera OCR Scanner */}
        {onOpenScanner && (
          <button
            type="button"
            onClick={onOpenScanner}
            className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap font-heading shadow-xs"
            title="Ouvrir la caméra pour tester la reconnaissance visuelle (OCR Tesseract)"
          >
            <Camera className="w-3.5 h-3.5 text-amber-950" />
            <span>Caméra OCR</span>
          </button>
        )}

        {/* Evaluation Report */}
        <button
          type="button"
          onClick={onOpenReport}
          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap font-heading"
          title="Bilan et rapport enseignant / parents"
        >
          <Award className="w-3.5 h-3.5 text-emerald-700" />
          <span>Rapport</span>
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
              : 'bg-slate-100 text-slate-400 border-slate-300'
          }`}
          title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
          aria-label={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Action Bar Sub-row */}
      <div className="flex items-center justify-between gap-1.5 md:hidden pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenPrintCards}
          className="flex-1 py-1.5 px-2 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1 font-heading"
        >
          <Printer className="w-3 h-3 text-amber-700" />
          <span>Kit Cartes</span>
        </button>

        {onOpenScanner && (
          <button
            type="button"
            onClick={onOpenScanner}
            className="flex-1 py-1.5 px-2 text-[11px] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center justify-center gap-1 font-heading"
          >
            <Camera className="w-3 h-3" />
            <span>Caméra OCR</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenReport}
          className="flex-1 py-1.5 px-2 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center justify-center gap-1 font-heading"
        >
          <Award className="w-3 h-3 text-emerald-700" />
          <span>Rapport</span>
        </button>
      </div>
    </header>
  );
};

