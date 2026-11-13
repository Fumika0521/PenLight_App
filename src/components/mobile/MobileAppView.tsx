import React, { useState } from 'react';
import {
  PenlightConfig,
  StickerItem,
  MobileScreen,
  SavedProject,
  MyPart
} from '../../types';
import { PhotoPartCreatorModal } from '../modals/PhotoPartCreatorModal';
import { PenlightBase } from '../penlight/PenlightBase';
import { StickerSVG, STICKER_CATALOG, StickerDef } from '../stickers/StickerSVG';
import { InteractiveCanvas } from '../canvas/InteractiveCanvas';
import { PartsPickerPanel } from '../panels/PartsPickerPanel';
import { BaseSelectionModal } from '../modals/BaseSelectionModal';
import { ColorCustomizationModal } from '../modals/ColorCustomizationModal';
import { CompleteModal } from '../modals/CompleteModal';
import { GalleryModal } from '../modals/GalleryModal';
import {
  Home,
  PlusCircle,
  User,
  ChevronLeft,
  Undo2,
  Redo2,
  Palette,
  Sparkles,
  Trash2,
  Type,
  Image as ImageIcon,
  Check,
  Gem,
  Gift
} from 'lucide-react';

interface MobileAppViewProps {
  config: PenlightConfig;
  stickers: StickerItem[];
  selectedId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onDeleteSticker: (id: string) => void;
  onDuplicateSticker: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onAddSticker: (sticker: Omit<StickerItem, 'id' | 'zIndex'>) => void;
  onUpdateConfig: (updates: Partial<PenlightConfig>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSaveCurrentDesign: () => void;
  savedProjects: SavedProject[];
  onLoadProject: (p: SavedProject) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onExportImage: () => void;
  onNewDeco: () => void;
  myParts: MyPart[];
  onAddMyPart: (part: MyPart) => void;
  onDeleteMyPart: (id: string) => void;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  config,
  stickers,
  selectedId,
  onSelectSticker,
  onUpdateSticker,
  onDeleteSticker,
  onDuplicateSticker,
  onBringForward,
  onSendBackward,
  onAddSticker,
  onUpdateConfig,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSaveCurrentDesign,
  savedProjects,
  onLoadProject,
  onDeleteProject,
  onRenameProject,
  onExportImage,
  onNewDeco,
  myParts,
  onAddMyPart,
  onDeleteMyPart,
}) => {
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('home');
  const [activePanel, setActivePanel] = useState<'insert' | 'ribbon' | 'parts' | null>(null);
  const [partsInitialCategory, setPartsInitialCategory] = useState<string>('heart');
  const [selectedInsert, setSelectedInsert] = useState<'moon-star' | 'double-heart' | 'oshi-name' | null>(null);
  const [oshiName, setOshiName] = useState('');

  const togglePanel = (panel: 'insert' | 'ribbon' | 'parts', category?: string) => {
    if (panel === 'parts') {
      const cat = category || 'heart';
      if (activePanel === 'parts' && partsInitialCategory === cat) {
        setActivePanel(null);
      } else {
        setPartsInitialCategory(cat);
        setActivePanel('parts');
      }
    } else {
      setActivePanel(prev => prev === panel ? null : panel);
    }
  };
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPhotoPartCreatorOpen, setIsPhotoPartCreatorOpen] = useState(false);
  const [addedTexts, setAddedTexts] = useState<{ text: string; color: string }[]>([]);

  // Screen 1: Mobile Home Screen (Matches Mockup 1)
  if (currentScreen === 'home') {
    return (
      <div className="relative w-full max-w-[420px] sm:max-w-[440px] mx-auto h-[820px] sm:h-[850px] bg-gradient-to-b from-[#fff5f8] via-[#ffffff] to-[#f0f7ff] rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col justify-between select-none">
        {/* Dynamic Island / Speaker cutout */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40 flex items-center justify-end px-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 pt-3 text-[11px] font-bold text-slate-800 z-30">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-xs">
            <span>●●●</span>
            <span>WiFi</span>
            <span>100%</span>
          </div>
        </div>

        {/* Header Logo */}
        <div className="text-center pt-5">
          <h1 className="font-cursive text-6xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-blue-400 font-bold">
            Light Deco ♡
          </h1>
          <p className="text-base text-pink-400 font-bold mt-0.5" style={{ letterSpacing: '0.15em', marginRight: '-0.15em' }}>
            ペンライトデコアプリ
          </p>
        </div>

        {/* Hero Illustration (Cute Decorated Penlight - Enlarged) */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Scattered sparkles around penlight */}
            <span className="absolute text-yellow-300 text-2xl animate-sparkle pointer-events-none select-none" style={{ top: '8%',  left: '18%', animationDelay: '0s' }}>✦</span>
            <span className="absolute text-pink-400  text-sm  animate-float   pointer-events-none select-none" style={{ top: '14%', left: '8%',  animationDelay: '0.7s' }}>✧</span>
            <span className="absolute text-blue-300  text-xl  animate-sparkle pointer-events-none select-none" style={{ top: '26%', left: '22%', animationDelay: '1.1s' }}>★</span>
            <span className="absolute text-purple-300 text-xs animate-float   pointer-events-none select-none" style={{ top: '20%', left: '12%', animationDelay: '0.3s' }}>✦</span>
            <span className="absolute text-yellow-400 text-lg animate-sparkle pointer-events-none select-none" style={{ top: '44%', left: '7%',  animationDelay: '0.5s' }}>✧</span>
            <span className="absolute text-pink-300  text-base animate-sparkle pointer-events-none select-none" style={{ top: '60%', left: '19%', animationDelay: '1.4s' }}>✦</span>
            <span className="absolute text-blue-200  text-sm  animate-float   pointer-events-none select-none" style={{ top: '75%', left: '10%', animationDelay: '0.9s' }}>✨</span>
            <span className="absolute text-yellow-300 text-xl animate-float   pointer-events-none select-none" style={{ top: '88%', left: '23%', animationDelay: '0.2s' }}>✧</span>

            <span className="absolute text-pink-400  text-xl  animate-sparkle pointer-events-none select-none" style={{ top: '6%',  right: '20%', animationDelay: '0.4s' }}>✧</span>
            <span className="absolute text-yellow-300 text-base animate-float  pointer-events-none select-none" style={{ top: '17%', right: '9%',  animationDelay: '1.0s' }}>✦</span>
            <span className="absolute text-blue-300  text-xl  animate-sparkle pointer-events-none select-none" style={{ top: '32%', right: '21%', animationDelay: '0.6s' }}>★</span>
            <span className="absolute text-pink-200  text-xs  animate-sparkle pointer-events-none select-none" style={{ top: '50%', right: '8%',  animationDelay: '1.3s' }}>✦</span>
            <span className="absolute text-blue-300  text-lg  animate-float   pointer-events-none select-none" style={{ top: '65%', right: '18%', animationDelay: '0.1s' }}>✧</span>
            <span className="absolute text-yellow-400 text-sm animate-sparkle pointer-events-none select-none" style={{ top: '79%', right: '11%', animationDelay: '0.8s' }}>✨</span>
            <span className="absolute text-pink-300  text-xl  animate-float   pointer-events-none select-none" style={{ top: '91%', right: '22%', animationDelay: '0.5s' }}>✦</span>

            <div className="relative w-full h-full pointer-events-none">
              <PenlightBase config={config} showEmptyGlass />
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="px-6 space-y-2.5 pb-4">
          <button
            onClick={() => setCurrentScreen('select-base')}
            className="w-full py-3.5 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-sm rounded-full shadow-cute hover:shadow-cute-lg transition-all active:scale-98 shimmer-btn"
          >
            新しくデコる
          </button>
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="w-full py-3.5 bg-white/90 hover:bg-white text-pink-600 font-extrabold text-sm rounded-full border border-pink-200 shadow-xs transition-all active:scale-98"
          >
            保存したデザインを見る
          </button>
        </div>

        {/* Bottom Tab Bar (Home, Create, MyPage) */}
        <div className="h-16 bg-white/90 backdrop-blur-md border-t border-pink-100 flex items-center justify-around px-4 z-30">
          <button className="flex flex-col items-center text-pink-500">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">ホーム</span>
          </button>
          <button
            onClick={() => setCurrentScreen('editor')}
            className="flex flex-col items-center text-slate-400 hover:text-pink-500"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center -mt-3 shadow-cute">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5 text-pink-500">作る</span>
          </button>
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="flex flex-col items-center text-slate-400 hover:text-pink-500"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">マイページ</span>
          </button>
        </div>

        {/* Gallery — inline inside phone frame */}
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          savedProjects={savedProjects}
          onLoadProject={(p) => {
            onLoadProject(p);
            setIsGalleryOpen(false);
            setCurrentScreen('editor');
          }}
          onDeleteProject={onDeleteProject}
          onRenameProject={onRenameProject}
          inline
        />
      </div>
    );
  }

  // Screen 2: Select Base Screen
  if (currentScreen === 'select-base') {
    const inserts = {
      'moon-star':    { name: 'クラシック月と星', imageUrl: '/assets/stickers/insert_moon_star.png',            svgKey: 'insert-moon-star-3d',  cssFilter: undefined,                        text: undefined },
      'double-heart': { name: '2重ハート',       imageUrl: '/assets/stickers/insert_double_heart_clear.png',  svgKey: 'insert-double-heart',  cssFilter: undefined,                        text: undefined },
      'oshi-name':    { name: '推しの名前',       imageUrl: '/assets/stickers/insert_empty_glass.png',         svgKey: 'insert-oshi-name',     cssFilter: undefined,                        text: oshiName.trim() },
      // 'heart-note': {
      //   name: '雲とクローバー',
      //   imageUrl: '/assets/stickers/heart_note_soft_sharp.png',
      //   svgKey: 'insert-heart-note',
      // },
      // 'heart-note-music': {
      //   name: 'ハートと音符',
      //   imageUrl: '/assets/stickers/insert_heart_note.png',
      //   svgKey: 'insert-heart-note-music',
      // },
    };

    const handleNext = () => {
      // 既存のパーツをすべてクリアしてから中身を追加
      onNewDeco();
      if (selectedInsert) {
        const def = inserts[selectedInsert];
        onAddSticker({
          name: def.name,
          category: 'insert',
          layer: 'insert',
          x: 50,
          y: 37.7,
          scale: 1.2,
          rotation: 0,
          type: '3d-png',
          imageUrl: def.imageUrl,
          svgKey: def.svgKey,
          cssFilter: def.cssFilter,
          text: def.text || undefined,
          opacity: 1,
        });
      }
      setCurrentScreen('editor');
    };

    return (
      <div className="relative w-full max-w-[420px] sm:max-w-[440px] mx-auto h-[820px] sm:h-[850px] bg-white rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col justify-between select-none">
        {/* Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40" />

        {/* Top Bar */}
        <div className="px-4 pt-11 pb-4 border-b border-pink-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-3 rounded-full hover:bg-pink-50 text-slate-600"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h2 className="font-extrabold text-base text-slate-800">中身を選択</h2>
          <div className="w-12" />
        </div>

        <div className="flex-1 px-4 flex flex-col items-center justify-center gap-5">
          <p className="text-sm text-slate-600 font-semibold text-center">
            ドームの中身を選んでください♡
          </p>
          <div className="flex flex-col gap-3 w-full">
            {/* 月と星 / 2重ハート */}
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'moon-star' as const,    label: 'クラシック月と星', src: '/assets/stickers/insert_moon_star.png',           objPos: 'center 30%', cssFilter: undefined },
                { key: 'double-heart' as const, label: '2重ハート',       src: '/assets/stickers/insert_double_heart_clear.png', objPos: 'center center', cssFilter: undefined },
              ]).map((item) => {
                const isSelected = selectedInsert === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedInsert(isSelected ? null : item.key)}
                    className={`relative flex flex-col items-center px-3 py-4 rounded-3xl border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-pink-400 bg-pink-50/60 shadow-cute' : 'border-slate-100 hover:border-pink-200'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-28 h-28 rounded-full overflow-hidden shadow-md">
                      <img src={item.src} alt={item.label} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: item.objPos, filter: item.cssFilter }} />
                    </div>
                    <span className="font-bold text-xs text-slate-600 mt-2 text-center">{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* 推しの名前 */}
            {(() => {
              const isSelected = selectedInsert === 'oshi-name';
              return (
                <div
                  onClick={() => setSelectedInsert(isSelected ? null : 'oshi-name')}
                  className={`relative flex items-center gap-4 px-4 py-3 rounded-3xl border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-pink-400 bg-pink-50/60 shadow-cute' : 'border-slate-100 hover:border-pink-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  {/* ガラス球プレビュー */}
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-md shrink-0 relative bg-white/40">
                    <img src="/assets/stickers/insert_empty_glass.png" className="w-full h-full object-cover" />
                    {oshiName.trim() && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={{
                          fontFamily: '"M PLUS Rounded 1c", sans-serif',
                          fontWeight: 800,
                          fontSize: `${Math.max(8, Math.min(18, 56 / Math.max(oshiName.trim().length, 1)))}px`,
                          color: 'rgba(255,255,255,0.45)',
                          textShadow: '-1px -1px 0 rgba(255,255,255,0.78), 1.5px 1.5px 2px rgba(100,80,160,0.45)',
                          whiteSpace: 'nowrap',
                        }}>
                          {oshiName.trim()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="font-bold text-sm text-slate-700">推しの名前</span>
                    {isSelected && (
                      <input
                        type="text"
                        value={oshiName}
                        onChange={(e) => setOshiName(e.target.value.slice(0, 8))}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="名前を入力（8文字まで）"
                        maxLength={8}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-400 font-bold text-slate-700"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-5 border-t border-pink-50 bg-pink-50/20">
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-full shadow-cute transition-all active:scale-98"
          >
            次へ
          </button>
        </div>
      </div>
    );
  }

  // Screen 3: Mobile Editor Screen
  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[440px] mx-auto h-[820px] sm:h-[850px] bg-slate-50 rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col select-none">
      {/* Dynamic Island */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40" />

      {/* Top Bar */}
      <div className="relative px-4 pt-11 pb-5 bg-white border-b border-pink-100 flex items-center justify-between z-30 shrink-0">
        {/* Left: Back */}
        <button
          onClick={() => setCurrentScreen('home')}
          className="p-3 rounded-full hover:bg-pink-50 text-slate-600"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        {/* Center: Undo / Redo — absolutely centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-3 rounded-full ${canUndo ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300'}`}
          >
            <Undo2 className="w-6 h-6" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-3 rounded-full ${canRedo ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300'}`}
          >
            <Redo2 className="w-6 h-6" />
          </button>
        </div>

        {/* Right: Save */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSaveCurrentDesign();
              alert('デザインを保存しました！♡');
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-400 to-sky-400 text-white font-extrabold text-base rounded-full shadow-xs active:scale-95"
          >
            保存
          </button>
        </div>
      </div>

      {/* Center Interactive Canvas — tap to close open panel */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center p-1 min-h-0"
        onClick={() => setActivePanel(null)}
      >
        <InteractiveCanvas
          config={config}
          stickers={stickers}
          selectedId={selectedId}
          onSelectSticker={onSelectSticker}
          onUpdateSticker={onUpdateSticker}
          onDeleteSticker={onDeleteSticker}
          onDuplicateSticker={onDuplicateSticker}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          isConcertMode={false}
        />
      </div>

      {/* Inline Panel — appears above bottom dock when a menu button is active */}
      {activePanel && (
        <div className="bg-white border-t border-pink-100 shrink-0 flex flex-col overflow-hidden" style={{ maxHeight: '52%' }}>
          <div className="px-4 py-2.5 border-b border-pink-100 flex items-center justify-between shrink-0">
            <h3 className="font-extrabold text-sm text-slate-800">
              {activePanel === 'insert' ? 'ドームの中身を選ぶ'
                : activePanel === 'ribbon' ? 'リボンを選ぶ'
                : ''}
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="text-xs font-bold text-pink-500 px-3 py-1.5 rounded-lg hover:bg-pink-50"
            >
              閉じる
            </button>
          </div>
          <div className="overflow-y-auto">
            {activePanel === 'insert' && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'moon-star',    name: 'クラシック月と星', imageUrl: '/assets/stickers/insert_moon_star.png',           svgKey: 'insert-moon-star-3d', objPos: 'center 30%',    cssFilter: undefined },
                    { key: 'double-heart', name: '2重ハート',       imageUrl: '/assets/stickers/insert_double_heart_clear.png', svgKey: 'insert-double-heart', objPos: 'center center', cssFilter: undefined },
                  ] as const).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        onAddSticker({ name: item.name, category: 'insert', layer: 'insert', x: 50, y: 37.7, scale: 1.2, rotation: 0, type: '3d-png', imageUrl: item.imageUrl, svgKey: item.svgKey, cssFilter: item.cssFilter, opacity: 1 });
                        setActivePanel(null);
                      }}
                      className="flex flex-col items-center px-3 py-4 rounded-3xl border-2 border-slate-100 hover:border-pink-300 bg-white hover:bg-pink-50/40 transition-all active:scale-95"
                    >
                      <div className="w-28 h-20 overflow-hidden rounded-2xl flex items-center justify-center">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" style={{ objectPosition: item.objPos, filter: item.cssFilter }} />
                      </div>
                      <span className="font-bold text-xs text-slate-600 mt-2 text-center">{item.name}</span>
                    </button>
                  ))}
                </div>

                {/* 推しの名前 */}
                <div className="flex flex-col gap-2 p-3 rounded-2xl border-2 border-slate-100 bg-white">
                  <span className="font-bold text-xs text-slate-600">推しの名前</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={oshiName}
                      onChange={(e) => setOshiName(e.target.value.slice(0, 8))}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="名前を入力（8文字まで）"
                      maxLength={8}
                      className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-pink-200 bg-pink-50/30 focus:outline-none focus:border-pink-400 font-bold text-slate-700"
                    />
                    <button
                      onClick={() => {
                        if (!oshiName.trim()) return;
                        onAddSticker({ name: `推しの名前「${oshiName.trim()}」`, category: 'insert', layer: 'insert', x: 50, y: 37.7, scale: 1.2, rotation: 0, type: '3d-png', imageUrl: '/assets/stickers/insert_empty_glass.png', svgKey: 'insert-oshi-name', text: oshiName.trim(), opacity: 1 });
                        setActivePanel(null);
                      }}
                      className="px-4 py-1.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-xs rounded-xl active:scale-95 transition disabled:opacity-40"
                      disabled={!oshiName.trim()}
                    >
                      追加
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activePanel === 'ribbon' && (
              <div className="p-4 grid grid-cols-2 gap-3">
                {STICKER_CATALOG.filter((s) => s.category === 'handle').map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      onAddSticker({
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
                      });
                      setActivePanel(null);
                    }}
                    className="flex flex-col items-center px-3 py-4 rounded-3xl border-2 border-slate-100 hover:border-pink-300 bg-white hover:bg-pink-50/40 transition-all active:scale-95"
                  >
                    <div className="w-28 h-20 flex items-center justify-center overflow-hidden">
                      <img src={item.imagePath} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-xs text-slate-600 mt-2 text-center">
                      {item.name.replace('（持ち手用）', '')}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {activePanel === 'parts' && (
              <PartsPickerPanel
                onAddSticker={(st) => {
                  onAddSticker(st);
                  if (st.category !== 'mypart') setActivePanel(null);
                }}
                onSetInsidePhoto={(url) => onUpdateConfig({ insidePhotoUrl: url })}
                insidePhotoUrl={config.insidePhotoUrl}
                initialCategory={partsInitialCategory}
                addedTexts={addedTexts}
                onAddedTextsChange={setAddedTexts}
                myParts={myParts}
                onOpenPhotoPartCreator={() => setIsPhotoPartCreatorOpen(true)}
                onDeleteMyPart={onDeleteMyPart}
              />
            )}
          </div>
        </div>
      )}

      {/* Bottom Tool Dock */}
      <div className="bg-white px-2 pt-4 pb-8 border-t border-pink-100 flex items-center justify-between gap-1 z-30 shrink-0">
        <button
          onClick={() => togglePanel('insert')}
          className={`flex flex-col items-center min-w-[50px] transition-colors ${activePanel === 'insert' ? 'text-pink-600' : 'text-pink-400 hover:text-pink-600'}`}
        >
          <Gem className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">中身</span>
        </button>

        <button
          onClick={() => togglePanel('ribbon')}
          className={`flex flex-col items-center min-w-[50px] transition-colors ${activePanel === 'ribbon' ? 'text-rose-600' : 'text-rose-400 hover:text-rose-600'}`}
        >
          <Gift className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">持ち手</span>
        </button>

        <button
          onClick={() => togglePanel('parts', 'heart')}
          className={`flex flex-col items-center min-w-[50px] transition-colors ${activePanel === 'parts' && !['text', 'photo'].includes(partsInitialCategory) ? 'text-purple-600' : 'text-purple-400 hover:text-purple-600'}`}
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">パーツ</span>
        </button>

        <button
          onClick={() => togglePanel('parts', 'text')}
          className={`flex flex-col items-center min-w-[50px] transition-colors ${activePanel === 'parts' && partsInitialCategory === 'text' ? 'text-pink-600' : 'text-slate-400 hover:text-pink-500'}`}
        >
          <Type className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">文字</span>
        </button>

        <button
          onClick={() => togglePanel('parts', 'photo')}
          className={`flex flex-col items-center min-w-[50px] transition-colors ${activePanel === 'parts' && partsInitialCategory === 'photo' ? 'text-pink-600' : 'text-slate-400 hover:text-pink-500'}`}
        >
          <ImageIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">写真</span>
        </button>

        <button
          onClick={() => setIsColorModalOpen(true)}
          className="flex flex-col items-center text-blue-400 hover:text-blue-600 min-w-[50px] transition-colors"
        >
          <Palette className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">色</span>
        </button>

        {selectedId ? (
          <button
            onClick={() => onDeleteSticker(selectedId)}
            className="flex flex-col items-center text-rose-500 min-w-[50px]"
          >
            <Trash2 className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">削除</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCompleteOpen(true)}
            className="flex flex-col items-center text-pink-600 font-bold min-w-[50px]"
          >
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span className="text-[10px] font-bold mt-1">完成！</span>
          </button>
        )}
      </div>

      {/* Color Customization Modal — inline so it stays inside the phone frame */}
      <ColorCustomizationModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        config={config}
        onSaveConfig={onUpdateConfig}
        inline
      />

      {/* Complete Modal — inline so it stays inside the phone frame */}
      <CompleteModal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        config={config}
        stickers={stickers}
        onExportImage={onExportImage}
        inline
      />

      {/* Photo Part Creator Modal — inline inside phone frame */}
      <PhotoPartCreatorModal
        isOpen={isPhotoPartCreatorOpen}
        onClose={() => setIsPhotoPartCreatorOpen(false)}
        onPartCreated={(part) => {
          onAddMyPart(part);
          setIsPhotoPartCreatorOpen(false);
        }}
      />
    </div>
  );
};
