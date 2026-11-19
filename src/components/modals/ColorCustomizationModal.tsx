import React, { useState, useEffect } from 'react';
import { PenlightConfig, StickerItem } from '../../types';
import { PenlightBase, HEAD_SCALE, HEAD_ORIGIN } from '../penlight/PenlightBase';
import { StickerSVG } from '../stickers/StickerSVG';
import { myPartFilterStyle } from './PhotoPartCreatorModal';
import { X, Check, Sparkles, Sun } from 'lucide-react';

const DOME_Y = 33.4;
const DOME_R = 13.3;
const INSERT_OFFSET_Y = -4;
const STICKER_BASE_PCT = 18.95;
const HANDLE_BASE_PCT  = 23.16;
const TEXT_FONT_PCT    = 7.37;

const COLLAR_MASK: Record<string, string> = {
  classic: 'linear-gradient(to bottom, transparent 0%, transparent 43.8%, black 44.1%)',
  heart2:  'linear-gradient(to bottom, transparent 0%, transparent 43.8%, black 44.1%)',
  panel:   'linear-gradient(to bottom, transparent 0%, transparent 45%, black 48%)',
  wand:    'linear-gradient(to bottom, transparent 0%, transparent 38%, black 42%)',
};
const BASE_IMAGES: Record<string, string> = {
  classic: '/assets/hires/penlight_empty.png',
  heart2:  '/assets/hires/penlight_heart2_realistic.png',
  panel:   '/assets/hires/penlight_panel_realistic.png',
  wand:    '/assets/hires/penlight_wand.svg',
};

function oshiNameFontPx(len: number): number {
  if (len <= 1) return 50; if (len <= 2) return 42; if (len <= 3) return 28;
  if (len <= 4) return 22; if (len <= 5) return 18; if (len <= 6) return 15;
  if (len <= 7) return 13; return 11;
}

interface ColorCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PenlightConfig;
  stickers?: StickerItem[];
  onSaveConfig: (updated: Partial<PenlightConfig>) => void;
  inline?: boolean;
}

const COVER_COLORS = [
  '#ffd1dc',
  '#fbcfe8',
  '#facc15',
  '#bae6fd',
  '#a5f3fc',
  '#e9d5ff',
  '#fef08a',
  '#bbf7d0',
];

const GLOW_COLORS = [
  { name: '赤',      hex: '#ef4444', displayHex: '#fca5a5' },
  { name: 'オレンジ', hex: '#f97316', displayHex: '#fed7aa' },
  { name: '黄色',    hex: '#eab308', displayHex: '#fde68a' },
  { name: '緑',      hex: '#10b981', displayHex: '#a7f3d0' },
  { name: '青',      hex: '#38bdf8', displayHex: '#bae6fd' },
  { name: '紫',      hex: '#a855f7', displayHex: '#d8b4fe' },
  { name: 'ピンク',  hex: '#ff4b72', displayHex: '#ffb3c1' },
  { name: '白',      hex: '#F4F8FF', displayHex: '#F4F8FF' },
];

export const ColorCustomizationModal: React.FC<ColorCustomizationModalProps> = ({
  isOpen,
  onClose,
  config,
  stickers = [],
  onSaveConfig,
  inline = false,
}) => {
  const [tempConfig, setTempConfig] = useState<PenlightConfig>({ ...config });

  // モーダルを開くたびに最新の config に同期する
  useEffect(() => {
    if (isOpen) setTempConfig({ ...config });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleApply = () => {
    onSaveConfig(tempConfig);
    onClose();
  };

  return (
    <div className={`${inline ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in`}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-cute-lg border border-pink-100 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-pink-100 bg-gradient-to-r from-blue-50/50 via-white to-pink-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-sm">好きな色で光らせよう♡</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-pink-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Live Mini Preview */}
          {(() => {
            const hasInsert = stickers.some(s => s.category === 'insert' || s.layer === 'insert');
            const collarMask = COLLAR_MASK[tempConfig.baseType] || COLLAR_MASK.classic;
            const baseSrc = BASE_IMAGES[tempConfig.baseType] || BASE_IMAGES.classic;
            return (
              <div
                className="w-48 mx-auto rounded-2xl overflow-hidden border border-pink-100 relative"
                style={{ aspectRatio: '36 / 53', containerType: 'inline-size' } as React.CSSProperties}
              >
                {/* 1. PenlightBase */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <PenlightBase config={tempConfig} showGloss />
                </div>
                {/* 2. Dome glow */}
                <div
                  className="absolute inset-0 z-[5] pointer-events-none transition-opacity duration-200"
                  style={{
                    opacity: tempConfig.isLightOn ? 1 : 0,
                    clipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
                    WebkitClipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
                    background: tempConfig.glowColor === '#F4F8FF'
                      ? `radial-gradient(circle at 50% ${DOME_Y}%, rgba(255,255,255,0.6) 0%, rgba(220,235,255,0.25) 60%, transparent 88%)`
                      : `radial-gradient(circle at 50% ${DOME_Y}%, ${tempConfig.glowColor}40 0%, ${tempConfig.glowColor}18 60%, transparent 88%)`,
                  }}
                />
                {/* 3. Insert layer */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    clipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
                    WebkitClipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
                  }}
                >
                  {stickers.filter(s => s.category === 'insert' || s.layer === 'insert').map(s => (
                    <div
                      key={s.id}
                      className="absolute"
                      style={{
                        left: `${s.x}%`, top: `${s.y + INSERT_OFFSET_Y}%`,
                        width: `${31 * s.scale}%`, aspectRatio: '304 / 260',
                        transform: `translate(-50%, -50%) rotate(${s.rotation}deg)${s.flipX ? ' scaleX(-1)' : ''}`,
                        zIndex: s.zIndex, opacity: s.opacity ?? 1,
                      }}
                    >
                      {(s.type === '3d-png' || s.type === 'preset') && s.imageUrl && (
                        <img src={s.imageUrl} alt="" className="w-full h-full object-contain"
                          style={{ filter: s.cssFilter || undefined, clipPath: 'ellipse(44% 54% at 50% 49%)' }} />
                      )}
                      {s.svgKey === 'insert-oshi-name' && s.text && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span style={{ fontFamily: '"Zen Maru Gothic", sans-serif', fontWeight: 800,
                            fontSize: `${oshiNameFontPx(s.text.length) / 380 * 100}cqw`,
                            color: 'rgba(255,255,255,0.45)',
                            textShadow: '-1px -1px 0 rgba(255,255,255,0.78), 1.5px 1.5px 2px rgba(100,80,160,0.45)',
                            letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{s.text}</span>
                        </div>
                      )}
                      {s.type === 'photo' && s.imageUrl && (
                        <div className="w-full h-full overflow-hidden rounded-full border-2 border-white bg-white">
                          <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* 4. Collar overlay */}
                <div className="absolute inset-0 z-[20] pointer-events-none">
                  <img src={baseSrc} alt="" className="w-full h-full object-contain"
                    style={{ WebkitMaskImage: collarMask, maskImage: collarMask }} />
                </div>
                {/* 5. Dome gloss */}
                {tempConfig.baseType === 'classic' && (
                  <div className="absolute inset-0 z-[25] pointer-events-none">
                    <img src="/assets/hires/dome_gloss.png" alt="" className="w-full h-full object-contain"
                      style={{ transform: `scale(${HEAD_SCALE})`, transformOrigin: HEAD_ORIGIN }} />
                  </div>
                )}
                {/* 6. Stickers */}
                <div className="absolute inset-0 z-30 pointer-events-none">
                  {stickers.filter(s => s.category !== 'insert' && s.layer !== 'insert').map(s => {
                    const isHandle = s.category === 'handle' || s.layer === 'handle';
                    const widthPct = (isHandle ? HANDLE_BASE_PCT : STICKER_BASE_PCT) * s.scale;
                    return (
                      <div key={s.id} className="absolute" style={{
                        left: `${s.x}%`, top: `${s.y}%`,
                        width: `${widthPct}%`, aspectRatio: '1 / 1',
                        transform: `translate(-50%, -50%) rotate(${s.rotation}deg)${s.flipX ? ' scaleX(-1)' : ''}`,
                        zIndex: s.zIndex, opacity: s.opacity ?? 1,
                      }}>
                        {(s.type === '3d-png' || s.type === 'preset') && (
                          <StickerSVG svgKey={s.svgKey || ''} imagePath={s.imageUrl} customColor={s.color} className="w-full h-full drop-shadow-md" />
                        )}
                        {s.type === 'text' && (
                          <div className="text-center font-extrabold leading-none whitespace-nowrap" style={{
                            color: s.textColor || '#ff6584',
                            fontFamily: s.fontFamily || '"Zen Maru Gothic", sans-serif',
                            fontSize: `${TEXT_FONT_PCT * s.scale}cqw`,
                            letterSpacing: '0.1em',
                          }}>{s.text}</div>
                        )}
                        {s.type === 'photo' && s.category === 'mypart' && s.imageUrl && (
                          <img src={s.imageUrl} alt="" className="w-full h-full object-contain"
                            style={{ filter: myPartFilterStyle(s.borderSize, s.hasShadow) || undefined }} />
                        )}
                        {s.type === 'photo' && s.category !== 'mypart' && s.imageUrl && (
                          <div className={`w-full h-full overflow-hidden border-2 border-white bg-white ${
                            s.imageShape === 'circle' ? 'rounded-full' : s.imageShape === 'heart' ? 'rounded-[30%]' : 'rounded-2xl'
                          }`}>
                            <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Glow / Light Color */}
          <div>
            <div className="mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                ペンライトの発光カラー
              </label>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {GLOW_COLORS.map((g) => (
                <button
                  key={g.hex}
                  onClick={() =>
                    setTempConfig((prev) => ({ ...prev, glowColor: g.hex, isLightOn: true }))
                  }
                  className={`h-7 rounded-xl border-2 transition-all ${
                    tempConfig.glowColor === g.hex
                      ? 'border-pink-500 scale-105 shadow-sm ring-2 ring-pink-300'
                      : 'border-slate-200 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: g.displayHex,
                    ...(g.name === '白' ? { boxShadow: 'inset 0 0 0 1px #E5E7EB' } : {}),
                  }}
                  title={g.name}
                />
              ))}
              {/* Custom color picker */}
              <label
                className={`h-7 rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:scale-105 ${
                  !GLOW_COLORS.some(g => g.hex === tempConfig.glowColor)
                    ? 'border-pink-500 scale-105 ring-2 ring-pink-300'
                    : 'border-slate-200'
                }`}
                style={{ background: 'conic-gradient(from 0deg, #fca5a5, #fed7aa, #fde68a, #a7f3d0, #bae6fd, #d8b4fe, #ffb3c1, #fca5a5)' }}
                title="カスタムカラー"
              >
                <input
                  type="color"
                  className="opacity-0 w-0 h-0 absolute"
                  value={tempConfig.glowColor}
                  onChange={(e) =>
                    setTempConfig((prev) => ({ ...prev, glowColor: e.target.value, isLightOn: true }))
                  }
                />
              </label>
            </div>
          </div>


          {/* Glow Animation Mode */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              ライトのアニメーション
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setTempConfig((prev) => ({ ...prev, glowMode: 'solid' }))}
                className={`py-2 px-3 rounded-xl border font-bold transition ${
                  tempConfig.glowMode === 'solid'
                    ? 'border-pink-400 bg-pink-50 text-pink-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ずっと光る
              </button>
              <button
                onClick={() => setTempConfig((prev) => ({ ...prev, glowMode: 'pulse' }))}
                className={`py-2 px-3 rounded-xl border font-bold transition ${
                  tempConfig.glowMode === 'pulse'
                    ? 'border-pink-400 bg-pink-50 text-pink-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ふわっと光る
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pink-100 bg-blue-50/20 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl bg-white border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50 transition"
          >
            閉じる
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            適用する
          </button>
        </div>
      </div>
    </div>
  );
};
