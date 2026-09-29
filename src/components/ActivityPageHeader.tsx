import React from 'react';
import { ArrowLeft, ArrowRight, LayoutGrid, CheckCircle2, Star } from 'lucide-react';
import { ACTIVITIES_LIST } from '../data/curriculumData';
import { ActivityId } from '../types';

interface ActivityPageHeaderProps {
  currentActivityId: ActivityId;
  onNavigate: (id: ActivityId) => void;
  onBackToHub: () => void;
  isCompleted?: boolean;
}

export const ActivityPageHeader: React.FC<ActivityPageHeaderProps> = ({
  currentActivityId,
  onNavigate,
  onBackToHub,
  isCompleted = false,
}) => {
  const currentIndex = ACTIVITIES_LIST.findIndex(a => a.id === currentActivityId);
  const currentMeta = ACTIVITIES_LIST[currentIndex];

  const prevActivity = currentIndex > 0 ? ACTIVITIES_LIST[currentIndex - 1] : null;
  const nextActivity = currentIndex < ACTIVITIES_LIST.length - 1 ? ACTIVITIES_LIST[currentIndex + 1] : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-sm">
      {/* Left: Back to Hub */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBackToHub}
          className="px-3 py-1.5 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-heading"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-amber-700" />
          <span>Sommaire des 10 activités</span>
        </button>

        {currentMeta && (
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 font-mono">
            Page {currentMeta.index} / 10
          </span>
        )}
      </div>

      {/* Center: Activity Title & Unit Tag */}
      {currentMeta && (
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentMeta.icon}</span>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-heading leading-tight">
              {currentMeta.title}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {currentMeta.unit} · {currentMeta.interactionType}
            </p>
          </div>
          {isCompleted && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Validée
            </span>
          )}
        </div>
      )}

      {/* Right: Prev & Next Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!prevActivity}
          onClick={() => prevActivity && onNavigate(prevActivity.id)}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer font-heading"
          title={prevActivity ? `Aller à : ${prevActivity.title}` : undefined}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Précédente</span>
        </button>

        <button
          type="button"
          disabled={!nextActivity}
          onClick={() => nextActivity && onNavigate(nextActivity.id)}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer font-heading"
          title={nextActivity ? `Aller à : ${nextActivity.title}` : undefined}
        >
          <span className="hidden sm:inline">Suivante</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
