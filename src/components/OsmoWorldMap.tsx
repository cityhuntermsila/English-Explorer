import React from 'react';
import { Play, Star, Lock, CheckCircle2, Trophy, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { ACTIVITIES_LIST } from '../data/curriculumData';
import { ActivityId } from '../types';
import mapBg from '../assets/images/osmo_world_map_1790630271946.jpg';
import mascotImg from '../assets/images/massi_fennec_mascot_1790628791368.jpg';

interface OsmoWorldMapProps {
  onSelectActivity: (id: ActivityId) => void;
  completedActivities: ActivityId[];
  starsCount: number;
}

export const OsmoWorldMap: React.FC<OsmoWorldMapProps> = ({
  onSelectActivity,
  completedActivities,
  starsCount,
}) => {
  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[640px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 select-none bg-sky-300">
      {/* Background Illustrated Adventure Map (Matching Photo 6) */}
      <img
        src={mapBg}
        alt="Osmo Adventure World Map"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Soft Vignette & Sun Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

      {/* Top Map HUD Bar (Osmo Style) */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border-2 border-amber-300">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 bg-amber-100 shrink-0">
            <img
              src={mascotImg}
              alt="Massi"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 font-mono block">
              1st Term Explorer
            </span>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 font-heading leading-tight">
              Osmo English Adventure
            </h1>
          </div>
        </div>

        {/* Score & Progression Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border-2 border-amber-300 font-heading">
            <span className="text-xl">⭐</span>
            <span className="text-base sm:text-lg font-black text-amber-950 tabular-nums">
              {starsCount}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border-2 border-emerald-300 text-emerald-800 font-heading text-xs font-bold">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>{completedActivities.length} / 10 Validées</span>
          </div>
        </div>
      </div>

      {/* Level Milestone Checkpoints on Winding Trail (Inspired by Photo 6) */}
      <div className="relative z-10 p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-5 my-2 max-w-5xl mx-auto">
        {ACTIVITIES_LIST.map((act, index) => {
          const isCompleted = completedActivities.includes(act.id);
          const isUnlocked = index === 0 || completedActivities.includes(ACTIVITIES_LIST[index - 1].id) || isCompleted;

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelectActivity(act.id)}
              className={`group relative flex flex-col items-center p-3.5 rounded-2xl border-4 transition-all duration-200 cursor-pointer select-none text-center ${
                isCompleted
                  ? 'bg-gradient-to-b from-emerald-50 to-emerald-100 border-emerald-400 text-emerald-950 shadow-xl scale-102 hover:scale-105'
                  : isUnlocked
                  ? 'bg-gradient-to-b from-white to-amber-50 border-amber-400 text-slate-900 shadow-xl hover:scale-108 hover:border-amber-500 animate-pulse-subtle'
                  : 'bg-white/80 border-slate-300 text-slate-500 opacity-85 hover:opacity-100 hover:bg-white'
              }`}
            >
              {/* Milestone Number Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black font-mono shadow-md border-2 border-white">
                #{act.index}
              </div>

              {/* Icon / Character Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md border-2 border-amber-200 flex items-center justify-center text-3xl sm:text-4xl my-1 group-hover:scale-110 transition-transform">
                {act.icon}
              </div>

              {/* Title & Unit */}
              <span className="text-[10px] font-bold text-amber-700 uppercase font-mono mt-0.5">
                {act.unit}
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold font-heading leading-tight mt-0.5 line-clamp-1">
                {act.title}
              </h3>

              {/* Status Indicator */}
              <div className="mt-2">
                {isCompleted ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Terminé
                  </span>
                ) : isUnlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-300 px-2.5 py-0.5 rounded-full shadow-sm font-heading group-hover:bg-amber-400">
                    <Play className="w-2.5 h-2.5 fill-amber-950" /> Jouer
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" /> À débloquer
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Launch Banner (Matching Photo 2 Play Button) */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md text-white border-t-2 border-white/20">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-heading flex items-center gap-2">
            <span>🦊 Massi t'attend sur le parcours !</span>
          </h2>
          <p className="text-xs text-slate-300">
            Reconnaissance de lettres, phonics /ɪ/ vs /ʌ/, prépositions et dialogue oral.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectActivity('pre-simon')}
          className="px-6 py-3 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:brightness-110 text-white font-heading font-black text-base sm:text-lg rounded-2xl shadow-xl border-2 border-white/80 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
          style={{
            boxShadow: '0 8px 20px -3px rgba(225,29,72,0.6), inset 0 2px 2px rgba(255,255,255,0.4)',
          }}
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Commencer l'Aventure (Activité 1)</span>
        </button>
      </div>
    </div>
  );
};
