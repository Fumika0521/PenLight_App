import React, { useState } from 'react';
import { 
  PenlightConfig, 
  StickerItem, 
  MobileScreen, 
  PenlightBaseType,
  SavedProject 
} from '../../types';
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
  Save, 
  Palette, 
  Sparkles, 
  Trash2, 
  Type, 
  Image as ImageIcon,
  Check,
  Music,
  Share2,
  FolderHeart
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
}) => {
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('home');
  const [isPartsSheetOpen, setIsPartsSheetOpen] = useState(false);
  const [partsInitialCategory, setPartsInitialCategory] = useState<string>('all');

  const openPartsSheet = (category: string = 'all') => {
    setPartsInitialCategory(category);
    setIsPartsSheetOpen(true);
  };
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isConcertMode, setIsConcertMode] = useState(false);

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
              <PenlightBase config={config} />
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

  // Screen 2: Select Base Screen (Matches Mockup 2)
  if (currentScreen === 'select-base') {
    const baseList: { type: PenlightBaseType; name: string }[] = [
      { type: 'classic', name: '定番タイプ' },
      { type: 'heart', name: 'ハートタイプ' },
      { type: 'star', name: 'スタータイプ' },
      { type: 'diamond', name: 'ダイヤタイプ' },
    ];

    return (
      <div className="relative w-full max-w-[420px] sm:max-w-[440px] mx-auto h-[820px] sm:h-[850px] bg-white rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col justify-between select-none">
        {/* Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40" />

        {/* Top Bar — same height as editor header */}
        <div className="px-4 pt-11 pb-5 border-b border-pink-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-3 rounded-full hover:bg-pink-50 text-slate-600"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h2 className="font-extrabold text-base text-slate-800">ペンライトを選択</h2>
          <div className="w-12" />
        </div>

        {/* Base Grid + Subtitle — subtitle at midpoint between header and first card row */}
        <div className="flex-1 px-4 flex flex-col justify-evenly">
          <p className="text-base text-slate-600 font-semibold text-center">
            お好みのペンライトを選択してください♡
          </p>
          <div className="grid grid-cols-2 gap-3">
            {baseList.map((item) => {
              const isSelected = config.baseType === item.type;
              return (
                <div
                  key={item.type}
                  onClick={() => onUpdateConfig({ baseType: item.type })}
                  className={`relative px-2 pt-3 pb-2 rounded-2xl border-2 flex flex-col items-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-50/40 shadow-cute'
                      : 'border-slate-100 hover:border-pink-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-32 h-44 pointer-events-none">
                    <PenlightBase config={{ ...config, baseType: item.type }} />
                  </div>
                  <span className="font-bold text-xs text-slate-600 mt-1">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-5 border-t border-pink-50 bg-pink-50/20">
          <button
            onClick={() => setCurrentScreen('editor')}
            className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-full shadow-cute transition-all active:scale-98"
          >
            次へ
          </button>
        </div>
      </div>
    );
  }

  // Screen 3: Mobile Editor Screen (Matches Mockup 3)
  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[440px] mx-auto h-[820px] sm:h-[850px] bg-slate-50 rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col justify-between select-none">
      {/* Dynamic Island */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40" />

      {/* Top Bar */}
      <div className="relative px-4 pt-11 pb-5 bg-white border-b border-pink-100 flex items-center justify-between z-30">
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

        {/* Right: Concert mode + Save */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConcertMode(!isConcertMode)}
            className={`p-3 rounded-full font-bold ${
              isConcertMode ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            title="暗闇モード"
          >
            <Music className="w-6 h-6" />
          </button>
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

      {/* Center Interactive Canvas */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-1">
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
          isConcertMode={isConcertMode}
        />
      </div>

      {/* Quick Stickers Strip */}
      <div className="bg-white/95 px-3 py-2 border-t border-pink-100 flex items-center gap-2.5 overflow-x-auto scrollbar-none z-20">
        {STICKER_CATALOG.filter((s) => s.popular).slice(0, 8).map((st) => (
          <button
            key={`quick-${st.key}`}
            onClick={() =>
              onAddSticker({
                name: st.name,
                category: st.category as any,
                x: 50,
                y: 40,
                scale: 1,
                rotation: 0,
                type: 'preset',
                svgKey: st.key,
                opacity: 1,
              })
            }
            className="w-16 h-16 p-1.5 rounded-2xl bg-pink-50/60 hover:bg-pink-100 border border-pink-100 shrink-0 flex items-center justify-center transition active:scale-90"
          >
            <div className="w-12 h-12">
              <StickerSVG svgKey={st.key} />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Tool Dock */}
      <div className="bg-white px-3 py-4 border-t border-pink-100 flex items-center justify-center gap-5 z-30">
        <button
          onClick={() => openPartsSheet('all')}
          className="flex flex-col items-center text-pink-500 hover:text-pink-600 min-w-[56px]"
        >
          <Sparkles className="w-7 h-7" />
          <span className="text-[11px] font-bold mt-1">パーツ</span>
        </button>

        <button
          onClick={() => openPartsSheet('text')}
          className="flex flex-col items-center text-slate-500 hover:text-pink-500 min-w-[56px]"
        >
          <Type className="w-7 h-7" />
          <span className="text-[11px] font-bold mt-1">文字</span>
        </button>

        <button
          onClick={() => openPartsSheet('photo')}
          className="flex flex-col items-center text-slate-500 hover:text-pink-500 min-w-[56px]"
        >
          <ImageIcon className="w-7 h-7" />
          <span className="text-[11px] font-bold mt-1">写真</span>
        </button>

        <button
          onClick={() => setIsColorModalOpen(true)}
          className="flex flex-col items-center text-blue-500 hover:text-blue-600 min-w-[56px]"
        >
          <Palette className="w-7 h-7" />
          <span className="text-[11px] font-bold mt-1">色・照明</span>
        </button>

        {selectedId ? (
          <button
            onClick={() => onDeleteSticker(selectedId)}
            className="flex flex-col items-center text-rose-500 min-w-[56px]"
          >
            <Trash2 className="w-7 h-7" />
            <span className="text-[11px] font-bold mt-1">削除</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCompleteOpen(true)}
            className="flex flex-col items-center text-pink-600 font-bold min-w-[56px]"
          >
            <Sparkles className="w-7 h-7 text-amber-400" />
            <span className="text-[11px] font-bold mt-1">完成！</span>
          </button>
        )}
      </div>

      {/* Modals & Sheets */}
      {isPartsSheetOpen && (
        <div
          className="absolute inset-0 z-50 bg-slate-900/40 flex flex-col justify-end"
          onClick={() => setIsPartsSheetOpen(false)}
        >
          <div
            className="h-[82%] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 border-b border-pink-100 flex items-center justify-end">
              <button
                onClick={() => setIsPartsSheetOpen(false)}
                className="text-xs font-bold text-pink-500 px-3 py-1.5 rounded-lg hover:bg-pink-50"
              >
                閉じる
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PartsPickerPanel
                onAddSticker={(st) => {
                  onAddSticker(st);
                  setIsPartsSheetOpen(false);
                }}
                onSetInsidePhoto={(url) => onUpdateConfig({ insidePhotoUrl: url })}
                insidePhotoUrl={config.insidePhotoUrl}
                initialCategory={partsInitialCategory}
              />
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};
