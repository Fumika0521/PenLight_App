import React, { useState } from 'react';
import { SavedProject } from '../../types';
import { PenlightBase } from '../penlight/PenlightBase';
import { X, FolderHeart, Trash2, ArrowUpRight, Sparkles, Pencil, Check } from 'lucide-react';

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
    <div className={inline ? 'h-full w-full bg-white flex flex-col' : 'w-full max-w-lg bg-white rounded-3xl shadow-cute-lg border border-pink-100 overflow-hidden flex flex-col max-h-[85vh]'}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-pink-100 bg-gradient-to-r from-pink-50/60 via-white to-purple-50/60 shrink-0">
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

      {/* Content — vertically scrollable */}
      <div className="p-4 overflow-y-auto flex-1">
        {savedProjects.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-300" />
            <p className="font-bold text-sm text-slate-600">保存されたデザインはありません</p>
            <p className="text-xs text-slate-400 mt-1">
              編集画面の「保存」ボタンからお気に入りのデザインを保存できます♡
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedProjects.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-2xl border border-pink-100 hover:border-pink-300 bg-pink-50/30 p-2.5 flex flex-col transition-all hover:shadow-cute"
              >
                {/* Penlight preview */}
                <div
                  onClick={() => { onLoadProject(p); onClose(); }}
                  className="aspect-[3/4] bg-white rounded-xl border border-pink-100 overflow-hidden cursor-pointer mb-2 relative"
                >
                  <div className="w-full h-full pointer-events-none">
                    <PenlightBase config={p.config} />
                  </div>
                  <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 text-pink-600 font-bold text-[10px] px-2 py-1 rounded-full shadow-xs flex items-center gap-0.5">
                      開く <ArrowUpRight className="w-3 h-3" />
                    </span>
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
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.date}</p>
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
                        className="p-1 rounded-lg text-slate-300 hover:text-pink-400 hover:bg-pink-50 transition"
                        title="名前を変更"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
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
              </div>
            ))}
          </div>
        )}
      </div>

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
      <div className="absolute inset-0 z-50 animate-fade-in overflow-hidden">
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
