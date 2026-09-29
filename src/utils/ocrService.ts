import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
  cleanWord: string;
  matchedTarget?: string;
  rawText: string;
}

class OcrService {
  private worker: any = null;
  private isInitializing: boolean = false;
  private isReady: boolean = false;

  async initWorker(): Promise<boolean> {
    if (this.isReady && this.worker) return true;
    if (this.isInitializing) {
      // wait until ready
      let count = 0;
      while (this.isInitializing && count < 30) {
        await new Promise(r => setTimeout(r, 200));
        count++;
      }
      return this.isReady;
    }

    try {
      this.isInitializing = true;
      // In Tesseract.js v5/v6/v7, createWorker takes language
      this.worker = await createWorker('eng');
      this.isReady = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('Tesseract worker initialization failed, falling back to direct mode:', err);
      this.isInitializing = false;
      this.isReady = false;
      return false;
    }
  }

  /**
   * Pre-process image on canvas to enhance contrast for OCR
   */
  preprocessCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = sourceCanvas.width;
    outputCanvas.height = sourceCanvas.height;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return sourceCanvas;

    ctx.drawImage(sourceCanvas, 0, 0);
    const imgData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = imgData.data;

    // Grayscale & contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Increase contrast
      const factor = 1.4;
      const enhanced = factor * (avg - 128) + 128;
      const binarized = enhanced > 120 ? 255 : Math.max(0, enhanced * 0.8);

      data[i] = binarized;
      data[i + 1] = binarized;
      data[i + 2] = binarized;
    }

    ctx.putImageData(imgData, 0, 0);
    return outputCanvas;
  }

  /**
   * Recognize text from canvas, video frame or data URL
   */
  async recognize(
    imageSource: HTMLCanvasElement | HTMLVideoElement | string,
    targetCandidates: string[] = []
  ): Promise<OcrResult> {
    try {
      let canvasToScan: HTMLCanvasElement | string = '';

      if (imageSource instanceof HTMLVideoElement) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageSource.videoWidth || 640;
        tempCanvas.height = imageSource.videoHeight || 480;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imageSource, 0, 0, tempCanvas.width, tempCanvas.height);
        }
        canvasToScan = this.preprocessCanvas(tempCanvas);
      } else if (imageSource instanceof HTMLCanvasElement) {
        canvasToScan = this.preprocessCanvas(imageSource);
      } else {
        canvasToScan = imageSource;
      }

      await this.initWorker();

      let resultText = '';
      let confidence = 0;

      if (this.worker && this.isReady) {
        const ret = await this.worker.recognize(canvasToScan);
        resultText = ret.data.text || '';
        confidence = ret.data.confidence || 0;
      } else {
        // Fallback using Tesseract direct if worker failed
        const Tesseract = await import('tesseract.js');
        const ret = await Tesseract.recognize(canvasToScan, 'eng');
        resultText = ret.data.text || '';
        confidence = ret.data.confidence || 0;
      }

      const cleanWord = resultText
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .toUpperCase();

      // Find closest match among candidate words or letters
      let matchedTarget: string | undefined = undefined;
      const wordsInResult = cleanWord.split(/\s+/).filter(Boolean);

      if (targetCandidates.length > 0) {
        // Direct exact match
        for (const candidate of targetCandidates) {
          const upperCand = candidate.toUpperCase();
          if (cleanWord.includes(upperCand)) {
            matchedTarget = candidate;
            break;
          }
          if (wordsInResult.includes(upperCand)) {
            matchedTarget = candidate;
            break;
          }
        }

        // Fuzzy match or sub-letter match if not matched yet
        if (!matchedTarget) {
          for (const candidate of targetCandidates) {
            const upperCand = candidate.toUpperCase();
            if (upperCand.length === 1 && cleanWord.includes(upperCand)) {
              matchedTarget = candidate;
              break;
            }
          }
        }
      }

      return {
        text: resultText.trim(),
        cleanWord,
        confidence: Math.round(confidence),
        matchedTarget,
        rawText: resultText,
      };
    } catch (err) {
      console.error('OCR Recognition error:', err);
      return {
        text: '',
        cleanWord: '',
        confidence: 0,
        rawText: '',
      };
    }
  }

  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (e) {
        // ignore
      }
      this.worker = null;
      this.isReady = false;
    }
  }
}

export const ocrService = new OcrService();
