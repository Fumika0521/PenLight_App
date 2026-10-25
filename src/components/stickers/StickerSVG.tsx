import React from 'react';

export interface StickerDef {
  key: string;
  name: string;
  category: 'ribbon' | 'heart' | 'star' | 'pearl' | 'rhinestone' | 'charm';
  defaultScale?: number;
  popular?: boolean;
  is3d?: boolean;
  imagePath?: string;
}

export const STICKER_CATALOG: StickerDef[] = [
  // ================= 3D RIBBONS =================
  {
    key: 'ribbon-couture-3d',
    name: 'クチュールサテンリボン（ピンク＆ブルー）',
    category: 'ribbon',
    popular: true,
    is3d: true,
    imagePath: '/assets/hires/ribbon_couture.png',
    defaultScale: 1.4,
  },
  {
    key: 'ribbon-pink-satin-3d',
    name: 'サテンリボン（ピンク）',
    category: 'ribbon',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/ribbon_pink_satin.png',
    defaultScale: 1.1,
  },
  {
    key: 'ribbon-blue-satin-3d',
    name: 'サテンリボン（スカイブルー）',
    category: 'ribbon',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/ribbon_blue_satin.png',
    defaultScale: 1.1,
  },
  {
    key: 'ribbon-blue-lace-3d',
    name: 'レースリボン（ブルー）',
    category: 'ribbon',
    is3d: true,
    imagePath: '/assets/stickers/ribbon_blue_lace.png',
  },
  {
    key: 'ribbon-purple-twin-3d',
    name: 'ツインリボン（ラベンダー）',
    category: 'ribbon',
    is3d: true,
    imagePath: '/assets/stickers/ribbon_purple_twin.png',
  },
  {
    key: 'ribbon-gold-bow-3d',
    name: 'ゴールドボウリボン',
    category: 'ribbon',
    is3d: true,
    imagePath: '/assets/stickers/ribbon_gold_bow.png',
  },
  {
    key: 'ribbon-silver-twin-3d',
    name: 'シルバーツインリボン',
    category: 'ribbon',
    is3d: true,
    imagePath: '/assets/stickers/ribbon_silver_twin.png',
  },

  // ================= 3D HEARTS =================
  {
    key: 'gem-heart-pearl-3d',
    name: 'スワロフスキーハート（パール囲み）',
    category: 'heart',
    popular: true,
    is3d: true,
    imagePath: '/assets/hires/gem_heart_pearl.png',
    defaultScale: 1.2,
  },
  {
    key: 'heart-faceted-pink-3d',
    name: 'ラインストーンハート（ピンク）',
    category: 'heart',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/heart_faceted_pink.png',
  },
  {
    key: 'heart-crystal-pink-3d',
    name: 'クリスタルハート（ペールピンク）',
    category: 'heart',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/heart_crystal_pink.png',
  },
  {
    key: 'heart-glossy-pink-3d',
    name: 'ぷっくりジュエルハート',
    category: 'heart',
    is3d: true,
    imagePath: '/assets/stickers/heart_glossy_pink.png',
  },
  {
    key: 'heart-hologram-purple-3d',
    name: 'ホログラムハート（オーロラ）',
    category: 'heart',
    is3d: true,
    imagePath: '/assets/stickers/heart_hologram_purple.png',
  },
  {
    key: 'heart-silver-pearl-3d',
    name: 'シルバーパールハート',
    category: 'heart',
    is3d: true,
    imagePath: '/assets/stickers/heart_silver_pearl.png',
  },
  {
    key: 'heart-gem-ruby-3d',
    name: 'ルビークリスタルハート',
    category: 'heart',
    is3d: true,
    imagePath: '/assets/stickers/heart_gem_ruby.png',
  },

  // ================= 3D STARS =================
  {
    key: 'star-cyan-gem-3d',
    name: 'クリスタルスター（シアン）',
    category: 'star',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/star_cyan_gem.png',
  },
  {
    key: 'star-gold-twinkle-3d',
    name: 'キラキラスター（ゴールド）',
    category: 'star',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/star_gold_twinkle.png',
  },

  // ================= 3D RHINESTONES & CHARMS =================
  {
    key: 'rhinestone-pink-3d',
    name: 'ストーン（ピュアピンク）',
    category: 'rhinestone',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/rhinestone_pink.png',
    defaultScale: 0.6,
  },
  {
    key: 'rhinestone-rose-3d',
    name: 'ストーン（ローズ）',
    category: 'rhinestone',
    is3d: true,
    imagePath: '/assets/stickers/rhinestone_rose.png',
    defaultScale: 0.6,
  },
  {
    key: 'rhinestone-peach-3d',
    name: 'ストーン（ピーチ）',
    category: 'rhinestone',
    is3d: true,
    imagePath: '/assets/stickers/rhinestone_peach.png',
    defaultScale: 0.6,
  },
  {
    key: 'rhinestone-diamond-3d',
    name: 'ストーン（クリアダイヤ）',
    category: 'rhinestone',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/rhinestone_diamond.png',
    defaultScale: 0.6,
  },
  {
    key: 'rhinestone-violet-3d',
    name: 'ストーン（バイオレット）',
    category: 'rhinestone',
    is3d: true,
    imagePath: '/assets/stickers/rhinestone_violet.png',
    defaultScale: 0.6,
  },
  {
    key: 'crown-gold-3d',
    name: 'プリンセスティアラクラウン',
    category: 'charm',
    popular: true,
    is3d: true,
    imagePath: '/assets/stickers/crown_gold.png',
    defaultScale: 0.9,
  },
];

export const PRESET_LETTERS = ['A', 'B', 'C', 'D', 'E', 'H', 'J', 'K', 'M', 'N', 'R', 'S', 'T', 'W', 'Y', '♡', '★'];

export const PRESET_WORDS = [
  { text: 'LOVE', color: '#ff6584' },
  { text: 'OSHl', color: '#38bdf8' },
  { text: '推し', color: '#f43f5e' },
  { text: '尊い', color: '#a855f7' },
  { text: '天使', color: '#ec4899' },
  { text: '一生推し', color: '#ff4b72' },
  { text: 'すき♡', color: '#fb7185' },
  { text: 'NO.1', color: '#f59e0b' },
  { text: 'My Idol', color: '#06b6d4' }
];

// Preset idol avatar images were corrupted at the source (badly cropped
// during generation) and had no good replacement, so the list is empty for
// now. Users can still add their own photo via the upload button.
export const PRESET_AVATARS: { id: string; name: string; url: string }[] = [];

export const StickerSVG: React.FC<{
  svgKey: string;
  imagePath?: string;
  className?: string;
  customColor?: string;
}> = ({ svgKey, imagePath, className = 'w-full h-full' }) => {
  if (imagePath) {
    return (
      <img
        src={imagePath}
        alt={svgKey}
        className={`${className} object-contain pointer-events-none drop-shadow-md select-none`}
      />
    );
  }

  // Fallback to image from catalog if matched
  const found = STICKER_CATALOG.find((s) => s.key === svgKey);
  if (found?.imagePath) {
    return (
      <img
        src={found.imagePath}
        alt={svgKey}
        className={`${className} object-contain pointer-events-none drop-shadow-md select-none`}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-pink-400 font-bold">
      ★
    </div>
  );
};
