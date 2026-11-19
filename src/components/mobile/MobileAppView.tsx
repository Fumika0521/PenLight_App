import React, { useState } from 'react';
import {
  PenlightConfig,
  StickerItem,
  MobileScreen,
  SavedProject,
  MyPart
} from '../../types';
import { PhotoPartCreatorModal } from '../modals/PhotoPartCreatorModal';
import { PhotoStickerModal } from '../modals/PhotoStickerModal';
import { PenlightBase } from '../penlight/PenlightBase';
import { INSERT_DEFAULTS } from '../../lib/insertDefaults';
import { MENU_COLORS, menuActiveBg, PHONE_BG_GRADIENT, APP_BG_CLASS } from '../../lib/uiConstants';
import { InteractiveCanvas } from '../canvas/InteractiveCanvas';
import { PartsPickerPanel } from '../panels/PartsPickerPanel';
import { BaseSelectionModal } from '../modals/BaseSelectionModal';
import { ColorCustomizationModal } from '../modals/ColorCustomizationModal';
import { CompleteModal } from '../modals/CompleteModal';
import { GalleryModal } from '../modals/GalleryModal';
import {
  Home,
  User,
  ChevronLeft,
  Undo2,
  Redo2,
  Palette,
  Sparkles,
  Bookmark,
  Type,
  Image as ImageIcon,
  Check,
  Gem
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
  onSaveCompleteDesign?: () => void;
  myParts: MyPart[];
  onAddMyPart: (part: MyPart) => void;
  onDeleteMyPart: (id: string) => void;
  nativeMode?: boolean;
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
  onSaveCompleteDesign,
  myParts,
  onAddMyPart,
  onDeleteMyPart,
  nativeMode = false,
}) => {
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('home');
  const [activePanel, setActivePanel] = useState<'insert' | 'parts' | null>(null);
  const [partsInitialCategory, setPartsInitialCategory] = useState<string>('heart');
  const [selectedInsert, setSelectedInsert] = useState<'moon-star' | 'double-heart' | 'empty-glass' | null>(null);
  const [hoveredInsert, setHoveredInsert] = useState<string | null>(null);
  const [hoveredEditorInsert, setHoveredEditorInsert] = useState<string | null>(null);

  // Glow color → rgb string for insert hover radial-gradient
  const glowRgb = (() => {
    const c = config.glowColor || '#ff6584';
    const r = parseInt(c.slice(1, 3), 16) || 251;
    const g = parseInt(c.slice(3, 5), 16) || 113;
    const b = parseInt(c.slice(5, 7), 16) || 133;
    return `${r},${g},${b}`;
  })();

  const togglePanel = (panel: 'insert' | 'parts', category?: string) => {
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
  const [isEditorGalleryOpen, setIsEditorGalleryOpen] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isPhotoPartCreatorOpen, setIsPhotoPartCreatorOpen] = useState(false);
  const [photoStickerFile, setPhotoStickerFile] = useState<File | null>(null);
  const [addedTexts, setAddedTexts] = useState<{ text: string; color: string }[]>([]);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Bottom tab bar / dock icon area padding (px)
  const DOCK_ICON_PAD = 10;        // ホーム・中身選択画面
  const EDITOR_DOCK_PAD = 22;      // 作業画面（高め）

  // Screen 1: Mobile Home Screen (Matches Mockup 1)
  if (currentScreen === 'home') {
    const frameClass = nativeMode
      ? `relative w-full h-dvh ${PHONE_BG_GRADIENT} overflow-hidden flex flex-col justify-between select-none`
      : `relative w-full max-w-[420px] sm:max-w-[440px] mx-auto h-[820px] sm:h-[850px] ${PHONE_BG_GRADIENT} rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col justify-between select-none`;
    return (
      <div
        className={frameClass}
        style={nativeMode ? { paddingTop: 'env(safe-area-inset-top)' } : undefined}
      >
        {/* Dynamic Island / Speaker cutout — browser only */}
        {!nativeMode && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40 flex items-center justify-end px-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
          </div>
        )}

        {/* Status Bar — browser only */}
        {!nativeMode && (
          <div className="flex justify-between items-center px-6 pt-3 text-[11px] font-bold text-slate-800 z-30">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span>●●●</span>
              <span>WiFi</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Hero — flex column: logo on top, penlight below, same bg = no split */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Logo text as normal flex item — stays above penlight */}
          <div className="text-center pt-5 shrink-0">
            <h1 className="font-cursive text-6xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-blue-400 font-bold">
              Light Deco ♡
            </h1>
            <p className="text-base text-pink-400 font-bold mt-0.5" style={{ letterSpacing: '0.15em', marginRight: '-0.15em' }}>
              ペンライトデコアプリ
            </p>
          </div>
          {/* Penlight — slight negative margin so dome glow softly bleeds into text area */}
          <div className="flex-1 relative flex items-center justify-center" style={{ marginTop: '22px' }}>
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
              <PenlightBase config={config} showEmptyGlass containerAspect={400 / 508} />
            </div>
          </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="px-6 space-y-2.5 pb-4">
          <button
            onClick={() => { onNewDeco(); setCurrentScreen('select-base'); }}
            className="w-full py-4 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-base rounded-full shadow-cute hover:shadow-cute-lg transition-all active:scale-98 shimmer-btn"
          >
            新しくデコる
          </button>
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="w-full py-4 bg-white/90 hover:bg-white text-pink-600 font-extrabold text-base rounded-full border border-pink-200 shadow-xs transition-all active:scale-98"
          >
            保存したデザインを見る
          </button>
        </div>

        {/* Bottom Tab Bar (Home, MyPage) */}
        {/* paddingTop = safe-area-bottom so icons are centered in the full space (bar + home bar region) */}
        <div
          className="bg-white/90 backdrop-blur-md border-t border-pink-100 flex items-center justify-around px-4 z-[55] relative shrink-0"
          style={nativeMode ? {
            paddingTop: 'max(env(safe-area-inset-bottom), 16px)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
          } : {
            paddingTop: `${DOCK_ICON_PAD}px`,
            paddingBottom: `${DOCK_ICON_PAD}px`,
          }}
        >
          <button
            onClick={() => setIsGalleryOpen(false)}
            className={`flex flex-col items-center ${!isGalleryOpen ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
          >
            <Home className="w-8 h-8" />
            <span className="text-[11px] font-bold mt-1">ホーム</span>
          </button>
          <button
            onClick={() => setIsGalleryOpen(true)}
            className={`flex flex-col items-center ${isGalleryOpen ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
          >
            <User className="w-8 h-8" />
            <span className="text-[11px] font-bold mt-1">マイページ</span>
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
      'moon-star':    { name: 'ムーンスター',   imageUrl: '/assets/stickers/insert_moon_star.png',           svgKey: 'insert-moon-star-3d', cssFilter: undefined, text: undefined },
      'double-heart': { name: 'ダブルハート',   imageUrl: '/assets/stickers/insert_double_heart_clear.png', svgKey: 'insert-double-heart', cssFilter: undefined, text: undefined },
      'empty-glass':  { name: 'クリアガラス',   imageUrl: '/assets/stickers/insert_empty_glass.png',         svgKey: 'insert-oshi-name',    cssFilter: undefined, text: undefined },
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
          ...INSERT_DEFAULTS,
          type: '3d-png',
          imageUrl: def.imageUrl,
          svgKey: def.svgKey,
          cssFilter: def.cssFilter,
          text: def.text || undefined,
        });
      }
      setCurrentScreen('editor');
    };

    const frameClass2 = nativeMode
      ? `relative w-full h-dvh bg-white overflow-hidden flex flex-col justify-between select-none`
      : `relative w-full max-w-[420px] sm:max-w-[440px] mx-auto h-[820px] sm:h-[850px] ${APP_BG_CLASS} rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col justify-between select-none`;
    return (
      <div
        className={frameClass2}
        style={nativeMode ? { paddingTop: 'env(safe-area-inset-top)' } : undefined}
      >
        {/* Dynamic Island — browser only */}
        {!nativeMode && <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40" />}

        {/* Top Bar */}
        <div className={`px-4 ${nativeMode ? 'pt-2' : 'pt-11'} pb-2 border-b border-pink-100 bg-white flex items-center justify-between`}>
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-3 rounded-full hover:bg-pink-50 text-slate-600"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div />
          <div className="w-12" />
        </div>

        <div className={`flex-1 px-4 flex flex-col items-center justify-center gap-5 ${nativeMode ? APP_BG_CLASS : ''}`}>
          <p className="text-sm text-slate-600 font-semibold text-center">
            ドームの中身を選ぼう♡
          </p>
          <div className="flex flex-col gap-3 w-full">
            {/* 中身の選択肢 — 2 col grid */}
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'moon-star' as const,    label: 'ムーンスター',   src: '/assets/stickers/insert_moon_star.png',           cssFilter: undefined },
                { key: 'double-heart' as const, label: 'ダブルハート',   src: '/assets/stickers/insert_double_heart_clear.png', cssFilter: undefined },
              ] as const).map((item) => {
                const isSelected = selectedInsert === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedInsert(isSelected ? null : item.key)}
                    onMouseEnter={() => setHoveredInsert(item.key)}
                    onMouseLeave={() => setHoveredInsert(null)}
                    className={`relative flex flex-col items-center px-3 py-4 rounded-3xl border-2 cursor-pointer transition-all bg-white ${
                      isSelected ? 'border-pink-400 shadow-cute' : 'border-slate-100 hover:border-pink-200 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div
                      className="w-28 h-20 overflow-hidden rounded-2xl flex items-center justify-center shadow-md transition-all duration-300"
                      style={{
                        background: (isSelected || hoveredInsert === item.key)
                          ? `radial-gradient(circle, rgba(${glowRgb},0.5) 0%, rgba(${glowRgb},0.18) 65%, transparent 100%)`
                          : 'white',
                      }}
                    >
                      <img src={item.src} alt={item.label} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: 'center 30%', filter: item.cssFilter }} />
                    </div>
                    <span className="font-bold text-xs text-slate-600 mt-2 text-center">{item.label}</span>
                  </div>
                );
              })}
            </div>
            {/* ガラスのみ — centered below (inverted triangle) */}
            <div className="flex justify-center">
              {(() => {
                const item = { key: 'empty-glass' as const, label: 'クリアガラス', src: '/assets/stickers/insert_empty_glass.png' };
                const isSelected = selectedInsert === item.key;
                return (
                  <div
                    onClick={() => setSelectedInsert(isSelected ? null : item.key)}
                    onMouseEnter={() => setHoveredInsert(item.key)}
                    onMouseLeave={() => setHoveredInsert(null)}
                    className={`relative flex flex-col items-center px-3 py-4 rounded-3xl border-2 cursor-pointer transition-all w-[calc(50%-6px)] bg-white ${
                      isSelected ? 'border-pink-400 shadow-cute' : 'border-slate-100 hover:border-pink-200 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div
                      className="w-28 h-20 overflow-hidden rounded-2xl flex items-center justify-center shadow-md transition-all duration-300"
                      style={{
                        background: (isSelected || hoveredInsert === item.key)
                          ? `radial-gradient(circle, rgba(${glowRgb},0.5) 0%, rgba(${glowRgb},0.18) 65%, transparent 100%)`
                          : 'white',
                      }}
                    >
                      <img src={item.src} alt={item.label} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: 'center 30%' }} />
                    </div>
                    <span className="font-bold text-xs text-slate-600 mt-2 text-center">{item.label}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className={`px-5 pt-3 border-t border-pink-50 ${nativeMode ? APP_BG_CLASS : 'bg-pink-50/20'}`}
          style={{ paddingBottom: nativeMode ? 'max(calc(env(safe-area-inset-bottom) + 20px), 20px)' : '20px' }}
        >
          <button
            onClick={handleNext}
            disabled={selectedInsert === null}
            className={`w-full py-4 font-extrabold text-sm rounded-full shadow-cute transition-all active:scale-98 ${
              selectedInsert === null
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white'
            }`}
          >
            次へ
          </button>
        </div>
      </div>
    );
  }

  // Screen 3: Mobile Editor Screen
  const editorFrameClass = nativeMode
    ? 'relative w-full h-dvh bg-white overflow-hidden flex flex-col select-none'
    : 'relative w-full max-w-[420px] sm:max-w-[440px] mx-auto h-[820px] sm:h-[850px] bg-slate-50 rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col select-none';
  return (
    <div
      className={editorFrameClass}
      style={nativeMode ? { paddingTop: 'env(safe-area-inset-top)' } : undefined}
    >
      {/* Dynamic Island — browser only */}
      {!nativeMode && <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-40" />}

      {/* Top Bar */}
      <div className={`relative px-4 ${nativeMode ? 'pt-3' : 'pt-11'} pb-5 bg-white border-b border-pink-100 flex items-center justify-between z-30 shrink-0`}>
        {/* Left: Back */}
        <button
          onClick={() => setShowBackConfirm(true)}
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

        {/* Right: Complete */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCompleteOpen(true)}
            className="px-7 py-3 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-base rounded-full shadow-xs active:scale-95 transition-all"
          >
            完成
          </button>
        </div>
      </div>

      {/* Center Interactive Canvas — tap to close open panel */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center px-1 py-5 min-h-0"
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
          panelOpen={activePanel !== null}
          onRequestDelete={(id) => { onSelectSticker(id); setShowDeleteConfirm(true); }}
        />
      </div>

      {/* Inline Panel — appears above bottom dock when a menu button is active */}
      {activePanel && (
        <div className="bg-white border-t border-pink-100 shrink-0 flex flex-col overflow-hidden" style={{ maxHeight: '38%' }}>
          <div className="px-4 py-2.5 border-b border-pink-100 flex items-center justify-between shrink-0">
            <h3 className="font-extrabold text-sm text-slate-700">
              {activePanel === 'insert' ? 'ドームの中身を選ぼう♡' :
               activePanel === 'parts' && partsInitialCategory === 'text' ? '好きな言葉を飾ろう♡' :
               activePanel === 'parts' && partsInitialCategory === 'photo' ? 'お気に入りの写真でデコろう♡' :
               activePanel === 'parts' ? 'パーツを選んでデコろう♡' : ''}
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
                    { key: 'moon-star',    name: 'ムーンスター',   imageUrl: '/assets/stickers/insert_moon_star.png',           svgKey: 'insert-moon-star-3d', cssFilter: undefined },
                    { key: 'double-heart', name: 'ダブルハート',   imageUrl: '/assets/stickers/insert_double_heart_clear.png', svgKey: 'insert-double-heart', cssFilter: undefined },
                  ] as const).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        onAddSticker({ name: item.name, category: 'insert', layer: 'insert', ...INSERT_DEFAULTS, type: '3d-png', imageUrl: item.imageUrl, svgKey: item.svgKey as string, cssFilter: item.cssFilter });
                        setActivePanel(null);
                      }}
                      onMouseEnter={() => setHoveredEditorInsert(item.key)}
                      onMouseLeave={() => setHoveredEditorInsert(null)}
                      className="flex flex-col items-center px-3 py-4 rounded-3xl border-2 border-slate-100 hover:border-pink-300 bg-white transition-all active:scale-95"
                    >
                      <div
                        className="w-28 h-20 overflow-hidden rounded-2xl flex items-center justify-center transition-all duration-300"
                        style={{
                          background: hoveredEditorInsert === item.key
                            ? `radial-gradient(circle, rgba(${glowRgb},0.5) 0%, rgba(${glowRgb},0.18) 65%, transparent 100%)`
                            : 'white',
                        }}
                      >
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" style={{ objectPosition: 'center 30%', filter: item.cssFilter }} />
                      </div>
                      <span className="font-bold text-xs text-slate-600 mt-2 text-center">{item.name}</span>
                    </button>
                  ))}
                </div>
                {/* ガラスのみ — centered below (inverted triangle) */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      onAddSticker({ name: 'クリアガラス', category: 'insert', layer: 'insert', ...INSERT_DEFAULTS, type: '3d-png', imageUrl: '/assets/stickers/insert_empty_glass.png', svgKey: 'insert-oshi-name', cssFilter: undefined });
                      setActivePanel(null);
                    }}
                    onMouseEnter={() => setHoveredEditorInsert('empty-glass')}
                    onMouseLeave={() => setHoveredEditorInsert(null)}
                    className="flex flex-col items-center px-3 py-4 rounded-3xl border-2 border-slate-100 hover:border-pink-300 bg-white transition-all active:scale-95 w-[calc(50%-6px)]"
                  >
                    <div
                      className="w-28 h-20 overflow-hidden rounded-2xl flex items-center justify-center transition-all duration-300"
                      style={{
                        background: hoveredEditorInsert === 'empty-glass'
                          ? `radial-gradient(circle, rgba(${glowRgb},0.5) 0%, rgba(${glowRgb},0.18) 65%, transparent 100%)`
                          : 'white',
                      }}
                    >
                      <img src="/assets/stickers/insert_empty_glass.png" alt="クリアガラス" className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
                    </div>
                    <span className="font-bold text-xs text-slate-600 mt-2 text-center">クリアガラス</span>
                  </button>
                </div>

              </div>
            )}
            {activePanel === 'parts' && (
              <PartsPickerPanel
                key={partsInitialCategory}
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
                onOpenPhotoSticker={(file) => setPhotoStickerFile(file)}
              />
            )}
          </div>
        </div>
      )}


      {/* Bottom Tool Dock */}
      <div
        className="bg-white px-2 border-t border-pink-100 flex items-center justify-between gap-1 z-30 shrink-0"
        style={{
          paddingTop: `${EDITOR_DOCK_PAD}px`,
          paddingBottom: nativeMode
            ? `max(calc(env(safe-area-inset-bottom) + ${EDITOR_DOCK_PAD}px), ${EDITOR_DOCK_PAD}px)`
            : `${EDITOR_DOCK_PAD}px`,
        }}
      >
        {([
          { panel: 'insert' as const,  category: undefined,  Icon: Gem,       label: '中身',  colorKey: 'insert',
            isActive: activePanel === 'insert' },
          { panel: 'parts' as const,   category: 'heart',    Icon: Sparkles,  label: 'パーツ', colorKey: 'parts',
            isActive: activePanel === 'parts' && !['text','photo'].includes(partsInitialCategory) },
          { panel: 'parts' as const,   category: 'text',     Icon: Type,      label: '文字',  colorKey: 'text',
            isActive: activePanel === 'parts' && partsInitialCategory === 'text' },
          { panel: 'parts' as const,   category: 'photo',    Icon: ImageIcon, label: '写真',  colorKey: 'photo',
            isActive: activePanel === 'parts' && partsInitialCategory === 'photo' },
        ]).map(({ panel, category, Icon, label, colorKey, isActive }) => (
          <button
            key={label}
            onClick={() => togglePanel(panel, category)}
            className="flex flex-col items-center min-w-[50px] px-2 py-1 rounded-xl transition-all"
            style={{ backgroundColor: isActive ? menuActiveBg(MENU_COLORS[colorKey]) : undefined }}
          >
            <Icon className="w-6 h-6" style={{ color: MENU_COLORS[colorKey] }} />
            <span className="text-[10px] font-bold mt-1" style={{ color: MENU_COLORS.insert }}>{label}</span>
          </button>
        ))}

        <button
          onClick={() => setIsColorModalOpen(true)}
          className="flex flex-col items-center min-w-[50px] px-2 py-1 rounded-xl transition-all"
        >
          <Palette className="w-6 h-6" style={{ color: MENU_COLORS.color }} />
          <span className="text-[10px] font-bold mt-1" style={{ color: MENU_COLORS.insert }}>色</span>
        </button>

        <button
          onClick={() => {
            onSaveCurrentDesign();
            setShowSaveToast(true);
            setTimeout(() => setShowSaveToast(false), 4000);
          }}
          className="flex flex-col items-center min-w-[50px] px-2 py-1 rounded-xl transition-all"
        >
          <Bookmark className="w-6 h-6" style={{ color: MENU_COLORS.insert }} />
          <span className="text-[10px] font-bold mt-1" style={{ color: MENU_COLORS.insert }}>下書き保存</span>
        </button>
      </div>

      {/* Color Customization Modal — inline so it stays inside the phone frame */}
      <ColorCustomizationModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        config={config}
        stickers={stickers}
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
        onSaveToGallery={onSaveCompleteDesign}
        inline
      />

      {/* Photo Sticker Modal — inline inside phone frame */}
      <PhotoStickerModal
        file={photoStickerFile}
        onClose={() => setPhotoStickerFile(null)}
        onAdd={(dataUrl, borderSize, hasShadow) => {
          onAddSticker({
            name: '写真ステッカー',
            category: 'mypart',
            x: 50,
            y: 38,
            scale: 0.85,
            rotation: 0,
            type: 'photo',
            imageUrl: dataUrl,
            borderSize,
            hasShadow,
            opacity: 1,
          });
          setPhotoStickerFile(null);
          setActivePanel(null);
        }}
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

      {/* Editor Gallery Modal — opened from "マイページへ" in save toast */}
      <GalleryModal
        isOpen={isEditorGalleryOpen}
        onClose={() => setIsEditorGalleryOpen(false)}
        savedProjects={savedProjects}
        onLoadProject={(p) => { onLoadProject(p); setIsEditorGalleryOpen(false); }}
        onDeleteProject={onDeleteProject}
        onRenameProject={onRenameProject}
        inline
      />

      {/* Draft save toast */}
      {showSaveToast && (
        <div className="absolute top-24 left-3 right-3 z-[75] animate-fade-in">
          <div className="bg-slate-800/92 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-xs font-bold">下書き保存しました</span>
            </div>
            <button
              onClick={() => { setShowSaveToast(false); setIsEditorGalleryOpen(true); }}
              className="text-xs font-extrabold text-pink-300 hover:text-pink-200 ml-3 shrink-0 underline underline-offset-2"
            >
              マイページへ
            </button>
          </div>
        </div>
      )}

      {/* Back Confirmation Dialog */}
      {showBackConfirm && (
        <div className="absolute inset-0 z-[70] bg-black/40 flex items-center justify-center px-5">
          <div className="bg-white rounded-3xl p-5 shadow-2xl w-full">
            <p className="font-extrabold text-slate-800 text-sm text-center mb-5">はじめの画面に戻りますか？</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBackConfirm(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={() => { setShowBackConfirm(false); setCurrentScreen('home'); }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-extrabold text-sm"
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedId && (
        <div className="absolute inset-0 z-[70] bg-black/40 flex items-center justify-center px-5">
          <div className="bg-white rounded-3xl p-5 shadow-2xl w-full">
            <p className="font-extrabold text-slate-800 text-sm text-center mb-4">パーツを削除しますか？</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={() => { onDeleteSticker(selectedId); setShowDeleteConfirm(false); }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-extrabold text-sm"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
