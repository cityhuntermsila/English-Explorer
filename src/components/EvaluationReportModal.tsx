import React from 'react';
import { X, Award, CheckCircle2, AlertCircle, Printer, Download, Sparkles, User, Calendar, BookOpen } from 'lucide-react';
import { EvaluationScores } from '../types';

interface EvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: EvaluationScores;
  studentName?: string;
}

export const EvaluationReportModal: React.FC<EvaluationReportModalProps> = ({
  isOpen,
  onClose,
  scores,
  studentName = 'Élève (Primary School)',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getGradeAssessment = (total: number) => {
    if (total >= 18) return { label: 'Excellent / Maîtrise Très Satisfaisante', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (total >= 14) return { label: 'Bien / Maîtrise Satisfaisante', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (total >= 10) return { label: 'Moyen / En cours d\'acquisition', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    return { label: 'À consolider', color: 'text-red-700 bg-red-100 border-red-300' };
  };

  const assessment = getGradeAssessment(scores.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-100" />
            <div>
              <h2 className="text-xl font-bold font-heading">
                Bilan Pédagogique Officiel · Term 1
              </h2>
              <p className="text-xs text-amber-100">
                Fiche d'Évaluation Individuelle (Reconnaissance Vocale & Visuelle)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
            aria-label="Fermer le bilan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Content */}
        <div className="p-6 space-y-5 print:p-0">
          {/* Student Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs">
            <div className="flex items-center gap-2 text-slate-800">
              <User className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">Élève :</span>
              <span className="font-bold font-heading text-sm text-amber-950">{studentName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Date d'évaluation : <strong>{scores.completedAt || new Date().toLocaleDateString('fr-FR')}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Niveau : <strong>1st Term (Term First)</strong></span>
            </div>
          </div>

          {/* Global Scorecard Banner */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300">
                Score Global Sommatif
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-amber-400 font-heading tabular-nums">
                  {scores.total}
                </span>
                <span className="text-xl text-slate-400 font-heading">/ 20</span>
                <span className="text-xl">⭐</span>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${assessment.color} font-heading`}>
              {assessment.label}
            </div>
          </div>

          {/* Detailed 3-Phase Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] uppercase font-mono text-slate-500 font-semibold">Phase 1 : Vision & Espace</p>
              <p className="text-2xl font-bold text-slate-900 font-heading mt-1 tabular-nums">
                {scores.phase1} <span className="text-sm text-slate-500">/ 6 pts</span>
              </p>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <p>Précision manipulation : <strong>{scores.visionPrecision}%</strong></p>
                <p>Respect consignes spatiales : <strong>{scores.spatialAccuracy}%</strong></p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] uppercase font-mono text-slate-500 font-semibold">Phase 2 : Voix & Phonics</p>
              <p className="text-2xl font-bold text-slate-900 font-heading mt-1 tabular-nums">
                {scores.phase2} <span className="text-sm text-slate-500">/ 8 pts</span>
              </p>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <p>Fluidité orale : <strong>{scores.voiceFluency}%</strong></p>
                <p>Voyelles /ɪ/ vs /ʌ/ : <strong>{scores.vowelPronunciation}%</strong></p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] uppercase font-mono text-slate-500 font-semibold">Phase 3 : Tracé Script</p>
              <p className="text-2xl font-bold text-slate-900 font-heading mt-1 tabular-nums">
                {scores.phase3} <span className="text-sm text-slate-500">/ 6 pts</span>
              </p>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <p>Dictée de lettres : <strong>Acquis</strong></p>
                <p>Conformité script : <strong>Conforme</strong></p>
              </div>
            </div>
          </div>

          {/* Observations & Automated Pedagogical Recommendation */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Recommandations Pédagogiques Automatisées :
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                « Excellente compréhension orale et manipulation spatiale des fournitures. L'élève distingue avec aisance les voyelles courtes /ɪ/ (six, sister) et /ʌ/ (bus, duck). Poursuivre l'entraînement sur l'expression spontanée lors des rituels de classe au Term 2. »
              </p>
            </div>

            <div className="pt-2 border-t border-amber-200/70">
              <h4 className="text-[11px] font-bold text-slate-700 uppercase font-mono mb-1">
                Points Forts Validés :
              </h4>
              <ul className="text-xs text-slate-600 space-y-1">
                {scores.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer font-heading"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer font-heading"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer l'Attestation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
