import React, { useState } from 'react';
import { StickerItem, PenlightConfig } from '../../types';
import { StickerSVG } from '../stickers/StickerSVG';
import { 
  Sliders, 
  Palette, 
  Layers, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Sun,
  Eye,
  Type
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedSticker: StickerItem | null;
  config: PenlightConfig;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onDeleteSticker: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onUpdateConfig: (updates: Partial<PenlightConfig>) => void;
}

const COLOR_SWATCHES = [
  { name: 'ピンク', color: '#ff6584' },
  { name: 'パステルピンク', color: '#ffb3c6' },
  { name: 'スカイブルー', color: '#38bdf8' },
  { name: 'ラベンダー', color: '#c084fc' },
  { name: 'ミントグリーン', color: '#34d399' },
  { name: 'イエロー', color: '#facc15' },
  { name: 'ホワイト', color: '#ffffff' },
  { name: 'ゴールド', color: '#f59e0b' },
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedSticker,
  config,
  onUpdateSticker,
  onDeleteSticker,
  onBringForward,
  onSendBackward,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'style' | 'penlight'>('parts');

  if (!selectedSticker) {
    return (
      <div className="flex flex-col h-full bg-white/95 backdrop-blur-md border-l border-pink-100 p-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-pink-500" />
            ペンライト設定
          </h3>
          <span className="text-xs text-pink-400 bg-pink-50 px-2 py-0.5 rounded-full font-medium">
            全体
          </span>
        </div>

        <div className="space-y-4 pt-3 text-xs">
          {/* Light toggle & glow color */}
          <div className="bg-pink-50/60 p-3 rounded-2xl border border-pink-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                ペンライト点灯
              </span>
              <button
                onClick={() => onUpdateConfig({ isLightOn: !config.isLightOn })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  config.isLightOn ? 'bg-pink-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    config.isLightOn ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 mb-1.5 block">発光カラー</label>
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.color}
                    onClick={() => onUpdateConfig({ glowColor: swatch.color, isLightOn: true })}
                    className={`h-7 rounded-lg border flex items-center justify-center transition-all ${
                      config.glowColor === swatch.color
                        ? 'border-pink-500 scale-105 shadow-sm ring-2 ring-pink-200'
                        : 'border-slate-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>発光の強さ</span>
                <span>{Math.round(config.glowIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={config.glowIntensity}
                onChange={(e) => onUpdateConfig({ glowIntensity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>


          {/* Tip card */}
          <div className="mt-4 p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100 text-center text-slate-500">
            <Sparkles className="w-5 h-5 text-pink-400 mx-auto mb-1 animate-sparkle" />
            <p className="font-semibold text-pink-600 mb-0.5">パーツを選択してね♡</p>
            <p className="text-[10px] text-slate-400">
              キャンバス上のパーツをタップすると、サイズや角度を自由に変更できます！
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-md border-l border-pink-100 p-4 overflow-y-auto">
      {/* Tab Switcher */}
      <div className="flex border-b border-pink-100 mb-3 pb-1">
        <button
          onClick={() => setActiveTab('parts')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'parts'
              ? 'bg-pink-100 text-pink-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          パーツ
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'style'
              ? 'bg-pink-100 text-pink-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          スタイル
        </button>
      </div>

      {/* Selected Item Header Card */}
      <div className="flex items-center gap-3 p-2.5 bg-pink-50/70 border border-pink-100 rounded-2xl mb-3">
        <div className="w-10 h-10 bg-white rounded-xl shadow-xs flex items-center justify-center p-1 border border-pink-100 shrink-0">
          {selectedSticker.type === 'preset' && selectedSticker.svgKey ? (
            <StickerSVG svgKey={selectedSticker.svgKey} customColor={selectedSticker.color} />
          ) : selectedSticker.type === 'photo' && selectedSticker.imageUrl ? (
            <img
              src={selectedSticker.imageUrl}
              alt=""
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="font-bold text-pink-500 text-xs">
              {selectedSticker.text?.slice(0, 3) || 'TXT'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-800 truncate">{selectedSticker.name}</h4>
          <span className="text-[10px] text-pink-500 font-medium bg-white px-2 py-0.5 rounded-full border border-pink-200">
            {selectedSticker.category}
          </span>
        </div>
      </div>

      {/* Tab 1: Parts Adjustments (Size, Rotation, Position, Layer) */}
      {activeTab === 'parts' && (
        <div className="space-y-3.5 text-xs">
          {/* Size Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] text-slate-600">
              <span className="font-semibold">サイズ</span>
              <span className="font-bold text-pink-500">
                {Math.round(selectedSticker.scale * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onUpdateSticker(selectedSticker.id, {
                    scale: Math.max(0.3, selectedSticker.scale - 0.1),
                  })
                }
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-600 flex items-center justify-center text-xs"
              >
                -
              </button>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={selectedSticker.scale}
                onChange={(e) =>
                  onUpdateSticker(selectedSticker.id, { scale: parseFloat(e.target.value) })
                }
                className="flex-1"
              />
              <button
                onClick={() =>
                  onUpdateSticker(selectedSticker.id, {
                    scale: Math.min(2.5, selectedSticker.scale + 0.1),
                  })
                }
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-600 flex items-center justify-center text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Rotation Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] text-slate-600">
              <span className="font-semibold">回転</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-pink-500">{selectedSticker.rotation}°</span>
                <button
                  onClick={() => onUpdateSticker(selectedSticker.id, { rotation: 0 })}
                  className="text-slate-400 hover:text-pink-500 p-0.5"
                  title="角度リセット"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={selectedSticker.rotation}
              onChange={(e) =>
                onUpdateSticker(selectedSticker.id, { rotation: parseInt(e.target.value) })
              }
              className="w-full"
            />
          </div>

          {/* D-Pad Position Nudge */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              位置の微調整
            </label>
            <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
              <div />
              <button
                onClick={() =>
                  onUpdateSticker(selectedSticker.id, {
                    y: Math.max(0, selectedSticker.y - 1.5),
                  })
                }
                className="h-7 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <div />

              <button
                onClick={() =>
                  onUpdateSticker(selectedSticker.id, {
                    x: Math.max(0, selectedSticker.x - 1.5),
                  })
                }
                className="h-7 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="h-7 flex items-center justify-center text-[10px] text-slate-400">
                ●
              </div>
              <button
                onClick={() =>
                  onUpdateSticker(selectedSticker.id, {
                    x: Math.min(100, selectedSticker.x + 1.5),
                  })
                }
                className="h-7 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div />
              <button
                onClick={() =>
                  onUpdateSticker(selectedSticker.id, {
                    y: Math.min(100, selectedSticker.y + 1.5),
                  })
                }
                className="h-7 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <div />
            </div>
          </div>

          {/* Layer Order (重なり順) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              重なり順
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onBringForward(selectedSticker.id)}
                className="py-1.5 px-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-600 rounded-xl font-bold flex items-center justify-center gap-1 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                前面へ
              </button>
              <button
                onClick={() => onSendBackward(selectedSticker.id)}
                className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-1 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                背面へ
              </button>
            </div>
          </div>

          {/* Delete Action Button */}
          <div className="pt-2">
            <button
              onClick={() => onDeleteSticker(selectedSticker.id)}
              className="w-full py-2 border border-rose-300 text-rose-500 hover:bg-rose-50 rounded-xl font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              削除
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Style & Colors */}
      {activeTab === 'style' && (
        <div className="space-y-4 text-xs">
          {/* Color change if ribbon/text/gem */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              カラー変更
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.color}
                  onClick={() =>
                    onUpdateSticker(selectedSticker.id, {
                      color: swatch.color,
                      textColor: swatch.color,
                    })
                  }
                  className={`h-7 rounded-xl border flex items-center justify-center shadow-xs transition ${
                    selectedSticker.color === swatch.color ||
                    selectedSticker.textColor === swatch.color
                      ? 'border-pink-500 scale-105 ring-2 ring-pink-300'
                      : 'border-slate-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.name}
                />
              ))}
            </div>
          </div>

          {/* Text Sticker Customization if type is text */}
          {selectedSticker.type === 'text' && (
            <div className="space-y-2 pt-2 border-t border-pink-100">
              <label className="text-[11px] font-semibold text-slate-600 block">
                テキスト内容の変更
              </label>
              <input
                type="text"
                value={selectedSticker.text || ''}
                onChange={(e) =>
                  onUpdateSticker(selectedSticker.id, { text: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-pink-200 rounded-xl text-xs focus:outline-pink-400"
                placeholder="テキストを入力"
              />
            </div>
          )}

          {/* Opacity slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] text-slate-600">
              <span className="font-semibold">不透明度</span>
              <span className="font-bold text-pink-500">
                {Math.round((selectedSticker.opacity ?? 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={selectedSticker.opacity ?? 1}
              onChange={(e) =>
                onUpdateSticker(selectedSticker.id, { opacity: parseFloat(e.target.value) })
              }
              className="w-full"
            />
          </div>

          {/* Horizontal Flip */}
          <div>
            <button
              onClick={() =>
                onUpdateSticker(selectedSticker.id, {
                  flipX: !selectedSticker.flipX,
                })
              }
              className="w-full py-1.5 px-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl text-pink-600 font-bold transition flex items-center justify-center gap-1.5"
            >
              左右反転 (Flip)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
