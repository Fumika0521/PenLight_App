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
  Heart, 
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
  onExportImage,
}) => {
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('home');
  const [isPartsSheetOpen, setIsPartsSheetOpen] = useState(false);
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
          <h1 className="font-cursive text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-blue-400 font-bold">
            Light Deco ♡
          </h1>
          <p className="text-[11px] text-pink-400 font-bold tracking-widest mt-0.5">
            ペンライトデコアプリ
          </p>
        </div>

        {/* Hero Illustration (Cute Decorated Penlight - Enlarged) */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-64 h-96 flex items-center justify-center">
            {/* Sparkle background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-200/40 via-purple-200/30 to-blue-200/40 rounded-full blur-2xl animate-pulse-slow" />
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
            className="w-full py-3 bg-white/90 hover:bg-white text-pink-600 font-bold text-xs rounded-full border border-pink-200 shadow-xs transition-all active:scale-98"
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

        {/* Gallery Modal */}
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          savedProjects={savedProjects}
          onLoadProject={(p) => {
            onLoadProject(p);
            setCurrentScreen('editor');
          }}
          onDeleteProject={onDeleteProject}
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

        {/* Top Bar */}
        <div className="px-5 pt-8 pb-3 border-b border-pink-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-1.5 rounded-full hover:bg-pink-50 text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-sm text-slate-800">ベースを選択</h2>
          <div className="w-8" />
        </div>

        {/* Subtitle */}
        <div className="px-5 py-1">
          <p className="text-[11px] text-slate-500 font-medium">
            お好みのベースペンライトを選択してください♡
          </p>
        </div>

        {/* Base Grid */}
        <div className="flex-1 px-5 py-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3.5">
            {baseList.map((item) => {
              const isSelected = config.baseType === item.type;
              return (
                <div
                  key={item.type}
                  onClick={() => onUpdateConfig({ baseType: item.type })}
                  className={`relative p-3 rounded-2xl border-2 flex flex-col items-center cursor-pointer transition-all ${
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
                  <div className="w-20 h-28 my-1 pointer-events-none">
                    <PenlightBase config={{ ...config, baseType: item.type }} />
                  </div>
                  <span className="font-bold text-xs text-slate-700 mt-1">{item.name}</span>
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
      <div className="px-4 pt-8 pb-2.5 bg-white border-b border-pink-100 flex items-center justify-between z-30">
        <button
          onClick={() => setCurrentScreen('home')}
          className="p-1 rounded-full hover:bg-pink-50 text-slate-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-full ${canUndo ? 'text-slate-700' : 'text-slate-300'}`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-full ${canRedo ? 'text-slate-700' : 'text-slate-300'}`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConcertMode(!isConcertMode)}
            className={`p-1.5 rounded-full text-xs font-bold ${
              isConcertMode ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            title="暗闇モード"
          >
            <Music className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onSaveCurrentDesign();
              alert('デザインを保存しました！♡');
            }}
            className="px-3 py-1 bg-gradient-to-r from-blue-400 to-sky-400 text-white font-extrabold text-xs rounded-full shadow-xs active:scale-95"
          >
            保存
          </button>
        </div>
      </div>

      {/* Center Interactive Canvas */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2">
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
      <div className="bg-white/95 px-3 py-1.5 border-t border-pink-100 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
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
            className="w-9 h-9 p-1 rounded-xl bg-pink-50/60 hover:bg-pink-100 border border-pink-100 shrink-0 flex items-center justify-center transition active:scale-90"
          >
            <div className="w-6 h-6">
              <StickerSVG svgKey={st.key} />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Tool Dock (Matches Mockup Icons: パーツ, ラインストーン, 文字, 写真, 色・照明, 削除) */}
      <div className="bg-white px-2 py-2 border-t border-pink-100 flex items-center justify-around z-30">
        <button
          onClick={() => setIsPartsSheetOpen(true)}
          className="flex flex-col items-center text-pink-500 hover:text-pink-600"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">パーツ</span>
        </button>

        <button
          onClick={() => setIsPartsSheetOpen(true)}
          className="flex flex-col items-center text-slate-500 hover:text-pink-500"
        >
          <Heart className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">ストーン</span>
        </button>

        <button
          onClick={() => setIsPartsSheetOpen(true)}
          className="flex flex-col items-center text-slate-500 hover:text-pink-500"
        >
          <Type className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">文字</span>
        </button>

        <button
          onClick={() => setIsPartsSheetOpen(true)}
          className="flex flex-col items-center text-slate-500 hover:text-pink-500"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">写真</span>
        </button>

        <button
          onClick={() => setIsColorModalOpen(true)}
          className="flex flex-col items-center text-blue-500 hover:text-blue-600"
        >
          <Palette className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">色・照明</span>
        </button>

        {selectedId ? (
          <button
            onClick={() => onDeleteSticker(selectedId)}
            className="flex flex-col items-center text-rose-500"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">削除</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCompleteOpen(true)}
            className="flex flex-col items-center text-pink-600 font-bold"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-[9px] font-bold mt-0.5">完成！</span>
          </button>
        )}
      </div>

      {/* Modals & Sheets */}
      {isPartsSheetOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 flex flex-col justify-end">
          <div className="h-[75%] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            <div className="px-4 py-2 border-b border-pink-100 flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-700">パーツ一覧</span>
              <button
                onClick={() => setIsPartsSheetOpen(false)}
                className="text-xs font-bold text-pink-500 px-2 py-1 rounded-lg hover:bg-pink-50"
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
              />
            </div>
          </div>
        </div>
      )}

      {/* Color Customization Modal */}
      <ColorCustomizationModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        config={config}
        onSaveConfig={onUpdateConfig}
      />

      {/* Complete Modal */}
      <CompleteModal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        config={config}
        stickers={stickers}
        onExportImage={onExportImage}
      />
    </div>
  );
};
