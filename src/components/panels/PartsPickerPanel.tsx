import React, { useState, useRef } from 'react';
import {
  STICKER_CATALOG,
  StickerDef,
  PRESET_LETTERS,
  PRESET_WORDS,
  PRESET_HIRAGANA,
  PRESET_KATAKANA,
  StickerSVG
} from '../stickers/StickerSVG';
import { MyPart, StickerCategory, StickerItem } from '../../types';
import { INSERT_DEFAULTS } from '../../lib/insertDefaults';
import {
  Sparkles,
  Heart,
  Type,
  Image as ImageIcon,
  Upload,
  Plus,
} from 'lucide-react';

interface PartsPickerPanelProps {
  onAddSticker: (sticker: Omit<StickerItem, 'id' | 'zIndex'>) => void;
  onSetInsidePhoto?: (photoUrl: string | null) => void;
  insidePhotoUrl?: string | null;
  initialCategory?: string;
  activeCategory?: string;
  addedTexts?: { text: string; color: string }[];
  onAddedTextsChange?: (texts: { text: string; color: string }[]) => void;
  myParts?: MyPart[];
  onOpenPhotoPartCreator?: () => void;
  onDeleteMyPart?: (id: string) => void;
  onOpenPhotoSticker?: (file: File) => void;
}

export const PartsPickerPanel: React.FC<PartsPickerPanelProps> = ({
  onAddSticker,
  onSetInsidePhoto,
  insidePhotoUrl,
  initialCategory,
  activeCategory,
  addedTexts = [],
  onAddedTextsChange,
  myParts = [],
  onOpenPhotoPartCreator,
  onDeleteMyPart,
  onOpenPhotoSticker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(activeCategory || initialCategory || 'heart');
  const [isAlphabetOpen, setIsAlphabetOpen] = useState(false);
  const [isHiraganaOpen, setIsHiraganaOpen] = useState(false);
  const [isKatakanaOpen, setIsKatakanaOpen] = useState(false);
  const [customText, setCustomText] = useState<string>('');
  const [customTextColor, setCustomTextColor] = useState<string>('#ff6584');

  // Sync external category changes from left navigation tabs
  React.useEffect(() => {
    if (activeCategory) {
      setSelectedCategory(activeCategory);
    }
  }, [activeCategory]);

  const [longPressId, setLongPressId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Photo sticker file input
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear value so the same file can be selected again next time
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setPhotoError('この写真は読み込めませんでした。別の写真を選んでね');
    };
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) {
        setPhotoError('この写真は読み込めませんでした。別の写真を選んでね');
        return;
      }
      // Resize to max 1600px on the longer side (handles large JPEGs and HEIC converted by browser)
      const img = new Image();
      img.onerror = () => {
        setPhotoError('この写真は読み込めませんでした。別の写真を選んでね');
      };
      img.onload = () => {
        const MAX = 1600;
        let { width, height } = img;
        if (width === 0 || height === 0) {
          setPhotoError('この写真は読み込めませんでした。別の写真を選んでね');
          return;
        }
        if (width > MAX || height > MAX) {
          if (width >= height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setPhotoError('この写真は読み込めませんでした。別の写真を選んでね');
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob && onOpenPhotoSticker) {
            onOpenPhotoSticker(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', 0.9);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Panel thumbnail display scale per category.
  // Baseline = スワロフスキーハート (heart_*.png, geomean fill 88.9%).
  // star: 88.8% fill → 1.00 (identical to heart)
  // rhinestone: 92.7% fill → 0.96 (88.9/92.7) to match heart visual size
  // Add new categories here to control their thumbnail size.
  const PART_DISPLAY_SCALE: Record<string, number> = {
    heart:      0.75,
    star:       0.75,
    rhinestone: 0.63,
  };

  const categories = [
    { id: 'heart',      label: 'ハート' },
    { id: 'rhinestone', label: 'ストーン' },
    { id: 'ribbon',     label: 'リボン' },
  ];

  const partsOnly = STICKER_CATALOG.filter((s) => s.category !== 'insert' && s.category !== 'handle' && s.category !== 'ribbon');
  const handleItems = STICKER_CATALOG.filter((s) => s.category === 'handle');

  const filteredStickers = selectedCategory === 'all'
    ? partsOnly
    : partsOnly.filter((s) => s.category === selectedCategory);

  const popularStickers = partsOnly.filter((s) => s.popular);

  const handleAddPresetSticker = (def: StickerDef) => {
    const isInsert = def.category === 'insert';
    const isHandle = def.category === 'handle';

    onAddSticker({
      name: def.name,
      category: def.category as StickerCategory,
      layer: isInsert ? 'insert' : isHandle ? 'handle' : 'sticker',
      x: isInsert ? 50 : isHandle ? 50 : 50 + (Math.random() * 6 - 3),
      y: isInsert ? 37 : isHandle ? 62 : 42 + (Math.random() * 6 - 3),
      scale: isInsert ? 1.4 : (def.defaultScale || 1.0),
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
      y: 38,
      scale: 0.85,
      rotation: 0,
      type: 'text',
      text,
      textColor: color,
      textBorderColor: '#ffffff',
      fontFamily: '"Zen Maru Gothic", sans-serif',
      opacity: 1,
    });
    if (onAddedTextsChange && !addedTexts.some((t) => t.text === text && t.color === color)) {
      const MAX_TEXTS = 8;
      const updated = [...addedTexts, { text, color }];
      onAddedTextsChange(updated.length > MAX_TEXTS ? updated.slice(1) : updated);
    }
  };

  const handleAddPhotoSticker = (url: string, name: string) => {
    onAddSticker({
      name,
      category: 'photo',
      x: 50,
      y: 30,
      scale: 0.85,
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
          handleAddPhotoSticker(result, '好きな写真');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col bg-white/95 backdrop-blur-md border-r border-pink-100 p-4">

      {/* Category Filter Chips — hidden in text/photo/insert tabs */}
      {selectedCategory !== 'text' && selectedCategory !== 'photo' && selectedCategory !== 'insert' && (
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
      )}

      {/* Main Sticker Grid */}
      {selectedCategory !== 'text' && selectedCategory !== 'photo' && (
        <div className="space-y-4">
          {/* Insert Specific Guide & Quick Photo Upload */}
          {selectedCategory === 'insert' && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-2xl border border-pink-100 mb-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600">
                <Sparkles className="w-3.5 h-3.5" />
                ドームの中身パーツ
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                ガラスドームの中に配置されます。ガラス反射レイヤーの下に重なり、リアルな奥行きが出ます♡
              </p>
              <label className="flex items-center justify-center gap-2 w-full py-2 bg-white text-pink-600 font-bold text-xs rounded-xl border border-pink-200 shadow-2xs hover:bg-pink-50 cursor-pointer active:scale-95 transition">
                <Upload className="w-3.5 h-3.5" />
                推し写真をドーム内に入れる
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const url = ev.target?.result as string;
                        onAddSticker({
                          name: 'ドーム内推し写真',
                          category: 'insert',
                          layer: 'insert',
                          ...INSERT_DEFAULTS,
                          type: 'photo',
                          imageUrl: url,
                          imageShape: 'circle',
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {/* Preset Insert Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {([
                  { key: 'insert-moon-star',    name: 'クラシック月と星', imageUrl: '/assets/stickers/insert_moon_star.png',           cssFilter: undefined },
                  { key: 'insert-double-heart', name: '2重ハート',       imageUrl: '/assets/stickers/insert_double_heart_clear.png', cssFilter: undefined },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onAddSticker({
                      name: item.name,
                      category: 'insert',
                      layer: 'insert',
                      ...INSERT_DEFAULTS,
                      type: '3d-png',
                      imageUrl: item.imageUrl,
                      svgKey: item.key,
                      cssFilter: item.cssFilter,
                    })}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border border-pink-100 bg-white hover:bg-pink-50 hover:border-pink-300 transition active:scale-95"
                  >
                    <img src={item.imageUrl} className="w-12 h-12 object-contain" style={{ filter: item.cssFilter }} />
                    <span className="text-[10px] text-slate-600 font-bold">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* Popular Parts (人気のパーツ) — shown first */}
          {selectedCategory === 'all' && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                人気のパーツ
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {popularStickers.slice(0, 8).map((item) => (
                  <button
                    key={`pop-${item.key}`}
                    onClick={() => handleAddPresetSticker(item)}
                    className="aspect-square p-1 rounded-xl bg-pink-50/60 hover:bg-pink-100 border border-pink-100 hover:border-pink-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xs"
                    title={item.name}
                  >
                    <div className="w-11 h-11 p-1 flex items-center justify-center">
                      <StickerSVG svgKey={item.key} imagePath={item.imagePath} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ribbon Section */}
          {selectedCategory === 'ribbon' && (
            <div className="grid grid-cols-3 gap-2 min-h-[280px] content-start">
              {handleItems.map((item) => (
                <button
                  key={item.key}
                  title={item.name.replace('（持ち手用）', '')}
                  onClick={() => onAddSticker({
                    name: item.name,
                    category: item.category as any,
                    layer: 'handle',
                    x: 50,
                    y: 62,
                    scale: item.defaultScale || 1.0,
                    rotation: 0,
                    type: item.is3d ? '3d-png' : 'preset',
                    imageUrl: item.imagePath,
                    svgKey: item.key,
                    opacity: 1,
                  })}
                  className="group relative aspect-square p-1.5 rounded-xl border-2 border-slate-100 hover:border-pink-300 bg-white hover:bg-pink-50/40 transition-all active:scale-95 flex items-center justify-center overflow-hidden"
                >
                  <img src={item.imagePath} alt={item.name} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-bold text-white bg-black/40 py-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.name.replace('（持ち手用）', '')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Full sticker list */}
          {selectedCategory !== 'ribbon' && (
          <div className={selectedCategory === 'all' ? 'pt-2 border-t border-pink-50' : ''}>
            {selectedCategory === 'all' && (
              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                パーツ一覧
              </h4>
            )}
            <div className="grid grid-cols-4 gap-2 min-h-[280px] content-start">
              {filteredStickers.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleAddPresetSticker(item)}
                  className="group relative aspect-square p-1 rounded-xl bg-gradient-to-b from-white to-pink-50/40 border border-pink-100 hover:border-pink-300 hover:shadow-cute hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center"
                  title={item.name}
                >
                  <div style={{ transform: `scale(${PART_DISPLAY_SCALE[item.category] ?? 1})`, transformOrigin: 'center' }}>
                    <div className="w-11 h-11 p-1 flex items-center justify-center transition-transform group-hover:scale-105">
                      <StickerSVG svgKey={item.key} imagePath={item.imagePath} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
      )}

      {/* Text Stickers Tab */}
      {selectedCategory === 'text' && (
        <div className="space-y-4 text-xs">
          {/* Custom Text Generator */}
          <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-100 space-y-2">
            <label className="font-bold text-slate-700 block">好きな文字・推しの名前を入力してね♡</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder=""
                className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 text-xs focus:outline-pink-400 bg-white"
                style={{ fontFamily: '"Zen Maru Gothic", sans-serif' }}
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
              <span className="text-[11px] text-slate-600">文字色:</span>
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

            {/* Recently Used Texts */}
            <div className="pt-1">
              <h4 className="font-bold text-slate-700 mb-2">文字候補</h4>
              <div className="border border-pink-200 rounded-xl px-2 py-2 min-h-[40px] flex items-center">
                {addedTexts.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 w-full">
                    {addedTexts.map((w, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddTextSticker(w.text, w.color)}
                        className="px-3 py-1 rounded-xl bg-white border border-pink-100 hover:border-pink-300 font-extrabold text-xs whitespace-nowrap shrink-0 hover:shadow-xs transition hover:scale-105 active:scale-95"
                        style={{ color: w.color }}
                      >
                        {w.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 w-full text-center">
                    文字を追加したらここに表示されます
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Alphabet Letters Grid — collapsible */}
          <div>
            <button
              onClick={() => setIsAlphabetOpen((v) => !v)}
              className="flex items-center gap-1.5 font-bold text-slate-700 mb-2 w-full text-left"
            >
              <span>アルファベット・記号</span>
              <span className="text-[10px] text-slate-400 ml-1">{isAlphabetOpen ? '▲' : '▼'}</span>
            </button>
            {isAlphabetOpen && (
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
            )}
          </div>

          {/* Hiragana Grid — collapsible */}
          <div>
            <button
              onClick={() => setIsHiraganaOpen((v) => !v)}
              className="flex items-center gap-1.5 font-bold text-slate-700 mb-2 w-full text-left"
            >
              <span>ひらがな</span>
              <span className="text-[10px] text-slate-400 ml-1">{isHiraganaOpen ? '▲' : '▼'}</span>
            </button>
            {isHiraganaOpen && (
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_HIRAGANA.map((char) => (
                  <button
                    key={char}
                    onClick={() => handleAddTextSticker(char, '#f472b6')}
                    className="h-8 rounded-xl bg-white border border-pink-100 hover:border-pink-400 font-extrabold text-pink-500 text-sm hover:scale-110 hover:shadow-xs transition active:scale-95 flex items-center justify-center shadow-2xs"
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Katakana Grid — collapsible */}
          <div>
            <button
              onClick={() => setIsKatakanaOpen((v) => !v)}
              className="flex items-center gap-1.5 font-bold text-slate-700 mb-2 w-full text-left"
            >
              <span>カタカナ</span>
              <span className="text-[10px] text-slate-400 ml-1">{isKatakanaOpen ? '▲' : '▼'}</span>
            </button>
            {isKatakanaOpen && (
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_KATAKANA.map((char) => (
                  <button
                    key={char}
                    onClick={() => handleAddTextSticker(char, '#a78bfa')}
                    className="h-8 rounded-xl bg-white border border-purple-100 hover:border-purple-400 font-extrabold text-purple-500 text-sm hover:scale-110 hover:shadow-xs transition active:scale-95 flex items-center justify-center shadow-2xs"
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Korean — text input only, preset grid removed */}
          <p className="text-[11px] text-slate-600">韓国語はテキスト入力欄に直接入力できます（スマホキーボード対応）</p>
        </div>
      )}

      {/* Photo Stickers Tab */}
      {selectedCategory === 'photo' && (
        <div className="space-y-4 text-xs">
          {/* Custom Upload */}
          <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-100 space-y-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-pink-500" />
              好きな写真をアップロード
            </h4>
            <p className="text-[11px] text-slate-500">
              好きな写真をペンライトに飾ってね♡
            </p>
            {/* Hidden file input — value cleared after each selection so same file re-triggers */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoFileSelect}
            />

            {/* Button calls click() synchronously so iOS photo library sheet opens */}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="w-full py-2 px-3 bg-white hover:bg-pink-50 border border-pink-200 text-pink-600 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              ステッカーにする
            </button>

            {photoError && (
              <p className="text-[11px] text-rose-500 font-bold text-center">{photoError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
