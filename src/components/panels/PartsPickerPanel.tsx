import React, { useState } from 'react';
import { 
  STICKER_CATALOG, 
  StickerDef, 
  PRESET_LETTERS, 
  PRESET_WORDS, 
  PRESET_AVATARS,
  StickerSVG 
} from '../stickers/StickerSVG';
import { StickerCategory, StickerItem } from '../../types';
import { 
  Sparkles, 
  Heart, 
  Star, 
  Type, 
  Image as ImageIcon, 
  Upload, 
  Smile, 
  Plus
} from 'lucide-react';

interface PartsPickerPanelProps {
  onAddSticker: (sticker: Omit<StickerItem, 'id' | 'zIndex'>) => void;
  onSetInsidePhoto?: (photoUrl: string | null) => void;
  insidePhotoUrl?: string | null;
}

export const PartsPickerPanel: React.FC<PartsPickerPanelProps> = ({
  onAddSticker,
  onSetInsidePhoto,
  insidePhotoUrl,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customText, setCustomText] = useState<string>('LOVE');
  const [customTextColor, setCustomTextColor] = useState<string>('#ff6584');

  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'ribbon', label: 'リボン' },
    { id: 'heart', label: 'ハート' },
    { id: 'star', label: '星' },
    { id: 'rhinestone', label: 'ストーン' },
    { id: 'text', label: '文字' },
    { id: 'photo', label: '写真' },
    { id: 'charm', label: 'チャーム' },
  ];

  const filteredStickers = selectedCategory === 'all'
    ? STICKER_CATALOG
    : STICKER_CATALOG.filter((s) => s.category === selectedCategory);

  const popularStickers = STICKER_CATALOG.filter((s) => s.popular);

  const handleAddPresetSticker = (def: StickerDef) => {
    onAddSticker({
      name: def.name,
      category: def.category as StickerCategory,
      x: 50 + (Math.random() * 6 - 3),
      y: 42 + (Math.random() * 6 - 3),
      scale: def.defaultScale || 1.0,
      rotation: 0,
      type: def.is3d ? '3d-png' : 'preset',
      imageUrl: def.imagePath,
      svgKey: def.key,
      opacity: 1,
    });
  };

  const handleAddTextSticker = (text: string, color: string = '#ff6584') => {
    if (!text.trim()) return;
    onAddSticker({
      name: `文字「${text}」`,
      category: 'text',
      x: 50,
      y: 36,
      scale: 1.15,
      rotation: 0,
      type: 'text',
      text,
      textColor: color,
      textBorderColor: '#ffffff',
      opacity: 1,
    });
  };

  const handleAddPhotoSticker = (url: string, name: string) => {
    onAddSticker({
      name,
      category: 'photo',
      x: 50,
      y: 30,
      scale: 1.1,
      rotation: 0,
      type: 'photo',
      imageUrl: url,
      imageShape: 'heart',
      opacity: 1,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, forInsideDome: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (forInsideDome && onSetInsidePhoto) {
          onSetInsidePhoto(result);
        } else {
          handleAddPhotoSticker(result, '推し写真');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-md border-r border-pink-100 p-4 overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-3">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-500 animate-sparkle" />
          パーツを選択
        </h3>
        <span className="text-[10px] text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full font-bold">
          3Dパーツ
        </span>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-xs scale-105'
                : 'bg-pink-50/80 text-pink-600 hover:bg-pink-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Sticker Grid */}
      {selectedCategory !== 'text' && selectedCategory !== 'photo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {filteredStickers.map((item) => (
              <button
                key={item.key}
                onClick={() => handleAddPresetSticker(item)}
                className="group relative aspect-square p-1 rounded-2xl bg-gradient-to-b from-white to-pink-50/30 border border-pink-100 hover:border-pink-300 hover:shadow-cute hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center overflow-hidden"
                title={item.name}
              >
                <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <StickerSVG svgKey={item.key} imagePath={item.imagePath} />
                </div>
              </button>
            ))}
          </div>

          {/* Popular Parts (人気のパーツ) */}
          <div className="pt-2 border-t border-pink-50">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              人気のパーツ
            </h4>
            <div className="grid grid-cols-5 gap-1.5">
              {popularStickers.slice(0, 10).map((item) => (
                <button
                  key={`pop-${item.key}`}
                  onClick={() => handleAddPresetSticker(item)}
                  className="aspect-square p-1 rounded-xl bg-pink-50/60 hover:bg-pink-100 border border-pink-100 hover:border-pink-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title={item.name}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <StickerSVG svgKey={item.key} imagePath={item.imagePath} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Stickers Tab */}
      {selectedCategory === 'text' && (
        <div className="space-y-4 text-xs">
          {/* Custom Text Generator */}
          <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-100 space-y-2">
            <label className="font-bold text-slate-700 block">好きな文字・推しの名前</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="推しの名前や一言"
                className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 text-xs focus:outline-pink-400 bg-white"
                maxLength={15}
              />
              <button
                onClick={() => handleAddTextSticker(customText, customTextColor)}
                className="px-3 py-1.5 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                追加
              </button>
            </div>

            {/* Color choices for text */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">文字色:</span>
              <div className="flex gap-1.5">
                {['#ff6584', '#38bdf8', '#c084fc', '#f59e0b', '#10b981', '#334155'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCustomTextColor(c)}
                    className={`w-5 h-5 rounded-full border transition ${
                      customTextColor === c ? 'ring-2 ring-pink-400 scale-110' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preset Words */}
          <div>
            <h4 className="font-bold text-slate-700 mb-2">定番の推し活ワード</h4>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_WORDS.map((w) => (
                <button
                  key={w.text}
                  onClick={() => handleAddTextSticker(w.text, w.color)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-pink-100 hover:border-pink-300 font-extrabold hover:shadow-xs transition hover:scale-105 active:scale-95"
                  style={{ color: w.color }}
                >
                  {w.text}
                </button>
              ))}
            </div>
          </div>

          {/* Alphabet Letters Grid */}
          <div>
            <h4 className="font-bold text-slate-700 mb-2">アルファベット・記号</h4>
            <div className="grid grid-cols-6 gap-1.5">
              {PRESET_LETTERS.map((char) => (
                <button
                  key={char}
                  onClick={() => handleAddTextSticker(char, '#ff6584')}
                  className="h-8 rounded-xl bg-white border border-pink-100 hover:border-pink-400 font-extrabold text-pink-500 text-sm hover:scale-110 hover:shadow-xs transition active:scale-95 flex items-center justify-center shadow-2xs"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo Stickers Tab */}
      {selectedCategory === 'photo' && (
        <div className="space-y-4 text-xs">
          {/* Custom Upload */}
          <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-100 space-y-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-pink-500" />
              推しの写真をアップロード
            </h4>
            <p className="text-[11px] text-slate-500">
              お好きな推し写真をペンライトのドーム内に入れたり、ステッカーとして飾れます♡
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="cursor-pointer py-2 px-3 bg-white hover:bg-pink-50 border border-pink-200 text-pink-600 rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-xs transition hover:scale-102">
                <ImageIcon className="w-4 h-4" />
                <span>ステッカーにする</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
              </label>

              {onSetInsidePhoto && (
                <label className="cursor-pointer py-2 px-3 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-xs transition hover:scale-102">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>ドーム内に入れる</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {insidePhotoUrl && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-pink-600 font-bold">✓ ドーム内写真設定中</span>
                <button
                  onClick={() => onSetInsidePhoto && onSetInsidePhoto(null)}
                  className="text-[10px] text-slate-400 hover:text-rose-500 underline"
                >
                  解除する
                </button>
              </div>
            )}
          </div>

          {/* Preset Idol Avatars */}
          {PRESET_AVATARS.length > 0 && (
          <div>
            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-pink-500" />
              推しアイコン（タップで追加）
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleAddPhotoSticker(av.url, av.name)}
                  className="group flex flex-col items-center p-1 rounded-2xl bg-white border border-pink-100 hover:border-pink-300 hover:shadow-cute transition hover:-translate-y-0.5"
                  title={av.name}
                >
                  <img
                    src={av.url}
                    alt={av.name}
                    className="w-10 h-10 rounded-full object-cover border border-pink-200 group-hover:scale-105 transition"
                  />
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};
