export type PenlightBaseType =
  | 'classic'
  | 'heart2'
  | 'panel'
  | 'wand';

export type StickerCategory =
  | 'all'
  | 'insert'
  | 'handle'
  | 'ribbon'
  | 'heart'
  | 'star'
  | 'pearl'
  | 'rhinestone'
  | 'text'
  | 'photo'
  | 'charm'
  | 'mypart';

export type StickerLayer = 'insert' | 'handle' | 'sticker' | 'back';
export type BorderSize = 'none' | 'thin' | 'normal' | 'thick';

export interface StickerItem {
  id: string;
  name: string;
  category: StickerCategory;
  layer?: StickerLayer;
  x: number; // percentage from center (0 to 100, where 50 is center)
  y: number; // percentage from top (0 to 100, where 50 is center)
  scale: number; // 0.2 to 2.5 (1.0 default)
  rotation: number; // degrees (-180 to 180)
  zIndex: number;
  color?: string; // color tint if applicable
  opacity?: number;
  flipX?: boolean;
  type: '3d-png' | 'preset' | 'text' | 'photo';
  imageUrl?: string;
  svgKey?: string;
  text?: string;
  textColor?: string;
  textBorderColor?: string;
  fontFamily?: string;
  imageShape?: 'circle' | 'heart' | 'square';
  // insert color tint (CSS filter string)
  cssFilter?: string;
  // mypart-specific
  borderSize?: BorderSize;
  hasShadow?: boolean;
  myPartId?: string;
}

export interface MyPart {
  id: string;
  name: string;
  dataUrl: string; // WebP data URL (transparent)
  createdAt: number;
}

export interface PenlightConfig {
  baseType: PenlightBaseType;
  domeColor: string;
  domeOpacity: number;
  glowColor: string;
  glowIntensity: number; // 0 to 1
  isLightOn: boolean;
  glowMode: 'solid' | 'pulse' | 'rainbow' | 'concert';
  strapColor: string;
  ringColor: string;
  insidePhotoUrl?: string | null;
}

export interface SavedProject {
  id: string;
  name: string;
  date: string;
  config: PenlightConfig;
  stickers: StickerItem[];
  thumbnail?: string;
}

export type MobileScreen = 
  | 'home' 
  | 'select-base' 
  | 'editor' 
  | 'parts' 
  | 'color' 
  | 'complete';
