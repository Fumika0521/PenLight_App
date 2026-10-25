import React, { useState } from 'react';
import { 
  PenlightConfig, 
  StickerItem, 
  PenlightBaseType, 
  SavedProject 
} from '../../types';
import { InteractiveCanvas } from '../canvas/InteractiveCanvas';
import { PartsPickerPanel } from '../panels/PartsPickerPanel';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { LivePreviewCard } from '../panels/LivePreviewCard';
import { BaseSelectionModal } from '../modals/BaseSelectionModal';
import { ColorCustomizationModal } from '../modals/ColorCustomizationModal';
import { GalleryModal } from '../modals/GalleryModal';
import { CompleteModal } from '../modals/CompleteModal';
import { 
  Home, 
  PlusCircle, 
  FolderHeart, 
  Sparkles, 
  Heart, 
  Type, 
  Image as ImageIcon, 
  Palette, 
  Settings, 
  Music, 
  Sun,
  Download,
  Share2
} from 'lucide-react';

interface DesktopAppViewProps {
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
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export const DesktopAppView: React.FC<DesktopAppViewProps> = ({
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
  canvasRef,
}) => {
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isConcertMode, setIsConcertMode] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('parts');

  const selectedSticker = stickers.find((s) => s.id === selectedId) || null;

  return (
    <div className="flex w-full h-[calc(100vh-68px)] min-h-[640px] bg-pink-50/20 overflow-hidden select-none">
      {/* 1. Leftmost Navigation Sidebar */}
      <aside className="w-48 bg-white border-r border-pink-100 flex flex-col justify-between p-3.5 shrink-0 z-20">
        <div>
          {/* Logo */}
          <div className="pb-4 mb-3 border-b border-pink-100/80 px-2 flex items-center justify-between">
            <h1 className="font-cursive text-2xl text-pink-500 font-bold tracking-tight">
              Light Deco <span className="text-pink-400">♡</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setIsBaseModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-pink-50 hover:text-pink-600 font-bold transition"
            >
              <PlusCircle className="w-4 h-4 text-pink-500" />
              新しく作る
            </button>

            <button
              onClick={() => setIsGalleryOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-pink-50 hover:text-pink-600 font-bold transition"
            >
              <FolderHeart className="w-4 h-4 text-purple-500" />
              保存済み
            </button>

            <div className="h-[1px] bg-pink-100 my-2" />

            {/* Editing Category Selectors */}
            <button
              onClick={() => setActiveNav('parts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                activeNav === 'parts'
                  ? 'bg-pink-100 text-pink-600 shadow-xs'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              パーツ
            </button>

            <button
              onClick={() => setActiveNav('rhinestone')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                activeNav === 'rhinestone'
                  ? 'bg-pink-100 text-pink-600 shadow-xs'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              ラインストーン
            </button>

            <button
              onClick={() => setActiveNav('text')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                activeNav === 'text'
                  ? 'bg-pink-100 text-pink-600 shadow-xs'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <Type className="w-4 h-4 text-amber-500" />
              文字
            </button>

            <button
              onClick={() => setActiveNav('photo')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                activeNav === 'photo'
                  ? 'bg-pink-100 text-pink-600 shadow-xs'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-blue-500" />
              写真
            </button>

            <button
              onClick={() => setIsColorModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-pink-50 hover:text-blue-500 font-bold transition"
            >
              <Palette className="w-4 h-4 text-sky-500" />
              カラー設定
            </button>

            <button
              onClick={() => setIsConcertMode(!isConcertMode)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                isConcertMode
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <Music className="w-4 h-4 text-indigo-500" />
              {isConcertMode ? '暗闇ライブ ON' : 'ライブ演出'}
            </button>
          </nav>
        </div>

        {/* Bottom Save & Complete Quick Action */}
        <div className="space-y-2 pt-3 border-t border-pink-100">
          <button
            onClick={() => {
              onSaveCurrentDesign();
              alert('デザインを保存しました！♡');
            }}
            className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold text-xs rounded-xl border border-pink-200 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <FolderHeart className="w-3.5 h-3.5" />
            デザイン保存
          </button>
          <button
            onClick={() => setIsCompleteOpen(true)}
            className="w-full py-2 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl shadow-cute transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            完成プレビュー
          </button>
        </div>
      </aside>

      {/* 2. Parts Picker Panel (Left-Center) */}
      <div className="w-80 shrink-0 h-full border-r border-pink-100">
        <PartsPickerPanel
          onAddSticker={onAddSticker}
          onSetInsidePhoto={(url) => onUpdateConfig({ insidePhotoUrl: url })}
          insidePhotoUrl={config.insidePhotoUrl}
        />
      </div>

      {/* 3. Center Interactive Canvas Stage */}
      <main className="flex-1 h-full relative flex items-center justify-center p-4 bg-slate-50/50">
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
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          canvasRef={canvasRef}
          isConcertMode={isConcertMode}
        />
      </main>

      {/* 4. Detailed Customization Properties Panel (Right-Center) */}
      <div className="w-72 shrink-0 h-full border-l border-pink-100">
        <PropertiesPanel
          selectedSticker={selectedSticker}
          config={config}
          onUpdateSticker={onUpdateSticker}
          onDeleteSticker={onDeleteSticker}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          onUpdateConfig={onUpdateConfig}
        />
      </div>

      {/* 5. Far-Right Live Preview & Export Panel */}
      <LivePreviewCard
        config={config}
        stickers={stickers}
        onExportImage={onExportImage}
        isConcertMode={isConcertMode}
        onToggleConcertMode={() => setIsConcertMode(!isConcertMode)}
        onOpenCompleteModal={() => setIsCompleteOpen(true)}
      />

      {/* Modals */}
      <BaseSelectionModal
        isOpen={isBaseModalOpen}
        onClose={() => setIsBaseModalOpen(false)}
        currentBaseType={config.baseType}
        onSelectBase={(type) => onUpdateConfig({ baseType: type })}
      />

      <ColorCustomizationModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        config={config}
        onSaveConfig={onUpdateConfig}
      />

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        savedProjects={savedProjects}
        onLoadProject={onLoadProject}
        onDeleteProject={onDeleteProject}
      />

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
