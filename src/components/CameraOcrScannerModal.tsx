import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, CheckCircle2, Sparkles, X, FlipHorizontal, Eye, Zap, Layers, AlertCircle } from 'lucide-react';
import { ocrService, OcrResult } from '../utils/ocrService';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CameraOcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedTargets?: string[];
  targetWord?: string;
  activityTitle?: string;
  onDetected: (detectedText: string, matchedTarget?: string) => void;
}

export const CameraOcrScannerModal: React.FC<CameraOcrScannerModalProps> = ({
  isOpen,
  onClose,
  expectedTargets = [],
  targetWord,
  activityTitle = 'Activité en cours',
  onDetected,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isAutoScan, setIsAutoScan] = useState<boolean>(true);
  const [lastOcrResult, setLastOcrResult] = useState<OcrResult | null>(null);
  const [matchSuccess, setMatchSuccess] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Targets to search for: targetWord + expectedTargets
  const candidates: string[] = [];
  if (targetWord) candidates.push(targetWord.toUpperCase());
  expectedTargets.forEach(t => {
    if (t && !candidates.includes(t.toUpperCase())) {
      candidates.push(t.toUpperCase());
    }
  });

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La webcam/caméra n\'est pas supportée dans ce navigateur.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.warn('Play interrupted:', e));
        };
        try {
          await videoRef.current.play();
        } catch {
          // Play will start on metadata load
        }
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err?.message || 'Impossible d\'accéder à la caméra (vérifie les autorisations de ton navigateur).'
      );
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Handle camera switch
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Re-bind stream if videoRef mounts or camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  // Switch camera when facingMode changes
  useEffect(() => {
    if (isOpen && isCameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Perform single OCR scan
  const performScan = useCallback(async () => {
    if (!videoRef.current || isScanning) return;
    if (videoRef.current.readyState < 2) return; // not ready

    setIsScanning(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const vWidth = video.videoWidth || 640;
      const vHeight = video.videoHeight || 480;

      // Crop center 70% where the reticle box is located
      const cropW = Math.floor(vWidth * 0.7);
      const cropH = Math.floor(vHeight * 0.7);
      const cropX = Math.floor((vWidth - cropW) / 2);
      const cropY = Math.floor((vHeight - cropH) / 2);

      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      }

      // Run Tesseract OCR
      const result = await ocrService.recognize(canvas, candidates);
      setLastOcrResult(result);
      setScanCount(c => c + 1);

      // Check if match found
      if (result.matchedTarget) {
        setMatchSuccess(result.matchedTarget);
        soundManager.playSuccess();
        confetti({ particleCount: 35, spread: 50 });
        onDetected(result.cleanWord, result.matchedTarget);
        setTimeout(() => setMatchSuccess(null), 3000);
      } else if (candidates.length > 0) {
        // Substring matching
        for (const cand of candidates) {
          if (result.cleanWord.includes(cand) || result.text.toUpperCase().includes(cand)) {
            setMatchSuccess(cand);
            soundManager.playSuccess();
            confetti({ particleCount: 35, spread: 50 });
            onDetected(cand, cand);
            setTimeout(() => setMatchSuccess(null), 3000);
            break;
          }
        }
      } else if (result.cleanWord.length > 0) {
        // Any word detected
        onDetected(result.cleanWord);
      }
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, candidates, onDetected]);

  // Test with digital card simulation
  const testSampleCard = async (word: string) => {
    setIsScanning(true);
    try {
      // Create high-contrast text canvas simulating card
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 400;
      testCanvas.height = 250;
      const ctx = testCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 250);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(4, 4, 392, 242);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word.toUpperCase(), 200, 125);
      }

      const result = await ocrService.recognize(testCanvas, candidates);
      setLastOcrResult(result);
      setScanCount(c => c + 1);

      const matched = result.matchedTarget || word.toUpperCase();
      setMatchSuccess(matched);
      soundManager.playSuccess();
      confetti({ particleCount: 40, spread: 60 });
      onDetected(word.toUpperCase(), matched);
      setTimeout(() => setMatchSuccess(null), 3000);
    } catch (err) {
      console.error('Card test failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
        autoScanTimerRef.current = null;
      }
    }
    return () => {
      stopCamera();
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
      }
    };
  }, [isOpen, startCamera, stopCamera]);

  // Auto-scan loop
  useEffect(() => {
    if (isOpen && isCameraActive && isAutoScan && !matchSuccess) {
      autoScanTimerRef.current = setInterval(() => {
        performScan();
      }, 2200);
    } else if (autoScanTimerRef.current) {
      clearInterval(autoScanTimerRef.current);
      autoScanTimerRef.current = null;
    }
    return () => {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
      }
    };
  }, [isOpen, isCameraActive, isAutoScan, matchSuccess, performScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-400 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[96vh] sm:max-h-[92vh]">
        {/* 1. Modal Top Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3.5 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-extrabold font-heading text-amber-300 truncate">
                  Reconnaissance Visuelle OCR
                </h3>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono font-bold shrink-0">
                  Actif
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {activityTitle} · Scanne ta carte ou ta lettre
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-2"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* 2. Target Objective Banner */}
        <div className="px-5 py-2 bg-amber-500/15 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">
              Cible attendue :{' '}
              <strong className="text-amber-300 uppercase font-mono text-sm underline">
                {targetWord || candidates.join(', ') || 'N\'importe quelle lettre / mot'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoScan(!isAutoScan)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                isAutoScan
                  ? 'bg-emerald-600/40 text-emerald-200 border-emerald-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Scan Auto : {isAutoScan ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={toggleFacingMode}
              className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
              title="Changer de caméra (Avant / Arrière)"
            >
              <FlipHorizontal className="w-3 h-3" />
              <span>Changer caméra</span>
            </button>
          </div>
        </div>

        {/* 3. Main Camera Stage with Reticle */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Live Video - Kept persistently mounted so ref & stream are never broken */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isCameraActive ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            } ${highContrast ? 'contrast-150 grayscale' : ''}`}
            onLoadedMetadata={() => {
              videoRef.current?.play().catch(e => console.warn('Play prevented:', e));
            }}
          />

          {!isCameraActive && (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-md z-10">
              <CameraOff className="w-12 h-12 text-slate-500 mb-3" />
              <p className="text-sm font-semibold text-slate-300 mb-2">
                Caméra non active
              </p>
              {cameraError && (
                <p className="text-xs text-red-400 mb-4 bg-red-950/60 p-2.5 rounded-xl border border-red-500/40">
                  {cameraError}
                </p>
              )}
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer font-heading"
              >
                <Camera className="w-4 h-4" />
                <span>Autoriser et Allumer la Caméra</span>
              </button>
            </div>
          )}

          {/* Hidden Canvas for OCR processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning Reticle Box */}
          {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              <div
                className={`relative w-64 sm:w-80 h-44 sm:h-52 border-2 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                  matchSuccess
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_#10b981]'
                    : isScanning
                    ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_20px_#f59e0b]'
                    : 'border-amber-300/60 bg-black/20'
                }`}
              >
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl-md" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr-md" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl-md" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br-md" />

                {/* Laser scan animation when actively scanning */}
                {isScanning && (
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce" />
                )}

                {/* Central guide text */}
                {!matchSuccess && (
                  <span className="text-[11px] font-mono text-amber-200/80 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-xs text-center max-w-[90%]">
                    Place la carte ou lettre bien droite dans ce cadre
                  </span>
                )}

                {/* Match celebration badge */}
                {matchSuccess && (
                  <div className="bg-emerald-600 text-white font-black px-4 py-2 rounded-xl shadow-xl border-2 border-white flex items-center gap-2 animate-scaleUp">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span className="text-sm font-heading tracking-wider">
                      RECONNU : {matchSuccess} !
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Scanner Feedback Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs flex items-center gap-2 max-w-[70%]">
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400 text-[10px] block">
                  Dernière lecture optique :
                </span>
                <span className="font-mono font-bold text-amber-300 truncate block">
                  {lastOcrResult?.cleanWord || (isScanning ? 'Analyse en cours...' : 'En attente d\'une carte')}
                </span>
              </div>
            </div>

            {lastOcrResult && lastOcrResult.confidence > 0 && (
              <span className="bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/15 text-[11px] font-mono text-slate-300">
                Confiance : <strong className="text-emerald-400">{lastOcrResult.confidence}%</strong>
              </span>
            )}
          </div>
        </div>

        {/* 4. Controls & Sample Digital Card Tester */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={performScan}
              disabled={!isCameraActive || isScanning}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-heading"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Analyse Tesseract...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950" />
                  <span>Scanner Maintenant 📸</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                highContrast
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Filtre Contraste Élevé : {highContrast ? 'Activé' : 'Normal'}
            </button>
          </div>

          {/* Quick-Test Cards Bar (Essential if webcam isn't physically pointing at paper) */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Tester la reconnaissance OCR avec une carte échantillon :
              </span>
              <span className="text-[10px] text-slate-500">
                (Clique pour simuler la lecture d'une carte)
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(candidates.length > 0 ? candidates : ['PENCIL', 'BOOK', 'RULER', 'FATHER', 'STAND']).map(
                cand => (
                  <button
                    key={cand}
                    type="button"
                    onClick={() => testSampleCard(cand)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 hover:border-amber-400 text-xs font-mono font-bold text-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
                    title={`Tester la lecture OCR de ${cand}`}
                  >
                    🃏 {cand}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
