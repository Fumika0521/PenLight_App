import React, { useRef, useState, useEffect } from 'react';
import { StickerItem, PenlightConfig } from '../../types';
import { PenlightBase, HEAD_SCALE } from '../penlight/PenlightBase';
import { myPartFilterStyle } from '../modals/PhotoPartCreatorModal';

// ヘッドスケール後のドーム位置
// p-2パディング + H≈564pxのとき、スケール後もドーム中心はcanvas33.4%のまま維持される
const HEAD_ORIGIN = '50% 45%';
const DOME_Y = 33.4;  // canvas座標でのドーム中心Y（スケール前後で不変）
const DOME_R = 13.3;  // glass inner radius in canvas coords
const INSERT_OFFSET_Y = -4;  // insert縦位置オフセット（%、マイナスで上に移動）

const PENLIGHT_BASE_IMAGES: Record<string, string> = {
  classic: '/assets/hires/penlight_empty.png',
  heart2:  '/assets/hires/penlight_heart2_realistic.png',
  panel:   '/assets/hires/penlight_panel_realistic.png',
  wand:    '/assets/hires/penlight_wand.svg',
};

// Masks that show only the collar/handle area (below the dome head).
// Values match PenlightBase.tsx headCutoff/headFade per base type.
const COLLAR_MASK: Record<string, string> = {
  classic: 'linear-gradient(to bottom, transparent 0%, transparent 43%, black 46%)',
  heart2:  'linear-gradient(to bottom, transparent 0%, transparent 43%, black 46%)',
  panel:   'linear-gradient(to bottom, transparent 0%, transparent 45%, black 48%)',
  wand:    'linear-gradient(to bottom, transparent 0%, transparent 38%, black 42%)',
};

// 推しの名前フォントサイズ（文字数に応じてドーム内に収まるよう調整）
function oshiNameFontPx(len: number): number {
  if (len <= 1) return 50;
  if (len <= 2) return 42;
  if (len <= 3) return 28;
  if (len <= 4) return 22;
  if (len <= 5) return 18;
  if (len <= 6) return 15;
  if (len <= 7) return 13;
  return 11;
}
import { StickerSVG } from '../stickers/StickerSVG';
import { 
  RotateCw, 
  Trash2, 
  Copy, 
  Undo2, 
  Redo2, 
  Layers, 
  ZoomIn, 
  ZoomOut
} from 'lucide-react';

interface InteractiveCanvasProps {
  config: PenlightConfig;
  stickers: StickerItem[];
  selectedId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onDeleteSticker: (id: string) => void;
  onDuplicateSticker: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  canvasRef?: React.RefObject<HTMLDivElement>;
  isConcertMode?: boolean;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  config,
  stickers,
  selectedId,
  onSelectSticker,
  onUpdateSticker,
  onDeleteSticker,
  onDuplicateSticker,
  onBringForward,
  onSendBackward,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  canvasRef: externalCanvasRef,
  isConcertMode = false,
}) => {
  const internalCanvasRef = useRef<HTMLDivElement>(null);
  const containerRef = externalCanvasRef || internalCanvasRef;

  const [zoom, setZoom] = useState<number>(1);
  const [activeDrag, setActiveDrag] = useState<{
    id: string;
    type: 'move' | 'scale' | 'rotate';
    startX: number;
    startY: number;
    initialStickerX: number;
    initialStickerY: number;
    initialScale: number;
    initialRotation: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  // Keyboard navigation / nudge / delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteSticker(selectedId);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const s = stickers.find((item) => item.id === selectedId);
        if (s) onUpdateSticker(selectedId, { y: Math.max(0, s.y - 1) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const s = stickers.find((item) => item.id === selectedId);
        if (s) onUpdateSticker(selectedId, { y: Math.min(100, s.y + 1) });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const s = stickers.find((item) => item.id === selectedId);
        if (s) onUpdateSticker(selectedId, { x: Math.max(0, s.x - 1) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const s = stickers.find((item) => item.id === selectedId);
        if (s) onUpdateSticker(selectedId, { x: Math.min(100, s.x + 1) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, stickers, onDeleteSticker, onUpdateSticker]);

  // Pointer drag move & rotate & scale handling
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    action: 'move' | 'scale' | 'rotate'
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const s = stickers.find((item) => item.id === id);
    if (!s || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const stickerPixelX = rect.left + (s.x / 100) * rect.width;
    const stickerPixelY = rect.top + (s.y / 100) * rect.height;

    onSelectSticker(id);
    setActiveDrag({
      id,
      type: action,
      startX: e.clientX,
      startY: e.clientY,
      initialStickerX: s.x,
      initialStickerY: s.y,
      initialScale: s.scale,
      initialRotation: s.rotation,
      centerX: stickerPixelX,
      centerY: stickerPixelY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    if (activeDrag.type === 'move') {
      const deltaX = (((e.clientX - activeDrag.startX) / rect.width) * 100) / zoom;
      const deltaY = (((e.clientY - activeDrag.startY) / rect.height) * 100) / zoom;

      const newX = Math.min(100, Math.max(0, activeDrag.initialStickerX + deltaX));
      const newY = Math.min(100, Math.max(0, activeDrag.initialStickerY + deltaY));

      onUpdateSticker(activeDrag.id, {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
      });
    } else if (activeDrag.type === 'scale') {
      const distStart = Math.hypot(
        activeDrag.startX - activeDrag.centerX,
        activeDrag.startY - activeDrag.centerY
      );
      const distCurrent = Math.hypot(
        e.clientX - activeDrag.centerX,
        e.clientY - activeDrag.centerY
      );
      const scaleMultiplier = distCurrent / (distStart || 1);
      const newScale = Math.min(3.2, Math.max(0.25, activeDrag.initialScale * scaleMultiplier));

      onUpdateSticker(activeDrag.id, {
        scale: Math.round(newScale * 100) / 100,
      });
    } else if (activeDrag.type === 'rotate') {
      const angleStart = Math.atan2(
        activeDrag.startY - activeDrag.centerY,
        activeDrag.startX - activeDrag.centerX
      );
      const angleCurrent = Math.atan2(
        e.clientY - activeDrag.centerY,
        e.clientX - activeDrag.centerX
      );
      const deltaDeg = ((angleCurrent - angleStart) * 180) / Math.PI;
      let newRot = Math.round(activeDrag.initialRotation + deltaDeg);
      if (newRot > 180) newRot -= 360;
      if (newRot < -180) newRot += 360;

      onUpdateSticker(activeDrag.id, {
        rotation: newRot,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
      setActiveDrag(null);
    }
  };

  const handleCanvasClick = () => {
    onSelectSticker(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Top Floating Mini-Toolbar */}
      <div className="absolute top-3 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-pink-100 rounded-full shadow-cute transition-all">
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-full transition ${
              canUndo
                ? 'hover:bg-pink-50 text-slate-700 active:scale-95'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="元に戻す (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-full transition ${
              canRedo
                ? 'hover:bg-pink-50 text-slate-700 active:scale-95'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="やり直す (Redo)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        )}

        {selectedId && (() => {
          const sel = stickers.find((s) => s.id === selectedId);
          const isInsertSel = sel && (sel.category === 'insert' || sel.layer === 'insert');
          if (isInsertSel) return null;
          return (
            <>
              <div className="w-[1px] h-4 bg-slate-200 mx-1" />
              <button
                onClick={() => onBringForward(selectedId)}
                className="p-1.5 rounded-full hover:bg-pink-50 text-slate-700 active:scale-95 transition"
                title="前面へ"
              >
                <Layers className="w-4 h-4 text-pink-500" />
              </button>
              <button
                onClick={() => onDuplicateSticker(selectedId)}
                className="p-1.5 rounded-full hover:bg-pink-50 text-slate-700 active:scale-95 transition"
                title="複製する"
              >
                <Copy className="w-4 h-4 text-blue-500" />
              </button>
              <button
                onClick={() => onDeleteSticker(selectedId)}
                className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500 active:scale-95 transition"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          );
        })()}
      </div>

      {/* Main Interactive Stage Container */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative h-full max-w-full aspect-[36/53] rounded-3xl transition-colors duration-500 overflow-hidden shadow-cute border-4 ${
          isConcertMode
            ? 'bg-slate-950 border-purple-900/60 shadow-glow-blue'
            : 'canvas-grid-pattern border-white shadow-cute-lg'
        }`}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Floating Sparkles removed — keeps canvas clean for editing */}

        {/* Concert Dark Mode Lights */}
        {isConcertMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-96 bg-gradient-to-b from-white/10 via-pink-400/5 to-transparent blur-md pointer-events-none" />
          </div>
        )}

        {/* 1. Base 3D Penlight — z-0: glass dome visual behind everything */}
        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 pointer-events-none z-0">
          <div className="w-[340px] h-[510px] sm:w-[390px] sm:h-[570px] md:w-[430px] md:h-[620px]">
            <PenlightBase config={config} showGloss={false} />
          </div>
        </div>

        {/* 2. Dome Radial Glow — z-[5]: inside glass, behind insert */}
        {config.isLightOn && (
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              clipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
              WebkitClipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
              background: `radial-gradient(circle at 50% ${DOME_Y}%, ${config.glowColor}40 0%, ${config.glowColor}18 60%, transparent 88%)`,
            }}
          />
        )}

        {/* 3. Inserts Layer — z-10: above glass dome, below collar overlay */}
        <div
          className="absolute inset-0 pointer-events-auto z-10"
          style={{
            clipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
            WebkitClipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
          }}
        >
          {stickers
            .filter((s) => s.category === 'insert' || s.layer === 'insert')
            .map((sticker) => {
              const isSelected = sticker.id === selectedId;
              const wPct = 31 * sticker.scale;
              const hPct = 21 * sticker.scale;

              return (
                <div
                  key={sticker.id}
                  onPointerDown={(e) => handlePointerDown(e, sticker.id, 'move')}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute cursor-move select-none transition-shadow ${
                    isSelected ? 'z-40' : ''
                  }`}
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y + INSERT_OFFSET_Y}%`,
                    width: `${wPct}%`,
                    height: `${hPct}%`,
                    transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) ${
                      sticker.flipX ? 'scaleX(-1)' : ''
                    }`,
                    zIndex: sticker.zIndex,
                    opacity: sticker.opacity ?? 1,
                  }}
                >
                  <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
                    {(sticker.type === '3d-png' || sticker.type === 'preset') && sticker.imageUrl && (
                      <img
                        src={sticker.imageUrl}
                        alt={sticker.svgKey || ''}
                        className="w-full h-full object-contain pointer-events-none select-none"
                        style={{ filter: sticker.cssFilter || undefined }}
                      />
                    )}

                    {/* 推しの名前 — engraved glass text overlay */}
                    {sticker.svgKey === 'insert-oshi-name' && sticker.text && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="pointer-events-none select-none"
                          style={{
                            fontFamily: '"M PLUS Rounded 1c", sans-serif',
                            fontWeight: 800,
                            fontSize: `${oshiNameFontPx(sticker.text.length)}px`,
                            color: 'rgba(255, 255, 255, 0.45)',
                            textShadow: '-1px -1px 0 rgba(255,255,255,0.78), 1.5px 1.5px 2px rgba(100,80,160,0.45)',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {sticker.text}
                        </span>
                      </div>
                    )}

                    {sticker.type === 'text' && (
                      <div
                        className="text-center font-extrabold px-2 py-1 leading-none select-none tracking-widest whitespace-nowrap"
                        style={{
                          color: sticker.textColor || '#ff6584',
                          textShadow: `0 2px 6px rgba(255, 101, 132, 0.4)`,
                          fontFamily: sticker.fontFamily || '"M PLUS Rounded 1c", sans-serif',
                          fontSize: `${28 * sticker.scale}px`,
                          letterSpacing: '0.1em',
                        }}
                      >
                        {sticker.text}
                      </div>
                    )}

                    {sticker.type === 'photo' && sticker.imageUrl && (
                      <div className="w-full h-full overflow-hidden rounded-full border-2 border-white shadow-md bg-white">
                        <img
                          src={sticker.imageUrl}
                          alt="oshi stamp"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* 4. Collar Overlay — z-[20]: penlight body image masked to collar/handle area only,
            covers any insert image that bleeds below the dome circle boundary */}
        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 pointer-events-none z-[20]">
          <div className="w-[340px] h-[510px] sm:w-[390px] sm:h-[570px] md:w-[430px] md:h-[620px]">
            <img
              src={PENLIGHT_BASE_IMAGES[config.baseType] || PENLIGHT_BASE_IMAGES.classic}
              alt=""
              className="w-full h-full object-contain pointer-events-none select-none"
              style={{
                WebkitMaskImage: COLLAR_MASK[config.baseType] || COLLAR_MASK.classic,
                maskImage: COLLAR_MASK[config.baseType] || COLLAR_MASK.classic,
              }}
            />
          </div>
        </div>

        {/* 5. Glass Reflection Layer — z-[25]: dome gloss on top of insert */}
        {config.baseType === 'classic' && (
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 pointer-events-none z-[25]">
            <div className="w-[340px] h-[510px] sm:w-[390px] sm:h-[570px] md:w-[430px] md:h-[620px]">
              <img
                src="/assets/hires/dome_gloss.png"
                alt="Glass Dome Gloss"
                className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]"
                style={{
                  transform: `scale(${HEAD_SCALE})`,
                  transformOrigin: HEAD_ORIGIN,
                }}
              />
            </div>
          </div>
        )}

        {/* 4. Handle Accessories & Stickers Layer (On top of glass reflection) */}
        <div className="absolute inset-0 pointer-events-auto z-30">
          {stickers
            .filter((s) => s.category !== 'insert' && s.layer !== 'insert')
            .map((sticker) => {
              const isSelected = sticker.id === selectedId;
              const isHandleAcc = sticker.category === 'handle' || sticker.layer === 'handle';
              const baseSize = isHandleAcc ? 88 : 72;
              const itemSize = baseSize * sticker.scale;

              return (
                <div
                  key={sticker.id}
                  onPointerDown={(e) => handlePointerDown(e, sticker.id, 'move')}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute cursor-move select-none transition-shadow ${
                    isSelected ? 'z-40' : ''
                  }`}
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    width: `${itemSize}px`,
                    height: `${itemSize}px`,
                    transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) ${
                      sticker.flipX ? 'scaleX(-1)' : ''
                    }`,
                    zIndex: isSelected ? 99 : sticker.zIndex,
                    opacity: sticker.opacity ?? 1,
                  }}
                >
                  <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
                    {(sticker.type === '3d-png' || sticker.type === 'preset') && (
                      <StickerSVG
                        svgKey={sticker.svgKey || ''}
                        imagePath={sticker.imageUrl}
                        customColor={sticker.color}
                        className="w-full h-full drop-shadow-md"
                      />
                    )}

                    {sticker.type === 'text' && (
                      <div
                        className="text-center font-extrabold px-2 py-1 leading-none select-none tracking-widest whitespace-nowrap"
                        style={{
                          color: sticker.textColor || '#ff6584',
                          textShadow: `0 2px 6px rgba(255, 101, 132, 0.4)`,
                          fontFamily: sticker.fontFamily || '"M PLUS Rounded 1c", sans-serif',
                          fontSize: `${28 * sticker.scale}px`,
                          letterSpacing: '0.1em',
                        }}
                      >
                        {sticker.text}
                      </div>
                    )}

                    {sticker.type === 'photo' && sticker.category === 'mypart' && sticker.imageUrl && (
                      <img
                        src={sticker.imageUrl}
                        alt={sticker.name}
                        className="w-full h-full object-contain pointer-events-none"
                        style={{ filter: myPartFilterStyle(sticker.borderSize, sticker.hasShadow) || undefined }}
                      />
                    )}

                    {sticker.type === 'photo' && sticker.category !== 'mypart' && sticker.imageUrl && (
                      <div
                        className={`w-full h-full overflow-hidden border-2 border-white shadow-md bg-white ${
                          sticker.imageShape === 'circle'
                            ? 'rounded-full'
                            : sticker.imageShape === 'heart'
                            ? 'rounded-[30%]'
                            : 'rounded-2xl'
                        }`}
                      >
                        <img
                          src={sticker.imageUrl}
                          alt="oshi stamp"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* 5. Active Selection Handles Overlay (Always visible on top of all layers) */}
        {selectedId && (() => {
          const sticker = stickers.find((s) => s.id === selectedId);
          if (!sticker) return null;
          const isInsert = sticker.category === 'insert' || sticker.layer === 'insert';
          if (isInsert) return null;
          const isHandle = sticker.category === 'handle' || sticker.layer === 'handle';

          const sizeStyle = isInsert
            ? { width: `${31 * sticker.scale}%`, height: `${21 * sticker.scale}%` }
            : { width: `${(isHandle ? 88 : 72) * sticker.scale}px`, height: `${(isHandle ? 88 : 72) * sticker.scale}px` };

          return (
            <div
              className="absolute pointer-events-auto z-50 select-none"
              onClick={(e) => e.stopPropagation()}
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                ...sizeStyle,
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) ${
                  sticker.flipX ? 'scaleX(-1)' : ''
                }`,
              }}
            >
              <div
                className="absolute -inset-1.5 border-2 border-dashed border-[#4facfe] rounded-xl pointer-events-auto shadow-sm cursor-move"
                onPointerDown={(e) => handlePointerDown(e, sticker.id, 'move')}
              >
                {/* Top Rotation Handle */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, sticker.id, 'rotate')}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-[#4facfe] rounded-full shadow flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition"
                  title="回転"
                >
                  <RotateCw className="w-3 h-3 text-[#4facfe]" />
                </div>

                {/* Corner Handles */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#4facfe] rounded-full shadow-xs" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#4facfe] rounded-full shadow-xs" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#4facfe] rounded-full shadow-xs" />

                {/* Bottom-Right Scale Handle */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, sticker.id, 'scale')}
                  className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-pink-400 rounded-full shadow flex items-center justify-center cursor-nwse-resize hover:scale-110 transition"
                  title="拡大・縮小"
                >
                  <div className="w-2 h-2 rounded-full bg-pink-400" />
                </div>

                {/* Quick Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSticker(sticker.id);
                  }}
                  className="absolute -top-3 -right-3 w-5 h-5 bg-rose-500 text-white rounded-full shadow flex items-center justify-center hover:scale-110 transition font-bold text-xs"
                  title="削除"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bottom Floating Zoom Controls */}
      <div className="absolute bottom-3 right-4 z-30 flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md border border-pink-100 rounded-full shadow-cute text-sm text-slate-600">
        <button
          onClick={() => setZoom((prev) => Math.max(0.7, prev - 0.1))}
          className="p-2.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition"
          title="縮小"
        >
          <ZoomOut className="w-6 h-6" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="px-2 font-semibold hover:text-pink-500 transition text-base"
          title="リセット (100%)"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom((prev) => Math.min(1.4, prev + 0.1))}
          className="p-2.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition"
          title="拡大"
        >
          <ZoomIn className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
