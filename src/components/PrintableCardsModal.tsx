import React from 'react';
import { X, Printer, Scissors, Sparkles, Layers } from 'lucide-react';
import { ALL_FLASHCARDS } from '../data/curriculumData';

interface PrintableCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableCardsModal: React.FC<PrintableCardsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-amber-100" />
            <div>
              <h2 className="text-xl font-bold font-heading">
                Planche de Cartes Physiques à Découper (Phygital Kit)
              </h2>
              <p className="text-xs text-amber-100">
                Imprimez ces cartes pour que l'enfant les pose directement sur la table devant la caméra !
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
            aria-label="Fermer la planche"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 print:p-2">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900 print:hidden">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-600" />
              <span><strong>Conseil pédagogique :</strong> Imprimez sur du papier un peu épais (160g) et découpez le long des pointillés.</span>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer font-heading"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer la planche</span>
            </button>
          </div>

          {/* Section: Letters */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
              1. Lettres Phonics (Pre-Unit & Unit 1)
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {ALL_FLASHCARDS.filter(c => c.category === 'letter').map(card => (
                <div
                  key={card.id}
                  className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <span className="text-3xl font-extrabold text-slate-800 font-heading">
                    {card.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">
                    {card.phonicsSound}
                  </span>
                  <span className="text-[9px] text-amber-600 font-bold uppercase mt-0.5">
                    TERM 1
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Family */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
              2. Famille · Unit 1 (Me, My Family and My Friends)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {ALL_FLASHCARDS.filter(c => c.category === 'family').map(card => (
                <div
                  key={card.id}
                  className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <span className="text-3xl mb-1">{card.iconName}</span>
                  <span className="text-xs font-bold text-slate-900 font-heading">
                    {card.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {card.arabicLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: School Supplies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
              3. Fournitures Scolaires · Unit 2 (My School)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {ALL_FLASHCARDS.filter(c => c.category === 'school').map(card => (
                <div
                  key={card.id}
                  className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <span className="text-3xl mb-1">{card.iconName}</span>
                  <span className="text-xs font-bold text-slate-900 font-heading">
                    {card.label}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    School item
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer font-heading"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
