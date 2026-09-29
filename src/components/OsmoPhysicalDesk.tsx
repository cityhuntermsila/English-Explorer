import React, { useState } from 'react';
import { Play, RotateCcw, Plus, Trash2, Camera, CameraOff, Sparkles, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { ALL_FLASHCARDS } from '../data/curriculumData';
import { CardItem, PlacedCard } from '../types';
import { soundManager } from '../utils/audio';

export interface CodeBlock {
  id: string;
  type: 'walk' | 'pick' | 'listen' | 'speak' | 'letter' | 'family' | 'school';
  direction?: 'right' | 'left' | 'up' | 'down';
  count?: number;
  label: string;
  icon: string;
  color: string;
  cardId?: string;
}

interface OsmoPhysicalDeskProps {
  sequence: CodeBlock[];
  onAddBlock: (block: Omit<CodeBlock, 'id'>) => void;
  onRemoveBlock: (id: string) => void;
  onClearSequence: () => void;
  onExecuteSequence: () => void;
  isExecuting?: boolean;
  placedCards: PlacedCard[];
  onPlaceCard: (cardId: string, x?: number, y?: number) => void;
  onRemoveCard: (cardId: string) => void;
  expectedActionOrCard?: string | null;
  activeTabCategory?: 'coding' | 'cards';
}

export const OsmoPhysicalDesk: React.FC<OsmoPhysicalDeskProps> = ({
  sequence,
  onAddBlock,
  onRemoveBlock,
  onClearSequence,
  onExecuteSequence,
  isExecuting = false,
  placedCards,
  onPlaceCard,
  onRemoveCard,
  expectedActionOrCard,
  activeTabCategory = 'coding',
}) => {
  const [activeDeskMode, setActiveDeskMode] = useState<'coding' | 'cards'>('coding');
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Available Osmo Action Blocks matching the photo
  const presetBlocks: Omit<CodeBlock, 'id'>[] = [
    { type: 'walk', direction: 'right', count: 2, label: 'Walk Right', icon: '🏃 ➡', color: 'bg-sky-500 text-white' },
    { type: 'walk', direction: 'left', count: 2, label: 'Walk Left', icon: '🏃 ⬅', color: 'bg-sky-500 text-white' },
    { type: 'walk', direction: 'up', count: 2, label: 'Walk Up', icon: '🏃 ⬆', color: 'bg-sky-500 text-white' },
    { type: 'walk', direction: 'down', count: 2, label: 'Walk Down', icon: '🏃 ⬇', color: 'bg-sky-500 text-white' },
    { type: 'pick', count: 1, label: 'Pick / Grab', icon: '✋ Attraper', color: 'bg-red-500 text-white' },
    { type: 'listen', count: 1, label: 'Listen', icon: '👂 Écouter', color: 'bg-amber-500 text-slate-950' },
    { type: 'speak', count: 1, label: 'Speak / Talk', icon: '🗣️ Parler', color: 'bg-emerald-600 text-white' },
  ];

  const toggleWebcam = async () => {
    if (useWebcam) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setUseWebcam(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setUseWebcam(true);
      } catch (err) {
        console.warn('Camera blocked:', err);
      }
    }
  };

  return (
    <div className="w-full bg-[#f2eada] border-4 border-[#d8c7a8] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden select-none">
      {/* Wooden Desk Mat Texture & Perspective Grid */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#c4a47c_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Red Mirror Reflector Scanner Projection Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-16 bg-gradient-to-b from-red-500/20 via-red-500/5 to-transparent pointer-events-none rounded-b-full blur-md" />
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-white text-[11px] font-bold rounded-full shadow-md z-10 font-heading">
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>Champ de vision du Réflecteur Rouge Osmo</span>
      </div>

      {/* Desk Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-amber-200/80 rounded-xl border border-amber-300">
            <button
              type="button"
              onClick={() => setActiveDeskMode('coding')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer font-heading ${
                activeDeskMode === 'coding'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              🧩 Blocs Tangibles Osmo
            </button>
            <button
              type="button"
              onClick={() => setActiveDeskMode('cards')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer font-heading ${
                activeDeskMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              🃏 Cartes Physiques Posées ({placedCards.length})
            </button>
          </div>
        </div>

        {/* Camera Scanner Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleWebcam}
            className={`px-3 py-1 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
              useWebcam
                ? 'bg-emerald-600 text-white'
                : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
            }`}
          >
            {useWebcam ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span>{useWebcam ? 'Scanner Actif' : 'Scanner Caméra'}</span>
          </button>

          {sequence.length > 0 && activeDeskMode === 'coding' && (
            <button
              type="button"
              onClick={onClearSequence}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-red-700 bg-white/70 hover:bg-white rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vider</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Play Mat Area */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 min-h-[220px]">
        {/* Left Side: Modular Tangible Blocks Sequence on the Table (Just like in the photo!) */}
        <div className="flex-1 w-full flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-amber-950 font-heading uppercase tracking-wide">
              {activeDeskMode === 'coding'
                ? 'Séquence de Blocs Emboîtés sur la Table'
                : 'Cartes Physiques Détectées sur la Table'}
            </span>
            <p className="text-[11px] text-amber-800">
              {activeDeskMode === 'coding'
                ? 'Emboîte les blocs d\'action puis appuie sur le bouton vert ▶ !'
                : 'Pose les cartes physiques dans le champ du miroir rouge'}
            </p>
          </div>

          {activeDeskMode === 'coding' ? (
            /* Tactile Blocks Stack matching Osmo */
            <div className="flex flex-col items-center gap-1 w-full max-w-sm">
              {sequence.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-amber-400/80 rounded-2xl text-center bg-white/40 text-amber-900/60 w-full">
                  <p className="text-xs font-semibold">Aucun bloc sur la table.</p>
                  <p className="text-[11px] mt-1">Choisis des blocs d'action ci-dessous pour les poser !</p>
                </div>
              ) : (
                sequence.map((block, idx) => (
                  <div
                    key={block.id}
                    onClick={() => {
                      onRemoveBlock(block.id);
                      soundManager.playCardSnap();
                    }}
                    className={`relative w-full px-4 py-2.5 rounded-xl shadow-lg border-2 border-white/60 flex items-center justify-between transition-all hover:scale-102 cursor-pointer ${block.color} group`}
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2), inset 0 2px 2px rgba(255,255,255,0.4)',
                    }}
                    title="Clique pour retirer ce bloc"
                  >
                    {/* Osmo Plastic Snap Notch Connector */}
                    <div className="absolute -top-1.5 left-8 w-6 h-3 bg-white/50 rounded-t-md" />

                    <div className="flex items-center gap-2.5 font-heading">
                      <span className="text-lg leading-none">{block.icon}</span>
                      <span className="font-extrabold text-sm">{block.label}</span>
                    </div>

                    {block.count && (
                      <span className="w-7 h-7 bg-amber-400 text-slate-950 font-black rounded-full flex items-center justify-center text-sm shadow-inner border border-amber-300">
                        {block.count}
                      </span>
                    )}

                    <span className="absolute -right-2 -top-2 w-5 h-5 bg-red-600 text-white rounded-full text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </span>
                  </div>
                ))
              )}

              {/* The Iconic Osmo BIG GREEN PLAY BUTTON Block! (Directly as in the photo) */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playSuccess();
                  onExecuteSequence();
                }}
                disabled={isExecuting || sequence.length === 0}
                className={`relative w-full mt-2 px-6 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white rounded-2xl shadow-xl border-4 border-white/80 flex items-center justify-center gap-3 transition-all cursor-pointer font-heading disabled:opacity-50 disabled:pointer-events-none active:scale-95 hover:brightness-105 ${
                  isExecuting ? 'ring-4 ring-emerald-400 animate-pulse' : 'hover:scale-102'
                }`}
                style={{
                  boxShadow: '0 8px 15px -3px rgba(16,185,129,0.5), inset 0 3px 3px rgba(255,255,255,0.6)',
                }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-md">
                  <Play className="w-4 h-4 fill-emerald-600 ml-0.5" />
                </div>
                <div className="text-left">
                  <span className="text-sm sm:text-base font-black uppercase tracking-wider block leading-tight">
                    {isExecuting ? 'Massi s\'anime...' : 'Exécuter la Séquence'}
                  </span>
                  <span className="text-[10px] text-emerald-100 font-sans block">
                    (Appuie comme sur le bloc Osmo vert !)
                  </span>
                </div>
              </button>
            </div>
          ) : (
            /* Cards on Table Mode */
            <div className="w-full flex flex-wrap items-center justify-center gap-3 min-h-[160px] p-4 bg-white/50 rounded-2xl border-2 border-dashed border-amber-300">
              {placedCards.length === 0 ? (
                <div className="text-center text-amber-800/70 text-xs">
                  Pose une carte physique en cliquant dans la réserve ci-dessous.
                </div>
              ) : (
                placedCards.map(p => {
                  const card = ALL_FLASHCARDS.find(c => c.id === p.cardId);
                  return (
                    <div
                      key={p.cardId}
                      onClick={() => onRemoveCard(p.cardId)}
                      className="p-3 bg-white rounded-2xl shadow-lg border-2 border-amber-400 flex flex-col items-center cursor-pointer hover:scale-105 transition-all text-center min-w-[80px]"
                    >
                      <span className="text-3xl mb-1">{card?.iconName || '📄'}</span>
                      <span className="text-xs font-bold text-slate-900 font-heading">{card?.label}</span>
                      <span className="text-[9px] text-emerald-600 font-bold mt-1">Détectée ✓</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Side: Tray of Tactile Blocks or Flashcards to pick from */}
        <div className="w-full lg:w-72 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-amber-200/90 shadow-md">
          <span className="text-xs font-bold text-slate-800 font-heading block mb-2">
            {activeDeskMode === 'coding' ? 'Réserve de Blocs Osmo :' : 'Réserve de Cartes Phygitales :'}
          </span>

          {activeDeskMode === 'coding' ? (
            <div className="grid grid-cols-2 gap-2">
              {presetBlocks.map((blk, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onAddBlock(blk);
                    soundManager.playCardSnap();
                  }}
                  className={`p-2 rounded-xl text-xs font-bold shadow-sm border border-white/50 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading ${blk.color}`}
                >
                  <span className="text-base">{blk.icon}</span>
                  <span className="text-[10px] leading-tight text-center">{blk.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {ALL_FLASHCARDS.slice(0, 12).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onPlaceCard(c.id, 50, 50);
                    soundManager.playCardSnap();
                  }}
                  className="p-1.5 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 flex flex-col items-center text-center cursor-pointer transition-all"
                >
                  <span className="text-xl leading-none">{c.iconName || '📄'}</span>
                  <span className="text-[9px] font-bold text-slate-800 truncate max-w-full font-heading mt-0.5">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
