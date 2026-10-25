import React from 'react';
import { SavedProject } from '../../types';
import { X, FolderHeart, Trash2, ArrowUpRight, Sparkles } from 'lucide-react';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: SavedProject[];
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  onLoadProject,
  onDeleteProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-cute-lg border border-pink-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-pink-100 bg-gradient-to-r from-pink-50/60 via-white to-purple-50/60">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-4 h-4 text-pink-500" />
            <h3 className="font-extrabold text-slate-800 text-sm">保存したデザイン一覧</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-pink-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {savedProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-300" />
              <p className="font-bold text-sm text-slate-600">保存されたデザインはありません</p>
              <p className="text-xs text-slate-400 mt-1">
                編集画面の「保存」ボタンからお気に入りのデザインを保存できます♡
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {savedProjects.map((p) => (
                <div
                  key={p.id}
                  className="group relative rounded-2xl border border-pink-100 hover:border-pink-300 bg-pink-50/30 p-2.5 flex flex-col transition-all hover:shadow-cute hover:-translate-y-0.5"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      onLoadProject(p);
                      onClose();
                    }}
                    className="aspect-[3/4] bg-white rounded-xl border border-pink-100 flex items-center justify-center overflow-hidden cursor-pointer mb-2 relative"
                  >
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-2xl">✨</span>
                        <p className="text-[10px] text-pink-400 font-bold mt-1">{p.config.baseType}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-pink-600 font-bold text-[10px] px-2 py-1 rounded-full shadow-xs flex items-center gap-0.5">
                        開く <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Title & Date */}
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400">{p.date}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`「${p.name}」を削除しますか？`)) {
                          onDeleteProject(p.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-pink-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
