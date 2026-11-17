import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronLeft, Loader2, Check, Eraser, Undo2, Paintbrush } from 'lucide-react';
import { BorderSize } from '../../types';
import { myPartFilterStyle } from './PhotoPartCreatorModal';

type CutShape = 'auto' | 'circle' | 'heart' | 'star' | 'square';
type BrushTool = 'erase' | 'restore';
type Step = 'shape-select' | 'processing' | 'preview';

interface Props {
  file: File | null;
  onClose: () => void;
  onAdd: (dataUrl: string, borderSize: BorderSize, hasShadow: boolean) => void;
}

// ---- Alpha cleanup thresholds (tune here) ----
const ALPHA_HIGH = 128;  // >= this → 255 (fully opaque)
const ALPHA_LOW  = 38;   // <  this → 0   (fully transparent)

const BRUSH_SIZES = [16, 36, 64] as const;
type BrushSize = typeof BRUSH_SIZES[number];

// ---- Canvas helpers ----

function drawHeartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.moveTo(cx, cy + r * 0.65);
  ctx.bezierCurveTo(cx - r * 2.1, cy + r * 0.1, cx - r * 1.0, cy - r * 1.4, cx, cy - r * 0.6);
  ctx.bezierCurveTo(cx + r * 1.0, cy - r * 1.4, cx + r * 2.1, cy + r * 0.1, cx, cy + r * 0.65);
  ctx.closePath();
}

function drawStarPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const inner = r * 0.42;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : inner;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

async function imgToCanvas(source: Blob | File, maxSide = 1600): Promise<HTMLCanvasElement> {
  const img = new Image();
  const url = URL.createObjectURL(source);
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
  URL.revokeObjectURL(url);
  let w = img.naturalWidth, h = img.naturalHeight;
  if (Math.max(w, h) > maxSide) {
    const s = maxSide / Math.max(w, h);
    w = Math.round(w * s); h = Math.round(h * s);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return canvas;
}

// Apply shape clipping for circle / heart / star / square
async function applyShapeMask(source: File | Blob, shape: CutShape): Promise<Blob> {
  if (shape === 'auto' || shape === 'square') {
    const canvas = await imgToCanvas(source);
    return new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej(), 'image/webp', 0.9));
  }
  const canvas = await imgToCanvas(source);
  const { width: w, height: h } = canvas;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d')!;
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 * 0.95;
  ctx.beginPath();
  if (shape === 'circle') ctx.arc(cx, cy, r, 0, Math.PI * 2);
  else if (shape === 'heart') drawHeartPath(ctx, cx, cy, r);
  else drawStarPath(ctx, cx, cy, r);
  ctx.clip();
  ctx.drawImage(canvas, 0, 0);
  return new Promise<Blob>((res, rej) => out.toBlob(b => b ? res(b) : rej(), 'image/webp', 0.9));
}

// Post-process AI alpha: threshold + 1px blur for smooth edges
async function cleanAlpha(blob: Blob): Promise<Blob> {
  const img = new Image();
  const url = URL.createObjectURL(blob);
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
  URL.revokeObjectURL(url);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const { width: w, height: h } = canvas;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // Step 1: threshold alpha
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] >= ALPHA_HIGH) d[i] = 255;
    else if (d[i] < ALPHA_LOW) d[i] = 0;
    // else keep for smooth edges
  }

  // Step 2: 1px box blur on alpha only (smooth jagged edges)
  const tmp = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) tmp[i] = d[i * 4 + 3];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      d[i * 4 + 3] = Math.round((
        tmp[i - w - 1] + tmp[i - w] + tmp[i - w + 1] +
        tmp[i - 1]     + tmp[i]     + tmp[i + 1] +
        tmp[i + w - 1] + tmp[i + w] + tmp[i + w + 1]
      ) / 9);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  return new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej(), 'image/png'));
}

// Detect solid-color background and remove via flood-fill from edges.
// Returns processed Blob, or null if background is not solid enough (→ use AI).
async function tryColorRemoval(source: File | Blob): Promise<Blob | null> {
  const canvas = await imgToCanvas(source, 1600);
  const { width: w, height: h } = canvas;
  const ctx = canvas.getContext('2d')!;
  const px = ctx.getImageData(0, 0, w, h).data;

  const getRGB = (idx: number): [number, number, number] => [px[idx * 4], px[idx * 4 + 1], px[idx * 4 + 2]];

  const edgeIndices: number[] = [];
  for (let x = 0; x < w; x++) { edgeIndices.push(x); edgeIndices.push((h - 1) * w + x); }
  for (let y = 1; y < h - 1; y++) { edgeIndices.push(y * w); edgeIndices.push(y * w + w - 1); }

  let rSum = 0, gSum = 0, bSum = 0;
  const n = edgeIndices.length;
  for (const idx of edgeIndices) { const [r, g, b] = getRGB(idx); rSum += r; gSum += g; bSum += b; }
  const bgColor: [number, number, number] = [rSum / n, gSum / n, bSum / n];

  let variance = 0;
  for (const idx of edgeIndices) {
    const [r, g, b] = getRGB(idx);
    variance += (r - bgColor[0]) ** 2 + (g - bgColor[1]) ** 2 + (b - bgColor[2]) ** 2;
  }
  variance /= n;
  if (variance > 2500) return null;

  const TOLERANCE = 55;
  const colorDist = (a: [number, number, number], b: [number, number, number]) =>
    Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
  const isBgPx = (idx: number) => colorDist(getRGB(idx), bgColor) < TOLERANCE;

  const mask = new Uint8Array(w * h);
  const queue: number[] = [];
  const tryAdd = (idx: number) => {
    if (idx < 0 || idx >= w * h || mask[idx] !== 0) return;
    if (isBgPx(idx)) { mask[idx] = 1; queue.push(idx); } else { mask[idx] = 2; }
  };
  for (let x = 0; x < w; x++) { tryAdd(x); tryAdd((h - 1) * w + x); }
  for (let y = 1; y < h - 1; y++) { tryAdd(y * w); tryAdd(y * w + w - 1); }
  let qi = 0;
  while (qi < queue.length) {
    const idx = queue[qi++];
    const x = idx % w, y = Math.floor(idx / w);
    if (x > 0)     tryAdd(idx - 1);
    if (x < w - 1) tryAdd(idx + 1);
    if (y > 0)     tryAdd(idx - w);
    if (y < h - 1) tryAdd(idx + w);
  }

  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const outCtx = out.getContext('2d')!;
  const outData = outCtx.createImageData(w, h);
  const od = outData.data;
  for (let idx = 0; idx < w * h; idx++) {
    const si = idx * 4;
    od[si] = px[si]; od[si + 1] = px[si + 1]; od[si + 2] = px[si + 2];
    if (mask[idx] !== 1) { od[si + 3] = 255; continue; }
    const x = idx % w, y = Math.floor(idx / w);
    const hasAdjacentFg =
      (x > 0 && mask[idx - 1] !== 1) || (x < w - 1 && mask[idx + 1] !== 1) ||
      (y > 0 && mask[idx - w] !== 1) || (y < h - 1 && mask[idx + w] !== 1);
    od[si + 3] = hasAdjacentFg ? 80 : 0;
  }
  outCtx.putImageData(outData, 0, 0);
  return new Promise<Blob>((res, rej) => out.toBlob(b => b ? res(b) : rej(), 'image/webp', 0.9));
}

// ---- UI Constants ----

const SHAPE_OPTIONS: { key: CutShape; label: string; emoji: string }[] = [
  { key: 'auto',   label: '自動',   emoji: '✂️' },
  { key: 'circle', label: '丸',     emoji: '⭕' },
  { key: 'heart',  label: 'ハート', emoji: '♡' },
  { key: 'star',   label: '星',     emoji: '★' },
  { key: 'square', label: '四角',   emoji: '⬜' },
];

const BORDER_OPTIONS: { key: BorderSize; label: string }[] = [
  { key: 'none',   label: 'なし' },
  { key: 'thin',   label: '細い' },
  { key: 'normal', label: 'ふつう' },
  { key: 'thick',  label: '太い' },
];

// ---- Component ----

export const PhotoStickerModal: React.FC<Props> = ({ file, onClose, onAdd }) => {
  const [step, setStep] = useState<Step>('shape-select');
  const [shape, setShape] = useState<CutShape>('auto');
  const [borderSize, setBorderSize] = useState<BorderSize>('thin');
  const [hasShadow, setHasShadow] = useState(true);
  const [previewSrc, setPreviewSrc] = useState('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  // Brush tool state
  const [tool, setTool] = useState<BrushTool>('erase');
  const [brushSize, setBrushSize] = useState<BrushSize>(36);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origImgDataRef = useRef<ImageData | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Reset when new file arrives
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewSrc(url);
    setStep('shape-select');
    setProcessedBlob(null);
    setError('');
    setShape('auto');
    setBorderSize('thin');
    setHasShadow(true);
    setUndoStack([]);
    origImgDataRef.current = null;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Initialize brush canvas when entering preview step
  useEffect(() => {
    if (step !== 'preview' || !processedBlob || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const url = URL.createObjectURL(processedBlob);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      origImgDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setUndoStack([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [step, processedBlob]);

  // ---- Process ----

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setError('');
    setStep('processing');
    try {
      let blob: Blob;
      if (shape === 'auto') {
        // 1. Try fast solid-color removal first
        const colorBlob = await tryColorRemoval(file);
        if (colorBlob) {
          blob = colorBlob;
        } else {
          // 2. AI background removal (isnet_fp16 by default)
          const { removeBackground } = await import('@imgly/background-removal');
          const aiBlob = await removeBackground(file, {
            // No publicPath → library default: staticimgly.com CDN (isnet_fp16)
            output: { format: 'image/png', quality: 1 },
          });
          blob = await cleanAlpha(aiBlob);
        }
      } else {
        blob = await applyShapeMask(file, shape);
      }
      setProcessedBlob(blob);
      setStep('preview');
    } catch (err) {
      console.error(err);
      setError('うまく切り抜けなかったので、形を選んで切り抜いてね');
      setStep('shape-select');
    }
  }, [file, shape]);

  // ---- Brush helpers ----

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
      scaleX: canvas.width / rect.width,
    };
  };

  const applyBrush = useCallback((cx: number, cy: number, scaledRadius: number, currentTool: BrushTool) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    if (currentTool === 'erase') {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scaledRadius);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.65, 'rgba(0,0,0,0.85)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, scaledRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Restore: copy pixels from original with alpha
      const orig = origImgDataRef.current;
      if (!orig) return;
      const r = Math.ceil(scaledRadius);
      const x0 = Math.max(0, Math.floor(cx - r));
      const y0 = Math.max(0, Math.floor(cy - r));
      const x1 = Math.min(canvas.width,  Math.ceil(cx + r));
      const y1 = Math.min(canvas.height, Math.ceil(cy + r));
      const pw = x1 - x0, ph = y1 - y0;
      if (pw <= 0 || ph <= 0) return;
      const patch = ctx.getImageData(x0, y0, pw, ph);
      const pd = patch.data;
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
          if (dist > scaledRadius) continue;
          const strength = 1 - (dist / scaledRadius) ** 2;
          const pi = ((py - y0) * pw + (px - x0)) * 4;
          const oi = (py * canvas.width + px) * 4;
          const targetAlpha = Math.round(255 * strength);
          pd[pi]     = orig.data[oi];
          pd[pi + 1] = orig.data[oi + 1];
          pd[pi + 2] = orig.data[oi + 2];
          pd[pi + 3] = Math.max(pd[pi + 3], targetAlpha);
        }
      }
      ctx.putImageData(patch, x0, y0);
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = null;
    // Save snapshot for undo
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setUndoStack(prev => [...prev.slice(-9), snap]);
    }
    const { x, y, scaleX } = getCanvasPos(e);
    applyBrush(x, y, (brushSize / 2) * scaleX, tool);
    lastPosRef.current = { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const { x, y, scaleX } = getCanvasPos(e);
    const scaledRadius = (brushSize / 2) * scaleX;
    const last = lastPosRef.current;
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = scaledRadius * 0.4;
      const steps = Math.max(1, Math.ceil(dist / step));
      for (let i = 1; i <= steps; i++) {
        applyBrush(last.x + dx * i / steps, last.y + dy * i / steps, scaledRadius, tool);
      }
    } else {
      applyBrush(x, y, scaledRadius, tool);
    }
    lastPosRef.current = { x, y };
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const newStack = [...undoStack];
    const restored = newStack[newStack.length - 2];
    newStack.pop();
    setUndoStack(newStack);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d', { willReadFrequently: true })!.putImageData(restored, 0, 0);
    }
  };

  // ---- Add to canvas ----

  const handleAdd = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/webp', 0.88);
    onAdd(dataUrl, borderSize, hasShadow);
    onClose();
  };

  if (!file) return null;

  return (
    <div className="absolute inset-0 z-[200] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-11 pb-3 border-b border-pink-100 shrink-0">
        {step === 'preview' ? (
          <button onClick={() => setStep('shape-select')} className="p-2 text-slate-500 hover:text-pink-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <h2 className="font-extrabold text-sm text-slate-800">ステッカーを作る</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ---- STEP: shape-select ---- */}
      {step === 'shape-select' && (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="w-40 h-40 mx-auto rounded-2xl border border-pink-100 overflow-hidden bg-slate-50 flex items-center justify-center">
            {previewSrc && <img src={previewSrc} alt="選択した写真" className="w-full h-full object-contain" />}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 mb-3 text-center">切り抜き方を選んでね♡</p>
            <div className="grid grid-cols-5 gap-2">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setShape(opt.key)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all ${
                    shape === opt.key
                      ? 'border-pink-400 bg-pink-50 scale-105 shadow-sm'
                      : 'border-slate-200 hover:border-pink-200 bg-white'
                  }`}
                >
                  <span className="text-xl leading-none">{opt.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-600 leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
            {shape === 'auto' && (
              <p className="text-[11px] text-slate-500 text-center mt-2 leading-tight">
                単色の背景は素早く除去。複雑な背景はAIで自動除去します
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-bold text-center bg-rose-50 py-2 px-3 rounded-xl">{error}</p>
          )}

          <button
            onClick={handleProcess}
            className="w-full py-3 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-extrabold text-sm rounded-full shadow-md transition active:scale-95"
          >
            切り抜く
          </button>
        </div>
      )}

      {/* ---- STEP: processing ---- */}
      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
          <Loader2 className="w-12 h-12 text-pink-400 animate-spin" />
          <div className="text-center space-y-1">
            <p className="font-extrabold text-slate-700">背景を切り抜いています…</p>
            {shape === 'auto' && (
              <p className="text-xs text-slate-500">初回はAIモデルの読み込みで少し時間がかかります</p>
            )}
          </div>
        </div>
      )}

      {/* ---- STEP: preview ---- */}
      {step === 'preview' && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Canvas preview with checkerboard bg */}
          <div
            className="rounded-2xl overflow-hidden mx-auto border border-pink-100 relative"
            style={{
              maxWidth: '100%',
              background: 'repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%) 0 0 / 12px 12px',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: '100%',
                maxHeight: '220px',
                display: 'block',
                margin: '0 auto',
                touchAction: 'none',
                cursor: tool === 'erase' ? 'cell' : 'crosshair',
                filter: myPartFilterStyle(borderSize, hasShadow) || undefined,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>

          {/* Brush controls */}
          <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              {/* Tool toggle */}
              <div className="flex gap-1 flex-1">
                <button
                  onClick={() => setTool('erase')}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    tool === 'erase'
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  <Eraser className="w-3 h-3" /> 消しゴム
                </button>
                <button
                  onClick={() => setTool('restore')}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    tool === 'restore'
                      ? 'border-blue-400 bg-blue-50 text-blue-600'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  <Paintbrush className="w-3 h-3" /> 戻す
                </button>
              </div>
              {/* Undo */}
              <button
                onClick={handleUndo}
                disabled={undoStack.length <= 1}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 transition flex items-center gap-1 text-xs font-bold"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            </div>

            {/* Brush size */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-bold mr-1">太さ</span>
              {BRUSH_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setBrushSize(s)}
                  className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                    brushSize === s
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div
                    className="rounded-full bg-slate-500"
                    style={{ width: s === 16 ? 6 : s === 36 ? 10 : 15, height: s === 16 ? 6 : s === 36 ? 10 : 15 }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Border picker */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">白いふち</p>
            <div className="grid grid-cols-4 gap-2">
              {BORDER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setBorderSize(opt.key)}
                  className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    borderSize === opt.key
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shadow toggle */}
          <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-2.5">
            <span className="text-xs font-bold text-slate-700">影をつける</span>
            <button
              onClick={() => setHasShadow((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative ${hasShadow ? 'bg-pink-400' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasShadow ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-3 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-extrabold text-sm rounded-full shadow-md transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            ペンライトに追加する
          </button>
        </div>
      )}
    </div>
  );
};
