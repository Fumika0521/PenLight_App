import React, { useEffect, useRef, useState } from 'react';
import { PenlightConfig, StickerItem } from '../../types';
import { PenlightBase } from '../penlight/PenlightBase';
import { StickerSVG } from '../stickers/StickerSVG';
import { Download, Share2, Sparkles, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PenlightConfig;
  stickers: StickerItem[];
  onExportImage: () => void;
  onSaveToGallery?: () => void;
  inline?: boolean;
}

export const CompleteModal: React.FC<CompleteModalProps> = ({
  isOpen,
  onClose,
  config,
  stickers,
  onExportImage,
  onSaveToGallery,
  inline = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onExportImage();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (inline && canvasRef.current) {
      // Confetti bounded to the inline canvas inside the phone frame
      const bounded = confetti.create(canvasRef.current, { resize: true, useWorker: false });
      bounded({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#ff9ebb', '#ff6584', '#38bdf8', '#c084fc', '#fef08a'],
      });
    } else {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ff9ebb', '#ff6584', '#38bdf8', '#c084fc', '#fef08a'],
      });
    }
  }, [isOpen, inline]);

  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Light Deco ♡ - 私だけの推しペンライト',
        text: 'Light Decoで世界にひとつだけのオリジナルペンライトをデコったよ！♡',
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('URLをクリップボードにコピーしました！SNSなどでシェアしてね♡');
    }
  };

  return (
    <div className={`${inline ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in`}>
      {/* Confetti canvas — only used in inline mode, covers the phone frame overlay */}
      {inline && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      )}
      <div className="relative z-20 w-full max-w-sm bg-gradient-to-b from-[#fff5f8] via-white to-[#f0f7ff] rounded-3xl shadow-2xl border border-pink-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-pink-600 shadow-sm flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge */}
        <div className="pt-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100/80 rounded-full text-pink-600 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-sparkle" />
            世界にひとつだけのオリジナルペンライト
          </div>
        </div>

        {/* 完成！♡ + Penlight Card — evenly spaced so title sits between badge and card */}
        <div className="relative flex-1 flex flex-col items-center justify-evenly px-4 pb-2">
          <h2 className="w-full text-2xl font-black text-slate-800 tracking-wide text-center mb-4 pl-8">
            完成！♡
          </h2>

          <div className="relative w-[240px] h-[320px] rounded-3xl bg-gradient-to-b from-pink-100/40 via-purple-100/30 to-blue-100/40 p-3 shadow-inner border border-white flex items-center justify-center overflow-hidden">
            {/* Sparkle background elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* top center */}
              <span className="absolute text-yellow-300 text-sm  animate-sparkle" style={{ top: '4%',  left: '50%', transform: 'translateX(-50%)', animationDelay: '0s'   }}>✦</span>
              {/* left × 2 */}
              <span className="absolute text-pink-400  text-xs  animate-sparkle" style={{ top: '28%', left: '5%',  animationDelay: '0.6s' }}>✧</span>
              <span className="absolute text-purple-300 text-sm  animate-sparkle" style={{ top: '65%', left: '22%', animationDelay: '1.1s' }}>✦</span>
              {/* right × 2 */}
              <span className="absolute text-blue-300  text-sm  animate-sparkle" style={{ top: '30%', right: '5%', animationDelay: '0.3s' }}>✦</span>
              <span className="absolute text-pink-300  text-xs  animate-sparkle" style={{ top: '68%', right: '6%', animationDelay: '0.9s' }}>✧</span>
            </div>

            {/* Base Penlight */}
            <div className="relative w-[200px] h-[310px] pointer-events-none select-none">
              <div className="absolute inset-0">
                <PenlightBase config={{ ...config, isLightOn: true }} />
              </div>

              {/* Stickers */}
              <div className="absolute inset-0">
                {stickers.map((s) => {
                  const baseSize = 54;
                  const itemSize = baseSize * s.scale;
                  return (
                    <div
                      key={`comp-${s.id}`}
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
                            fontSize: `${15 * s.scale}px`,
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

            {/* "My Lightstick" elegant signature text */}
            <div className="absolute bottom-3 font-cursive text-2xl text-pink-400 font-bold drop-shadow-sm select-none pointer-events-none">
              My Lightstick ♡
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-1 space-y-2 relative">
          {/* Save toast */}
          {isSaved && (
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-fade-in z-30 whitespace-nowrap">
              <Check className="w-3.5 h-3.5 text-green-400" />
              保存しました！
            </div>
          )}

          {/* Save Image CTA */}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-black text-sm rounded-full shadow-cute hover:shadow-cute-lg transition-all active:scale-98 flex items-center justify-center gap-2 shimmer-btn"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            画像を保存
          </button>

          {/* Share CTA */}
          <button
            onClick={handleShare}
            className="w-full py-2.5 bg-white hover:bg-pink-50 text-pink-600 font-bold text-xs rounded-full border border-pink-200 shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            共有する
          </button>

          {/* Continue Editing */}
          <button
            onClick={onClose}
            className="w-full py-1.5 text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
          >
            ← 編集画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
};
