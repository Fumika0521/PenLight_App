import React, { useState } from 'react';
import { PenlightBaseType } from '../../types';
import { Check, Sparkles, X, ChevronRight } from 'lucide-react';

interface BaseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBaseType: PenlightBaseType;
  onSelectBase: (type: PenlightBaseType) => void;
}

const BASE_OPTIONS: { type: PenlightBaseType; name: string; desc: string; img: string }[] = [
  { 
    type: 'classic', 
    name: '定番タイプ', 
    desc: '王道ドーム型ペンライト',
    img: '/assets/hires/penlight_classic.png' 
  },
  { 
    type: 'heart', 
    name: 'ハートタイプ', 
    desc: 'ガーリーなクリスタルハート',
    img: '/assets/hires/penlight_heart.png' 
  },
  { 
    type: 'star', 
    name: 'スタータイプ', 
    desc: 'キラめく星型ペンライト',
    img: '/assets/hires/penlight_star.png' 
  },
  { 
    type: 'diamond', 
    name: 'ダイヤタイプ', 
    desc: '気品あふれるダイヤモンド型',
    img: '/assets/hires/penlight_diamond.png' 
  },
];

export const BaseSelectionModal: React.FC<BaseSelectionModalProps> = ({
  isOpen,
  onClose,
  currentBaseType,
  onSelectBase,
}) => {
  const [selected, setSelected] = useState<PenlightBaseType>(currentBaseType);
  const [activeTab, setActiveTab] = useState<'base' | 'cover' | 'deco'>('base');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectBase(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-cute-lg border border-pink-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-pink-100 bg-gradient-to-r from-pink-50/50 via-white to-blue-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500 animate-sparkle" />
            <h3 className="font-extrabold text-slate-800 text-sm">ベースを選択</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-pink-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Subtitle / Note */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-xs text-slate-500 font-medium">
            デコレーションのベースとなるペンライトを4つのタイプから選んでね♡
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {BASE_OPTIONS.map((opt) => {
              const isSelected = selected === opt.type;

              return (
                <div
                  key={opt.type}
                  onClick={() => setSelected(opt.type)}
                  className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                    isSelected
                      ? 'border-blue-400 bg-blue-50/40 shadow-cute ring-2 ring-blue-100'
                      : 'border-slate-100 hover:border-pink-200 bg-white hover:shadow-xs'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* 3D Penlight Thumbnail */}
                  <div className="w-24 h-36 flex items-center justify-center my-1 pointer-events-none">
                    <img
                      src={opt.img}
                      alt={opt.name}
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  </div>

                  <span className="font-extrabold text-xs text-slate-800 mt-1">{opt.name}</span>
                  <span className="text-[10px] text-slate-400">{opt.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-pink-100 bg-pink-50/30 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl bg-white border border-pink-200 font-bold text-slate-600 text-xs hover:bg-slate-50 transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-cute transition-all active:scale-98 flex items-center justify-center gap-1"
          >
            <span>次へ（決定）</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
