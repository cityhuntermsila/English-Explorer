import React from 'react';
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import mascotImg from '../assets/images/massi_fennec_mascot_1790628791368.jpg';
import osmoMapBg from '../assets/images/osmo_island_map_1790629757664.jpg';

export interface GridEntity {
  id: string;
  x: number;
  y: number;
  icon: string;
  label: string;
  collected?: boolean;
}

interface OsmoGameGridProps {
  playerPos: { x: number; y: number; dir: 'right' | 'left' | 'up' | 'down' };
  collectibles: GridEntity[];
  gridSize?: { cols: number; rows: number };
  onCollect?: (item: GridEntity) => void;
  statusMessage?: string;
  isMoving?: boolean;
}

export const OsmoGameGrid: React.FC<OsmoGameGridProps> = ({
  playerPos,
  collectibles,
  gridSize = { cols: 6, rows: 6 },
  statusMessage,
  isMoving = false,
}) => {
  return (
    <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden shadow-inner border-2 border-emerald-400/40 bg-sky-200 select-none">
      {/* Background Illustrated Island Texture */}
      <img
        src={osmoMapBg}
        alt="Osmo Adventure Island"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-85"
      />

      {/* Grid Overlay Lines (Exact Osmo Style) */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
        {[...Array(36)].map((_, i) => (
          <div
            key={i}
            className="border border-white/20 transition-colors hover:bg-white/10"
          />
        ))}
      </div>

      {/* Target Items / Collectibles on Grid */}
      {collectibles.map((item) => {
        if (item.collected) return null;
        const leftPercent = (item.x / gridSize.cols) * 100;
        const topPercent = (item.y / gridSize.rows) * 100;

        return (
          <div
            key={item.id}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              width: `${100 / gridSize.cols}%`,
              height: `${100 / gridSize.rows}%`,
            }}
            className="absolute flex flex-col items-center justify-center transition-all animate-bounce"
          >
            <div className="p-1 sm:p-1.5 bg-white/95 rounded-xl shadow-md border-2 border-amber-300 flex flex-col items-center">
              <span className="text-xl sm:text-2xl leading-none">{item.icon}</span>
              <span className="text-[9px] font-bold text-slate-800 font-heading truncate max-w-[45px]">
                {item.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* Massi le Fennec Player on Grid (Smooth Tile-by-Tile Transition) */}
      <div
        style={{
          left: `${(playerPos.x / gridSize.cols) * 100}%`,
          top: `${(playerPos.y / gridSize.rows) * 100}%`,
          width: `${100 / gridSize.cols}%`,
          height: `${100 / gridSize.rows}%`,
          transition: 'left 400ms ease-out, top 400ms ease-out',
        }}
        className="absolute flex items-center justify-center z-20 pointer-events-none"
      >
        <div className={`relative flex flex-col items-center ${isMoving ? 'scale-110' : ''}`}>
          {/* Pulsing indicator under feet */}
          <div className="absolute -bottom-1 w-8 h-3 bg-amber-500/40 rounded-full blur-[2px] animate-pulse" />

          {/* Massi Character Token */}
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-xl bg-amber-400 ring-2 ring-amber-500/70 transition-transform ${
            playerPos.dir === 'left' ? '-scale-x-100' : ''
          }`}>
            <img
              src={mascotImg}
              alt="Massi Player"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <span className="text-[9px] font-extrabold text-amber-950 bg-white/95 px-1.5 py-0.2 rounded-full shadow-sm font-heading mt-0.5 whitespace-nowrap">
            Massi 🦊
          </span>
        </div>
      </div>

      {/* Grid HUD Ribbon */}
      {statusMessage && (
        <div className="absolute top-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 flex items-center justify-between z-30 shadow-md">
          <div className="flex items-center gap-1.5 text-amber-300 font-heading">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">
            Pos: [{playerPos.x}, {playerPos.y}]
          </span>
        </div>
      )}
    </div>
  );
};
