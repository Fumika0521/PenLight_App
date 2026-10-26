import React, { useState } from 'react';
import { PenlightConfig } from '../../types';
import { PenlightBase } from '../penlight/PenlightBase';
import { X, Check, Palette, Sparkles, Sun } from 'lucide-react';

interface ColorCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PenlightConfig;
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
  { name: 'ストロベリーピンク', hex: '#ff4b72' },
  { name: 'チェリーピンク', hex: '#ff6584' },
  { name: 'スカイブルー', hex: '#38bdf8' },
  { name: 'サイバーブルー', hex: '#0284c7' },
  { name: 'ラベンダーパープル', hex: '#a855f7' },
  { name: 'ミントグリーン', hex: '#10b981' },
  { name: 'サンシャインイエロー', hex: '#f59e0b' },
  { name: 'ピュアホワイト', hex: '#ffffff' },
  { name: 'パッションレッド', hex: '#ef4444' },
  { name: 'エメラルド', hex: '#059669' },
];

export const ColorCustomizationModal: React.FC<ColorCustomizationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  inline = false,
}) => {
  const [tempConfig, setTempConfig] = useState<PenlightConfig>({ ...config });

  if (!isOpen) return null;

  const handleApply = () => {
    onSaveConfig(tempConfig);
    onClose();
  };

  return (
    <div className={`${inline ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in`}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-cute-lg border border-pink-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-pink-100 bg-gradient-to-r from-blue-50/50 via-white to-pink-50/50">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-500" />
            <h3 className="font-extrabold text-slate-800 text-sm">カラー変更</h3>
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
          <div className="w-36 h-48 mx-auto p-2 bg-gradient-to-b from-slate-900/5 via-pink-50/30 to-blue-50/20 rounded-2xl flex items-center justify-center border border-pink-100">
            <PenlightBase config={tempConfig} />
          </div>

          {/* Glow / Light Color */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                ペンライトの発光カラー
              </label>
              <span className="text-[10px] text-pink-500 font-bold">
                {tempConfig.isLightOn ? '点灯中' : '消灯中'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {GLOW_COLORS.map((g) => (
                <button
                  key={g.hex}
                  onClick={() =>
                    setTempConfig((prev) => ({ ...prev, glowColor: g.hex, isLightOn: true }))
                  }
                  className={`h-7 rounded-xl border flex items-center justify-center transition-all ${
                    tempConfig.glowColor === g.hex
                      ? 'border-blue-500 scale-105 shadow-sm ring-2 ring-blue-300'
                      : 'border-slate-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: g.hex }}
                  title={g.name}
                />
              ))}
            </div>
          </div>

          {/* Handle Color */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">持ち手（グリップ）の色</label>
            <div className="flex gap-2">
              {['#ffffff', '#ffd1dc', '#bae6fd', '#e9d5ff', '#334155'].map((c) => (
                <button
                  key={c}
                  onClick={() => setTempConfig((prev) => ({ ...prev, handleColor: c }))}
                  className={`w-7 h-7 rounded-full border transition-all ${
                    tempConfig.handleColor === c
                      ? 'border-blue-500 scale-110 shadow-sm ring-2 ring-blue-200'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Glow Animation Mode */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              ライトのアニメーション
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setTempConfig((prev) => ({ ...prev, glowMode: 'solid' }))}
                className={`py-2 px-3 rounded-xl border font-bold transition ${
                  tempConfig.glowMode === 'solid'
                    ? 'border-blue-400 bg-blue-50 text-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                通常点灯
              </button>
              <button
                onClick={() => setTempConfig((prev) => ({ ...prev, glowMode: 'pulse' }))}
                className={`py-2 px-3 rounded-xl border font-bold transition flex items-center justify-center gap-1 ${
                  tempConfig.glowMode === 'pulse'
                    ? 'border-pink-400 bg-pink-50 text-pink-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                パルス発光
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
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            適用する
          </button>
        </div>
      </div>
    </div>
  );
};
