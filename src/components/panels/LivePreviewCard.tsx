import React, { useState } from 'react';
import { PenlightConfig, StickerItem } from '../../types';
import { PenlightBase } from '../penlight/PenlightBase';
import { StickerSVG } from '../stickers/StickerSVG';
import { Download, Sparkles, Share2, Eye, Sun, Music } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LivePreviewCardProps {
  config: PenlightConfig;
  stickers: StickerItem[];
  onExportImage: () => void;
  isConcertMode: boolean;
  onToggleConcertMode: () => void;
  onOpenCompleteModal?: () => void;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({
  config,
  stickers,
  onExportImage,
  isConcertMode,
  onToggleConcertMode,
  onOpenCompleteModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff9ebb', '#ff6584', '#38bdf8', '#c084fc', '#fef08a'],
    });
    if (onOpenCompleteModal) {
      onOpenCompleteModal();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-md border-l border-pink-100 p-3.5 w-56 overflow-y-auto shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-pink-100 mb-3">
        <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-blue-500" />
          プレビュー
        </h3>
        <button
          onClick={onToggleConcertMode}
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition ${
            isConcertMode
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="暗闇コンサート演出の切り替え"
        >
          <Music className="w-3 h-3" />
          {isConcertMode ? '暗闇OFF' : '暗闇ON'}
        </button>
      </div>

      {/* Mini Preview Card */}
      <div
        className={`relative aspect-[3/4.6] rounded-2xl p-2.5 flex items-center justify-center overflow-hidden border shadow-sm transition-all duration-500 ${
          isConcertMode
            ? 'bg-slate-950 border-purple-800 shadow-glow-blue'
            : 'bg-gradient-to-b from-pink-50/60 via-purple-50/40 to-blue-50/60 border-pink-100'
        }`}
      >
        {/* Soft Background aura */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-28 h-28 bg-pink-400/20 rounded-full blur-xl" />
        </div>

        {/* Scaled-down Penlight + Stickers */}
        <div className="relative w-[180px] h-[280px] pointer-events-none select-none">
          {/* Base */}
          <div className="absolute inset-0">
            <PenlightBase config={config} />
          </div>

          {/* Stickers */}
          <div className="absolute inset-0">
            {stickers.map((s) => {
              const baseSize = 48; // smaller scale
              const itemSize = baseSize * s.scale;
              return (
                <div
                  key={`prev-${s.id}`}
                  className="absolute"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${itemSize}px`,
                    height: `${itemSize}px`,
                    transform: `translate(-50%, -50%) rotate(${s.rotation}deg) ${
                      s.flipX ? 'scaleX(-1)' : ''
                    }`,
                    zIndex: s.zIndex,
                    opacity: s.opacity ?? 1,
                  }}
                >
                  {s.type === 'preset' && s.svgKey && (
                    <StickerSVG svgKey={s.svgKey} customColor={s.color} className="w-full h-full" />
                  )}
                  {s.type === 'text' && (
                    <div
                      className="text-center font-bold px-1 py-0.5 leading-none whitespace-nowrap"
                      style={{
                        color: s.textColor || '#ff6584',
                        textShadow: `0 0 3px ${s.textBorderColor || '#ffffff'}, 0 0 6px #ffffff`,
                        fontSize: `${13 * s.scale}px`,
                      }}
                    >
                      {s.text}
                    </div>
                  )}
                  {s.type === 'photo' && s.imageUrl && (
                    <div
                      className={`w-full h-full overflow-hidden border border-white shadow-xs bg-white ${
                        s.imageShape === 'circle' ? 'rounded-full' : 'rounded-lg'
                      }`}
                    >
                      <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-3 text-xs">
        {/* Save Image Button (gradient sky blue pill matching design mockup) */}
        <button
          onClick={onExportImage}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-1.5 shimmer-btn"
        >
          <Download className="w-4 h-4" />
          画像を保存
        </button>

        {/* View Complete Modal / Celebration */}
        <button
          onClick={handleCelebrate}
          className="w-full py-2 px-3 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          完成画面を見る ♡
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full py-1.5 px-3 bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold rounded-xl border border-pink-200 transition-all flex items-center justify-center gap-1"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copied ? 'URLをコピーしました！' : 'デザインを共有'}
        </button>
      </div>
    </div>
  );
};
