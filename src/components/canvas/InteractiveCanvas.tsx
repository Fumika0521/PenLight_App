import React, { useRef, useState, useEffect } from 'react';
import { StickerItem, PenlightConfig } from '../../types';
import { PenlightBase } from '../penlight/PenlightBase';
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

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-bg-layer') {
      onSelectSticker(null);
    }
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

        {selectedId && (
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
        )}
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
        {/* Floating Sparkles in Background matching the reference mockup */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <span className="absolute top-10 left-8 text-sky-300 text-lg opacity-60 animate-sparkle">✦</span>
          <span className="absolute top-24 right-10 text-pink-300 text-base opacity-70 animate-sparkle" style={{ animationDelay: '0.6s' }}>✧</span>
          <span className="absolute bottom-32 left-10 text-pink-300 text-xl opacity-60 animate-sparkle" style={{ animationDelay: '1.2s' }}>✦</span>
          <span className="absolute bottom-20 right-8 text-purple-300 text-base opacity-70 animate-sparkle" style={{ animationDelay: '0.9s' }}>✧</span>
        </div>

        {/* Concert Dark Mode Lights */}
        {isConcertMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-96 bg-gradient-to-b from-white/10 via-pink-400/5 to-transparent blur-md pointer-events-none" />
          </div>
        )}

        {/* 1. Base 3D Penlight Layer (Significantly enlarged and centered) */}
        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
          <div className="w-[340px] h-[510px] sm:w-[390px] sm:h-[570px] md:w-[430px] md:h-[620px]">
            <PenlightBase config={config} />
          </div>
        </div>

        {/* 2. Interactive Stickers Layer */}
        <div className="absolute inset-0 pointer-events-auto">
          {stickers.map((sticker) => {
            const isSelected = sticker.id === selectedId;
            const baseSize = 100; // Enlarged base size for stickers to match larger penlight
            const itemSize = baseSize * sticker.scale;

            return (
              <div
                key={sticker.id}
                onPointerDown={(e) => handlePointerDown(e, sticker.id, 'move')}
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
                {/* Sticker Content Rendering */}
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
                        textShadow: `0 0 6px #ffffff, 0 0 10px #ffffff, 0 2px 6px rgba(255, 101, 132, 0.4), 0 3px 0 #ffffff`,
                        fontFamily: sticker.fontFamily || '"M PLUS Rounded 1c", sans-serif',
                        fontSize: `${28 * sticker.scale}px`,
                        letterSpacing: '0.1em',
                      }}
                    >
                      {sticker.text}
                    </div>
                  )}

                  {sticker.type === 'photo' && sticker.imageUrl && (
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

                {/* Bounding Box & Handles (Soft Cyan Dashed line matching reference) */}
                {isSelected && (
                  <div className="absolute -inset-1.5 border-2 border-dashed border-[#4facfe] rounded-xl pointer-events-auto shadow-sm">
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Zoom Controls */}
      <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-md border border-pink-100 rounded-full shadow-cute text-xs text-slate-600">
        <button
          onClick={() => setZoom((prev) => Math.max(0.7, prev - 0.1))}
          className="p-1 rounded-full hover:bg-pink-50 hover:text-pink-600 transition"
          title="縮小"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="px-1.5 font-semibold hover:text-pink-500 transition"
          title="リセット (100%)"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom((prev) => Math.min(1.4, prev + 0.1))}
          className="p-1 rounded-full hover:bg-pink-50 hover:text-pink-600 transition"
          title="拡大"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
