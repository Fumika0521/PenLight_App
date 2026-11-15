// App-wide near-white pink background tint (~#FFF7FA)
export const APP_BG_CLASS = 'bg-[#FFF7FA]'; // Tailwind class — used in App root, desktop layout

// Phone screen gradient — shared between home + select-base screens
export const PHONE_BG_GRADIENT = 'bg-gradient-to-b from-[#FFF7FA] via-[#FFF4F9] to-[#f0f7ff]';

// Per-menu icon / label colors (inactive = active, bg appears only when active).
// Desktop nav order: insert → ribbon → parts → rhinestone → text → photo (dark → light gradient)
export const MENU_COLORS: Record<string, string> = {
  insert:     '#e575aa', // 中身       (most saturated)
  ribbon:     '#e17ea9', // リボン     (interpolated)
  parts:      '#dc86a7', // パーツ
  rhinestone: '#e490b4', // ラインストーン (interpolated)
  text:       '#dc86a7', // 文字 (パーツと同色)
  photo:      '#dc86a7', // 写真 (パーツと同色)
  color:      '#e575aa', // 色 (中身と同色)
};

// Active background = menu color at ~12% opacity (append 1f in hex: 0x1f / 0xff ≈ 0.122)
export const menuActiveBg = (color: string) => color + '1f';

// Legacy exports kept for any remaining references (unused after refactor)
export const MENU_ICON_COLOR        = MENU_COLORS.insert;
export const MENU_ICON_COLOR_ACTIVE = MENU_COLORS.insert;
export const MENU_ICON_BG_ACTIVE    = menuActiveBg(MENU_COLORS.insert);
