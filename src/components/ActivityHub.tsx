import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Trophy, Play, Star, BookOpen, Layers } from 'lucide-react';
import { ACTIVITIES_LIST } from '../data/curriculumData';
import { ActivityId } from '../types';

interface ActivityHubProps {
  onSelectActivity: (id: ActivityId) => void;
  completedActivities: ActivityId[];
}

export const ActivityHub: React.FC<ActivityHubProps> = ({
  onSelectActivity,
  completedActivities,
}) => {
  const units = [
    {
      tag: 'pre-unit',
      name: 'Sequence Pre-Unit : My First English Class',
      desc: 'Mots d\'école, alphabet, consignes impératives & son phonics /ɪ/',
      color: 'border-amber-300 bg-amber-500/10 text-amber-900',
    },
    {
      tag: 'unit-1',
      name: 'Unit 1 : Me, My Family and My Friends',
      desc: 'Salutations, présentation, arbre généalogique, pronoms & son /ʌ/',
      color: 'border-blue-300 bg-blue-500/10 text-blue-900',
    },
    {
      tag: 'unit-2',
      name: 'Unit 2 : My School',
      desc: 'Fournitures scolaires, prépositions de lieu, jours & matières',
      color: 'border-purple-300 bg-purple-500/10 text-purple-900',
    },
    {
      tag: 'term-test',
      name: 'Test de Niveau du Premier Terme (Sommatif)',
      desc: 'Épreuve évaluative en 3 phases sans aide visuelle (Barème officiel /20)',
      color: 'border-red-300 bg-red-500/10 text-red-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200 font-mono">
              Premier Terme · Term 1 Explorer
            </span>
            <span className="text-[11px] bg-emerald-950/60 text-emerald-200 border border-emerald-400/50 px-2 py-0.5 rounded-full font-bold font-heading flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Reconnaissance Visuelle OCR (Tesseract) : Activée
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading mt-1">
            Sommaire des 10 Activités Pédagogiques
          </h1>
          <p className="text-sm text-amber-100 max-w-xl mt-1.5 leading-relaxed">
            Chaque activité est autonome et dispose de sa propre page dédiée combinant la reconnaissance visuelle (Caméra OCR Tesseract pour cartes et lettres), la reconnaissance vocale et le tactile.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <span className="text-xs text-amber-100 font-medium">Progression</span>
            <p className="text-2xl font-bold font-heading tabular-nums">
              {completedActivities.length} / 10
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectActivity('pre-simon')}
            className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-heading"
          >
            <Play className="w-3.5 h-3.5 fill-amber-900" />
            <span>Démarrer l'Activité 1</span>
          </button>
        </div>
      </div>

      {/* Sections by Unit */}
      {units.map(unitGroup => {
        const activitiesInUnit = ACTIVITIES_LIST.filter(a => a.unitTag === unitGroup.tag);

        return (
          <div key={unitGroup.tag} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  {unitGroup.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {unitGroup.desc}
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-400 font-mono">
                {activitiesInUnit.length} {activitiesInUnit.length > 1 ? 'activités' : 'épreuve'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activitiesInUnit.map(act => {
                const isDone = completedActivities.includes(act.id);

                return (
                  <div
                    key={act.id}
                    onClick={() => onSelectActivity(act.id)}
                    className="p-5 bg-white hover:bg-amber-50/40 rounded-2xl border-2 border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
                  >
                    {isDone && (
                      <div className="absolute top-3 right-3 text-emerald-600 bg-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Validée
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl p-2 bg-amber-100/70 rounded-xl group-hover:scale-110 transition-transform">
                          {act.icon}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono">
                            Activité #{act.index} · {act.unit}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 font-heading leading-tight group-hover:text-amber-900 transition-colors">
                            {act.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {act.interactionType}
                      </span>

                      <span className="font-bold text-amber-700 group-hover:text-amber-900 flex items-center gap-1 font-heading">
                        Ouvrir la page <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
