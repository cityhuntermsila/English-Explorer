import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Sparkles, RefreshCw, Layers, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { ALL_FLASHCARDS } from '../data/curriculumData';
import { CardItem, PlacedCard } from '../types';
import { soundManager } from '../utils/audio';
import { ocrService } from '../utils/ocrService';

interface VisionDetectionZoneProps {
  placedCards: PlacedCard[];
  onPlaceCard: (cardId: string, x?: number, y?: number) => void;
  onRemoveCard: (cardId: string) => void;
  onClearTable: () => void;
  expectedCardId?: string | null;
  targetPreposition?: 'on' | 'under' | 'next_to' | 'in' | null;
  referenceCardId?: string | null;
  filterCategory?: 'all' | 'letter' | 'family' | 'school';
  promptMessage?: string;
  isEvaluating?: boolean;
}

export const VisionDetectionZone: React.FC<VisionDetectionZoneProps> = ({
  placedCards,
  onPlaceCard,
  onRemoveCard,
  onClearTable,
  expectedCardId,
  targetPreposition,
  referenceCardId,
  filterCategory = 'all',
  promptMessage = 'Pose la carte demandée sur la table phygitale',
  isEvaluating = false,
}) => {
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamAllowed, setWebcamAllowed] = useState<boolean | null>(null);
  const [selectedQuickCard, setSelectedQuickCard] = useState<string>('');
  const [simulatedScanNotice, setSimulatedScanNotice] = useState<string>('');
  const [isOcrScanning, setIsOcrScanning] = useState<boolean>(false);
  const [lastDetectedText, setLastDetectedText] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const ocrIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter available cards for tray
  const availableCards = ALL_FLASHCARDS.filter(
    c => filterCategory === 'all' || c.category === filterCategory
  );

  // Target card labels for OCR matching
  const cardCandidates = availableCards.map(c => c.label.toUpperCase());

  // Toggle live camera
  const toggleCamera = async () => {
    if (useWebcam) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (ocrIntervalRef.current) {
        clearInterval(ocrIntervalRef.current);
        ocrIntervalRef.current = null;
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
        setWebcamAllowed(true);
      } catch (err) {
        console.warn('Camera access unavailable:', err);
        setWebcamAllowed(false);
        setUseWebcam(false);
      }
    }
  };

  // OCR detection cycle on webcam video stream
  useEffect(() => {
    if (useWebcam && !ocrIntervalRef.current) {
      ocrIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || isOcrScanning) return;
        setIsOcrScanning(true);
        try {
          const res = await ocrService.recognize(videoRef.current, cardCandidates);
          if (res.cleanWord) {
            setLastDetectedText(res.cleanWord);
            // Check if matches any available card
            const match = availableCards.find(
              c =>
                res.cleanWord.includes(c.label.toUpperCase()) ||
                res.cleanWord.includes(c.id.toUpperCase())
            );
            if (match && !placedCards.some(p => p.cardId === match.id)) {
              onPlaceCard(match.id, 50, 50);
              soundManager.playCardSnap();
              setSimulatedScanNotice(`OCR Reconnu : ${match.label} (${res.confidence}%)`);
              setTimeout(() => setSimulatedScanNotice(''), 3000);
            }
          }
        } catch (e) {
          // ignore scan error
        } finally {
          setIsOcrScanning(false);
        }
      }, 2500);
    }

    return () => {
      if (ocrIntervalRef.current) {
        clearInterval(ocrIntervalRef.current);
        ocrIntervalRef.current = null;
      }
    };
  }, [useWebcam, isOcrScanning, cardCandidates, availableCards, placedCards, onPlaceCard]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Keep stream attached to videoRef when active
  useEffect(() => {
    if (useWebcam && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [useWebcam]);

  // Handle clicking on table surface to drop or position
  const handleTableClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tableRef.current) return;
    const rect = tableRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const cardToPlace = selectedQuickCard || expectedCardId || availableCards[0]?.id;
    if (cardToPlace) {
      onPlaceCard(cardToPlace, Math.max(10, Math.min(90, x)), Math.max(10, Math.min(90, y)));
      soundManager.playCardSnap();
      setSimulatedScanNotice(`Carte détectée à x:${x}% y:${y}%`);
      setTimeout(() => setSimulatedScanNotice(''), 2500);
    }
  };

  // Find info for cards on table
  const placedCardDetails = placedCards.map(p => ({
    ...p,
    info: ALL_FLASHCARDS.find(c => c.id === p.cardId),
  }));

  // Check if expected card is detected
  const isExpectedDetected = expectedCardId
    ? placedCards.some(p => p.cardId === expectedCardId)
    : false;

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-white rounded-2xl border-2 border-amber-400/40 shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wide text-amber-300 uppercase font-heading">
            Zone Vision · Détection Table
          </span>
        </div>

        <div className="flex items-center gap-2">
          {useWebcam && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/40 font-mono flex items-center gap-1">
              <Eye className={`w-3 h-3 text-amber-400 ${isOcrScanning ? 'animate-spin' : ''}`} />
              <span>OCR Tesseract {isOcrScanning ? 'Scan...' : 'Prêt'}</span>
            </span>
          )}

          <button
            type="button"
            onClick={toggleCamera}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              useWebcam
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {useWebcam ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{useWebcam ? 'Caméra Active' : 'Activer Caméra'}</span>
          </button>

          {placedCards.length > 0 && (
            <button
              type="button"
              onClick={onClearTable}
              className="px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Vider la table"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Vider</span>
            </button>
          )}
        </div>
      </div>

      {/* Instruction banner */}
      <div className="px-3.5 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium truncate">{promptMessage}</span>
        </div>
        {isExpectedDetected && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" /> Détecté !
          </span>
        )}
      </div>

      {/* Main Detection Surface / Table */}
      <div
        ref={tableRef}
        onClick={handleTableClick}
        className="relative flex-1 min-h-[220px] bg-radial from-slate-800 to-slate-950 p-4 overflow-hidden select-none cursor-crosshair group"
      >
        {/* Subtle grid pattern resembling school desk surface */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Live video background if active */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
            useWebcam ? 'opacity-60' : 'opacity-0'
          }`}
          onLoadedMetadata={() => {
            videoRef.current?.play().catch(() => {});
          }}
        />

        {/* Center Optical Target Crosshairs */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-48 h-32 border border-dashed border-amber-300/40 rounded-xl flex items-center justify-center bg-amber-400/5">
            <span className="text-[11px] text-amber-300/60 font-mono tracking-wider">
              [ ZONE TABLE RECONNUE ]
            </span>
          </div>
        </div>

        {/* Placed cards on the table */}
        {placedCardDetails.map(card => {
          const isExpected = card.cardId === expectedCardId;
          return (
            <div
              key={card.cardId}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCard(card.cardId);
              }}
              style={{
                left: `${card.x}%`,
                top: `${card.y}%`,
                transform: `translate(-50%, -50%) rotate(${card.rotation || 0}deg)`,
              }}
              className={`absolute transition-all cursor-pointer p-2 rounded-xl shadow-2xl border-2 select-none group/card ${
                isExpected
                  ? 'bg-amber-400 text-slate-900 border-white ring-4 ring-amber-300/70 scale-110 z-20 animate-pulse-subtle'
                  : 'bg-white text-slate-900 border-amber-300 z-10 hover:scale-105'
              }`}
              title="Clique pour retirer la carte"
            >
              <div className="flex flex-col items-center min-w-[70px] max-w-[100px] text-center">
                <span className="text-2xl leading-none mb-1">
                  {card.info?.iconName || '🃏'}
                </span>
                <span className="text-xs font-bold font-heading truncate max-w-full">
                  {card.info?.label || card.cardId}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {card.info?.category}
                </span>
              </div>
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                ×
              </span>
            </div>
          );
        })}

        {/* Simulated scan notice tag */}
        {simulatedScanNotice && (
          <div className="absolute bottom-3 left-3 bg-emerald-900/90 text-emerald-200 text-xs px-2.5 py-1 rounded-md border border-emerald-500/50 backdrop-blur-sm pointer-events-none flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{simulatedScanNotice}</span>
          </div>
        )}

        {/* Empty state hint */}
        {placedCards.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4 text-slate-400">
            <Layers className="w-8 h-8 text-amber-400/50 mb-2" />
            <p className="text-xs font-medium text-slate-300">
              Pose ta carte physique devant la caméra
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Ou clique n'importe où sur la table pour poser directement une carte
            </p>
          </div>
        )}
      </div>

      {/* Quick Phygital Card Selector Tray */}
      <div className="p-2.5 bg-slate-950/90 border-t border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-slate-400 font-medium">
            Cartes physiques du Term 1 :
          </span>
          {expectedCardId && (
            <span className="text-[11px] text-amber-300 font-bold">
              Cible : {ALL_FLASHCARDS.find(c => c.id === expectedCardId)?.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {availableCards.map(c => {
            const isExpected = c.id === expectedCardId;
            const isAlreadyPlaced = placedCards.some(p => p.cardId === c.id);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedQuickCard(c.id);
                  onPlaceCard(c.id, 50, 50);
                  soundManager.playCardSnap();
                }}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isExpected
                    ? 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300 shadow-md animate-pulse'
                    : isAlreadyPlaced
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 opacity-60'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>{c.iconName || '📄'}</span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
