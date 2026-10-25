import React, { useState, useRef, useEffect } from 'react';
import { 
  PenlightConfig, 
  StickerItem, 
  SavedProject 
} from './types';
import { DesktopAppView } from './components/desktop/DesktopAppView';
import { MobileAppView } from './components/mobile/MobileAppView';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { 
  Smartphone, 
  Monitor, 
  RotateCcw,
  Eye,
  Trash2
} from 'lucide-react';

const INITIAL_CONFIG: PenlightConfig = {
  baseType: 'classic',
  handleColor: '#ffffff',
  domeColor: '#bae6fd',
  domeOpacity: 0.5,
  glowColor: '#ff6584',
  glowIntensity: 0.85,
  isLightOn: true,
  glowMode: 'solid',
  strapColor: '#ffd1dc',
  ringColor: '#cbd5e1',
  insidePhotoUrl: null,
};

const INITIAL_STICKERS: StickerItem[] = [
  // Big Couture Pink & Sky-Blue Satin Ribbon at collar
  {
    id: 'init-ribbon-1',
    name: 'クチュールサテンリボン（ピンク＆ブルー）',
    category: 'ribbon',
    x: 50,
    y: 54,
    scale: 1.5,
    rotation: 0,
    zIndex: 10,
    type: '3d-png',
    imageUrl: '/assets/hires/ribbon_couture.png',
    opacity: 1,
  },
  // Swarovski pearl-encrusted heart above oshi photo
  {
    id: 'init-heart-1',
    name: 'スワロフスキーハート（パール囲み）',
    category: 'heart',
    x: 50,
    y: 20,
    scale: 0.95,
    rotation: 0,
    zIndex: 12,
    type: '3d-png',
    imageUrl: '/assets/hires/gem_heart_pearl.png',
    opacity: 1,
  },
  // 3D "LOVE" bubble text lettering
  {
    id: 'init-text-1',
    name: '文字「LOVE」',
    category: 'text',
    x: 50,
    y: 44,
    scale: 1.25,
    rotation: 0,
    zIndex: 14,
    type: 'text',
    text: 'LOVE',
    textColor: '#ff6584',
    textBorderColor: '#ffffff',
    opacity: 1,
  },
  // Cyan crystal star
  {
    id: 'init-star-1',
    name: 'クリスタルスター（シアン）',
    category: 'star',
    x: 74,
    y: 24,
    scale: 0.85,
    rotation: 15,
    zIndex: 15,
    type: '3d-png',
    imageUrl: '/assets/stickers/star_cyan_gem.png',
    opacity: 1,
  },
  // Gold twinkle star
  {
    id: 'init-star-2',
    name: 'キラキラスター（ゴールド）',
    category: 'star',
    x: 26,
    y: 26,
    scale: 0.8,
    rotation: -15,
    zIndex: 15,
    type: '3d-png',
    imageUrl: '/assets/stickers/star_gold_twinkle.png',
    opacity: 1,
  },
  // Rhinestones along dome rim
  {
    id: 'init-rhine-1',
    name: 'ストーン（ピュアピンク）',
    category: 'rhinestone',
    x: 42,
    y: 13,
    scale: 0.65,
    rotation: 0,
    zIndex: 16,
    type: '3d-png',
    imageUrl: '/assets/stickers/rhinestone_pink.png',
    opacity: 1,
  },
  {
    id: 'init-rhine-2',
    name: 'ストーン（ピュアピンク）',
    category: 'rhinestone',
    x: 58,
    y: 13,
    scale: 0.65,
    rotation: 0,
    zIndex: 16,
    type: '3d-png',
    imageUrl: '/assets/stickers/rhinestone_pink.png',
    opacity: 1,
  },
];

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [config, setConfig] = useState<PenlightConfig>(INITIAL_CONFIG);
  const [stickers, setStickers] = useState<StickerItem[]>(INITIAL_STICKERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDecorations, setShowDecorations] = useState<boolean>(true);

  // Undo / Redo History
  const [history, setHistory] = useState<{ config: PenlightConfig; stickers: StickerItem[] }[]>([
    { config: INITIAL_CONFIG, stickers: INITIAL_STICKERS },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Saved Projects in LocalStorage
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const stored = localStorage.getItem('lightdeco_saved_projects_v3');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'sample-project-1',
        name: '王道キュートピンク',
        date: '2026/10/25',
        config: INITIAL_CONFIG,
        stickers: INITIAL_STICKERS,
      },
    ];
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('mobile');
    }
  }, []);

  const pushHistory = (newConfig: PenlightConfig, newStickers: StickerItem[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push({
      config: { ...newConfig },
      stickers: newStickers.map((s) => ({ ...s })),
    });
    if (nextHistory.length > 25) {
      nextHistory.shift();
    }
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setConfig(prev.config);
      setStickers(prev.stickers);
      setHistoryIndex(historyIndex - 1);
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setConfig(next.config);
      setStickers(next.stickers);
      setHistoryIndex(historyIndex + 1);
      setSelectedId(null);
    }
  };

  const handleUpdateConfig = (updates: Partial<PenlightConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    pushHistory(updated, stickers);
  };

  const handleAddSticker = (newSticker: Omit<StickerItem, 'id' | 'zIndex'>) => {
    const maxZ = stickers.length > 0 ? Math.max(...stickers.map((s) => s.zIndex)) : 10;
    const item: StickerItem = {
      ...newSticker,
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      zIndex: maxZ + 1,
    };
    const updated = [...stickers, item];
    setStickers(updated);
    setSelectedId(item.id);
    pushHistory(config, updated);
  };

  const handleUpdateSticker = (id: string, updates: Partial<StickerItem>) => {
    const updated = stickers.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStickers(updated);
  };

  const handleDeleteSticker = (id: string) => {
    const updated = stickers.filter((s) => s.id !== id);
    setStickers(updated);
    if (selectedId === id) setSelectedId(null);
    pushHistory(config, updated);
  };

  const handleDuplicateSticker = (id: string) => {
    const target = stickers.find((s) => s.id === id);
    if (!target) return;
    const maxZ = Math.max(...stickers.map((s) => s.zIndex));
    const duplicate: StickerItem = {
      ...target,
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: Math.min(95, target.x + 4),
      y: Math.min(95, target.y + 4),
      zIndex: maxZ + 1,
    };
    const updated = [...stickers, duplicate];
    setStickers(updated);
    setSelectedId(duplicate.id);
    pushHistory(config, updated);
  };

  const handleBringForward = (id: string) => {
    const index = stickers.findIndex((s) => s.id === id);
    if (index === -1 || index === stickers.length - 1) return;
    const updated = [...stickers];
    const item = updated[index];
    const higherZ = updated[index + 1].zIndex + 1;
    item.zIndex = higherZ;
    updated.splice(index, 1);
    updated.push(item);
    setStickers(updated);
    pushHistory(config, updated);
  };

  const handleSendBackward = (id: string) => {
    const index = stickers.findIndex((s) => s.id === id);
    if (index <= 0) return;
    const updated = [...stickers];
    const item = updated[index];
    const lowerZ = Math.max(1, updated[index - 1].zIndex - 1);
    item.zIndex = lowerZ;
    updated.splice(index, 1);
    updated.unshift(item);
    setStickers(updated);
    pushHistory(config, updated);
  };

  const handleSaveCurrentDesign = () => {
    const newProject: SavedProject = {
      id: `project-${Date.now()}`,
      name: `推しデコ (${config.baseType})`,
      date: new Date().toLocaleDateString('ja-JP'),
      config: { ...config },
      stickers: [...stickers],
    };
    const updated = [newProject, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem('lightdeco_saved_projects_v3', JSON.stringify(updated));
  };

  const handleLoadProject = (project: SavedProject) => {
    setConfig({ ...project.config });
    setStickers([...project.stickers]);
    setSelectedId(null);
    pushHistory(project.config, project.stickers);
  };

  const handleDeleteProject = (id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem('lightdeco_saved_projects_v3', JSON.stringify(updated));
  };

  const handleClearAllDecorations = () => {
    if (confirm('配置したすべてのデコレーションを消去して、まっさらなペンライトにしますか？')) {
      setStickers([]);
      setConfig(prev => ({ ...prev, insidePhotoUrl: null }));
      setSelectedId(null);
      pushHistory({ ...config, insidePhotoUrl: null }, []);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('キャンバスの配置を初期状態にリセットしますか？')) {
      setConfig(INITIAL_CONFIG);
      setStickers(INITIAL_STICKERS);
      setSelectedId(null);
      pushHistory(INITIAL_CONFIG, INITIAL_STICKERS);
    }
  };

  const handleExportImage = async () => {
    const element = canvasRef.current || document.getElementById('canvas-bg-layer')?.parentElement;
    if (!element) return;

    try {
      setSelectedId(null);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff9ebb', '#ff6584', '#38bdf8', '#c084fc', '#fef08a'],
      });

      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `LightDeco_MyLightstick_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('画像の保存に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9fb] text-slate-700">
      {/* Top Header */}
      <header className="h-[68px] bg-white/95 backdrop-blur-md border-b border-pink-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Left Title Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-cursive text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-blue-400 drop-shadow-xs">
              Light Deco ♡
            </span>
          </div>
          <span className="hidden lg:inline text-xs font-bold text-pink-500/90 tracking-wide bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
            ＼ あなただけの推しペンライトをデコろう ／
          </span>
        </div>

        {/* Center / Right Mode Switcher & Deco Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle View Bare Penlight vs Decorated */}
          <button
            onClick={() => setShowDecorations(!showDecorations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              !showDecorations
                ? 'bg-purple-600 text-white border-purple-500 shadow-cute'
                : 'bg-white text-slate-600 border-pink-200 hover:bg-pink-50 hover:text-pink-600'
            }`}
            title="デコレーションの表示/非表示を切り替え"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showDecorations ? '素のペンライトを見る' : 'デコを表示する'}</span>
            <span className="sm:hidden">{showDecorations ? '素の状態' : 'デコ表示'}</span>
          </button>

          <div className="flex items-center bg-pink-50/80 p-1 rounded-2xl border border-pink-100">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white text-pink-600 shadow-cute'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Web試作品 (PC・タブレット)</span>
              <span className="sm:hidden">Web版</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'mobile'
                  ? 'bg-white text-pink-600 shadow-cute'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">スマホアプリ版</span>
              <span className="sm:hidden">スマホ版</span>
            </button>
          </div>

          <button
            onClick={handleClearAllDecorations}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
            title="デコを全消去してまっさらにする"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetToDefault}
            className="p-2 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition"
            title="サンプル完成デコに戻す"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'desktop' ? (
          <DesktopAppView
            config={showDecorations ? config : { ...config, insidePhotoUrl: null }}
            stickers={showDecorations ? stickers : []}
            selectedId={selectedId}
            onSelectSticker={setSelectedId}
            onUpdateSticker={handleUpdateSticker}
            onDeleteSticker={handleDeleteSticker}
            onDuplicateSticker={handleDuplicateSticker}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onAddSticker={handleAddSticker}
            onUpdateConfig={handleUpdateConfig}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onSaveCurrentDesign={handleSaveCurrentDesign}
            savedProjects={savedProjects}
            onLoadProject={handleLoadProject}
            onDeleteProject={handleDeleteProject}
            onExportImage={handleExportImage}
            canvasRef={canvasRef}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-pink-100/30 via-purple-100/20 to-blue-100/30">
            <MobileAppView
              config={showDecorations ? config : { ...config, insidePhotoUrl: null }}
              stickers={showDecorations ? stickers : []}
              selectedId={selectedId}
              onSelectSticker={setSelectedId}
              onUpdateSticker={handleUpdateSticker}
              onDeleteSticker={handleDeleteSticker}
              onDuplicateSticker={handleDuplicateSticker}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
              onAddSticker={handleAddSticker}
              onUpdateConfig={handleUpdateConfig}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onSaveCurrentDesign={handleSaveCurrentDesign}
              savedProjects={savedProjects}
              onLoadProject={handleLoadProject}
              onDeleteProject={handleDeleteProject}
              onExportImage={handleExportImage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
