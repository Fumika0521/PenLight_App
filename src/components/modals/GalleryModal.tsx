import React, { useState } from 'react';
import { SavedProject } from '../../types';
import { PenlightBase, HEAD_SCALE, HEAD_ORIGIN } from '../penlight/PenlightBase';
import { StickerSVG } from '../stickers/StickerSVG';
import { myPartFilterStyle } from './PhotoPartCreatorModal';
import { X, FolderHeart, Trash2, Sparkles, Pencil, Check } from 'lucide-react';

// Constants matching InteractiveCanvas
const DOME_Y = 33.4;
const DOME_R = 13.3;
const INSERT_OFFSET_Y = -4;

// Sticker base sizes as % of canvas width (reference: 380px canvas)
// 72px / 380px * 100 ≈ 18.95%,  88px / 380px * 100 ≈ 23.16%
const STICKER_BASE_PCT = 18.95;
const HANDLE_BASE_PCT  = 23.16;

// Text font size as % of canvas width: 28px / 380px * 100 ≈ 7.37
const TEXT_FONT_PCT = 7.37;

const PREVIEW_BASE_IMAGES: Record<string, string> = {
  classic: '/assets/hires/penlight_empty.png',
  heart2:  '/assets/hires/penlight_heart2_realistic.png',
  panel:   '/assets/hires/penlight_panel_realistic.png',
  wand:    '/assets/hires/penlight_wand.svg',
};

const PREVIEW_COLLAR_MASK: Record<string, string> = {
  classic: 'linear-gradient(to bottom, transparent 0%, transparent 43.8%, black 44.1%)',
  heart2:  'linear-gradient(to bottom, transparent 0%, transparent 43.8%, black 44.1%)',
  panel:   'linear-gradient(to bottom, transparent 0%, transparent 45%, black 48%)',
  wand:    'linear-gradient(to bottom, transparent 0%, transparent 38%, black 42%)',
};

function oshiNameFontPx(len: number): number {
  if (len <= 1) return 50;
  if (len <= 2) return 42;
  if (len <= 3) return 28;
  if (len <= 4) return 22;
  if (len <= 5) return 18;
  if (len <= 6) return 15;
  if (len <= 7) return 13;
  return 11;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: SavedProject[];
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
  inline?: boolean;
  onRenameProject?: (id: string, newName: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  onLoadProject,
  onDeleteProject,
  inline = false,
  onRenameProject,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'complete' | 'draft'>('complete');

  if (!isOpen) return null;

  const startEdit = (p: SavedProject) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const commitEdit = () => {
    if (editingId && onRenameProject && editingName.trim()) {
      onRenameProject(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const inner = (
    <div className={inline ? 'relative h-full w-full bg-white flex flex-col' : 'relative w-full max-w-lg bg-white rounded-3xl shadow-cute-lg border border-pink-100 overflow-hidden flex flex-col max-h-[85vh]'}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-pink-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <FolderHeart className="w-5 h-5 text-pink-500" />
          <h3 className="font-extrabold text-slate-800 text-base">保存したデザイン一覧</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-pink-600 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pink-100 shrink-0">
        {(['complete', 'draft'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === tab
                ? 'text-pink-600 border-b-2 border-pink-400 bg-pink-50/40'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="text-lg">{tab === 'complete' ? '完成' : '下書き'}</span>
          </button>
        ))}
      </div>

      {/* Content — vertically scrollable */}
      <div className="p-4 overflow-y-auto flex-1">
        {(() => {
          const filtered = savedProjects
            .filter(p => activeTab === 'complete' ? !p.isDraft : p.isDraft === true)
            .sort((a, b) => {
              const ta = Number(a.id.replace('project-', '')) || 0;
              const tb = Number(b.id.replace('project-', '')) || 0;
              return tb - ta;
            });

          if (filtered.length === 0) return (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-300" />
              <p className="font-bold text-sm text-slate-600">
                {activeTab === 'complete' ? '完成したデザインはありません' : '下書きはありません'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {activeTab === 'complete'
                  ? '完成！画面の「保存」ボタンから保存できます♡'
                  : '編集画面の「下書き保存」ボタンから保存できます♡'}
              </p>
            </div>
          );

          return (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => {
                const hasInsert = p.stickers.some(s => s.category === 'insert' || s.layer === 'insert');
                const collarMask = PREVIEW_COLLAR_MASK[p.config.baseType] || PREVIEW_COLLAR_MASK.classic;
                const baseSrc = PREVIEW_BASE_IMAGES[p.config.baseType] || PREVIEW_BASE_IMAGES.classic;

                return (
                  <div
                    key={p.id}
                    className="group relative rounded-2xl border border-pink-100 hover:border-pink-300 bg-pink-50/30 p-2.5 flex flex-col transition-all hover:shadow-cute"
                  >
                    {/* Penlight preview — aspect matches the editor canvas (36:53) */}
                    {/* container-type enables cqw for text sizing */}
                    <div
                      onClick={() => { onLoadProject(p); onClose(); }}
                      className="aspect-[36/53] rounded-xl overflow-hidden cursor-pointer mb-2 relative bg-transparent"
                      style={{ containerType: 'inline-size' } as React.CSSProperties}
                    >
                      {/* 1. PenlightBase */}
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        <PenlightBase
                          config={p.config}
                          showGloss={false}
                          showEmptyGlass={!hasInsert}
                        />
                      </div>

                      {/* 2. Dome radial glow */}
                      {p.config.isLightOn && (
                        <div
                          className="absolute inset-0 z-[5] pointer-events-none"
                          style={{
                            clipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
                            WebkitClipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
                            background: p.config.glowColor === '#F4F8FF'
                              ? `radial-gradient(circle at 50% ${DOME_Y}%, rgba(255,255,255,0.6) 0%, rgba(220,235,255,0.25) 60%, transparent 88%)`
                              : `radial-gradient(circle at 50% ${DOME_Y}%, ${p.config.glowColor}40 0%, ${p.config.glowColor}18 60%, transparent 88%)`,
                          }}
                        />
                      )}

                      {/* 3. Insert layer */}
                      <div
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{
                          clipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
                          WebkitClipPath: `circle(${DOME_R}% at 50% ${DOME_Y}%)`,
                        }}
                      >
                        {p.stickers
                          .filter(s => s.category === 'insert' || s.layer === 'insert')
                          .map(sticker => (
                            <div
                              key={sticker.id}
                              className="absolute"
                              style={{
                                left: `${sticker.x}%`,
                                top: `${sticker.y + INSERT_OFFSET_Y}%`,
                                width: `${31 * sticker.scale}%`,
                                aspectRatio: '304 / 260',
                                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)${sticker.flipX ? ' scaleX(-1)' : ''}`,
                                zIndex: sticker.zIndex,
                                opacity: sticker.opacity ?? 1,
                              }}
                            >
                              {(sticker.type === '3d-png' || sticker.type === 'preset') && sticker.imageUrl && (
                                <img
                                  src={sticker.imageUrl}
                                  alt=""
                                  className="w-full h-full object-contain"
                                  style={{
                                    filter: sticker.cssFilter || undefined,
                                    clipPath: 'ellipse(44% 54% at 50% 49%)',
                                  }}
                                />
                              )}
                              {sticker.svgKey === 'insert-oshi-name' && sticker.text && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span
                                    style={{
                                      fontFamily: '"M PLUS Rounded 1c", sans-serif',
                                      fontWeight: 800,
                                      fontSize: `${oshiNameFontPx(sticker.text.length) / 380 * 100}cqw`,
                                      color: 'rgba(255, 255, 255, 0.45)',
                                      textShadow: '-1px -1px 0 rgba(255,255,255,0.78), 1.5px 1.5px 2px rgba(100,80,160,0.45)',
                                      letterSpacing: '0.05em',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {sticker.text}
                                  </span>
                                </div>
                              )}
                              {sticker.type === 'photo' && sticker.imageUrl && (
                                <div className="w-full h-full overflow-hidden rounded-full border-2 border-white shadow-md bg-white">
                                  <img src={sticker.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>

                      {/* 4. Collar overlay */}
                      <div className="absolute inset-0 z-[20] pointer-events-none">
                        <img
                          src={baseSrc}
                          alt=""
                          className="w-full h-full object-contain"
                          style={{
                            WebkitMaskImage: collarMask,
                            maskImage: collarMask,
                          }}
                        />
                      </div>

                      {/* 5. Dome gloss */}
                      {p.config.baseType === 'classic' && (
                        <div className="absolute inset-0 z-[25] pointer-events-none">
                          <img
                            src="/assets/hires/dome_gloss.png"
                            alt=""
                            className="w-full h-full object-contain"
                            style={{
                              transform: `scale(${HEAD_SCALE})`,
                              transformOrigin: HEAD_ORIGIN,
                            }}
                          />
                        </div>
                      )}

                      {/* 6. Stickers layer — sizes as % of canvas width for auto-scaling */}
                      <div className="absolute inset-0 z-30 pointer-events-none">
                        {p.stickers
                          .filter(s => s.category !== 'insert' && s.layer !== 'insert')
                          .map(sticker => {
                            const isHandle = sticker.category === 'handle' || sticker.layer === 'handle';
                            const basePct = isHandle ? HANDLE_BASE_PCT : STICKER_BASE_PCT;
                            const widthPct = basePct * sticker.scale;
                            return (
                              <div
                                key={sticker.id}
                                className="absolute"
                                style={{
                                  left: `${sticker.x}%`,
                                  top: `${sticker.y}%`,
                                  width: `${widthPct}%`,
                                  aspectRatio: '1 / 1',
                                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)${sticker.flipX ? ' scaleX(-1)' : ''}`,
                                  zIndex: sticker.zIndex,
                                  opacity: sticker.opacity ?? 1,
                                }}
                              >
                                {(sticker.type === '3d-png' || sticker.type === 'preset') && (
                                  <StickerSVG
                                    svgKey={sticker.svgKey || ''}
                                    imagePath={sticker.imageUrl}
                                    customColor={sticker.color}
                                    className="w-full h-full drop-shadow-md"
                                  />
                                )}
                                {sticker.type === 'text' && (
                                  <div
                                    className="text-center font-extrabold leading-none select-none tracking-widest whitespace-nowrap"
                                    style={{
                                      color: sticker.textColor || '#ff6584',
                                      textShadow: '0 2px 6px rgba(255, 101, 132, 0.4)',
                                      fontFamily: sticker.fontFamily || '"M PLUS Rounded 1c", sans-serif',
                                      fontSize: `${TEXT_FONT_PCT * sticker.scale}cqw`,
                                      letterSpacing: '0.1em',
                                    }}
                                  >
                                    {sticker.text}
                                  </div>
                                )}
                                {sticker.type === 'photo' && sticker.category === 'mypart' && sticker.imageUrl && (
                                  <img
                                    src={sticker.imageUrl}
                                    alt=""
                                    className="w-full h-full object-contain"
                                    style={{ filter: myPartFilterStyle(sticker.borderSize, sticker.hasShadow) || undefined }}
                                  />
                                )}
                                {sticker.type === 'photo' && sticker.category !== 'mypart' && sticker.imageUrl && (
                                  <div
                                    className={`w-full h-full overflow-hidden border-2 border-white shadow-md bg-white ${
                                      sticker.imageShape === 'circle' ? 'rounded-full' :
                                      sticker.imageShape === 'heart' ? 'rounded-[30%]' : 'rounded-2xl'
                                    }`}
                                  >
                                    <img src={sticker.imageUrl} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Name & Actions */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        {editingId === p.id ? (
                          <input
                            className="w-full text-xs font-bold text-slate-800 border-b border-pink-300 outline-none bg-transparent pb-0.5"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); }}
                            autoFocus
                          />
                        ) : (
                          <h4
                            className="font-bold text-xs text-slate-800 truncate cursor-pointer hover:text-pink-500 active:text-pink-500"
                            onClick={() => startEdit(p)}
                            title="タップして名前を変更"
                          >
                            {p.name}
                          </h4>
                        )}
                        <p className="text-[10px] text-slate-600 mt-0.5">{p.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {editingId === p.id ? (
                          <button
                            onClick={commitEdit}
                            className="p-1 rounded-lg text-pink-500 hover:bg-pink-50 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(p)}
                            className="p-1 rounded-lg text-slate-600 hover:text-pink-500 hover:bg-pink-50 transition"
                            title="名前を変更"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p.id); }}
                          className="p-1 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* In-app delete confirmation dialog */}
      {deleteConfirmId && (() => {
        const proj = savedProjects.find(p => p.id === deleteConfirmId);
        return (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm rounded-3xl">
            <div className="bg-white rounded-3xl shadow-cute-lg border border-pink-100 p-6 mx-4 max-w-xs w-full">
              <p className="font-extrabold text-sm text-slate-800 text-center mb-1">デザインを削除</p>
              <p className="text-xs text-slate-500 text-center mb-5">
                「{proj?.name}」を削除しますか？<br />この操作は元に戻せません
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => { onDeleteProject(deleteConfirmId); setDeleteConfirmId(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white text-xs font-bold transition"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer — only for non-inline */}
      {!inline && (
        <div className="p-3 border-t border-pink-100 bg-slate-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="absolute inset-0 z-50 animate-fade-in overflow-hidden bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {inner}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      {inner}
    </div>
  );
};
