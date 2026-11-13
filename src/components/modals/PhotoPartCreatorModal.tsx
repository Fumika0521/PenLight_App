import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Loader2, ChevronLeft, Sparkles } from 'lucide-react';
import { BorderSize, MyPart } from '../../types';
import { saveMyPart } from '../../lib/myPartsDB';

type CutShape = 'auto' | 'circle' | 'heart' | 'star';
type Step = 'select' | 'processing' | 'preview';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPartCreated: (part: MyPart) => void;
}

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
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

async function imgToCanvas(source: Blob | File, maxSide = 512): Promise<HTMLCanvasElement> {
  const img = new Image();
  const url = URL.createObjectURL(source);
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (Math.max(w, h) > maxSide) {
    const s = maxSide / Math.max(w, h);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return canvas;
}

async function applyShapeMask(source: File | Blob, shape: CutShape): Promise<string> {
  if (shape === 'auto') {
    // Background already removed; just scale down
    const canvas = await imgToCanvas(source);
    return canvas.toDataURL('image/webp', 0.85);
  }

  const canvas = await imgToCanvas(source);
  const { width: w, height: h } = canvas;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d')!;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 * 0.95;

  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (shape === 'heart') {
    drawHeartPath(ctx, cx, cy, r);
  } else {
    drawStarPath(ctx, cx, cy, r);
  }
  ctx.clip();
  ctx.drawImage(canvas, 0, 0);
  return out.toDataURL('image/webp', 0.85);
}

// CSS filter string for border + shadow applied at render time
export function myPartFilterStyle(borderSize?: BorderSize, hasShadow?: boolean): string {
  const filters: string[] = [];
  if (borderSize && borderSize !== 'none') {
    const px = { thin: 2, normal: 4, thick: 7 }[borderSize];
    const px2 = px * 1.6;
    filters.push(
      `drop-shadow(0 0 ${px}px white)`,
      `drop-shadow(0 0 ${px2}px white)`,
      `drop-shadow(0 0 ${px2}px white)`
    );
  }
  if (hasShadow) {
    filters.push('drop-shadow(0 3px 8px rgba(0,0,0,0.28))');
  }
  return filters.join(' ');
}

// ---- Component ----

const SHAPE_OPTIONS: { key: CutShape; label: string; emoji: string }[] = [
  { key: 'auto', label: '自動', emoji: '✂️' },
  { key: 'circle', label: '丸', emoji: '⭕' },
  { key: 'heart', label: 'ハート', emoji: '♡' },
  { key: 'star', label: '星', emoji: '★' },
];

const BORDER_OPTIONS: { key: BorderSize; label: string }[] = [
  { key: 'none', label: 'なし' },
  { key: 'thin', label: '細い' },
  { key: 'normal', label: 'ふつう' },
  { key: 'thick', label: '太い' },
];

export const PhotoPartCreatorModal: React.FC<Props> = ({ isOpen, onClose, onPartCreated }) => {
  const [step, setStep] = useState<Step>('select');
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [shape, setShape] = useState<CutShape>('auto');
  const [borderSize, setBorderSize] = useState<BorderSize>('thin');
  const [hasShadow, setHasShadow] = useState(true);
  const [processedDataUrl, setProcessedDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isFirstTime] = useState(() => !localStorage.getItem('mypart_used'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('select');
    setFile(null);
    setPreviewSrc('');
    setProcessedDataUrl('');
    setError('');
    setShape('auto');
    setBorderSize('thin');
    setHasShadow(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    const url = URL.createObjectURL(f);
    setPreviewSrc(url);
  };

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setError('');
    setStep('processing');

    try {
      let sourceBlob: File | Blob = file;

      if (shape === 'auto') {
        const { removeBackground } = await import('@imgly/background-removal');
        sourceBlob = await removeBackground(file, {
          publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/',
          output: { format: 'image/png', quality: 1 },
        });
        localStorage.setItem('mypart_used', '1');
      }

      const dataUrl = await applyShapeMask(sourceBlob, shape);
      setProcessedDataUrl(dataUrl);
      setStep('preview');
    } catch (err) {
      console.error(err);
      setError('切り抜きに失敗しました。別の写真で試してください。');
      setStep('select');
    }
  }, [file, shape]);

  const handleSave = async () => {
    if (!processedDataUrl) return;
    const id = `mypart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const name = file?.name.replace(/\.[^.]+$/, '') || 'マイパーツ';
    const part: MyPart = { id, name, dataUrl: processedDataUrl, createdAt: Date.now() };
    await saveMyPart(part);
    onPartCreated(part);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[200] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-11 pb-3 border-b border-pink-100 shrink-0">
        {step === 'preview' ? (
          <button onClick={() => setStep('select')} className="p-2 text-slate-500 hover:text-pink-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <h2 className="font-extrabold text-sm text-slate-800">写真からパーツを作る</h2>
        <button
          onClick={() => { reset(); onClose(); }}
          className="p-2 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ---- STEP: select ---- */}
      {step === 'select' && (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Photo picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-44 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
              file ? 'border-pink-300 bg-pink-50/40' : 'border-pink-200 hover:border-pink-400 bg-pink-50/20'
            }`}
          >
            {file && previewSrc ? (
              <img src={previewSrc} alt="選択した写真" className="w-full h-full object-contain rounded-3xl" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-pink-300" />
                <span className="text-sm font-bold text-pink-400">写真を選ぶ</span>
                <span className="text-xs text-slate-400">タップしてファイルを選択</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Shape selector */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">切り抜き方</p>
            <div className="grid grid-cols-4 gap-2">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setShape(opt.key)}
                  className={`flex flex-col items-center py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                    shape === opt.key
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-pink-200'
                  }`}
                >
                  <span className="text-xl mb-0.5">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-2xl px-4 py-3 space-y-1">
            <p className="text-xs font-bold text-blue-500">きれいに切り抜くコツ</p>
            <p className="text-xs text-slate-500">
              切り抜きたいものを全部写真に収めて、シンプルな背景で撮ってください。
            </p>
          </div>

          {/* Copyright */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="text-xs text-amber-700 font-semibold">
              ⚠️ 権利者の許可がない画像を公開しないでください。
            </p>
          </div>

          {error && <p className="text-xs text-rose-500 font-bold text-center">{error}</p>}

          <button
            onClick={handleProcess}
            disabled={!file}
            className={`w-full py-3.5 rounded-full font-extrabold text-sm transition-all ${
              file
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-cute active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {shape === 'auto' ? '✂️ 自動で切り抜く' : '切り抜く'}
          </button>
        </div>
      )}

      {/* ---- STEP: processing ---- */}
      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
          <Loader2 className="w-12 h-12 text-pink-400 animate-spin" />
          <p className="font-bold text-slate-700 text-sm">背景を切り抜いています...</p>
          {isFirstTime && (
            <p className="text-xs text-slate-400 leading-relaxed">
              はじめての切り抜きはAIモデルの読み込みがあるため、少し時間がかかります。
            </p>
          )}
        </div>
      )}

      {/* ---- STEP: preview ---- */}
      {step === 'preview' && processedDataUrl && (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Preview */}
          <div className="w-full h-52 flex items-center justify-center bg-[length:16px_16px] rounded-3xl overflow-hidden"
            style={{ backgroundImage: 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0,0 8px,8px -8px,-8px 0' }}>
            <img
              src={processedDataUrl}
              alt="プレビュー"
              className="max-w-full max-h-full object-contain"
              style={{ filter: myPartFilterStyle(borderSize, hasShadow) || undefined }}
            />
          </div>

          {/* Border */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">白いふちどり</p>
            <div className="grid grid-cols-4 gap-2">
              {BORDER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setBorderSize(opt.key)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    borderSize === opt.key
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-pink-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shadow */}
          <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
            <span className="text-sm font-bold text-slate-600">うっすらした影</span>
            <button
              onClick={() => setHasShadow(!hasShadow)}
              className={`w-12 h-6 rounded-full transition-all relative ${hasShadow ? 'bg-pink-400' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${hasShadow ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-extrabold text-sm rounded-full shadow-cute active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            パーツにする
          </button>
        </div>
      )}
    </div>
  );
};
